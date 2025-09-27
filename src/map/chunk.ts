import { Field } from "./field"
import { parseChunkKey, type World } from "./world"

/**
 * Chunks are always [this.world.chunkSize]x[this.world.chunkSize] fields.
 */
export class Chunk {
    changeStates: string

    constructor(
        public x: number,
        public y: number,
        public fieldRows: Field[][],
        public world: World,
    ) {
        this.changeStates = this.loadCurrentChangeStates()
    }

    loadCurrentChangeStates(): string {
        return this.fieldRows
            .flat()
            .map(field => field.getChangeState)
            .join(",")
    }

    getChangeState(): string {
        return this.changeStates
    }

    hasChanged(): boolean {
        return (
            this.changeStates !== this.loadCurrentChangeStates()
        )
    }

    serialize(): string {
        return JSON.stringify(
            this.fieldRows.map(fieldRow =>
                fieldRow.map(field => field.stringify()),
            ),
        )
    }

    getChunkKey(): string {
        return parseChunkKey(this.x, this.y)
    }

    getFieldRow(row: number): Field[] {
        if (row < 0) {
            throw new Error("Row must be >= 0")
        } else if (row >= this.world.chunkSize) {
            throw new Error(
                "Row must be < chunk size of " +
                    this.world.chunkSize,
            )
        }
        return this.fieldRows[row] as Field[]
    }

    static parse(
        x: number,
        y: number,
        serializedChunk: string,
        world: World,
    ): Chunk {
        const rawFields = JSON.parse(
            serializedChunk,
        ) as string[][]

        const fieldRows: Field[][] = []
        for (const rawFieldRow of rawFields) {
            if (rawFieldRow.length != world.chunkSize) {
                throw new Error(
                    "Invalid field row length in chunk at " +
                        x +
                        "," +
                        y +
                        ": " +
                        rawFieldRow.length +
                        " (expected " +
                        world.chunkSize +
                        ")",
                )
            }

            fieldRows.push(
                rawFieldRow.map(rawField =>
                    Field.parse(rawField),
                ) as Field[],
            )
        }

        return new Chunk(x, y, fieldRows, world)
    }
}
