import * as THREE from 'three'

class SpinControl {
  
  constructor(object3D, camera, domElement) {
    this.object3D = object3D
    this.camera = camera
    this.TRACKBALL_RADIUS = 5


    //this._ROTAIONAL_INERTIA_INVERSE = 1 / ( (1/6.0) * 1 * 1 )// for cube 1⁄6 x size^2 x mass
    this._angularMomentum = new THREE.Vector3()
    //not used this._angularVelocity = new THREE.Vector3() //calculated each frame
    this._FRICTION_COEFFICENT = .01
    this._frictionForce = new THREE.Vector3() //calculated each frame

    this.ray = new THREE.Ray()
    
    this._movePrev = new THREE.Vector2()
    this._moveCurr = new THREE.Vector2()
    this._lastMouseEventTime = performance.now()
    this._lastUpdateTime = performance.now()
    
    this._domElement = domElement
    this._screen = { left: NaN, top: NaN }
    this.resetMove()
    
    window.addEventListener( 'mousemove', this, false )
    window.addEventListener( 'mouseout', this, false )
  }

  dispose() {
    window.removeEventListener( 'mousemove', this, false )
    window.removeEventListener( 'mouseout', this, false )
  }

  updateMomentum() {
    let currentTime = performance.now()
    let deltaTime = (currentTime - this._lastMouseEventTime) / 1000 //milliseconds to seconds
    this._lastMouseEventTime = currentTime

    //this gets us points on trackball z plane    
    //todo project orthgraphicly?
    let object3DWorldPos = new THREE.Vector3()
    object3DWorldPos.setFromMatrixPosition(this.object3D.matrixWorld)

    let mouseNDC = new THREE.Vector3()
    let mouseCurrentPos = new THREE.Vector3()
    mouseNDC.set(this._moveCurr.x, this._moveCurr.y, .5)
    mouseNDC.unproject(this.camera) //in world space
    mouseNDC.sub(this.camera.position).normalize() //sub to put around origin
    //intersect plane at object with normal pointing to camera
    let distance = (object3DWorldPos.z - this.camera.position.z) / mouseNDC.z;
    mouseCurrentPos.copy( this.camera.position ).add( mouseNDC.multiplyScalar( distance ) );

    let mousePrevPos = new THREE.Vector3()
    mouseNDC.set(this._movePrev.x, this._movePrev.y, .5)
    mouseNDC.unproject(this.camera)
    mouseNDC.sub(this.camera.position).normalize()
    distance = (object3DWorldPos.z - this.camera.position.z) / mouseNDC.z;
    mousePrevPos.copy( this.camera.position ).add( mouseNDC.multiplyScalar( distance ) );
    
    //put in trackball position space to find trackball radius
    mouseCurrentPos.sub(object3DWorldPos)
    mousePrevPos.sub(object3DWorldPos)
    let trackballRadius = Math.max(mouseCurrentPos.length(), mousePrevPos.length(), this.TRACKBALL_RADIUS)
    
    // Project mouse on sphere
    // One effect: closer we get to sphere, more angle change we have per pixel of mouse movement
    let trackBallSphere = new THREE.Sphere(object3DWorldPos, trackballRadius)
    this.ray.origin.copy(this.camera.position)

    mouseNDC.set(this._moveCurr.x, this._moveCurr.y, .5)
    mouseNDC.unproject(this.camera) //in world space
    mouseNDC.sub(this.camera.position).normalize(); //sub to put around origin
    this.ray.direction.copy(mouseNDC)
    let intersectCurrent = this.ray.intersectSphere(trackBallSphere, mouseCurrentPos)
    
    mouseNDC.set(this._movePrev.x, this._movePrev.y, .5)
    mouseNDC.unproject(this.camera) //in world space
    mouseNDC.sub(this.camera.position).normalize();
    this.ray.direction.copy(mouseNDC)
    let intersectPast = this.ray.intersectSphere(trackBallSphere, mousePrevPos)

    // Could not be intersecting if faceing 180 degrees away from sphere
    //if(intersectCurrent != null && intersectPast != null) { //got intersection?
      //put in trackball position space
      intersectCurrent.sub(object3DWorldPos)
      intersectPast.sub(object3DWorldPos)

      
      let deltaMouseRadians = .02 * intersectPast.angleTo(intersectCurrent) / deltaTime
      let impulse = new THREE.Vector3() //change in angular vel
      impulse.crossVectors(intersectPast, intersectCurrent)
      impulse.setLength(deltaMouseRadians)
      
      this._angularMomentum.add(impulse)
    //}
    this._movePrev.copy(this._moveCurr);
  }
    
  update() {
    let currentTime = performance.now()
    let deltaTime = (currentTime - this._lastUpdateTime) / 1000 //milliseconds to seconds
    this._lastUpdateTime = currentTime

    this._frictionForce.copy(this._angularMomentum)
    this._frictionForce.multiplyScalar(-this._FRICTION_COEFFICENT)
    this._angularMomentum.add(this._frictionForce)

    // skip momentum to velocity as rotational inertia is constant (for now =)
    // this._angularVelocity.copy(this._angularMomentum) 
    // this._angularVelocity.multiplyScalar(this._ROTAIONAL_INERTIA_INVERSE)
    // let deltaAngle = this._angularVelocity.length()
    // let normalizedAxis = new THREE.Vector3().copy(this._angularVelocity)

    let deltaAngle = this._angularMomentum.length() * deltaTime
    let normalizedAxis = new THREE.Vector3().copy(this._angularMomentum)

    normalizedAxis.normalize()
    let angularVelQuat = new THREE.Quaternion()
    angularVelQuat.setFromAxisAngle(normalizedAxis, deltaAngle)
    
    
    this.object3D.quaternion.normalize()
    this.object3D.quaternion.premultiply(angularVelQuat)
  }

  getRelativeMousePosition(event, target) {
    target = target || event.target;
    var rect = target.getBoundingClientRect();
  
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }
  
  getNoPaddingNoBorderCanvasRelativeMousePosition(event, target) {
    target = target || event.target;
    var pos = this.getRelativeMousePosition(event, target);
    
    pos.x = pos.x * target.width  / this._domElement.clientWidth;
    pos.y = pos.y * target.height / this._domElement.clientHeight;
    
    return pos;  
  }

  onMouseMove(event) {
    event.preventDefault()
    event.stopPropagation()

    // ToDo does an event fire multiple times a frame?  Then we are missing impulse!
    // ToDo optimization stash the events and just run this every frame, not on every event.
    let pos = this.getNoPaddingNoBorderCanvasRelativeMousePosition(event, this._domElement)
    var ndcX = (pos.x / this._domElement.clientWidth) * 2 - 1;
    var ndcY = (1 - (pos.y / this._domElement.clientHeight)) * 2 - 1;
    this._moveCurr.set(
      ndcX,
      ndcY
    )
    
    if (this._screen.left !== window.screenX || this._screen.top !== window.screenY) {
      this._movePrev.copy(this._moveCurr)
      this._screen.left = window.screenX
      this._screen.top  = window.screenY
    }

    this.updateMomentum()
  }

  resetMove() {
    this._screen.left = NaN
    this._screen.top = NaN
  }

  onMouseOut(event) {
    this.resetMove()
  }

  handleEvent(evt) {
    switch(evt.type) {
      case "mousemove":
        this.onMouseMove(evt)
        break;
      case "mouseout":
        this.onMouseOut(evt)
        break;        
      default:
        return;
    }
  }

}

export default SpinControl
