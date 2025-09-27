import { MAX_UINT16, MAX_UINT32, MAX_UINT8 } from "./pseudoRand"

export type NoiseGenerator = (
    squareX: number,
    sqareY: number,
    topLeftAngle: number,
    topRightAngle: number,
    bottomLeftAngle: number,
    bottomRightAngle: number,
    gridSize?: number,
) => number

/**
 * Original Perlin noise algorithm implementation by Ken Perlin (1983)
 * Simple smoothing function, can create visible seams where noise chunks meet.
 *
 * @param x - X position in the noise grid
 * @param y - Y position in the noise grid
 * @param topLeftAngle - Random direction for top-left corner
 * @param topRightAngle - Random direction for top-right corner
 * @param bottomLeftAngle - Random direction for bottom-left corner
 * @param bottomRightAngle - Random direction for bottom-right corner
 * @param gridSize - Grid square size (default: 1)
 * @returns Random noise value between -1 and 1
 * @deprecated Use {@link perlinNoiseImproved} instead for better visual quality
 */
export const perlinNoise1983: NoiseGenerator = (
    x: number,
    y: number,
    topLeftAngle: number,
    topRightAngle: number,
    bottomLeftAngle: number,
    bottomRightAngle: number,
    gridSize: number = 1,
) => {
    throw new Error("perlinNoise1983 not implemented")
}

/**
 * Ken Perlin's improved noise algorithm by Ken Perlin (2002)
 * Uses quintic interpolation for smoother, artifact-free results.
 *
 * @param x - X coordinate in chunk
 * @param y - Y coordinate in chunk
 * @param topLeftAngle - Top-left corner angle (radians)
 * @param topRightAngle - Top-right corner angle (radians)
 * @param bottomLeftAngle - Bottom-left corner angle (radians)
 * @param bottomRightAngle - Bottom-right corner angle (radians)
 * @param gridSize - Chunk size (default: 1)
 * @returns Noise value [-1, 1]
 */
export const perlinNoiseImproved: NoiseGenerator = (
    x: number,
    y: number,
    topLeftAngle: number,
    topRightAngle: number,
    bottomLeftAngle: number,
    bottomRightAngle: number,
    gridSize: number = 1,
) => {
    throw new Error("perlinNoiseImproved not implemented")
}

export const unitToAngle = (value: number, max: number): number => {
    const invMax = max > 0 ? 1 / max : 1
    return value * ANGLE_RANGE * invMax
}

export const uint8ToAngle = (value: number): number => {
    return unitToAngle(value, MAX_UINT8)
}

export const uint16ToAngle = (value: number): number => {
    return unitToAngle(value, MAX_UINT16)
}

export const uint32ToAngle = (value: number): number => {
    return unitToAngle(value, MAX_UINT32)
}

export const ANGLE_RANGE = 2 * Math.PI
export const F2 = 0.3660254037844386 // (√3 - 1) / 2
export const G2 = 0.21132486540518713 // (3 - √3) / 6

/**
 * @param x - X position in the noise grid
 * @param y - Y position in the noise grid
 * @param topLeftAngle - Random direction for top-left corner
 * @param topRightAngle - Random direction for top-right corner
 * @param bottomLeftAngle - Random direction for bottom-left corner
 * @param bottomRightAngle - Random direction for bottom-right corner
 * @param gridSize - Grid square size (default: 1)
 * @returns Random noise value between -1 and 1
 */
export const simplexNoise: NoiseGenerator = (
    x: number,
    y: number,
    topLeftAngle: number,
    topRightAngle: number,
    bottomLeftAngle: number,
    bottomRightAngle: number,
    gridSize: number = 1,
): number => {
    // Normalize to cell space and take fractional part to ensure seamless transitions across grid cells
    const invSize = gridSize > 0 ? 1 / gridSize : 1
    const u = x * invSize
    const v = y * invSize

    // Gradient vectors at the four square corners (reuse provided angles)
    const g00x = Math.cos(topLeftAngle),
        g00y = Math.sin(topLeftAngle) // (0,0)
    const g10x = Math.cos(topRightAngle),
        g10y = Math.sin(topRightAngle) // (1,0)
    const g01x = Math.cos(bottomLeftAngle),
        g01y = Math.sin(bottomLeftAngle) // (0,1)
    const g11x = Math.cos(bottomRightAngle),
        g11y = Math.sin(bottomRightAngle) // (1,1)

    // Fractional position within the unit square cell
    const fx = u - Math.floor(u)
    const fy = v - Math.floor(v)

    // Dot products of gradients with distance vectors to corners
    const n00 = g00x * fx + g00y * fy
    const n10 = g10x * (fx - 1) + g10y * fy
    const n01 = g01x * fx + g01y * (fy - 1)
    const n11 = g11x * (fx - 1) + g11y * (fy - 1)

    // Quintic fade for C2 continuity
    const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
    const wx = fade(fx)
    const wy = fade(fy)

    const lerp = (a: number, b: number, w: number) => a + (b - a) * w
    const nx0 = lerp(n00, n10, wx)
    const nx1 = lerp(n01, n11, wx)
    const value = lerp(nx0, nx1, wy)

    return value < -1 ? -1 : value > 1 ? 1 : value
}

export const parsePerlinNoiseValue = (
    value: number,
    outputMin: number,
    outputMax: number,
): number => {
    return (
        outputMin + (outputMax - outputMin) * (value + 1) * 0.5
    )
}

export const parsePerlinNoiseInteger = (
    value: number,
    outputMin: number,
    outputMax: number,
): number => {
    return Math.round(
        parsePerlinNoiseValueWithPrecision(
            value,
            outputMin,
            outputMax,
        ),
    )
}

export const parsePerlinNoiseValueWithPrecision = (
    value: number,
    outputMin: number,
    outputMax: number,
    decimalPrecision: number = 4,
): number => {
    const multiplier = Math.pow(10, decimalPrecision)
    const scaledMin = outputMin * multiplier
    const scaledRange = (outputMax - outputMin) * multiplier

    const scaledResult =
        scaledRange * (value + 1) * 0.5 + scaledMin

    return Math.round(scaledResult) / multiplier
}
