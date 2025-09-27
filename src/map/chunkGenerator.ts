import { parsePerlinNoiseInteger, simplexNoise, uint16ToAngle } from "../utils/noise"
import { MAX_UINT8, PseudoRand, sineWave } from "../utils/pseudoRand"
import type { BackgroundId } from "./background"
import type { ChunkGenerator } from "./chunkStore"
import { Field } from "./field"

export class SeedChunkGenerator implements ChunkGenerator {
    seedRand: PseudoRand
    peakTemperature: number = 60 // max=2000 in celcius above 0
    lowestTemperature: number = 60 // max=2000 in celcius below 0
    waterLevel: number = 92 // max=255 (128=1/2 water on surface)
    deepWaterLevel = 30

    riverMin: number
    riverMax: number
    deepRiverMin: number
    deepRiverMax: number

    constructor(
        seed: PseudoRand,
        worldType: number,
    ) {
        this.seedRand = seed.clone(false)
        const constGen = this.seedRand.genChild(true, this.seedRand.contextBytes)

        if (worldType === 0) {
            this.peakTemperature = 60 + Math.round(
                constGen.hashUint8Int() /
                MAX_UINT8 *
                40
            )

            this.lowestTemperature = (this.peakTemperature + 15) - Math.round(
                constGen.hashUint8Int() /
                MAX_UINT8 *
                30
            )

            this.waterLevel = 40 + Math.round(
                constGen.hashUint8Int() /
                MAX_UINT8 *
                100
            )

            this.deepWaterLevel = 5 + Math.round(
                this.waterLevel * 0.95 -
                (
                    constGen.hashUint8Int() /
                    MAX_UINT8 *
                    15
                )
            )
        } else if (worldType === 1) {
            this.peakTemperature = 100 + Math.round(
                constGen.hashUint8Int() /
                MAX_UINT8 *
                40
            )

            this.lowestTemperature = (this.peakTemperature + 60) - Math.round(
                constGen.hashUint8Int() /
                MAX_UINT8 *
                30
            )

            this.waterLevel = 40 + Math.round(
                constGen.hashUint8Int() /
                MAX_UINT8 *
                180
            )

            this.deepWaterLevel = 3 + Math.round(
                this.waterLevel * 0.97 -
                (
                    constGen.hashUint8Int() /
                    MAX_UINT8 *
                    40
                )
            )
        } else if (worldType === 2) {
            this.peakTemperature = 200 + Math.round(
                constGen.hashUint8Int() /
                MAX_UINT8 *
                160
            )

            this.lowestTemperature = (this.peakTemperature + 120) - Math.round(
                constGen.hashUint8Int() /
                MAX_UINT8 *
                60
            )

            this.waterLevel = 3 + Math.round(
                constGen.hashUint8Int() /
                MAX_UINT8 *
                200
            )

            this.deepWaterLevel = 3 + Math.round(
                this.waterLevel * 0.71 -
                (
                    constGen.hashUint8Int() /
                    MAX_UINT8 *
                    30
                )
            )
        }

        const riverLevel = this.waterLevel * 0.099992
        this.riverMin = Math.round(MAX_UINT8 / 2 - riverLevel / 2)
        this.riverMax = Math.round(this.riverMin + riverLevel + riverLevel)

        const deepWaterLevel = this.waterLevel * 0.025
        this.deepRiverMin = Math.round(MAX_UINT8 / 2 - deepWaterLevel / 2)
        this.deepRiverMax = Math.round(this.riverMin + deepWaterLevel + deepWaterLevel)
    }

    /**
     * Converts a length and cycles to a frequency.
     * @param length 
     * @param cycles 
     * @returns 
     */
    getFrequency(length: number, cycles = 1): number {
        return (
            100 * cycles
        ) / length
    }

    generate(
        worldSize: number,
        chunkSize: number,
        cx: number,
        cy: number,
    ): Field[][] {
        const fieldRows: Field[][] = []

        for (let y = 0; y < chunkSize; y++) {
            const fields: Field[] = []

            for (let x = 0; x < chunkSize; x++) {
                const backgroundId =
                    this.fieldPlacementAlgorithm(
                        worldSize,
                        chunkSize,
                        cx,
                        cy,
                        x,
                        y,
                    )

                fields.push(new Field(backgroundId))
            }

            fieldRows.push(fields)
        }

        return fieldRows
    }

    calcWaveValues(
        freq: number,
        chunkSize: number,
        cx: number,
        cy: number,
        x: number,
        y: number,
        xOffset: number = 0,
        yOffset: number = 0,
    ): number {
        return sineWave(
            cx * chunkSize + x + xOffset,
            freq,
            127,
        ) + sineWave(
            cy * chunkSize + y + yOffset,
            freq,
            127,
        )
    }

