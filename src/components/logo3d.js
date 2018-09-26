import React, { Component } from 'react'
import * as THREE from 'three'
import SpinControl from './spincontrol'

class Logo3D extends Component {
  
  componentDidMount() {
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight
    
    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(
      20,
      width / height,
      0.1,
      100
    ) 
    this.camera.position.set(0, 0, 80)
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
    let material = new THREE.MeshBasicMaterial( {color: 0x000000} )
    this.frame = new THREE.Mesh( geometry, material )
    this.frame.renderOrder = 2
    this.scene.add( this.frame );
    
    const bs = 12 //logo size
    
    this.cube = new THREE.Object3D();
    material = new THREE.MeshLambertMaterial({ color: '#6666ff', side: THREE.FrontSide })
    material.emissive.set('#6666ff')
    material.emissiveIntensity = .3
    let planeGeo = new THREE.PlaneGeometry(bs * .87, bs * .87)
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
    
    this.cube.position.set(3.4, -3.4, bs/2.25)
    this.scene.add(this.cube)
    
    this.controls = new SpinControl(this.cube, this.renderer.domElement)

    window.addEventListener('resize', this.resizeCanvas)
    this.resizeCanvas()

    this.start()
  }

  componentWillUnmount() {
    this.stop()
    this.controls.dispose()
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
    this.controls.update();
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  render() {
    return(
      <div style = {{width:'100%', height:'100%'}}
        ref={(mount) => { this.mount = mount }}
      />
    )
  }
}

export default Logo3D