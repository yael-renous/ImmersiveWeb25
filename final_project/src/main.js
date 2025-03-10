import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { addBoilerPlateMeshes, addStandardMesh } from './addDefaultMeshes'
import { addLight } from './addDefaultLights'
import { addGussianSplat } from './addGussianSplat'
import { WheelAdaptor } from 'three-story-controls'
import { scenes } from './scenes'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import SofaModel from './SofaModel'

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
const clock = new THREE.Clock()
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

let currentSplatIndex = 0
const loadedSplats = [] 

let sofaModel;
const wheel = new WheelAdaptor({ type: 'discrete' })

let gui

function setupDebugGUI() {
  gui = new dat.GUI()
  
  const currentScene = scenes[currentSplatIndex]
  
  // Create control objects and store GUI controllers
  const cameraControls = {
    posX: currentScene.camera.position.x,
    posY: currentScene.camera.position.y,
    posZ: currentScene.camera.position.z,
    rotX: currentScene.camera.rotation.x,
    rotY: currentScene.camera.rotation.y,
    rotZ: currentScene.camera.rotation.z
  }

  const cameraControllers = {
    position: {},
    rotation: {}
  }

  // Camera controls
  const cameraPosition = gui.addFolder('Camera Position')
  cameraControllers.position.x = cameraPosition.add(cameraControls, 'posX', -10, 10).step(0.001).name('x').onChange(value => {
    camera.position.x = value
  })
  cameraControllers.position.y = cameraPosition.add(cameraControls, 'posY', -10, 10).step(0.001).name('y').onChange(value => {
    camera.position.y = value
  })
  cameraControllers.position.z = cameraPosition.add(cameraControls, 'posZ', -10, 10).step(0.001).name('z').onChange(value => {
    camera.position.z = value
  })
  cameraPosition.open()

  const cameraRotation = gui.addFolder('Camera Rotation')
  cameraControllers.rotation.x = cameraRotation.add(cameraControls, 'rotX', -Math.PI, Math.PI).step(0.001).name('x').onChange(value => {
    camera.rotation.x = value
  })
  cameraControllers.rotation.y = cameraRotation.add(cameraControls, 'rotY', -Math.PI, Math.PI).step(0.001).name('y').onChange(value => {
    camera.rotation.y = value
  })
  cameraControllers.rotation.z = cameraRotation.add(cameraControls, 'rotZ', -Math.PI, Math.PI).step(0.001).name('z').onChange(value => {
    camera.rotation.z = value
  })
  cameraRotation.open()

  // Add update function to controls
  controls.addEventListener('change', () => {
    // Update position controllers
    cameraControllers.position.x.setValue(camera.position.x)
    cameraControllers.position.y.setValue(camera.position.y)
    cameraControllers.position.z.setValue(camera.position.z)
    
    // Update rotation controllers
    cameraControllers.rotation.x.setValue(camera.rotation.x)
    cameraControllers.rotation.y.setValue(camera.rotation.y)
    cameraControllers.rotation.z.setValue(camera.rotation.z)
  })

  const sofaControls = meshes.sofa ? {
    posX: currentScene.sofa.position.x,
    posY: currentScene.sofa.position.y,
    posZ: currentScene.sofa.position.z,
    rotX: currentScene.sofa.rotation.x,
    rotY: currentScene.sofa.rotation.y,
    rotZ: currentScene.sofa.rotation.z,
    scale: currentScene.sofa.scale.x
  } : null

  // Sofa controls
  if (meshes.sofa && sofaControls) {
    const sofaPosition = gui.addFolder('Sofa Position')
    sofaPosition.add(sofaControls, 'posX', -10, 10).step(0.001).name('x').onChange(value => {
      meshes.sofa.position.x = value
    })
    sofaPosition.add(sofaControls, 'posY', -10, 10).step(0.001).name('y').onChange(value => {
      meshes.sofa.position.y = value
    })
    sofaPosition.add(sofaControls, 'posZ', -10, 10).step(0.001).name('z').onChange(value => {
      meshes.sofa.position.z = value
    })
    sofaPosition.open()

    const sofaRotation = gui.addFolder('Sofa Rotation')
    sofaRotation.add(sofaControls, 'rotX', -Math.PI, Math.PI).step(0.001).name('x').onChange(value => {
      meshes.sofa.rotation.x = value
    })
    sofaRotation.add(sofaControls, 'rotY', -Math.PI, Math.PI).step(0.001).name('y').onChange(value => {
      meshes.sofa.rotation.y = value
    })
    sofaRotation.add(sofaControls, 'rotZ', -Math.PI, Math.PI).step(0.001).name('z').onChange(value => {
      meshes.sofa.rotation.z = value
    })
    sofaRotation.open()

    const sofaScale = gui.addFolder('Sofa Scale')
    sofaScale.add(sofaControls, 'scale', 0.1, 5).step(0.001).name('uniform scale').onChange(value => {
      meshes.sofa.scale.set(value, value, value)
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
            x: Number(meshes.sofa.position.x.toFixed(3)),
            y: Number(meshes.sofa.position.y.toFixed(3)),
            z: Number(meshes.sofa.position.z.toFixed(3))
          },
          rotation: {
            x: Number(meshes.sofa.rotation.x.toFixed(3)),
            y: Number(meshes.sofa.rotation.y.toFixed(3)),
            z: Number(meshes.sofa.rotation.z.toFixed(3))
          },
          scale: {
            x: Number(meshes.sofa.scale.x.toFixed(3)),
            y: Number(meshes.sofa.scale.x.toFixed(3)),
            z: Number(meshes.sofa.scale.x.toFixed(3))
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

  // Reset sofa to default state
  if (sofaModel) {
    sofaModel.setVisibility('default')
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
  console.log(meshes.sofa)
  if (meshes.sofa) {
    gsap.to(meshes.sofa.position, {
      x: newScene.sofa.position.x,
      y: newScene.sofa.position.y,
      z: newScene.sofa.position.z,
      duration: 1.5,
      ease: "power2.inOut"
    })

    gsap.to(meshes.sofa.scale, {
      x: newScene.sofa.scale.x,
      y: newScene.sofa.scale.y,
      z: newScene.sofa.scale.z,
      duration: 1.5,
      ease: "power2.inOut"
    })

    gsap.to(meshes.sofa.rotation, {
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
  const initialScene = scenes[0]
  sofaModel = new SofaModel({
    url: '/sofa.glb',
    scene: scene,
    meshes: meshes,
    position: new THREE.Vector3(
      initialScene.sofa.position.x,
      initialScene.sofa.position.y,
      initialScene.sofa.position.z
    ),
    scale: new THREE.Vector3(
      initialScene.sofa.scale.x,
      initialScene.sofa.scale.y,
      initialScene.sofa.scale.z
    ),
    callback: (loadedMesh) => {
      console.log('Sofa loaded:', loadedMesh)
      setupDebugGUI()
      switchToScene(scenes[0])
    }
  })
  await sofaModel.init()
}

function setupClickHandler() {
    let isToggled = false;  // Track toggle state

    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        raycaster.setFromCamera(mouse, camera)

        // Check for intersections with the sofa model group
        const intersectsModel = raycaster.intersectObjects(scene.children)
        for(let i = 0; i < intersectsModel.length; i++) {
            const intersect = intersectsModel[i]
        
            const expectedType = isToggled ? 
                (scenes[currentSplatIndex].hoverModel || 'default') : 
                'default';
            const expectedName = `sofa-${expectedType}`;

            if(intersect.object.name === expectedName && intersect.object.visible) {
                isToggled = !isToggled;
                const currentScene = scenes[currentSplatIndex]
                const modelType = isToggled ? (currentScene.hoverModel || 'default') : 'default'

                sofaModel.setVisibility(modelType)
                break;
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

function init() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  meshes.default = addBoilerPlateMeshes()
  meshes.standard = addStandardMesh()
  lights.default = addLight()

  scene.add(lights.default)
  // scene.add(meshes.default)

  camera.position.set(0, 0, 5)

  setupClickHandler()  // Uncomment this
  // setupHoverHandler()  // Comment this out
  loadModels()
  resize()
  animate()
  scrollHandler()

  // Preload all splats before starting
  preloadSplats()
}

function resize() {
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  })
}

function animate() {
  const elapsedTime = clock.getElapsedTime()  // Get time elapsed since last frame

  requestAnimationFrame(animate)
  controls.update()
  
  // Update sofa animations with delta time
  if (sofaModel) {
    sofaModel.update(elapsedTime)
  }
  
  renderer.render(scene, camera)
}
