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

const square1TopLeftAngle = uint16ToAngle(rand.hashUint16Int())
const square1TopRightAngle = uint16ToAngle(rand.hashUint16Int())
const square1BottomLeftAngle = uint16ToAngle(rand.hashUint16Int())
const square1BottomRightAngle = uint16ToAngle(rand.hashUint16Int())

const map = SquareMap2D.generate(mapSize, (x, y) => {
    const noiseValue = simplexNoise(
        x,
        y,
        square1TopLeftAngle,
        square1TopRightAngle,
        square1BottomLeftAngle,
        square1BottomRightAngle,
        mapSize,
    )

    return parsePerlinNoiseInteger(noiseValue, 0, 255)
})

console.log(drawUint8Map2D(map.value))
