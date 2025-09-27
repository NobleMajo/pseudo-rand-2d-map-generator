

export const POWER_OF_TWO_32 = 4294967296
export const MAX_UINT32 = 4294967295
export const MAX_UINT16 = 65535
export const MAX_UINT8 = 255
export const MAX_SAFE_POWER_OF_TWO = POWER_OF_TWO_32


export type ContextBytes = Uint8Array | number | string

export function seededGenerator(
    seed: number,
    autoUpdateContext: boolean = true,
    stringParseByteLength: number = 32,
    numberParseByteLength: number = 32,
    parseByteLength: number = 32,
): PseudoRand {
    if (Number.isNaN(seed)) {
        throw new Error("Seed must be a number")
    } else if (seed < 0) {
        throw new Error("Seed must be a positive number")
    } else if (!Number.isInteger(seed)) {
        throw new Error("Seed must be an integer")
    } else if (seed >= MAX_SAFE_POWER_OF_TWO) {
        throw new Error(
            "Seed must be less than 2³² (MAX_SAFE_POWER_OF_TWO/POWER_OF_TWO_32): " +
            MAX_SAFE_POWER_OF_TWO
        )
    }

    return new PseudoRand(
        autoUpdateContext,
        parseNumber(
            seed,
            parseByteLength
        ),
        stringParseByteLength,
        numberParseByteLength,
    )
}

export function parseNumber(
    contextNumber: number,
    byteLength: number,
): Uint8Array {
    const bytes = new Uint8Array(byteLength)
    for (let i = 0; i < byteLength; i++) {
        bytes[i] = (contextNumber >> (8 * i)) & 0xff
    }
    return bytes
}

export function parseString(
    contextString: string,
    byteLength: number,
): Uint8Array {
    const bytes = new Uint8Array(byteLength)
    for (let i = 0; i < byteLength; i++) {
        bytes[i] = (contextString.charCodeAt(i) & 0xff)
    }
    return bytes
}

export function concat(
    ...arrs: Uint8Array[]
): Uint8Array {
    if (arrs.length === 0) {
        throw new Error('concat: no arrays provided')
    } else if (arrs.length === 1) {
        return arrs[0]!
    } else if (arrs.length === 2) {
        const combined = new Uint8Array(arrs[0]!.length + arrs[1]!.length)
        combined.set(arrs[0]!, 0)
        combined.set(arrs[1]!, arrs[0]!.length)
        return combined
    }

    let totalLength = 0
    for (const arr of arrs) {
        totalLength += arr.length
    }
    const combined = new Uint8Array(totalLength)
    let offset = 0
    for (const arr of arrs) {
        combined.set(arr, offset)
        offset += arr.length
    }
    return combined
}

export function parse(
    v: ContextBytes,
    numberParseByteLength: number,
    stringParseByteLength: number,
): Uint8Array {
    if (typeof v == "number") {
        return parseNumber(v, numberParseByteLength)
    } else if (typeof v == "string") {
        return parseString(v, stringParseByteLength)
    }
    return v
}

export function merge(
    numberParseByteLength: number,
    stringParseByteLength: number,
    ...arrs: ContextBytes[]
): Uint8Array {
    return concat(
        ...arrs.map(
            (v): Uint8Array => parse(
                v,
                numberParseByteLength,
                stringParseByteLength,
            )
        ),
    )
}

export function hash32(x: number): number {
    x += 7
    x ^= x << 13
    x ^= x >>> 17
    x += 13
    x ^= x << 5
    return x >>> 0
}

/**
 * Converts a value to a percentage of the max value between 0 and 1.
 * @param value 
 * @param max 
 * @param roundingPrecision 
 * @returns 
 */
export function valuePercentOfMax(value: number, max: number, roundingPrecision: number): number {
    if (!isFinite(value) || !isFinite(max)) {
        throw new Error('valuePercentOfMax: arguments must be finite numbers')
    }
    if (max === 0) {
        return 0
    }
    const factor = Math.pow(10, Math.floor(roundingPrecision))
    return Math.round((value / max) * factor) / factor
}

/**
 * Converts a percentage to a value between 0 and the max value.
 * @param percent - Between 0 and 1.
 * @param max 
 * @param roundingPrecision 
 * @returns 
 */
export function percentValueOfMax(percent: number, max: number, roundingPrecision: number): number {
    if (!isFinite(percent) || !isFinite(max)) {
        throw new Error('percentValueOfMax: arguments must be finite numbers')
    }
    const factor = Math.pow(10, Math.floor(roundingPrecision))
    return Math.round((percent * max) * factor) / factor
}

/**
 * Generates a sine wave value based on the time, frequency and curves tip.
 * @param time - The time value to generate the sine wave for.
 * @param frequency - The frequency of the sine wave between 0 and 1.
 * @param curvesTip - The curves tip of the sine wave between 0 and 255.
 * @returns 
 */
export function sineWave(
    time: number,
    frequency: number,
    curvesTip: number,
): number {
    if (!isFinite(time) || !isFinite(frequency) || !isFinite(curvesTip)) {
        throw new Error('sineWave: arguments must be finite numbers');
    }

    const radians = 2 * Math.PI * (frequency / 100) * time;
    const normalized = (Math.sin(radians) + 1) / 2
    return normalized * curvesTip;
}

