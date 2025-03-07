import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class ModelWithPoints {
  constructor({ url, scene, meshes }) {
    this.url = url
    this.scene = scene
    this.meshes = meshes
    this.loader = new GLTFLoader()
    this.model = null
    this.pointsGroup = null
    this.originalPositions = []  // Store original vertex positions
    this.animationAmplitude = 0.03  // Maximum distance points can move
    this.animationSpeed = 0.002  // Speed of the animation
    this.mousePosition = new THREE.Vector2(0, 0)  // Store mouse position
    this.mouseInfluence = 0.06      // How much mouse affects the warping
    this.mouseRadius = 0.2         // How far the mouse effect reaches
  }

  async load() {
    return new Promise((resolve, reject) => {
      this.loader.load(
        this.url,
        (gltf) => {
          this.model = gltf.scene

          // Create points representation
          this.pointsGroup = new THREE.Group()
          this.pointsGroup.scale.copy(this.model.scale)
          this.pointsGroup.position.copy(this.model.position)
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
} 