import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

export default class SofaModel {
    constructor({ url, scene, meshes, position = new THREE.Vector3(0, 0, 0), scale = new THREE.Vector3(1, 1, 1), callback }) {
        // Basic setup
        this.url = url
        this.scene = scene
        this.meshes = meshes
        this.position = position
        this.scale = scale
        this.callback = callback

        // Setup loaders
        this.loader = new GLTFLoader()
        this.dracoLoader = new DRACOLoader()
        this.dracoLoader.setDecoderPath('./draco/')
        this.loader.setDRACOLoader(this.dracoLoader)

        // Different sofa representations
        this.models = {
            default: null,
            points: null,
            neon: null,
            glitch: null,
            wireframe: null
        }

        // Create a parent group to handle transformations
        this.modelGroup = new THREE.Group()
        this.scene.add(this.modelGroup)

        // Animation properties
        this.originalPositions = []
        this.animationAmplitude = 0.03
        this.animationSpeed = 0.002

        // Current active model
        this.currentModel = 'default'
    }

    async init() {
        await this.loadModel()
        this.createPointsModel()
        this.createNeonModel()
        this.createGlitchModel()
        this.createWireframeModel()
        
        // Set initial visibility
        this.setVisibility('default')
        
        // Store reference in meshes object for external access
        this.meshes.sofa = this.modelGroup
        
        if (this.callback) this.callback(this.modelGroup)
    }

    async loadModel() {
        return new Promise((resolve, reject) => {
            this.loader.load(this.url, (gltf) => {
                // Setup default model
                this.models.default = gltf.scene
                this.modelGroup.add(this.models.default)

                // Set name for all meshes in default model
                this.models.default.traverse((child) => {
                    if (child.isMesh) {
                        child.name = 'sofa-default'
                        const positions = new Float32Array(child.geometry.attributes.position.array)
                        this.originalPositions.push({
                            positions: new Float32Array(positions),
                            count: child.geometry.attributes.position.count
                        })
                    }
                })

                // Set initial transforms
                this.modelGroup.position.copy(this.position)
                this.modelGroup.scale.copy(this.scale)

                resolve()
            }, undefined, reject)
        })
    }

    createPointsModel() {
        const pointsGroup = new THREE.Group()
        this.models.default.traverse((child) => {
            if (child.isMesh) {
                const pointsGeometry = new THREE.BufferGeometry()
                const positions = child.geometry.attributes.position.array.slice()
                pointsGeometry.setAttribute('position', 
                    new THREE.Float32BufferAttribute(positions, 3)
                )

                const points = new THREE.Points(
                    pointsGeometry,
                    new THREE.PointsMaterial({
                        color: 0xff6b6b,
                        size: 0.05,
                        sizeAttenuation: true
                    })
                )

                points.name = 'sofa-points'
                points.position.copy(child.position)
                points.rotation.copy(child.rotation)
                points.rotation.x = -Math.PI / 2
                points.scale.copy(child.scale)
                pointsGroup.add(points)
            }
        })

        this.models.points = pointsGroup
        this.modelGroup.add(this.models.points)
        this.models.points.visible = false
    }

   
    createNeonModel() {
        this.models.neon = this.models.default.clone(true)
        
        this.models.neon.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xff0000,
                    emissive: 0xff0000,
                    emissiveIntensity: 0.5,
                    metalness: 0.8,
                    roughness: 0.2
                })
                child.name = 'sofa-neon'
            }
        })

        this.modelGroup.add(this.models.neon)
        this.models.neon.visible = false
    }

    createGlitchModel() {
        this.models.glitch = this.models.default.clone(true)
        
        this.models.glitch.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({
                    color: 0x0000ff,
                    specular: 0xff00ff,
                    shininess: 100,
                    transparent: false,
                    side: THREE.DoubleSide,
                    flatShading: true,
                    wireframe: false,
                    emissive: 0x000033
                })
                child.name = 'sofa-glitch'
            }
        })

        this.modelGroup.add(this.models.glitch)
        this.models.glitch.visible = false
    }

    createWireframeModel() {
        this.models.wireframe = this.models.default.clone(true)
        
        this.models.wireframe.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.8
                })
                child.name = 'sofa-wireframe'
            }
        })

        this.modelGroup.add(this.models.wireframe)
        this.models.wireframe.visible = false
    }

    setVisibility(modelType) {
        // Hide all models
        Object.keys(this.models).forEach(key => {
            if (this.models[key]) {
                this.models[key].visible = false
            }
        })

        // Show selected model
        if (this.models[modelType]) {
            this.models[modelType].visible = true
            this.currentModel = modelType
        }
    }

    update(time) {
        // Handle any necessary animations based on current model
        switch (this.currentModel) {
            case 'points':
                // Animate points in a wave pattern
                this.models.points.traverse((child) => {
                    if (child instanceof THREE.Points) {
                        const positions = child.geometry.attributes.position.array;
                        for (let i = 0; i < positions.length; i += 3) {
                            const originalY = positions[i + 1];
                            positions[i + 1] = originalY + 
                                Math.sin(time * 2 + positions[i] * 0.0005) * 0.0002;
                        }
                        child.geometry.attributes.position.needsUpdate = true;
                    }
                });
                break;
            case 'neon':
                // Pulse the emissive intensity
                this.models.neon.traverse((child) => {
                    if (child.isMesh) {
                        child.material.emissiveIntensity = 0.5 + Math.sin(time * 0.001) * 0.3
                    }
                })
                break
            case 'wireframe':
                // Rotate the wireframe model slightly
                this.models.wireframe.rotation.y += 0.001
                break
            case 'glitch':
                this.models.glitch.traverse((child) => {
                    if (child.isMesh) {
                        child.material.specular.setHSL(Math.sin(time * 0.1), 1, 0.5)
                    }
                })
                break
        }
    }
} 