export class PseudoRand {
    constructor(
        public readonly autoUpdateContext: boolean,
        public contextBytes: Uint8Array,
        public readonly stringParseByteLength: number = 32,
        public readonly numberParseByteLength: number = 32,
    ) { }

    static fromMerge(
        autoUpdateContext: boolean,
        stringParseByteLength: number | undefined,
        numberParseByteLength: number | undefined,
        ...contextBytes: ContextBytes[]
    ): PseudoRand {
        let stringParseByteLength2 = 32
        let numberParseByteLength2 = 32
        if (stringParseByteLength !== undefined) {
            stringParseByteLength2 = stringParseByteLength
        }
        if (numberParseByteLength !== undefined) {
            numberParseByteLength2 = numberParseByteLength
        }

        let bytes: Uint8Array

        if (contextBytes.length === 0) {
            throw new Error('PseudoRand: no context bytes provided')
        } else if (contextBytes.length === 1) {

            if (contextBytes[0] instanceof Uint8Array) {
                bytes = contextBytes[0]
            } else {
                bytes = parse(
                    contextBytes[0]!,
                    numberParseByteLength2,
                    stringParseByteLength2,
                )
            }
        } else {
            bytes = merge(
                numberParseByteLength2,
                stringParseByteLength2,
                ...contextBytes,
            )
        }

        return new PseudoRand(
            autoUpdateContext,
            bytes,
            stringParseByteLength2,
            numberParseByteLength2,
        )
    }

    /**
     * Clones the PseudoRand instance.
     * @returns 
     */
    clone(
        autoUpdateContext: boolean,
    ): PseudoRand {
        return new PseudoRand(
            autoUpdateContext,
            this.contextBytes.slice(),
            this.stringParseByteLength,
            this.numberParseByteLength,
        )
    }

    genChild(
        autoUpdateContext: boolean,
        ...contextBytes: ContextBytes[]
    ): PseudoRand {
        return new PseudoRand(
            autoUpdateContext,
            this.hashUint8Array(this.contextBytes.length, ...contextBytes),
            this.stringParseByteLength,
            this.numberParseByteLength,
        )
    }

    /**
     * Uses the context bytes and the seed bytes to pseudo-randomly generate a byte array of the defined output length.
     * @param contextBytes 
     * @param outputLength 
     * @returns 
     */
    hashUint8Array(
        outputLength: number,
        ...contextBytes: ContextBytes[]
    ): Uint8Array {
        const combined = merge(
            this.numberParseByteLength,
            this.stringParseByteLength,
            this.contextBytes,
            ...contextBytes,
        )
        const output = new Uint8Array(outputLength)

        let state = 0

        for (let i = 0; i < combined.length; i++) {
            state = hash32(state + (combined[i] as number))
            const index = i % outputLength
            output[index] = output[index]! ^ (state & 0xff)
        }

        for (let i = 0; i < output.length; i++) {
            state = hash32(state + (output[i] as number))
            output[i] = state & 0xff
        }

        if (this.autoUpdateContext) {
            // Update internal state properly - extend the output if needed or use the generated bytes
            if (outputLength >= this.contextBytes.length) {
                // If output is large enough, use the last N bytes as new state
                this.contextBytes = output.slice(-this.contextBytes.length)
            } else {
                // If output is smaller, cycle it to fill the required length
                const newBytes = new Uint8Array(this.contextBytes.length)
                for (let i = 0; i < this.contextBytes.length; i++) {
                    newBytes[i] = output[i % outputLength]!
                }
                this.contextBytes = newBytes
            }
        }
        return output
    }

    /**
     * Uses the context bytes and the seed bytes to pseudo-randomly generate a safe unsigned 32bit integer.
     * It ranges from 0 to 4,294,967,295, so it has 4,294,967,296 possible states.
     * @param contextBytes 
     * @param outputBytes 
     * @returns 
     */
    hashUint32Int(
        ...contextBytes: ContextBytes[]
    ): number {
        const hashBytes = this.hashUint8Array(4, ...contextBytes)
        const view = new DataView(hashBytes.buffer)
        return view.getUint32(0)
    }

    /**
     * Uses the context bytes and the seed bytes to pseudo-randomly generate a safe unsigned 16bit integer.
     * It ranges from 0 to 65,535, so it has 65,536 possible states.
     * @param contextBytes 
     * @returns 
     */
    hashUint16Int(
        ...contextBytes: ContextBytes[]
    ): number {
        const hashBytes = this.hashUint8Array(2, ...contextBytes)
        const view = new DataView(hashBytes.buffer)
        return view.getUint16(0)
    }

    /**
     * Uses the context bytes and the seed bytes to pseudo-randomly generate a safe unsigned 8bit integer.
     * It ranges from 0 to 255, so it has 256 possible states.
     * @param contextBytes 
     * @returns 
     */
    hashUint8Int(
        ...contextBytes: ContextBytes[]
    ): number {
        const hashBytes = this.hashUint8Array(1, ...contextBytes)
        const view = new DataView(hashBytes.buffer)
        return view.getUint8(0)
    }
}