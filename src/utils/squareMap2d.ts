

export class SquareMap2D<T> {
    constructor(
        public value: T[][]
    ) {
        let rows = this.value.length
        for (const mapRow of this.value) {
            if (mapRow.length !== rows) {
                throw new Error("Square map row and column length must be equal");
            }
        }

    }

    static generate<T>(
        size: number,
        generator: (x: number, y: number) => T,
    ): SquareMap2D<T> {
        const rawMap: T[][] = []

        for (let y = 0; y < size; y++) {
            const row: T[] = []
            for (let x = 0; x < size; x++) {
                row.push(generator(x, y))
            }
            rawMap.push(row)
        }

        return new SquareMap2D(rawMap);
    }

    slice(
        x: number,
        y: number,
        width: number,
        height: number,
    ): T[][] {
        return this.value.slice(
            y,
            y + height,
        ).map(
            row => row.slice(
                x,
                x + width,
            )
        )
    }

    assertSameSize(...others: SquareMap2D<T>[]) {
        const size = this.value.length;
        for (const other of others) {
            if (other.value.length !== size) {
                throw new Error("Square map length do not match with the current map");
            }
        }
    }

    mergeQuarter(
        right: SquareMap2D<T>,
        bottom: SquareMap2D<T>,
        rightBottom: SquareMap2D<T>,
    ): SquareMap2D<T> {
        this.assertSameSize(
            right,
            bottom,
            rightBottom,
        )

        const noiseMap: T[][] = []

        for (let i = 0; i < this.value.length; i++) {
            noiseMap.push([
                ...this.value[i]!.slice(),
                ...right.value[i]!.slice(),
            ])
        }

        for (let i = 0; i < this.value.length; i++) {
            noiseMap.push([
                ...bottom.value[i]!.slice(),
                ...rightBottom.value[i]!.slice(),
            ])
        }

        return new SquareMap2D(noiseMap)
    }

    mergeNinths(
        topLeft: SquareMap2D<T>,
        top: SquareMap2D<T>,
        topRight: SquareMap2D<T>,
        left: SquareMap2D<T>,
        right: SquareMap2D<T>,
        bottomLeft: SquareMap2D<T>,
        bottom: SquareMap2D<T>,
        bottomRight: SquareMap2D<T>,
    ): SquareMap2D<T> {
        this.assertSameSize(
            topLeft,
            top,
            topRight,
            left,
            right,
            bottomLeft,
            bottom,
            bottomRight,
        )

        const rawMap: T[][] = []

        for (let i = 0; i < this.value.length; i++) {
            rawMap.push([
                ...topLeft.value[i]!.slice(),
                ...top.value[i]!.slice(),
                ...topRight.value[i]!.slice(),
            ])
        }

        for (let i = 0; i < this.value.length; i++) {
            rawMap.push([
                ...left.value[i]!.slice(),
                ...this.value[i]!.slice(),
                ...right.value[i]!.slice(),
            ])
        }

        for (let i = 0; i < this.value.length; i++) {
            rawMap.push([
                ...bottomLeft.value[i]!.slice(),
                ...bottom.value[i]!.slice(),
                ...bottomRight.value[i]!.slice(),
            ])
        }

        return new SquareMap2D(rawMap)
    }

    isQuarterSplitable(): boolean {
        return this.value.length % 2 === 0
    }

    isNinthsSplitable(): boolean {
        return this.value.length % 3 === 0
    }

    splitQuarter(): QuarterSplit<T> {
        if (!this.isQuarterSplitable()) {
            throw new Error("Square map is not splitable because it has not an even length");
        }

        const halfLength = this.value.length / 2

        return {
            topLeft: new SquareMap2D(
                this.slice(
                    0,
                    0,
                    halfLength,
                    halfLength,

                )
            ),
            topRight: new SquareMap2D(
                this.slice(
                    halfLength,
                    0,
                    halfLength,
                    halfLength,
                )
            ),
            bottomLeft: new SquareMap2D(
                this.slice(
                    0,
                    halfLength,
                    halfLength,
                    halfLength,

                )
            ),
            bottomRight: new SquareMap2D(
                this.slice(
                    halfLength,
                    halfLength,
                    halfLength,
                    halfLength,
                )
            ),
        }
    }

    splitNinths(): NinthsSplit<T> {
        if (!this.isNinthsSplitable()) {
            throw new Error("Square map is not splitable because it has not an even length");
        }

        const thirdLength = this.value.length / 3

        return {
            topLeft: new SquareMap2D(
                this.slice(
                    0,
                    0,
                    thirdLength,
                    thirdLength)
            ),
            top: new SquareMap2D(
                this.slice(
                    thirdLength,
                    0,
                    thirdLength,
                    thirdLength
                )
            ),
            topRight: new SquareMap2D(
                this.slice(
                    2 * thirdLength,
                    0,
                    thirdLength,
                    thirdLength
                )
            ),
            left: new SquareMap2D(
                this.slice(
                    0,
                    thirdLength,
                    thirdLength,
                    thirdLength
                )
            ),
            center: new SquareMap2D(
                this.slice(
                    thirdLength,
                    thirdLength,
                    thirdLength,
                    thirdLength
                )
            ),
            right: new SquareMap2D(
                this.slice(
                    2 * thirdLength,
                    thirdLength,
                    thirdLength,
                    thirdLength
                )
            ),
            bottomLeft: new SquareMap2D(
                this.slice(
                    0,
                    2 * thirdLength,
                    thirdLength,
                    thirdLength
                )
            ),
            bottom: new SquareMap2D(
                this.slice(
                    thirdLength,
                    2 *
                    thirdLength,
                    thirdLength,
                    thirdLength
                )
            ),
            bottomRight: new SquareMap2D(
                this.slice(
                    2 * thirdLength,
                    2 * thirdLength,
                    thirdLength,
                    thirdLength
                )
            ),
        };
    }
}

export interface QuarterSplit<T> {
    topLeft: SquareMap2D<T>,
    topRight: SquareMap2D<T>,
    bottomLeft: SquareMap2D<T>,
    bottomRight: SquareMap2D<T>,
}

export interface NinthsSplit<T> {
    topLeft: SquareMap2D<T>,
    top: SquareMap2D<T>,
    topRight: SquareMap2D<T>,
    left: SquareMap2D<T>,
    center: SquareMap2D<T>,
    right: SquareMap2D<T>,
    bottomLeft: SquareMap2D<T>,
    bottom: SquareMap2D<T>,
    bottomRight: SquareMap2D<T>,
}

