import * as THREE from 'three'

class SpinControl {
  
  constructor(object3D, camera, domElement) {
    this.trackball = object3D
    this.camera = camera
    this.TRACKBALL_RADIUS = 6

    // Inertia constant so don't use inertia or angularVelocity
    //this._ROTAIONAL_INERTIA_INVERSE = 1 / ( (1/6.0) * 1 * 1 )// for cube 1⁄6 x size^2 x mass
    //this._angularVelocity = new THREE.Vector3() //calculated each frame
    this._angularMomentum = new THREE.Vector3()
    this._FRICTION_COEFFICENT = .01
    this._frictionForce = new THREE.Vector3() //calculated each frame

    this.__ray = new THREE.Ray()
    
    this._lastMouseEvent = { ndcX: NaN, ndcY: NaN, time: NaN } //time is milliseconds
    this._lastUpdateTime = performance.now()
    
    this._domElement = domElement
    this._screen = { left: NaN, top: NaN }
    
    window.addEventListener( 'mousemove', this, false )
    window.addEventListener( 'mouseout', this, false )


    //local update vars
    this.__trackballWorldPos = new THREE.Vector3()
    this.__trackballPlane = new THREE.Plane()
    this.__trackballToCamera = new THREE.Vector3()
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


  // Precondition: this._lastMouseEvent set 
  updateMomentum(ndcX, ndcY, time) {
    let deltaTime = time - this._lastMouseEvent.time

    // Intersect mouse on plane at object with normal pointing to camera
    // ToDo project orthgraphicly?  plane.projectPoint?
    
    this.__trackballWorldPos.setFromMatrixPosition(this.trackball.matrixWorld)
    
    this.__trackballToCamera.copy(this.camera.position).sub(this.__trackballWorldPos)
    this.__trackballPlane.setFromNormalAndCoplanarPoint(this.__trackballToCamera, this.__trackballWorldPos)
    this.__ray.origin.copy(this.camera.position)

    this.__mouseCurrentDirection.set(ndcX, ndcY, .5)
    this.__mouseCurrentDirection.unproject(this.camera) //in world space
    this.__mouseCurrentDirection.sub(this.camera.position).normalize() //sub to put around origin    
    this.__ray.direction.copy(this.__mouseCurrentDirection)
    if(this.__ray.intersectPlane(this.__trackballPlane, this.__mouseCurrentPos) == null) {
      return
    }

    this.__mousePrevDirection.set(this._lastMouseEvent.ndcX, this._lastMouseEvent.ndcY, .5)
    this.__mousePrevDirection.unproject(this.camera)
    this.__mousePrevDirection.sub(this.camera.position).normalize()
    this.__ray.direction.copy(this.__mousePrevDirection)
    if(this.__ray.intersectPlane(this.__trackballPlane, this.__mousePrevPos) == null) {
      return
    }
    
    // Put in trackball position space to find trackball radius
    this.__mouseCurrentPos.sub(this.__trackballWorldPos)
    this.__mousePrevPos.sub(this.__trackballWorldPos)
    // Trackball radius fits both points, but does not shrink so much that you are always acting on edge
    let trackballRadius = Math.max(this.__mouseCurrentPos.length(), this.__mousePrevPos.length(), this.TRACKBALL_RADIUS)
    
    // Project mouse on trackball sphere    
    this.__trackBallSphere.set(this.__trackballWorldPos, trackballRadius)

    this.__ray.direction.copy(this.__mouseCurrentDirection)
    let intersectCurrent = this.__ray.intersectSphere(this.__trackBallSphere, this.__mouseCurrentPos)
    
    this.__ray.direction.copy(this.__mousePrevDirection)
    let intersectPast = this.__ray.intersectSphere(this.__trackBallSphere, this.__mousePrevPos)

    // May not intersect if faceing 180 degrees away from trackball sphere
    if(intersectCurrent != null && intersectPast != null) { //got intersection?
      // Put in trackball position space
      intersectCurrent.sub(this.__trackballWorldPos)
      intersectPast.sub(this.__trackballWorldPos)
      
      let deltaMouseRadians = intersectPast.angleTo(intersectCurrent) / deltaTime      
      // As we project mouse to sphere, closer we get to trackball, more angle change we have per pixel of mouse movement.
      // So when mouse is far from trackball, small impulse.  Bring it back a little.
      deltaMouseRadians *= .02 * Math.pow(1.05, trackballRadius - this.TRACKBALL_RADIUS)

      // Change in angular vel
      this.__impulse.crossVectors(intersectPast, intersectCurrent) 
      this.__impulse.setLength(deltaMouseRadians)
      
      this._angularMomentum.add(this.__impulse)
    }
  }
  
  applyInput(ndcX, ndcY, time) {
    if(!isNaN(this._lastMouseEvent.time)) { // is not first time through or after reset
      this.updateMomentum(ndcX, ndcY, time)
    }
    this._lastMouseEvent.ndcX = ndcX
    this._lastMouseEvent.ndcY = ndcY
    this._lastMouseEvent.time = time
  }
    
  update() {
    let currentTime = performance.now()
    let deltaTime = (currentTime - this._lastUpdateTime) / 1000 // milliseconds to seconds
    this._lastUpdateTime = currentTime

    this._frictionForce.copy(this._angularMomentum)
    this._frictionForce.multiplyScalar(-this._FRICTION_COEFFICENT)
    this._angularMomentum.add(this._frictionForce)

    // Skip momentum to velocity as rotational inertia is constant (for now =)
    // this._angularVelocity.copy(this._angularMomentum) 
    // this._angularVelocity.multiplyScalar(this._ROTAIONAL_INERTIA_INVERSE)
    // let deltaAngle = this._angularVelocity.length()
    // let normalizedAxis = new THREE.Vector3().copy(this._angularVelocity)

    let deltaAngle = this._angularMomentum.length() * deltaTime
    let normalizedAxis = new THREE.Vector3().copy(this._angularMomentum)

    normalizedAxis.normalize()
    let angularVelQuat = new THREE.Quaternion()
    angularVelQuat.setFromAxisAngle(normalizedAxis, deltaAngle)
    
    
    this.trackball.quaternion.normalize()
    this.trackball.quaternion.premultiply(angularVelQuat)
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
    event.stopPropagation()
    let pos = this.getNoPaddingNoBorderCanvasRelativeMousePosition(event, this._domElement)
    var ndcX = (pos.x / this._domElement.clientWidth) * 2 - 1;
    var ndcY = (1 - (pos.y / this._domElement.clientHeight)) * 2 - 1;
    this.applyInput(ndcX, ndcY, event.timeStamp / 1000.0 ) // milliseconds to seconds
  }

  resetMove() {
    this._lastMouseEvent.time = NaN
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
