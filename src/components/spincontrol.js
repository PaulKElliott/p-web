import * as THREE from 'three'

class SpinControl {
  
  constructor(object3D, domElement) {
    this.object3D = object3D

    this._movePrev = new THREE.Vector2()
    this._moveCurr = new THREE.Vector2()
    this._normalizedScreenWidth = window.screen.width / 1000 //normaized to 1000 pixel screen
    this._velVec = new THREE.Vector3()
    this._accelVec = new THREE.Vector3()
    this._lastTime = performance.now();
    this._dampingFactor = .98
    this._rotationAxis = new THREE.Vector3()
    
    this._domElement = this._domElement
    this._screen = { left: NaN, top: NaN }
    this.resetMove()
    
    window.addEventListener( 'mousemove', this, false )
    window.addEventListener( 'mouseout', this, false )
  }

  dispose() {
    window.removeEventListener( 'mousemove', this, false )
    window.removeEventListener( 'mouseout', this, false )
  }

  update() {
    let currentTime = performance.now()
    let timeDelta = (currentTime - this._lastTime) / 1000 //milliseconds to seconds
    this._lastTime = currentTime

    this._accelVec.set( 
      this._moveCurr.y - this._movePrev.y,
      this._moveCurr.x - this._movePrev.x,
      0
    )
    this._accelVec.setLength( .5 * Math.pow(this._accelVec.length(), 1.3) * timeDelta )

    this._velVec.add(this._accelVec)
    this._velVec.setLength( this._velVec.length() * this._dampingFactor )

    this._rotationAxis.copy(this._velVec).normalize()
    this.object3D.rotateOnWorldAxis(this._rotationAxis, this._velVec.length()  * timeDelta)

    this._movePrev.copy(this._moveCurr);
  }

  onMouseMove(event) {
    event.preventDefault()
		event.stopPropagation()

    this._moveCurr.set(
      event.screenX / this._normalizedScreenWidth,
      event.screenY / this._normalizedScreenWidth // width intentional so pixel scaling is square
    )
    
    if (this._screen.left !== window.screenX || this._screen.top !== window.screenY) {
      this._movePrev.copy(this._moveCurr)
      this._screen.left = window.screenX
      this._screen.top  = window.screenY
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
