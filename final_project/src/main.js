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
import { scenes } from './scenes'
import gsap from 'gsap'
import * as dat from 'dat.gui'

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

let currentSplatIndex = 0
const loadedSplats = [] // Array to store all loaded splats

// let isLoadingSplat = false
// const splatsURL = [
//   'https://lumalabs.ai/capture/f3f711da-72aa-46c1-9697-15390ab877c9',
//   'https://lumalabs.ai/capture/d913de89-45ac-40ba-a29e-19b847932b8f',
//   'https://lumalabs.ai/capture/2b2112cd-9aa0-44f3-88b3-fde365066a3b',
//   'https://lumalabs.ai/capture/8d7f5584-3765-487e-a16d-23b0656ce36c',
//   'https://lumalabs.ai/capture/34dc4036-a526-43ed-9ff6-b6a05fa024ba',
//   'https://lumalabs.ai/capture/e8c4d292-4765-4a0f-b729-4ca3ce29c5d2',
//   'https://lumalabs.ai/capture/90449613-d135-49db-92c9-20e70c2b9672',
//   'https://lumalabs.ai/capture/057109e3-79e1-411a-ab84-016cbd417d36',
//   'https://lumalabs.ai/capture/4da7cf32-865a-4515-8cb9-9dfc574c90c2'
// ]

const wheel = new WheelAdaptor({ type: 'discrete' })

// Add at the top with other declarations
const transitionPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0
  })
)

// Add near your other declarations
let gui

function setupDebugGUI() {
  gui = new dat.GUI()
  
  // Create control objects
  const cameraControls = {
    posX: camera.position.x,
    posY: camera.position.y,
    posZ: camera.position.z,
    rotX: camera.rotation.x,
    rotY: camera.rotation.y,
    rotZ: camera.rotation.z
  }

  const sofaControls = meshes.sofa ? {
    posX: meshes.sofa.model.position.x,
    posY: meshes.sofa.model.position.y,
    posZ: meshes.sofa.model.position.z,
    rotX: meshes.sofa.model.rotation.x,
    rotY: meshes.sofa.model.rotation.y,
    rotZ: meshes.sofa.model.rotation.z,
    scale: meshes.sofa.model.scale.x
  } : null

  // Camera controls
  const cameraPosition = gui.addFolder('Camera Position')
  cameraPosition.add(cameraControls, 'posX', -10, 10).step(0.001).name('x').onChange(value => {
    camera.position.x = value
  })
  cameraPosition.add(cameraControls, 'posY', -10, 10).step(0.001).name('y').onChange(value => {
    camera.position.y = value
  })
  cameraPosition.add(cameraControls, 'posZ', -10, 10).step(0.001).name('z').onChange(value => {
    camera.position.z = value
  })
  cameraPosition.open()

  const cameraRotation = gui.addFolder('Camera Rotation')
  cameraRotation.add(cameraControls, 'rotX', -Math.PI, Math.PI).step(0.001).name('x').onChange(value => {
    camera.rotation.x = value
  })
  cameraRotation.add(cameraControls, 'rotY', -Math.PI, Math.PI).step(0.001).name('y').onChange(value => {
    camera.rotation.y = value
  })
  cameraRotation.add(cameraControls, 'rotZ', -Math.PI, Math.PI).step(0.001).name('z').onChange(value => {
    camera.rotation.z = value
  })
  cameraRotation.open()

  // Sofa controls
  if (meshes.sofa && sofaControls) {
    const sofaPosition = gui.addFolder('Sofa Position')
    sofaPosition.add(sofaControls, 'posX', -10, 10).step(0.001).name('x').onChange(value => {
      meshes.sofa.model.position.x = value
    })
    sofaPosition.add(sofaControls, 'posY', -10, 10).step(0.001).name('y').onChange(value => {
      meshes.sofa.model.position.y = value
    })
    sofaPosition.add(sofaControls, 'posZ', -10, 10).step(0.001).name('z').onChange(value => {
      meshes.sofa.model.position.z = value
    })
    sofaPosition.open()

    const sofaRotation = gui.addFolder('Sofa Rotation')
    sofaRotation.add(sofaControls, 'rotX', -Math.PI, Math.PI).step(0.001).name('x').onChange(value => {
      meshes.sofa.model.rotation.x = value
    })
    sofaRotation.add(sofaControls, 'rotY', -Math.PI, Math.PI).step(0.001).name('y').onChange(value => {
      meshes.sofa.model.rotation.y = value
    })
    sofaRotation.add(sofaControls, 'rotZ', -Math.PI, Math.PI).step(0.001).name('z').onChange(value => {
      meshes.sofa.model.rotation.z = value
    })
    sofaRotation.open()

    const sofaScale = gui.addFolder('Sofa Scale')
    sofaScale.add(sofaControls, 'scale', 0.1, 5).step(0.001).name('uniform scale').onChange(value => {
      meshes.sofa.model.scale.set(value, value, value)
    })
    sofaScale.open()
  }

  // Log button
  gui.add({
    logSettings: () => {
      const settings = {
        camera: {
          position: {
            x: Number(camera.position.x.toFixed(3)),
            y: Number(camera.position.y.toFixed(3)),
            z: Number(camera.position.z.toFixed(3))
          },
          rotation: {
            x: Number(camera.rotation.x.toFixed(3)),
            y: Number(camera.rotation.y.toFixed(3)),
            z: Number(camera.rotation.z.toFixed(3))
          }
        }
      }

      if (meshes.sofa) {
        settings.sofa = {
          position: {
            x: Number(meshes.sofa.model.position.x.toFixed(3)),
            y: Number(meshes.sofa.model.position.y.toFixed(3)),
            z: Number(meshes.sofa.model.position.z.toFixed(3))
          },
          rotation: {
            x: Number(meshes.sofa.model.rotation.x.toFixed(3)),
            y: Number(meshes.sofa.model.rotation.y.toFixed(3)),
            z: Number(meshes.sofa.model.rotation.z.toFixed(3))
          },
          scale: {
            x: Number(meshes.sofa.model.scale.x.toFixed(3)),
            y: Number(meshes.sofa.model.scale.x.toFixed(3)),
            z: Number(meshes.sofa.model.scale.x.toFixed(3))
          }
        }
      }

      console.log('Scene Settings:', settings)
    }
  }, 'logSettings').name('Log All Settings')
}

