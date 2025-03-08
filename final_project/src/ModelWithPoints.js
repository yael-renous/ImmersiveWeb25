import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

export default class ModelWithPoints {
  constructor({ url, scene, meshes, position = new THREE.Vector3(0, 0, 0), scale = new THREE.Vector3(1, 1, 1) }) {
    this.url = url
    this.scene = scene
    this.meshes = meshes
    this.position = position
    this.scale = scale
    this.gltfLoader = new GLTFLoader()
    this.fbxLoader = new FBXLoader()
    this.model = null
    this.pointsGroup = null
    this.originalPositions = []  // Store original vertex positions
    this.animationAmplitude = 0.03  // Maximum distance points can move
    this.animationSpeed = 0.002  // Speed of the animation
    this.mousePosition = new THREE.Vector2(0, 0)  // Store mouse position
    this.mouseInfluence = 0.06      // How much mouse affects the warping
    this.mouseRadius = 0.2         // How far the mouse effect reaches
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z)
    if (this.model) this.model.position.set(x, y, z)
    if (this.pointsGroup) this.pointsGroup.position.set(x, y, z)
  }

  setScale(x, y, z) {
    this.scale.set(x, y, z)
    if (this.model) this.model.scale.set(x, y, z)
    if (this.pointsGroup) this.pointsGroup.scale.set(x, y, z)
  }

  async load() {
    return new Promise((resolve, reject) => {
      const fileExtension = this.url.split('.').pop().toLowerCase()
      const loader = fileExtension === 'fbx' ? this.fbxLoader : this.gltfLoader

      loader.load(
        this.url,
        (result) => {
          this.model = fileExtension === 'fbx' ? result : result.scene

          // Apply initial position and scale
          this.model.position.copy(this.position)
          this.model.scale.copy(this.scale)


          this.model.traverse((child) => {
            if (child.isMesh) {
              console.log(`Mesh name: ${child.name}`)
              console.log('Material:', child.material)
              
              // Check if material is MeshBasicMaterial
              if (child.material.type === 'MeshBasicMaterial') {
                // Create new MeshStandardMaterial and copy relevant properties
                const standardMaterial = new THREE.MeshStandardMaterial({
                  color: child.material.color,
                  map: child.material.map,
                  transparent: child.material.transparent,
                  opacity: child.material.opacity,
                  // side: child.material.side,
                  
                  // Brightness related parameters:
                  emissive: new THREE.Color(0x006666), // Deep blue-green/teal color
                  emissiveIntensity: 0, // Controls how strong the emission is (0-1)
                  
                  // Surface properties:
                  roughness: 0, // Lower values = more shiny/glossy (0-1)
                  metalness: 0, // Lower values = more like plastic, higher = more metallic (0-1)
                  
                  // Other useful parameters:
                  // envMapIntensity: 1.0, // How much environment lighting affects the material
                  flatShading: false, // true for faceted look
                  // wireframe: true, // true for wireframe view
                });
                child.material = standardMaterial;
              }
            }
          })
          
          // Create points representation
          this.pointsGroup = new THREE.Group()
          this.pointsGroup.position.copy(this.position)
          this.pointsGroup.scale.copy(this.scale)
          this.pointsGroup.rotation.copy(this.model.rotation)

          // Fix the rotation - rotate 90 degrees on X axis
          this.pointsGroup.rotation.x = -Math.PI / 2

          this.model.traverse((child) => {
            if (child.isMesh) {
              // Create a new geometry for points
              const pointsGeometry = new THREE.BufferGeometry()
              const positions = child.geometry.attributes.position.array.slice()
              pointsGeometry.setAttribute('position', 
                new THREE.Float32BufferAttribute(positions, 3)
              )
              
              // Store original positions for this mesh's vertices
              this.originalPositions.push({
                positions: positions.slice(), // Make another copy for the points
                count: child.geometry.attributes.position.count
              })

              const points = new THREE.Points(
                pointsGeometry, // Use the new geometry
                new THREE.PointsMaterial({
                  color: 0xffffff,
                  size: 0.01,
                  sizeAttenuation: true
                })
              )

              // Copy the mesh's local transform to the points
              points.position.copy(child.position)
              points.rotation.copy(child.rotation)
              points.scale.copy(child.scale)

              this.pointsGroup.add(points)
            }
          })

          // Add both representations to the scene
          this.scene.add(this.model)
          this.scene.add(this.pointsGroup)

          // Store reference in meshes object
          this.meshes[this.url] = {
            original: this.model,
            points: this.pointsGroup
          }

          resolve(this)
        },
        undefined,
        reject
      )
    })
  }

  setPointsVisible(visible) {
    if (this.pointsGroup) {
      this.pointsGroup.visible = visible
    }
  }

  setModelVisible(visible) {
    if (this.model) {
      this.model.visible = visible
    }
  }

  // Helper method to toggle between representations
  toggleRepresentation() {
    if (this.model && this.pointsGroup) {
      this.model.visible = !this.model.visible
      this.pointsGroup.visible = !this.pointsGroup.visible
    }
  }

  animatePoints(time) {
    // if (!this.pointsGroup || !this.pointsGroup.visible) return

    let vertexIndex = 0
    this.pointsGroup.traverse((child) => {
      if (child instanceof THREE.Points) {
        const positions = child.geometry.attributes.position.array
        const originalPositions = this.originalPositions[vertexIndex].positions

        for (let i = 0; i < positions.length; i += 3) {
          // Create a unique offset for each point based on its index and time
          const offset = (i + time) * this.animationSpeed
          
          // Use sine waves with different frequencies for each axis
          positions[i] = originalPositions[i] + 
            Math.sin(offset) * this.animationAmplitude
          positions[i + 1] = originalPositions[i + 1] + 
            Math.sin(offset * 1.1) * this.animationAmplitude
          positions[i + 2] = originalPositions[i + 2] + 
            Math.sin(offset * 1.2) * this.animationAmplitude
        }

        child.geometry.attributes.position.needsUpdate = true
        vertexIndex++
      }
    })
  }

  updateMousePosition(x, y) {
    this.mousePosition.set(x, y)
  }

  mouseWarp() {
    if (!this.pointsGroup || !this.pointsGroup.visible) return

    let vertexIndex = 0
    this.pointsGroup.traverse((child) => {
      if (child instanceof THREE.Points) {
        const positions = child.geometry.attributes.position.array
        const originalPositions = this.originalPositions[vertexIndex].positions

        for (let i = 0; i < positions.length; i += 3) {
          const vertexPosition = new THREE.Vector2(
            originalPositions[i],
            originalPositions[i + 1]
          )
          
          const distanceToMouse = vertexPosition.distanceTo(this.mousePosition)
          const influence = Math.max(0, 1 - (distanceToMouse / this.mouseRadius))
          
          // Apply mouse-based warping
          positions[i] = positions[i] + 
            (this.mousePosition.x * influence * this.mouseInfluence)
          positions[i + 1] = positions[i + 1] + 
            (this.mousePosition.y * influence * this.mouseInfluence)
          positions[i + 2] = positions[i + 2] + 
            (Math.sin(distanceToMouse * 10) * influence * this.mouseInfluence)
        }

        child.geometry.attributes.position.needsUpdate = true
        vertexIndex++
      }
    })
  }

  animateMesh(time) {
    if (!this.model || !this.model.visible) return

    let vertexIndex = 0
    this.model.traverse((child) => {
      if (child.isMesh) {
        const positions = child.geometry.attributes.position.array
        const originalPositions = this.originalPositions[vertexIndex].positions

        for (let i = 0; i < positions.length; i += 3) {
          // Create a unique offset for each vertex based on its index and time
          const offset = (i + time) * this.animationSpeed
          
          // Use sine waves with different frequencies for each axis
          positions[i] = originalPositions[i] + 
            Math.sin(offset) * this.animationAmplitude
          positions[i + 1] = originalPositions[i + 1] + 
            Math.sin(offset * 1.1) * this.animationAmplitude
          positions[i + 2] = originalPositions[i + 2] + 
            Math.sin(offset * 1.2) * this.animationAmplitude
        }

        child.geometry.attributes.position.needsUpdate = true
        vertexIndex++
      }
    })
  }

  // Add a method to warp the mesh with mouse too
  mouseMeshWarp() {
    if (!this.model || !this.model.visible) return

    let vertexIndex = 0
    this.model.traverse((child) => {
      if (child.isMesh) {
        const positions = child.geometry.attributes.position.array
        const originalPositions = this.originalPositions[vertexIndex].positions

        for (let i = 0; i < positions.length; i += 3) {
          const vertexPosition = new THREE.Vector2(
            originalPositions[i],
            originalPositions[i + 1]
          )
          
          const distanceToMouse = vertexPosition.distanceTo(this.mousePosition)
          const influence = Math.max(0, 1 - (distanceToMouse / this.mouseRadius))
          
          positions[i] = positions[i] + 
            (this.mousePosition.x * influence * this.mouseInfluence)
          positions[i + 1] = positions[i + 1] + 
            (this.mousePosition.y * influence * this.mouseInfluence)
          positions[i + 2] = positions[i + 2] + 
            (Math.sin(distanceToMouse * 10) * influence * this.mouseInfluence)
        }

        child.geometry.attributes.position.needsUpdate = true
        vertexIndex++
      }
    })
  }
} 