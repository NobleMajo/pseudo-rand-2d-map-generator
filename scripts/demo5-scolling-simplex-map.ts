import {
    parsePerlinNoiseInteger,
    simplexNoise,
    uint16ToAngle,
} from "../src/utils/noise"
import { drawUint8Map2DRows } from "../src/utils/print"
import { PseudoRand, seededGenerator } from "../src/utils/pseudoRand"
import { SquareMap2D } from "../src/utils/squareMap2d"

const printTimedLines = async (lines: string[], delayMillis: number | (() => number)) => {
    for (const line of lines) {
        process.stdout.write("\n" + line, "utf-8", (err) => {
            if (err) {
                console.error(err)
            }
        })
        await new Promise(
            (res) => setTimeout(
                res,
                typeof delayMillis === "function" ?
                    delayMillis() :
                    delayMillis
            )
        )
    }
}

const seed = 1234
const rand: PseudoRand = seededGenerator(seed)
const mapSize = 80
const waitMillis = 32

let lastTopLeftAngle = uint16ToAngle(rand.hashUint16Int())
let lastTopRightAngle = uint16ToAngle(rand.hashUint16Int())
let lastBottomLeftAngle = uint16ToAngle(rand.hashUint16Int())
let lastBottomRightAngle = uint16ToAngle(rand.hashUint16Int())

let map: SquareMap2D<number>


while (true) {
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

    await printTimedLines(drawUint8Map2DRows(map.value), () => waitMillis)
    process.stdout.write(" <")

    lastTopLeftAngle = lastBottomLeftAngle
    lastTopRightAngle = lastBottomRightAngle
    lastBottomLeftAngle = uint16ToAngle(rand.hashUint16Int())
    lastBottomRightAngle = uint16ToAngle(rand.hashUint16Int())
}