init()


function switchScene(direction) {
  console.log('Switching scene', direction)
  // Hide current splat
  if (loadedSplats[currentSplatIndex]) {
    loadedSplats[currentSplatIndex].visible = false
  }

  // Update index
  if (direction > 0) {
    currentSplatIndex = (currentSplatIndex + 1) % scenes.length
  } else {
    currentSplatIndex = (currentSplatIndex - 1 + scenes.length) % scenes.length
  }

  const newScene = scenes[currentSplatIndex]
  const splat = loadedSplats[currentSplatIndex]


  switchToScene(newScene)
  // Show new splat
  if (splat) {
    splat.visible = true
    splat.captureCubemap(renderer).then((capturedTexture) => {
      console.log('Captured texture', capturedTexture)
      scene.environment = capturedTexture;
      scene.background = capturedTexture;
      scene.backgroundBlurriness = 0.5;
    })
  }
}

function switchToScene(newScene) {

  console.log('New scene', newScene)
  // Animate camera position and rotation
  gsap.to(camera.position, {
    x: newScene.camera.position.x,
    y: newScene.camera.position.y,
    z: newScene.camera.position.z,
    duration: 1.5,
    ease: "power2.inOut"
  })

  gsap.to(camera.rotation, {
    x: newScene.camera.rotation.x,
    y: newScene.camera.rotation.y,
    z: newScene.camera.rotation.z,
    duration: 1.5,
    ease: "power2.inOut"
  })

  // Animate sofa if it exists
  // console.log(meshes.sofa)
  if (meshes.sofa) {
    gsap.to(meshes.sofa.model.position, {
      x: newScene.sofa.position.x,
      y: newScene.sofa.position.y,
      z: newScene.sofa.position.z,
      duration: 1.5,
      ease: "power2.inOut"
    })

    gsap.to(meshes.sofa.model.scale, {
      x: newScene.sofa.scale.x,
      y: newScene.sofa.scale.y,
      z: newScene.sofa.scale.z,
      duration: 1.5,
      ease: "power2.inOut"
    })

    gsap.to(meshes.sofa.model.rotation, {
      x: newScene.sofa.rotation.x,
      y: newScene.sofa.rotation.y,
      z: newScene.sofa.rotation.z,
      duration: 1.5,
      ease: "power2.inOut"
    })

  }
}

function scrollHandler() {
  wheel.connect()
  wheel.addEventListener('trigger', (event) => {
    if (event.y === 1) {
      console.log('Scrolling Down');
      switchScene(1)
    } else if (event.y === -1) {
      console.log('Scrolling Up');
      switchScene(-1)
    }
  })
}

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
  setupDebugGUI()
  switchToScene(scenes[0])
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
        // meshes.sofa.toggleRepresentation()
      }
    }
  })
}


async function preloadSplats() {
  console.log('Starting splat preload...')

  // Simple for loop to load splats
  for (let i = 0; i < scenes.length; i++) {
    try {
      const splat = await addGussianSplat(scenes[i].splatUrl)
      if (splat) {
        loadedSplats[i] = splat
        scene.add(splat)
        splat.visible = i === 0 // Only show first splat initially
      }
    } catch (error) {
      console.error(`Error loading splat ${i}:`, error)
    }
  }

  console.log('All splats preloaded!')
}

function setSceneParameters(sceneIndex) {
  const targetScene = scenes[sceneIndex]

  // Set camera parameters
  camera.position.set(
    targetScene.camera.position.x,
    targetScene.camera.position.y,
    targetScene.camera.position.z
  )
  camera.rotation.set(
    targetScene.camera.rotation.x,
    targetScene.camera.rotation.y,
    targetScene.camera.rotation.z
  )

  // Set sofa parameters if it exists
  if (meshes.sofa && meshes.sofa.model) {
    meshes.sofa.model.position.set(
      targetScene.sofa.position.x,
      targetScene.sofa.position.y,
      targetScene.sofa.position.z
    )
    meshes.sofa.model.rotation.set(
      targetScene.sofa.rotation.x,
      targetScene.sofa.rotation.y,
      targetScene.sofa.rotation.z
    )
    meshes.sofa.model.scale.set(
      targetScene.sofa.scale.x,
      targetScene.sofa.scale.x,  // Using x for uniform scale
      targetScene.sofa.scale.x
    )
  }
}

function init() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  meshes.default = addBoilerPlateMeshes()
  meshes.standard = addStandardMesh()
  lights.default = addLight()

  scene.add(lights.default)
  // scene.add(meshes.default)

  camera.position.set(0, 0, 5)


  setupClickHandler()
  loadModels()
  resize()
  animate()
  scrollHandler()

  // Preload all splats before starting
  preloadSplats()


  // Load initial splat
  
  // setupDebugGUI()
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