import * as THREE from 'three';

export const scenes = [
    {
        id: 'scene1',
        splatUrl: 'https://lumalabs.ai/capture/f3f711da-72aa-46c1-9697-15390ab877c9',
        camera: {
            position: { x: 3.255, y: 0.463, z: 2.826 },
            rotation: { x: -0.162, y: 0.849, z: 0.122 }
        },
        sofa: {
            position: { x: -0.647, y: 0.676, z: 1.338 },
            rotation: { x: -0.965, y: -0.48, z: -2.143 },
            scale: { x: 1.473, y: 1.473, z: 1.473 }
        },
        hoverModel: 'glitch'
    },
    {
        id: 'scene2',
        splatUrl: 'https://lumalabs.ai/capture/d913de89-45ac-40ba-a29e-19b847932b8f',
        camera: {
            position: { x: -3.087, y: 0.063, z: -1.277 },
            rotation: { x: 2.544, y: -1.13, z: 2.59 }
        },
        sofa: {
            position: { x: 0, y: 0.3, z: 0.1 },
            rotation: { x: 0, y: -2.143, z: 0 },
            scale: { x: 1.35, y: 1.35, z: 1.35 }
        },
        hoverModel: 'wireframe'
    },
    {
        id: 'scene3',
        splatUrl: 'https://lumalabs.ai/capture/2b2112cd-9aa0-44f3-88b3-fde365066a3b',
        camera: {
            position: { x: -2.252, y: 0.471, z: -5.4 },
            rotation: { x: -2.952, y: -0.243, z: -3.096 }
        },
        sofa: {
            position: { x: -2.632, y: -1.529, z: 0.456 },
            rotation: { x: -0.688, y: 2.568, z: -0.134 },
            scale: { x: 2.608, y: 2.608, z: 2.608 }
        },
        hoverModel: 'points'
    },
    {
        id: 'scene4',
        splatUrl: 'https://lumalabs.ai/capture/4da7cf32-865a-4515-8cb9-9dfc574c90c2',
        camera: {
            position: { x: 6.431, y: 4.036, z: 1.7 },
            rotation: { x: -1.21, y: 1.061, z: 1.163 }
        },
        sofa: {
            position: { x: -1.97, y: 0.015, z: 0.235 },
            rotation: { x: -0.065, y: 0.282, z: 0.005 },
            scale: { x: 1.851, y: 1.851, z: 1.851 }
        },
        hoverModel: 'neon'
    }
]

