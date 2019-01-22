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

    this.__ray = new THREE.Ray()
    
    this._movePrev = new THREE.Vector2()
    this._moveCurr = new THREE.Vector2()
    this._lastMouseEventTime = performance.now()
    this._lastUpdateTime = performance.now()
    
    this._domElement = domElement
    this._screen = { left: NaN, top: NaN }
    this.resetMove()
    
    window.addEventListener( 'mousemove', this, false )
    window.addEventListener( 'mouseout', this, false )

    //local update vars
    this.__object3DWorldPos = new THREE.Vector3()
    this.__object3DPlane = new THREE.Plane()
    this.__objectToCamera = new THREE.Vector3()
    this.__mouseCurrentDirection = new THREE.Vector3()
    this.__mouseCurrentPos = new THREE.Vector3()
    this.__mousePrevDirection = new THREE.Vector3()
    this.__mousePrevPos = new THREE.Vector3()
    this.__trackBallSphere = new THREE.Sphere()
    this.__impulse = new THREE.Vector3() 
  }

  dispose() {
    window.removeEventListener( 'mousemove', this, false )
    window.removeEventListener( 'mouseout', this, false )
  }

  updateMomentum() {
    let currentTime = performance.now()
    let deltaTime = (currentTime - this._lastMouseEventTime) / 1000 //milliseconds to seconds
    this._lastMouseEventTime = currentTime

    //intersect mouse on plane at object with normal pointing to camera
    //todo project orthgraphicly?  plane.projectPoint?
    
    this.__object3DWorldPos.setFromMatrixPosition(this.object3D.matrixWorld)
    
    this.__objectToCamera.copy(this.camera.position).sub(this.__object3DWorldPos)
    this.__object3DPlane.setFromNormalAndCoplanarPoint(this.__objectToCamera, this.__object3DWorldPos)
    this.__ray.origin.copy(this.camera.position)

    this.__mouseCurrentDirection.set(this._moveCurr.x, this._moveCurr.y, .5)
    this.__mouseCurrentDirection.unproject(this.camera) //in world space
    this.__mouseCurrentDirection.sub(this.camera.position).normalize() //sub to put around origin    
    this.__ray.direction.copy(this.__mouseCurrentDirection)
    if(this.__ray.intersectPlane(this.__object3DPlane, this.__mouseCurrentPos) == null) {
      return
    }

    this.__mousePrevDirection.set(this._movePrev.x, this._movePrev.y, .5)
    this.__mousePrevDirection.unproject(this.camera)
    this.__mousePrevDirection.sub(this.camera.position).normalize()
    this.__ray.direction.copy(this.__mousePrevDirection)
    if(this.__ray.intersectPlane(this.__object3DPlane, this.__mousePrevPos) == null) {
      return
    }
    
    //put in trackball position space to find trackball radius
    this.__mouseCurrentPos.sub(this.__object3DWorldPos)
    this.__mousePrevPos.sub(this.__object3DWorldPos)
    // Trackball radius fits both points, but does not shrink so much that you are always acting on edge
    let trackballRadius = Math.max(this.__mouseCurrentPos.length(), this.__mousePrevPos.length(), this.TRACKBALL_RADIUS)
    
    // Project mouse on sphere
    // One effect: closer we get to sphere, more angle change we have per pixel of mouse movement
    this.__trackBallSphere.set(this.__object3DWorldPos, trackballRadius)

    this.__ray.direction.copy(this.__mouseCurrentDirection)
    let intersectCurrent = this.__ray.intersectSphere(this.__trackBallSphere, this.__mouseCurrentPos)
    
    this.__ray.direction.copy(this.__mousePrevDirection)
    let intersectPast = this.__ray.intersectSphere(this.__trackBallSphere, this.__mousePrevPos)

    // May not intersect if faceing 180 degrees away from sphere
    if(intersectCurrent != null && intersectPast != null) { //got intersection?
      //put in trackball position space
      intersectCurrent.sub(this.__object3DWorldPos)
      intersectPast.sub(this.__object3DWorldPos)
      
      const deltaMouseRadians = .02 * intersectPast.angleTo(intersectCurrent) / deltaTime

      //change in angular vel
      this.__impulse.crossVectors(intersectPast, intersectCurrent) 
      this.__impulse.setLength(deltaMouseRadians)
      
      this._angularMomentum.add(this.__impulse)
    }
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
    //event.preventDefault()
    event.stopPropagation()

    let pos = this.getNoPaddingNoBorderCanvasRelativeMousePosition(event, this._domElement)
    var ndcX = (pos.x / this._domElement.clientWidth) * 2 - 1;
    var ndcY = (1 - (pos.y / this._domElement.clientHeight)) * 2 - 1;
    this._moveCurr.set(
      ndcX,
      ndcY
    )
    
    if (this._screen.left !== window.screenX || this._screen.top !== window.screenY) {
      //Dragging window title bar
      this._movePrev.copy(this._moveCurr)
      this._screen.left = window.screenX
      this._screen.top  = window.screenY
    }
    else {
      this.updateMomentum()
      this._movePrev.copy(this._moveCurr);
    }
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
