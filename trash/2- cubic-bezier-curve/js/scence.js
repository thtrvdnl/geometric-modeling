const url = 'data.json'
let dataScence = null
//
const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
console.log(WIDTH, HEIGHT)
const renderer = new THREE.WebGLRenderer({antialias: true})

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT)

let curve = null
let arrayVectors = []
const geometry = new THREE.BufferGeometry()
const geometryVectors = new THREE.Geometry()

const matrix = new THREE.Matrix4()

const material = new THREE.LineBasicMaterial({color: 0xff0000});

async function getFile(url) {
    try {
        const rawData = await fetch(url)
        const data = await rawData.json()
        return data
    } catch (err) {
        console.error(err)
    }
}

const createTable = () => {
    const table = document.querySelector('#table')
    const fields = [11, 21, 31, 41]
    for (let field of fields) {
        table.insertAdjacentHTML(
            'beforeend',
            `<tr>
          <td><input type="text" name="n${field}" placeholder="n${field}"></td>
          <td><input type="text" name="n${field + 1}" placeholder="n${field + 1}"></td>
          <td><input type="text" name="n${field + 2}" placeholder="n${field + 2}"></td>
          <td><input type="text" name="n${field + 3}" placeholder="n${field + 3}"></td>
        </tr>`
        )
    }
}

const render = () => {
    requestAnimationFrame(render)
    renderer.render(scene, camera)
}

const getVectorsFromGeometry = (geometry) => {
    dataGeometry = geometry.clone()
    return dataGeometry.vertices
}

const setLookAt = () => {
    const vectors = getVectorsFromGeometry(geometryVectors)
    let x = 0
    let y = 0
    let z = 0
    let lenVectors = 0
    for (let vector of vectors) {
        console.log("setLookAt vector: ", vector)
        x += vector.x
        y += vector.y
        z += vector.z
        lenVectors += 1
    }
    x = parseFloat(x / lenVectors).toFixed(4)
    y = parseFloat(y / lenVectors).toFixed(4)
    z = parseFloat(z / lenVectors).toFixed(4)
    camera.lookAt(new THREE.Vector3(x, y, z))
    console.log("setLookAt", x, y, z)
}

const setCurve = (vectors) => {
        curve = new THREE.CubicBezierCurve3(
        vectors[0],
        vectors[1],
        vectors[2],
        vectors[3],
        )

        const points = curve.getPoints(50)
        geometry.setFromPoints(points)

        const curveObject = new THREE.Line(geometry, material)

        scene.add(curveObject)
}

const transformGeometryVectorsToGeometry = () => {
    geometryVectors.applyMatrix4(matrix)
    const vectors = getVectorsFromGeometry(geometryVectors)
    setCurve(vectors)
    console.log(vectors)
}

const getMultiplicationMatrix = (e) => {
    // Это Хардкод осторожно !
    let multiplicationMatrix = [
        document.table.n11.value,
        document.table.n12.value,
        document.table.n13.value,
        document.table.n14.value,
        document.table.n21.value,
        document.table.n22.value,
        document.table.n23.value,
        document.table.n24.value,
        document.table.n31.value,
        document.table.n32.value,
        document.table.n33.value,
        document.table.n34.value,
        document.table.n41.value,
        document.table.n42.value,
        document.table.n43.value,
        document.table.n44.value
    ]
    try {
        for (let idx = 0; idx < multiplicationMatrix.length; idx++) {
            if (multiplicationMatrix[idx].split(' ')[0] === 'Sin') {
                multiplicationMatrix[idx] = Math.sin(parseFloat(multiplicationMatrix[idx].split(' ')[1]) * Math.PI / 180).toFixed(4)
                console.log(multiplicationMatrix[idx])
            } else if (multiplicationMatrix[idx].split(' ')[0] === '-Sin') {
                multiplicationMatrix[idx] = -Math.sin(parseFloat(multiplicationMatrix[idx].split(' ')[1]) * Math.PI / 180).toFixed(4)
                console.log(multiplicationMatrix[idx])
            } else if (multiplicationMatrix[idx].split(' ')[0] === 'Cos') {
                multiplicationMatrix[idx] = Math.cos(parseFloat(multiplicationMatrix[idx].split(' ')[1]) * Math.PI / 180).toFixed(4)
                console.log(multiplicationMatrix[idx])
            } else if (multiplicationMatrix[idx].split(' ')[0] === '-Cos') {
                multiplicationMatrix[idx] = -Math.cos(parseFloat(multiplicationMatrix[idx].split(' ')[1]) * Math.PI / 180).toFixed(4)
                console.log(multiplicationMatrix[idx])
            }
        }
    } catch (e) {
        console.log('Check getMultiplicationMatrix Sin/Cos: ', e)
    }
    try {
        console.log(multiplicationMatrix)
        matrix.set(
            parseFloat(multiplicationMatrix[0]),
            parseFloat(multiplicationMatrix[1]),
            parseFloat(multiplicationMatrix[2]),
            parseFloat(multiplicationMatrix[3]),
            parseFloat(multiplicationMatrix[4]),
            parseFloat(multiplicationMatrix[5]),
            parseFloat(multiplicationMatrix[6]),
            parseFloat(multiplicationMatrix[7]),
            parseFloat(multiplicationMatrix[8]),
            parseFloat(multiplicationMatrix[9]),
            parseFloat(multiplicationMatrix[10]),
            parseFloat(multiplicationMatrix[11]),
            parseFloat(multiplicationMatrix[12]),
            parseFloat(multiplicationMatrix[13]),
            parseFloat(multiplicationMatrix[14]),
            parseFloat(multiplicationMatrix[15])
        )
        try {
            transformGeometryVectorsToGeometry()
        } catch (e) {
            console.log('TABLE INPUT: ', e)
        }
        setLookAt()

    } catch (e) {
        console.log('getMultiplicationMatrix: ', e)
    }
}

const addedCubicBezierCurve = (dataScence) => {
    let arrayVectors = []
    console.log("addedVectors dataScence", dataScence)
    try {
        for (property in dataScence) {
            if (property === 'points') {
                for (numberArray in dataScence[property]) {
                    let x = dataScence[property][numberArray][0]
                    let y = dataScence[property][numberArray][1]
                    let z = dataScence[property][numberArray][2]
                    arrayVectors.push(new THREE.Vector3(x, y, z))
                    geometryVectors.vertices.push(new THREE.Vector3(x, y, z))
                }
            } else if (property === 'segments') {
                let segment1 = dataScence[property][0]
                let segment2 = dataScence[property][1]
                let segment3 = dataScence[property][2]
                geometryVectors.faces.push(new THREE.Face3(segment1, segment2, segment3))
                geometryVectors.computeBoundingSphere()
            }
        }
        console.log(arrayVectors)

    } catch (e) {
        console.warn('addedCubicBezierCurve property:', e)
    }
    try {
        setCurve(arrayVectors)
    } catch (e) {
        console.warn('addedCubicBezierCurve curve:', e)
    }

}

const workWithGeometry = () => {
    renderer.setSize(WIDTH, HEIGHT)
    renderer.setClearColor(0xdfe9c8, 1)
    document.body.appendChild(renderer.domElement)

    camera.position.z = 50;
    scene.add(camera)

    render()
}

async function main() {
    createTable()

    dataScence = await getFile(url)

    workWithGeometry()
    addedCubicBezierCurve(dataScence)

    // scene.add(mesh)

    const sendMatrixButton = document.table.sendMatrix
    sendMatrixButton.addEventListener("click", getMultiplicationMatrix)
}

main()

