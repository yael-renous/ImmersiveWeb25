import {
    BoxGeometry,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Mesh,
    Material
} from 'three'


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