import * as THREE from 'three'

class SpinControl {
  
  constructor(object3D, camera, domElement) {
    this.trackball = object3D
    this.camera = camera
    this.TRACKBALL_RADIUS = 6

    // Inertia constant so don't use inertia or angularVelocity
    //this._ROTAIONAL_INERTIA_INVERSE = 1 / ( (1/6.0) * 1 * 1 )// for cube 1⁄6 x size^2 x mass
    //this._angularVelocity = new THREE.Vector3() //calculated each frame
    this._angularMomentum = new THREE.Vector3(.30, .43, .12)
    this._FRICTION_COEFFICENT = .01

    this.__ray = new THREE.Ray()
    
    this._currentInputInfo = { x: NaN, y: NaN, time: NaN } // Time is milliseconds
    this._lastInputInfo = { x: NaN, y: NaN, time: NaN } 
    this._lastUpdateTime = performance.now() // Different than input time
    
    this._domElement = domElement
    this._screen = { left: NaN, top: NaN }
    
    window.addEventListener( 'mousemove', this, false )
    window.addEventListener( 'mouseout', this, false )
    this._domElement.addEventListener( 'touchstart', this, false )
    this._domElement.addEventListener( 'touchmove', this, false )
    this._domElement.addEventListener( 'touchend', this, false )    

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
    this.__frictionForce = new THREE.Vector3() //calculated each frame
  }

  dispose() {
    window.removeEventListener( 'mousemove', this, false )
    window.removeEventListener( 'mouseout', this, false )
    this._domElement.removeEventListener( 'touchstart', this, false )
    this._domElement.removeEventListener( 'touchmove', this, false )
    this._domElement.removeEventListener( 'touchend', this, false )
  }


  // Precondition: this._lastMouseEvent set 
  updateMomentum(inputInfo) {
    let deltaTime = inputInfo.time - this._lastInputInfo.time
    if(deltaTime === 0) {
      return // move along, nothing to see here (when adding new touch finger)
    }
    // Intersect mouse on plane at object with normal pointing to camera
    // ToDo project orthgraphicly?  plane.projectPoint?
    
    this.__trackballWorldPos.setFromMatrixPosition(this.trackball.matrixWorld)
    
    this.__trackballToCamera.copy(this.camera.position).sub(this.__trackballWorldPos)
    this.__trackballPlane.setFromNormalAndCoplanarPoint(this.__trackballToCamera, this.__trackballWorldPos)
    this.__ray.origin.copy(this.camera.position)

    this.__mouseCurrentDirection.set(inputInfo.x, inputInfo.y, .5)
    this.__mouseCurrentDirection.unproject(this.camera) //in world space
    this.__mouseCurrentDirection.sub(this.camera.position).normalize() //sub to put around origin    
    this.__ray.direction.copy(this.__mouseCurrentDirection)
    if(this.__ray.intersectPlane(this.__trackballPlane, this.__mouseCurrentPos) == null) {
      return
    }

    this.__mousePrevDirection.set(this._lastInputInfo.x, this._lastInputInfo.y, .5)
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
      
      let impulseMagnatude = intersectPast.angleTo(intersectCurrent) / deltaTime // Angle change speed in radians
      // As we project mouse to sphere, closer we get to trackball, more angle change we have per pixel of mouse movement.
      // So when mouse is far from trackball, small impulse.  Bring it back a little.
      impulseMagnatude *= .02 * Math.pow(1.05, trackballRadius - this.TRACKBALL_RADIUS)

      // Change in angular vel
      this.__impulse.crossVectors(intersectPast, intersectCurrent) 
      this.__impulse.setLength(impulseMagnatude)
      
      this._angularMomentum.add(this.__impulse)
    }
  }
    
  update(timestamp) {
    let deltaTime = (timestamp - this._lastUpdateTime) / 1000 // milliseconds to seconds
    this._lastUpdateTime = timestamp

    this.__frictionForce.copy(this._angularMomentum)
    this.__frictionForce.multiplyScalar(-this._FRICTION_COEFFICENT)
    this._angularMomentum.add(this.__frictionForce)

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

  getRelativeMousePosition(event, target, mousePosOut) {
    target = target || event.target;
    var rect = target.getBoundingClientRect();  
    mousePosOut.x = event.clientX - rect.left
    mousePosOut.y = event.clientY - rect.top
  }
  
  // Fix so no padding or boarder effects
  getCanvasRelativeMousePosition(event, target, mousePosOut) {
    target = target || event.target;
    this.getRelativeMousePosition(event, target, mousePosOut);    
    mousePosOut.x = mousePosOut.x * target.width  / this._domElement.clientWidth;
    mousePosOut.y = mousePosOut.y * target.height / this._domElement.clientHeight;
  }

  applyInput(event, timeStamp) {    
    this.getCanvasRelativeMousePosition(event, this._domElement, this._currentInputInfo)
    // Put in NDC space
    this._currentInputInfo.x = (this._currentInputInfo.x / this._domElement.clientWidth) * 2 - 1
    this._currentInputInfo.y = (1 - (this._currentInputInfo.y / this._domElement.clientHeight)) * 2 - 1
    this._currentInputInfo.time = timeStamp / 1000.0 // milliseconds to seconds
    if(!isNaN(this._lastInputInfo.time)) { // is not first time through or after reset
      this.updateMomentum(this._currentInputInfo)
    }
    const swappyTemp = this._lastInputInfo
    this._lastInputInfo = this._currentInputInfo
    this._currentInputInfo = swappyTemp
  }

  onMouseMove(event) {
    event.stopPropagation()
    this.applyInput(event, event.timeStamp)
  }

  resetMove() {
    this._lastInputInfo.time = NaN
  }

  onMouseOut(event) {
    this.resetMove()
  }

  onTouchStart(event) {
    if(event.touches.length === 1) {
      event.preventDefault()
      event.stopPropagation()
    }
    this.applyInput(event.touches[ 0 ], event.timeStamp)
  }

  onTouchMove(event) {
    if(event.touches.length === 1) {
      event.preventDefault()
      event.stopPropagation()
    }
    this.applyInput(event.touches[ 0 ], event.timeStamp)
  }

  onTouchEnd(event) {
    event.preventDefault()
    event.stopPropagation()
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
      case "touchstart":
        this.onTouchStart(evt)
        break;
      case "touchend":
        this.onTouchEnd(evt)
        break;
      case "touchmove":
        this.onTouchMove(evt)
        break;
      default:
        return;
    }
  }

}

export default SpinControl
