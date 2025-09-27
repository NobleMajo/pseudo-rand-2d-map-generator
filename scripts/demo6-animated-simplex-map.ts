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
        if (lineBuffer.length >= maxLineBuffer) {
            lineBuffer.shift()
            lineBuffer.push(line)
        } else {
            lineBuffer.push(line)
            continue
        }



        console.clear()
        // print debug infos
        process.stdout.write(
            "[DEBUG]" +
            " side offset: " + (getSideOffset() * 2) +
            " wait deplay: " + waitMillis +
            " increment: " + increment +
            " shown: " + (
                lineBuffer[lineBuffer.length - 1]!
                    .slice(
                        getSideOffset(),
                        getSideOffset() + showLineChars
                    ).length * 2
            ) +
            "\n"
        )

        // write sliced lines
        process.stdout.write(
            lineBuffer
                .map(
                    (v) => v.slice(getSideOffset() * 2, (getSideOffset() + showLineChars) * 2)
                )
                .join("\n"))

        await sleep(delayMillis)
    }
}

const sleep = (delayMillis: number | (() => number)): Promise<void> => {
    return new Promise<void>(
        (res) => setTimeout(
            res,
            typeof delayMillis === "function" ?
                delayMillis() :
                delayMillis
        )
    )
}

const getSideOffset = (): number => {
    return Math.round(
        (waitMillis - minWaitMillis)
        * waitRangeMultiplier
        * maxSideOffset
    )
}

const tickHorizontalAnimation = () => {
    if (increment) {
        waitMillis += (
            waitMillis < 48 ?
                1 :
                2
        )
    } else {
        waitMillis -= (
            waitMillis < 48 ?
                1 :
                2
        )
    }

    if (waitMillis >= maxWaitMillis) {
        increment = false
        waitMillis = maxWaitMillis
    } else if (waitMillis <= minWaitMillis) {
        increment = true
        waitMillis = minWaitMillis
    }
}

const startHorizontalAnimation = () => {
    setInterval(tickHorizontalAnimation, 67)
}

const seed = 1234
const rand: PseudoRand = seededGenerator(seed)
const mapSize = 140
// side offset animation
const showLineChars = 60
const maxSideOffset = mapSize - showLineChars
// print buffer
const maxLineBuffer = 64
let lineBuffer: string[] = []
// speed animation
const maxWaitMillis = 64
const minWaitMillis = 6
let waitMillis = 56
let increment: boolean = true
const waitMillisRange = maxWaitMillis - minWaitMillis
const waitRangeMultiplier = 1 / waitMillisRange

startHorizontalAnimation()

let lastTopLeftAngle: number = uint16ToAngle(rand.hashUint16Int())
let lastTopRightAngle: number = uint16ToAngle(rand.hashUint16Int())
let lastBottomLeftAngle: number = uint16ToAngle(rand.hashUint16Int())
let lastBottomRightAngle: number = uint16ToAngle(rand.hashUint16Int())
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

    lastTopLeftAngle = lastBottomLeftAngle
    lastTopRightAngle = lastBottomRightAngle
    lastBottomLeftAngle = uint16ToAngle(rand.hashUint16Int())
    lastBottomRightAngle = uint16ToAngle(rand.hashUint16Int())
}


