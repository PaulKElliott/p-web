import React, { Component } from 'react'
import * as THREE from 'three'
//import {TrackballControls} from 'trackball'
let TrackballControls = require('../components/trackball');
//import * as SUBDIV from  'three-subdivision-modifier'
//var SUBDIV = require('three-subdivision-modifier')
//import SUBDIV from 'three-subdivision-modifier'
//var SubdivisionModifier = require('three-subdivision-modifier');




class Logo3D extends Component {

  
  vertexGlowShader = `
uniform vec3 viewVector;
uniform float c;
uniform float p;
varying float intensity;
void main() 
{
  vec3 vNormal = normalize( normalMatrix * normal );
	vec3 vNormel = normalize( normalMatrix * viewVector );
	intensity = pow( c - dot(vNormal, vNormel), p );
	
   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

  fragGlowShader = `
uniform vec3 glowColor;
varying float intensity;
void main() 
{
	vec3 glow = glowColor * intensity;
    gl_FragColor = vec4( glow, 1.0 );
}
`


  componentDidMount() {
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight
    
    this.scene = new THREE.Scene()
    
    this.camera = new THREE.PerspectiveCamera(
      100,
      width / height,
      0.1,
      1000
    ) 
    this.camera.position.set(0, 0, 12)
    this.camera.lookAt(0,0,0)
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setClearColor('#fff')
    this.renderer.setSize(width, height)
    this.mount.appendChild(this.renderer.domElement)

    const sunLight = new THREE.DirectionalLight(0xFFFFFF)
    sunLight.position.set(-100, 100, 100)
    this.scene.add(sunLight)
    
    let fs = 10 //frame size
    let frame = new THREE.Shape()
    frame.moveTo(fs, -fs)
    frame.lineTo(-fs, -fs)
    frame.lineTo(-fs, fs)
    frame.lineTo(fs, fs)
    let screen = new THREE.Path()
    let ss = fs * .75 //screen size
    screen.moveTo(ss, -ss)
    screen.lineTo(-ss, -ss)
    screen.lineTo(-ss, ss)
    screen.lineTo(ss, ss)
    frame.holes.push(screen)
    let geometry = new THREE.ShapeGeometry( frame )
    material = new THREE.MeshBasicMaterial( {color: 0x000000} )
    this.frame = new THREE.Mesh( geometry, material )
    this.frame.renderOrder = 2
    this.scene.add( this.frame );
    
    const bs = 15 //logo size
    
    this.cube = new THREE.Object3D();
    let material = new THREE.MeshLambertMaterial({ color: '#6666ff', side: THREE.FrontSide })
    material.emissive.set('#6666ff')
    material.emissiveIntensity = .3
    let planeGeo = new THREE.PlaneGeometry(bs * .95, bs * .95)
    let plane = new THREE.Mesh( planeGeo, material )
    plane.renderOrder = 3
    plane.position.set(0, 0, bs/2)
    this.cube.add(plane)
    let pClone = plane.clone()
    pClone.position.set(0, 0, -bs/2) //always facing away
    pClone.rotateY(-Math.PI)
    this.cube.add(pClone)
    pClone = plane.clone()
    pClone.position.set(0, -bs/2, 0)
    pClone.rotateX(Math.PI/2)
    this.cube.add(pClone)
    pClone = plane.clone()
    pClone.position.set(0, bs/2, 0)
    pClone.rotateX(-Math.PI/2)
    this.cube.add(pClone)
    pClone = plane.clone()
    pClone.position.set(bs/2, 0, 0)
    pClone.rotateY(Math.PI/2)
    this.cube.add(pClone)
    pClone = plane.clone()
    pClone.position.set(-bs/2, 0, 0)
    pClone.rotateY(-Math.PI/2)
    this.cube.add(pClone)

    let geo = new THREE.BoxGeometry(bs, bs, bs)
    let fillMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff} )
    fillMaterial.depthTest = false
    let fill = new THREE.Mesh( geo, fillMaterial);
    fill.renderOrder = 3
    this.cube.add( fill );

    // geo = new THREE.BoxGeometry(bs, bs, bs)
    // fillMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff} )
    // fill = new THREE.Mesh( geo, fillMaterial);
    // fill.scale.multiplyScalar(.99)
    // fill.renderOrder = 3
    // this.cube.add( fill );

    // const customMaterial = new THREE.ShaderMaterial( 
    //   {
    //       uniforms: 
    //     { 
    //       "c":   { type: "f", value: 1.0 },
    //       "p":   { type: "f", value: .7 },
    //       glowColor: { type: "c", value: new THREE.Color(0x4444ff) },
    //       viewVector: { type: "v3", value: this.camera.position }
    //     },
    //     vertexShader: this.vertexGlowShader,
    //     fragmentShader: this.fragGlowShader,
    //     side: THREE.FrontSide,
    //     blending: THREE.AdditiveBlending,
    //     transparent: true
    //   } 
    // )
    // const cubeGlowGeo = new THREE.BoxGeometry(bs, bs, bs)
    // const smoothCubeGeom = cubeGlowGeo.clone();
    // const modifier = new SubdivisionModifier( 2.9 );
    // modifier.modify( smoothCubeGeom ); 
    // const cubeGlow = new THREE.Mesh( smoothCubeGeom, customMaterial.clone() );
    // cubeGlow.scale.multiplyScalar(1.7);
    //this.cube.add( cubeGlow );
    
    //this.cube.position.set(bs, 0, 0)
    //this.scene.add(this.cube)

    let cubeGrabPoint = new THREE.Object3D();
    cubeGrabPoint.add(this.cube)
    this.cube.position.set(0, 0, bs/2)
    cubeGrabPoint.position.set(4, -2, 0)
    this.scene.add(cubeGrabPoint)
    
    let orbitPivot = new THREE.Vector3(0, 0, -bs/2)
    orbitPivot.add(cubeGrabPoint.position)
    const controls = new TrackballControls( cubeGrabPoint, orbitPivot, this.renderer.domElement )
    controls.staticMoving = false
    controls.rotateSpeed = 1; //50
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = true;
    controls.noPan = true;
    controls.dynamicDampingFactor = 0.05;
    this.controls = controls

    //controls.addEventListener( 'change', render );

    window.addEventListener('resize', this.resizeCanvas)
    this.resizeCanvas()

    this.start()
  }

  componentWillUnmount() {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
    window.removeEventListener('resize', this.resizeCanvas)
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop = () => {
    cancelAnimationFrame(this.frameId)
  }

  resizeCanvas = () => {
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();    
    this.renderer.setSize(width, height);
  }

  animate = () => {
    // this.cube.rotation.x += 0.01
    // this.cube.rotation.y += 0.01
    this.controls.update();
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  render() {
    return(
      <div style={{ height: '600px', width: '99vw', 
        position: 'relative', marginLeft: '-50vw', left: '50%' 
      }}
        ref={(mount) => { this.mount = mount }}
      />
    )
  }
}

export default Logo3D