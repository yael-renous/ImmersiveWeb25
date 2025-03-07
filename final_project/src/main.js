import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { addBoilerPlateMeshes, addStandardMesh } from './addDefaultMeshes'
import { addLight } from './addDefaultLights'
import Model from './Model'
import ModelWithPoints from './ModelWithPoints'
import { addGussianSplat } from './addGussianSplat'

const renderer = new THREE.WebGLRenderer({ antialias: false })
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1, 100
)

const meshes = {}
const lights = {}
const scene = new THREE.Scene()
const controls = new OrbitControls(camera, renderer.domElement)

// Add these at the top with other declarations
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const normalizedMouse = new THREE.Vector2()

// Store reference to loaded model

init()

async function loadModels() {

    const sofaModel = new ModelWithPoints({
      url: '/sofa.glb',
      scene: scene,
      meshes: meshes,
      position: new THREE.Vector3(0, 0, 0),
      scale: new THREE.Vector3(2, 2, 2)
    })
    await sofaModel.load()
    meshes.sofa = sofaModel  // Store reference to the loaded model
    
    // // Initially show the regular model
    sofaModel.setPointsVisible(false)
    sofaModel.setModelVisible(true)   
}

// Add click event listener
function setupClickHandler() {
  window.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera)

    if (meshes.sofa) {
      // Check for intersections with both model and points
      const intersectsModel = raycaster.intersectObject(meshes.sofa.model, true)
      const intersectsPoints = raycaster.intersectObject(meshes.sofa.pointsGroup, true)

      // If we clicked either representation, toggle
      if (intersectsModel.length > 0 || intersectsPoints.length > 0) {
        meshes.sofa.toggleRepresentation()
      }
    }
  })
}

// Add mouse move handler
function setupMouseHandler() {
  window.addEventListener('mousemove', (event) => {
    // Convert mouse position to normalized device coordinates
    normalizedMouse.x = (event.clientX / window.innerWidth) * 2 - 1
    normalizedMouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    if (meshes.sofa) {
      meshes.sofa.updateMousePosition(normalizedMouse.x, normalizedMouse.y)
    }
  })
}

function init() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  meshes.splat = addGussianSplat('https://lumalabs.ai/capture/4da7cf32-865a-4515-8cb9-9dfc574c90c2')
  meshes.default = addBoilerPlateMeshes()
  meshes.standard = addStandardMesh()
  lights.default = addLight()

  scene.add(lights.default)
  scene.add(meshes.default)
  if (meshes.splat) {
    scene.add(meshes.splat)
  }
  camera.position.set(0, 0, 5)

  setupMouseHandler()
  setupClickHandler()
  loadModels()
  resize()
  animate()
}

function resize() {
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  })
}

function animate() {
  requestAnimationFrame(animate)
  
  // meshes.default.rotation.x += 0.01
  // meshes.standard.rotation.y += 0.01
  // meshes.standard.rotation.z -= 0.01

  // // Call both animations independently
  // if (meshes.sofa) {
  //  // meshes.sofa.animatePoints(performance.now() * 11)
  //    meshes.sofa.mouseWarp()
  //    meshes.sofa.animateMesh(performance.now() * 1)
  // }

  renderer.render(scene, camera)
}