import * as THREE from 'three'

class SpinControl {
  
  constructor(object3D, domElement) {
    this.object3D = object3D

    this._isFirstMouseMove = true
    this._movePrev = new THREE.Vector2()
	  this._moveCurr = new THREE.Vector2()
    this._velVec = new THREE.Vector3()
    this._accelVec = new THREE.Vector3()
    this._objectSidewaysDirection = new THREE.Vector3()
    this._lastTime = performance.now();
    this._dampingFactor = .99
    this._rotationAxis = new THREE.Vector3()
    
    this._domElement = domElement
    document.addEventListener( 'mousemove', this, false )
    this.screen = { left: 0, top: 0, width: 0, height: 0 };
    this.handleResize();
  }

  dispose() {
    document.removeEventListener( 'mousemove', this, false );  
  }

  update() {
    let currentTime = performance.now()
    let timeDelta = (currentTime - this._lastTime) / 1000 //milliseconds to seconds
    this._lastTime = currentTime

    this._accelVec.set( 
      -(this._moveCurr.y - this._movePrev.y), 
      this._moveCurr.x - this._movePrev.x,
      0
    )
    let magnitude = this._accelVec.length()
    this._accelVec.setLength( 1001 * Math.pow(magnitude, 1.3) * timeDelta )

    this._velVec.add( this._accelVec )
    this._velVec.setLength( this._velVec.length() * this._dampingFactor )

    this._rotationAxis.copy(this._velVec).normalize()
    this.object3D.rotateOnWorldAxis( this._rotationAxis, this._velVec.length()  * timeDelta)

    this._movePrev.copy( this._moveCurr );
  }

  onMouseMove(event) {
    event.preventDefault()
		event.stopPropagation()

    this._moveCurr.set(
      ( event.screenX / this.screen.width ),
      ( -event.screenY / this.screen.width ) // screen.width intentional
    )
    
    if (this._isFirstMouseMove) {
      this._movePrev.copy( this._moveCurr );
      this._isFirstMouseMove = false;
    }

  }

  handleResize() {
		if ( this._domElement === document ) {
			this.screen.left = 0;
			this.screen.top = 0;
			this.screen.width = window.innerWidth;
			this.screen.height = window.innerHeight;
    } 
    else {
			var box = this._domElement.getBoundingClientRect();
			// adjustments come from similar code in the jquery offset() function
			var d = this._domElement.ownerDocument.documentElement;
			this.screen.left = box.left + window.pageXOffset - d.clientLeft;
			this.screen.top = box.top + window.pageYOffset - d.clientTop;
			this.screen.width = box.width;
			this.screen.height = box.height;
		}

  }
  
  handleEvent(evt) {
    switch(evt.type) {
      case "mousemove":
        this.onMouseMove(evt);
        break;
      default:
        return;
    }
  }


}

export default SpinControl
