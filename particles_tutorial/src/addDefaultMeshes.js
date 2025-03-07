import {
    BoxGeometry,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Mesh,
    Material,
    SphereGeometry,
    TextureLoader,
    MeshPhysicalMaterial
} from 'three'

const loader = new TextureLoader();

export const addMushroomMesh= ()=>{
    const color = loader.load('Mushroom_Top_001_basecolor.jpg')
    const normal = loader.load('Mushroom_Top_001_normal.jpg')
    const displacement = loader.load('Mushroom_Top_001_height.png')
    const ambientOcclusion = loader.load('Mushroom_Top_001_ambientOcclusion.jpg')
    const roughness = loader.load('Mushroom_Top_001_roughness.jpg')
    const sphere = new SphereGeometry(0.5,100,100)
    const sphereMat = new MeshPhysicalMaterial({
        map:color,
        normalMap: normal,
        displacementMap: displacement,
        displacementScale:0.2,
        aoMap:ambientOcclusion,
        roughnessMap:roughness,
    })
    const sphereMesh = new Mesh(sphere,sphereMat)
    sphereMesh.position.set(0,2,0)
    return sphereMesh
}


//example func using textures and mesh physical mat
export const addTextureMesh= ()=>{
    const color = loader.load('Ice_001_COLOR.jpg')
    const normal = loader.load('Ice_001_NRM.jpg')
    const displacement = loader.load('Ice_001_DISP.png')
    const ambientOcclusion = loader.load('Ice_001_OCC.jpg')
    const spectural = loader.load('Ice_001_SPEC.jpg')
    const sphere = new SphereGeometry(0.5,100,100)
    const sphereMat = new MeshPhysicalMaterial({
        map:color,
        normalMap: normal,
        displacementMap: displacement,
        displacementScale:0.3,
        aoMap:ambientOcclusion,
        metalness:0.5,
        roughness:0.3,
        transmission:0.4,
        ior:2.33,
    })
    const sphereMesh = new Mesh(sphere,sphereMat)
    return sphereMesh
}

export const addBoilerPlateMeshes = () => {
    const box = new BoxGeometry(1, 1, 1)
    const boxMaterial = new MeshBasicMaterial({ color: 0xff0000 })
    const boxMesh = new Mesh(box, boxMaterial)
    boxMesh.position.set(-2, 0, 0)
    return boxMesh
}

export const addStandardMesh = () => {
    const box =  new BoxGeometry(1,1,1)
    const boxMaterial = new MeshStandardMaterial({
        color:0xff000
    })
    const boxMesh = new Mesh(box,boxMaterial)
    boxMesh.position.set(2,0,0)
    return boxMesh

}