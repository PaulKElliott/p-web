/**
 * @author Paul Elliott / http://vizworkshop.com
 */
import * as THREE from 'three'

var SpinControl = function ( object, camera, domElement ) {

	var _this = this;
  
	this.object = object;
  this.camera = camera;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.enabled = true;

	this.screen = { left: 0, top: 0, width: 0, height: 0 };

	this.rotateSensativity = .03; //.02
  
  var box = new THREE.Box3();
  var sphere = new THREE.Sphere();
  box.setFromObject(this.object);
  box.getBoundingSphere(sphere);
  this.minTrackballRadius = sphere.radius;

	this.staticMoving = false;
	this.dampingFactor = .015; //.01

	// internals

  var _angularVelocity = new THREE.Vector3(.33, .42, .15),
    _lastQuaternion = new THREE.Quaternion(),
  
		_mousePrev = new THREE.Vector2(),
		_mouseCurr = new THREE.Vector2(),
      
    //seperate touch variables as might be mouseing and touching at same time on laptop?
    _touchPrev = new THREE.Vector2(), 
		_touchCurr = new THREE.Vector2(),
  
    _EPS = 0.000001;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };  

	this.update = ( function () {
    
    return function update() {
     
      if( !_this.staticMoving ) {
        
        _angularVelocity.multiplyScalar( ( 1.0 - _this.dampingFactor ) );
        
        _this.applyVelocity();
        
      }
      

	  };

	}() );
  
  
	this.updateAngularVelocity = ( function () {

		var objectWorldPos = new THREE.Vector3(),
      objectToCamera = new THREE.Vector3(),
      objectPlane = new THREE.Plane(),
      ray = new THREE.Ray(),
      currentInputDirection = new THREE.Vector3(),
      lastInputDirection = new THREE.Vector3(),
      currentInputPos = new THREE.Vector3(),
      lastInputPos = new THREE.Vector3(),
      trackBallSphere = new THREE.Sphere(),
      impulse = new THREE.Vector3(),
      trackballRadius,
      lastTime = performance.now(),
      deltaTime,
      timeStamp,
			angle;

		return function updateAngularVelocity( currentNdc, lastNdc ) {
      timeStamp = performance.now();
      deltaTime = ( timeStamp - lastTime ) / 1000.0;
      lastTime = timeStamp;

      // Intersect mouse on plane at object with normal pointing to camera

      objectWorldPos.setFromMatrixPosition( _this.object.matrixWorld );
      objectToCamera.copy( _this.camera.position ).sub( objectWorldPos );
      objectPlane.setFromNormalAndCoplanarPoint( objectToCamera, objectWorldPos );
      
      ray.origin.copy( _this.camera.position );

      currentInputDirection.set( currentNdc.x, currentNdc.y, .5 )
      currentInputDirection.unproject( _this.camera ) //in world space
      currentInputDirection.sub( _this.camera.position ).normalize() //sub to put around origin    
      ray.direction.copy( currentInputDirection )
      if( ray.intersectPlane( objectPlane, currentInputPos ) == null ) {         
        return; //we could be facing 180 degrees away
      }

      lastInputDirection.set( lastNdc.x, lastNdc.y, .5 );
      lastInputDirection.unproject( _this.camera );
      lastInputDirection.sub( _this.camera.position ).normalize();
      ray.direction.copy( lastInputDirection );
      if( ray.intersectPlane( objectPlane, lastInputPos ) == null ) {
        return;
      }

      // Put in object position space to find trackball radius
      currentInputPos.sub( objectWorldPos );
      lastInputPos.sub( objectWorldPos );
      // Trackball radius fits both points, but does not shrink so much that you are always acting on edge
      trackballRadius = Math.max( currentInputPos.length(), lastInputPos.length(), _this.minTrackballRadius );

      trackBallSphere.set( objectWorldPos, trackballRadius);
      
      // Project mouse on trackball sphere
      
      if( trackballRadius >= objectToCamera.length()  ) { //if trackball encompases camera
        //extend ray start position so it fits the sphere
        objectToCamera.setLength( trackballRadius );
        ray.origin.addVectors( objectWorldPos, objectToCamera );        
      }      
      else {
      
        ray.direction.copy( currentInputDirection );
        if( ray.intersectSphere( trackBallSphere, currentInputPos ) == null ) { // May not intersect if faceing 180 degrees away from trackball sphere
          return;
        }

        ray.direction.copy( lastInputDirection );
        if( ray.intersectSphere( trackBallSphere, lastInputPos ) == null ) { // May not intersect if faceing 180 degrees away from trackball sphere
          return;
        }
        
        // Put in object position space
        currentInputPos.sub( objectWorldPos );
        lastInputPos.sub( objectWorldPos );
        
      }
      
      angle = lastInputPos.angleTo( currentInputPos ) * _this.rotateSensativity / deltaTime;
      
      // Change in angular vel
      impulse.crossVectors( lastInputPos, currentInputPos );
      impulse.setLength( angle );
      
      _angularVelocity.add( impulse );
      
		};

	}() );
  
  
	this.applyVelocity = ( function () {
    
    var quat = new THREE.Quaternion(),
      normalizedAxis = new THREE.Vector3(),
      deltaAngle,
      deltaTime,
      lastTime,
      timeStamp;
    
    return function applyVelocity() {
      timeStamp = performance.now();
      deltaTime = ( timeStamp - lastTime ) / 1000.0;
      lastTime = timeStamp;
      deltaAngle = _angularVelocity.length();
      if ( deltaAngle && deltaTime ) {
        normalizedAxis.copy( _angularVelocity );
        normalizedAxis.normalize();
        quat.setFromAxisAngle( normalizedAxis, deltaAngle * deltaTime );

        _this.object.quaternion.normalize();
        _this.object.quaternion.premultiply(quat);

        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if ( 8 * ( 1 - _lastQuaternion.dot( _this.object.quaternion ) ) > _EPS) {

          _this.dispatchEvent( changeEvent );

          _lastQuaternion.copy( _this.object.quaternion );

        }
      }

	  };

	}() );

  
  _this.onWindowResize = function () {
		if ( _this.domElement === document ) {

			_this.screen.left = 0;
			_this.screen.top = 0;
			_this.screen.width = window.innerWidth;
			_this.screen.height = window.innerHeight;

		} else {

			var box = _this.domElement.getBoundingClientRect();
			// adjustments come from similar code in the jquery offset() function
			var d = _this.domElement.ownerDocument.documentElement;
			_this.screen.left = box.left + window.pageXOffset - d.clientLeft;
			_this.screen.top = box.top + window.pageYOffset - d.clientTop;
			_this.screen.width = box.width;
      _this.screen.height = box.height;

		}

	};

	var getMouseInNdc = ( function () {

		var vector = new THREE.Vector2();

		return function getMouseInNdc( pageX, pageY ) {

			vector.set(
				( ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / ( _this.screen.width * 0.5 ) ),
				( ( _this.screen.height + 2 * ( _this.screen.top - pageY ) ) / _this.screen.height ) // screen.height intentional =)
			);

			return vector;

		};

	}() );

	// listeners

	function onMouseMove( event ) {

		if ( _this.enabled === false ) return;

    //event.preventDefault();

    _mousePrev.copy( _mouseCurr );
    _mouseCurr.copy( getMouseInNdc( event.pageX, event.pageY ) );
          
    _this.updateAngularVelocity( _mouseCurr, _mousePrev );
    
	}

	function touchstart( event ) {

		if ( _this.enabled === false ) return;
		
		//event.preventDefault();
        
    _touchCurr.copy( getMouseInNdc( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );

		_this.dispatchEvent( startEvent );

	}

	function touchmove( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

    _touchPrev.copy( _touchCurr );
    _touchCurr.copy( getMouseInNdc( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
    
    _this.updateAngularVelocity( _touchCurr, _touchPrev );
    

	}

	function touchend( event ) {

		if ( _this.enabled === false ) return;

		_this.dispatchEvent( endEvent );

	}

	this.dispose = function () {

    this.domElement.removeEventListener( 'resize', _this.onWindowResize, false );

		this.domElement.removeEventListener( 'touchstart', touchstart, false );
		this.domElement.removeEventListener( 'touchend', touchend, false );
		this.domElement.removeEventListener( 'touchmove', touchmove, false );

		window.removeEventListener( 'mousemove', onMouseMove, false );

	};

  this.domElement.addEventListener( 'resize', _this.onWindowResize, false );		

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );
  
  window.addEventListener( 'mousemove', onMouseMove, false );

	_this.onWindowResize();

};

SpinControl.prototype = Object.create( THREE.EventDispatcher.prototype );
SpinControl.prototype.constructor = SpinControl;

export default SpinControl