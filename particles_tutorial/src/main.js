import './style.css'
import * as THREE from 'three'
import { addBoilerPlateMeshes, addStandardMesh, addTextureMesh, addMushroomMesh } from './addDefaultMeshes';
import { addLight } from './addDefaultLights';
import Model from './Model'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const renderer = new THREE.WebGLRenderer({ antialias: true })
const clock = new THREE.Clock()

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1, 100
);

const meshes = {}
const lights = {}
const scene = new THREE.Scene();
const mixers = []
const controls = new OrbitControls(camera, renderer.domElement);

init();


function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  meshes.default = addBoilerPlateMeshes()
  meshes.standard = addStandardMesh()
  meshes.physical = addTextureMesh()
  meshes.mushroom = addMushroomMesh()
  meshes.physical.position.set(-2, -2, 0)
  camera.position.set(0, 0, 5);

  lights.default = addLight()

  points();
  buffer();
  // scene.add(meshes.default)
  // scene.add(meshes.standard)
  // scene.add(meshes.physical)
  // scene.add(meshes.mushroom)
  // scene.add(lights.default)
  resize();
  instances()
  animate();
 }

function buffer(){
  const geometry = new THREE.BufferGeometry()
  const count = 5000
  const positions = new Float32Array(count * 3)
  for(let i = 0; i < count * 3; i++){
    positions[i] = (Math.random() - 0.5) * 10
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.02,
    sizeAttenuation: true
  })
  const particles = new THREE.Points(geometry, particleMaterial)
  meshes.points = particles
  scene.add(meshes.points)
}

function points() {
  const particleGeometry = new THREE.SphereGeometry(1, 32, 32);
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.02,
    sizeAttenuation: true
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles)
//   meshes.points = particles
//   scene.add(meshes.points)
}

function instances() {
  const flower = new Model({
    name: 'flower',
    scene: scene,
    meshes: meshes,
    url: 'flowers.glb',
    scale: new THREE.Vector3(2, 2, 2),
    position: new THREE.Vector3(0, -0.8, 3),
    animationState: true,
    mixers: mixers,
    // replace: true,
    // replaceURL: 'black_matcap.png'
  })
  flower.initPoints()
}

function resize() {
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  })
}

function animate() {
  // const tick = clock.getElapsedTime()
  const delta = clock.getDelta()

  requestAnimationFrame(animate);
  for (const mixer of mixers) {
    mixer.update(delta)
  }
  if (meshes.flower) {
    meshes.flower.rotation.y -= 0.001;
  }
  // meshes.physical.material.displacementScale = Math.sin(tick)

  // meshes.points.rotation.y += 0.01

  for(let i = 0; i < 5000; i++){
    const index = i * 3
    const x = meshes.points.geometry.attributes.position.array[index]
    meshes.points.geometry.attributes.position.array[index +1] =Math.sin(clock.getElapsedTime()+x)
  }
  meshes.points.geometry.attributes.position.needsUpdate = true

  meshes.default.rotation.x += 0.01
  meshes.standard.rotation.y += 0.01
  meshes.standard.rotation.z -= 0.01
  meshes.physical.rotation.y += 0.02
  meshes.mushroom.rotation.x += 0.01
  // meshes.physical.rotation.x+=0.01

  renderer.render(scene, camera);
}