import './style.css'
import * as THREE from 'three'
import {
	addBoilerPlateMeshes,
	addStandardMesh,
} from './addDefaultMeshes'
import { addLight } from './addDefaultLights'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Model from './Model'
import { LumaSplatsThree } from '@lumaai/luma-web'
import gsap from 'gsap'

const renderer = new THREE.WebGLRenderer({ antialias: false })

const clock = new THREE.Clock()

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
)

const mixers = []

const meshes = {}

const lights = {}

const scene = new THREE.Scene()

const controls = new OrbitControls(camera, renderer.domElement)
// controls.autoRotate = true
init()

function init() {
	renderer.setSize(window.innerWidth, window.innerHeight)
	document.body.appendChild(renderer.domElement)
	// meshes.physical = addTexturedMesh()

	meshes.splat = new LumaSplatsThree({
		// source: 'https://lumalabs.ai/capture/e8c4d292-4765-4a0f-b729-4ca3ce29c5d2',
		// source: 'https://lumalabs.ai/capture/4da7cf32-865a-4515-8cb9-9dfc574c90c2',
		source: 'https://lumalabs.ai/capture/90449613-d135-49db-92c9-20e70c2b9672',
		// controls the particle entrance animation
		// particleRevealEnabled: true,
		loadingAnimationEnabled: false,
	})
	meshes.splat.onLoad = () => {
		meshes.splat.captureCubemap(renderer).then((capturedTexture) => {
			gsap.to('.loader', {
				opacity: 0,
				duration: 1.5,
				ease: 'power3.inOut',
				onComplete: () =>
					gsap.to('.loader', {
						zIndex: -3,
					}),
			})
			scene.environment = capturedTexture
			scene.background = capturedTexture
			scene.backgroundBlurriness = 0.5
		})
	}
	meshes.default = addBoilerPlateMeshes()
	meshes.standard = addStandardMesh()
	// lights.default = addLight()

	// scene.add(lights.default)
	scene.add(meshes.default)
	scene.add(meshes.standard)
	// scene.add(meshes.physical)
	scene.add(meshes.splat)

	// meshes.physical.position.set(-2, 2, 0)
	camera.position.set(0, 0, 5)
	instances()
	resize()
	animate()
}
function instances() {
	const car = new Model({
		name: 'car',
		scene: scene,
		meshes: meshes,
		url: 'sports_lite.glb',
		scale: new THREE.Vector3(0.01, 0.01, 0.01),
		position: new THREE.Vector3(-2.5, 1, 1),
		rotation: new THREE.Vector3(0, -Math.PI / 4, 0),
	})
	// car.init()

	const sofa = new Model({
		name: 'sofa',
		scene: scene,
		meshes: meshes,
		url: 'sofa.glb',
		scale: new THREE.Vector3(1	, 1, 1),
		position: new THREE.Vector3(0, -2, 0),
	})
	sofa.init()
}
function resize() {
	window.addEventListener('resize', () => {
		renderer.setSize(window.innerWidth, window.innerHeight)
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
	})
}
console.log(Math.clamp)
function animate() {
	const delta = clock.getDelta()
	requestAnimationFrame(animate)
	controls.update()

	for (const mixer of mixers) {
		mixer.update(delta)
	}
	if (meshes.flower) {
		meshes.flower.rotation.y -= 0.01
	}

	meshes.default.rotation.x += 0.01
	meshes.default.rotation.y -= 0.01
	meshes.default.rotation.z -= 0.02

	meshes.standard.rotation.x += 0.01
	meshes.standard.rotation.y += 0.02
	meshes.standard.rotation.z -= 0.012

	renderer.render(scene, camera)
}