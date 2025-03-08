import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { addBoilerPlateMeshes, addStandardMesh } from './addDefaultMeshes'
import { addLight } from './addDefaultLights'
import Model from './Model'
import ModelWithPoints from './ModelWithPoints'
import { addGussianSplat } from './addGussianSplat'
import { WheelAdaptor } from 'three-story-controls'


const renderer = new THREE.WebGLRenderer({ antialias: false })
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1, 100
)

const meshes = {}
const lights = {}
const scene = new THREE.Scene()
// const controls = new OrbitControls(camera, renderer.domElement)

// Add these at the top with other declarations
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const normalizedMouse = new THREE.Vector2()

let currentSplatIndex = 0
let isLoadingSplat = false
const splatsURL = [
  'https://lumalabs.ai/capture/f3f711da-72aa-46c1-9697-15390ab877c9',
  'https://lumalabs.ai/capture/d913de89-45ac-40ba-a29e-19b847932b8f',
  'https://lumalabs.ai/capture/2b2112cd-9aa0-44f3-88b3-fde365066a3b',
  'https://lumalabs.ai/capture/8d7f5584-3765-487e-a16d-23b0656ce36c',
  'https://lumalabs.ai/capture/34dc4036-a526-43ed-9ff6-b6a05fa024ba',
  'https://lumalabs.ai/capture/e8c4d292-4765-4a0f-b729-4ca3ce29c5d2',
  'https://lumalabs.ai/capture/90449613-d135-49db-92c9-20e70c2b9672',
  'https://lumalabs.ai/capture/057109e3-79e1-411a-ab84-016cbd417d36',
  'https://lumalabs.ai/capture/4da7cf32-865a-4515-8cb9-9dfc574c90c2'
]

const wheel = new WheelAdaptor(camera, renderer.domElement)
wheel.connect()
wheel.addEventListener('trigger', () => {
	//increment our counter each time we scroll
	currentSplatIndex = (currentSplatIndex + 1) % splatsURL.length
	//check if our meshes.flower exists
	switchSplat(1)
	// if (currentSlide < slides.length - 1) {
	// 	currentSlide++
	// } else {
	// 	currentSlide = 0
	// }
	// gsap.to(camera.position, {
	// 	y: currentSlide * -10,
	// 	duration: 2,
	// 	ease: 'back.inOut',
	// })
})

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


// Add this function to handle splat switching
async function switchSplat(direction) {
  if (isLoadingSplat) return // Prevent multiple loads at once

  isLoadingSplat = true

  // // Calculate new index
  // if (direction > 0) {
  //   currentSplatIndex = (currentSplatIndex + 1) % splatsURL.length
  // } else {
  //   currentSplatIndex = (currentSplatIndex - 1 + splatsURL.length) % splatsURL.length
  // }


  // Remove existing splat if it exists
  if (meshes.splat) {
    scene.remove(meshes.splat)
    meshes.splat.dispose && meshes.splat.dispose()
  }

  // Load new splat
  const newSplat = await addGussianSplat(splatsURL[currentSplatIndex])
  newSplat.onLoad = () => {

    meshes.splat = newSplat
    scene.add(meshes.splat)

    isLoadingSplat = false
  }

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


  setupClickHandler()
  loadModels()
  resize()
  animate()


  // Load initial splat
  switchSplat(1)
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