    fieldAttributes(
        worldSize: number,
        chunkSize: number,
        cx: number,
        cy: number,
        x: number,
        y: number,
    ): ({
        waterness: number,
        temperature: number,
        humidity: number,
        continentness: number,
        riverness: number,
    }) {
        const cx2 = cx + 1 >= worldSize ? 0 : cx + 1
        const cy2 = cy + 1 >= worldSize ? 0 : cy + 1

        const waterness = parsePerlinNoiseInteger(
            simplexNoise(
                x,
                y,
                uint16ToAngle(this.seedRand.hashUint16Int(cx + "_" + cy)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx2 + "_" + cy)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx + "_" + cy2)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx2 + "_" + cy2)),
                chunkSize,
            ),
            0,
            255,
        )

        const temperatureExtra = parsePerlinNoiseInteger(
            simplexNoise(
                x,
                y,
                uint16ToAngle(this.seedRand.hashUint16Int(cx + "," + cy)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx2 + "," + cy)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx + "," + cy2)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx2 + "," + cy2)),
                chunkSize,
            ),
            1,
            20,
        )

        let temperature = sineWave(
            cy * chunkSize + y +
            Math.round(worldSize * chunkSize * 0.75),
            this.getFrequency(worldSize * chunkSize, 1),
            this.lowestTemperature + this.peakTemperature,
        ) - this.lowestTemperature

        temperature = temperature + temperatureExtra - 20

        const humidity = parsePerlinNoiseInteger(
            simplexNoise(
                x,
                y,
                uint16ToAngle(this.seedRand.hashUint16Int(cx + "," + cy)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx2 + "," + cy)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx + "," + cy2)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx2 + "," + cy2)),
                chunkSize,
            ),
            0,
            255,
        )

        const continentness = parsePerlinNoiseInteger(
            simplexNoise(
                x,
                y,
                uint16ToAngle(this.seedRand.hashUint16Int(cx + "#" + cy)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx2 + "#" + cy)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx + "#" + cy2)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx2 + "#" + cy2)),
                chunkSize,
            ),
            0,
            255,
        )

        const riverness = parsePerlinNoiseInteger(
            simplexNoise(
                x,
                y,
                uint16ToAngle(this.seedRand.hashUint16Int(cx + "-" + cy)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx2 + "-" + cy)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx + "-" + cy2)),
                uint16ToAngle(this.seedRand.hashUint16Int(cx2 + "-" + cy2)),
                chunkSize,
            ),
            0,
            255,
        )

        return {
            waterness,
            temperature,
            humidity,
            continentness,
            riverness,
        }
    }

    fieldPlacementAlgorithm(
        worldSize: number,
        chunkSize: number,
        cx: number,
        cy: number,
        x: number,
        y: number,
    ): BackgroundId {
        const {
            waterness,
            temperature,
            humidity,
            continentness,
            riverness,
        } = this.fieldAttributes(worldSize, chunkSize, cx, cy, x, y)

        const getBiome = (): "mountain" | "grassland" | "desert" | "tundra" | "ocean" | "arctic" => {
            if (temperature > 40) {
                if (continentness > 160) {
                    return "mountain"
                }
                return "desert"
            } else if (temperature < 0) {
                if (continentness > 160) {
                    return "mountain"
                }
                if (temperature > -20) {
                    return "arctic"
                }
                return "tundra"
            } else {
                if (continentness < 120) {
                    return "ocean"
                }
                if (continentness > 160) {
                    return "mountain"
                }
                return "grassland"
            }
        }

        const biome = getBiome()

        if (humidity > 200) {
            if (temperature < -1) {
                return "SNOW"
            }
        }

        if (
            biome !== "desert" &&
            biome !== "ocean" &&
            biome !== "arctic" &&
            temperature < 40 &&
            continentness < 160
        ) {
            if (
                waterness < this.waterLevel
            ) {
                const isDeep = temperature < 50 && waterness < this.deepWaterLevel

                if (temperature < -15) {
                    return "BLACK_ICE"
                } else if (temperature < -10) {
                    if (isDeep) {
                        return "BLACK_ICE"
                    }

                    return "HARD_ICE"
                } else if (temperature < -5) {
                    if (isDeep) {
                        return "HARD_ICE"
                    }

                    return "ICE"
                }

                if (isDeep) {
                    return "DEEP_WATER"
                }

                return "WATER"
            }



            if (
                riverness > this.riverMin &&
                riverness < this.riverMax
            ) {
                const isDeep = temperature < 50 && riverness > this.deepRiverMin && riverness < this.deepRiverMax

                if (temperature < -15) {
                    return "BLACK_ICE"
                } else if (temperature < -10) {
                    if (isDeep) {
                        return "BLACK_ICE"
                    }

                    return "HARD_ICE"
                } else if (temperature < -5) {
                    if (isDeep) {
                        return "HARD_ICE"
                    }

                    return "ICE"
                }

                if (isDeep) {
                    return "DEEP_WATER"
                }

                return "WATER"
            }
        }

        if (biome === "desert") {
            if (continentness > 120) {
                return "HIGH_SAND"
            }
            return "SAND"
        }

        if (biome === "mountain") {
            if (continentness > 180) {
                return "HIGH_ROCK"
            }

            if (continentness > 140) {
                return "ROCK"
            }

            if (continentness > 100) {
                return "HIGH_STONE"
            }

            return "STONE"
        }

        if (biome === "arctic") {
            if (continentness > 180) {
                return "HIGH_ICE_ROCK"
            }

            if (continentness > 140) {
                return "ICE_ROCK"
            }

            if (continentness > 100) {
                return "HIGH_ICE_STONE"
            }

            return "ICE_STONE"
        }

        if (biome === "tundra") {
            if (continentness > 180) {
                return "HIGH_SNOW"
            }

            if (continentness > 170) {
                return "SNOW"
            }

            if (humidity > 200) {
                return "BLACK_ICE"
            }

            if (humidity > 180) {
                return "HARD_ICE"
            }

            if (humidity > 140) {
                return "ICE"
            }

            return "SNOW"
        }

        if (biome === "ocean") {
            return "DEEP_WATER"
        }

        if (biome === "grassland") {
            if (continentness > 180) {
                return "HIGH_STONE"
            }

            if (continentness > 160) {
                return "STONE"
            }

            if (continentness < 40) {
                return "HIGH_GRASS"
            }

            if (humidity > 140) {
                return "MUD"
            }

            return "GRASS"
        }

        return "BLACK_ICE"

    }
}
