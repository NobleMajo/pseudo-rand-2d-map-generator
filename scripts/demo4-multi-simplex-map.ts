import { readLine } from "../src/utils/input"
import {
    parsePerlinNoiseInteger,
    simplexNoise,
    uint16ToAngle,
} from "../src/utils/noise"
import { drawUint8Map2D } from "../src/utils/print"
import { PseudoRand, seededGenerator } from "../src/utils/pseudoRand"
import { SquareMap2D } from "../src/utils/squareMap2d"

const seed = 1234
const rand: PseudoRand = seededGenerator(seed)
const mapSize = 40

let lastTopLeftAngle = uint16ToAngle(rand.hashUint16Int())
let lastTopRightAngle = uint16ToAngle(rand.hashUint16Int())
let lastBottomLeftAngle = uint16ToAngle(rand.hashUint16Int())
let lastBottomRightAngle = uint16ToAngle(rand.hashUint16Int())

let map = SquareMap2D.generate(mapSize, (x, y) => {
    const noiseValue = simplexNoise(
        x,
        y,
        lastTopLeftAngle,
        lastTopRightAngle,
        lastBottomLeftAngle,
        lastBottomRightAngle,
        mapSize,
    )

    return parsePerlinNoiseInteger(noiseValue, 0, 255)
})

process.stdout.write(drawUint8Map2D(map.value))

// continue printing new maps after the first map

while (true) {
    const line = await readLine()
    if (line === "q" || line === "quit" || line === "exit") {
        break
    }

    lastTopLeftAngle = lastBottomLeftAngle
    lastTopRightAngle = lastBottomRightAngle
    lastBottomLeftAngle = uint16ToAngle(rand.hashUint16Int())
    lastBottomRightAngle = uint16ToAngle(rand.hashUint16Int())

    map = SquareMap2D.generate(mapSize, (x, y) => {
        const noiseValue = simplexNoise(
            x,
            y,
            lastTopLeftAngle,
            lastTopRightAngle,
            lastBottomLeftAngle,
            lastBottomRightAngle,
            mapSize,
        )

        return parsePerlinNoiseInteger(noiseValue, 0, 255)
    })

    process.stdout.write(drawUint8Map2D(map.value))
}

console.log("\nExiting...")

