import type { Chunk } from "../map/chunk"
import { Field } from "../map/field"
import type { World, WorldPosition } from "../map/world"

export interface WorldRendererPostition extends WorldPosition {
    fieldPixelX: number,
    fieldPixelY: number,
    worldCoordinateX: number,
    worldCoordinateY: number,
    centerDrawOffsetX: number,
    centerDrawOffsetY: number,
}


/**
 * 2D world renderer optimized for top-down view
 * Renders a this.surroundingChunkToLoad (default 5x5) chunks grid centered on player position
 */
export class WorldRenderer {
   public readonly chunkRowToLoad: number
   public readonly fieldRowsToLoad: number
    public readonly pixelRowToDraw: number

    public readonly chunkPixelSize: number
    public readonly worldPixelSize: number
    public readonly surroundingChunkPixelSize: number

    public readonly surroundingFieldsToLoad: number
    public readonly surroundingPixelsToDraw: number

    constructor(
        public world: World,
        public fieldPixelSize: number = 16,
        public surroundingChunkToLoad = 2,
    ) {
        this.chunkRowToLoad = surroundingChunkToLoad * 2 + 1
        this.fieldRowsToLoad =
            world.chunkSize * this.chunkRowToLoad
        this.pixelRowToDraw =
            this.fieldRowsToLoad * fieldPixelSize

        this.chunkPixelSize = this.fieldPixelSize * this.world.chunkSize
        this.worldPixelSize = this.chunkPixelSize * this.world.worldSize
        this.surroundingChunkPixelSize = this.surroundingChunkToLoad * this.chunkPixelSize

        this.surroundingFieldsToLoad =
            surroundingChunkToLoad * world.chunkSize
        this.surroundingPixelsToDraw =
            this.surroundingFieldsToLoad * fieldPixelSize
    }

    getPixelPosition(
        pixelX: number,
        pixelY: number
    ): WorldRendererPostition {
        while (pixelX < 0) {
            pixelX += this.worldPixelSize
        }
        while (pixelY < 0) {
            pixelY += this.worldPixelSize
        }
        while (pixelX >= this.worldPixelSize) {
            pixelX -= this.worldPixelSize
        }
        while (pixelY >= this.worldPixelSize) {
            pixelY -= this.worldPixelSize
        }

        const fieldPixelX = pixelX % this.fieldPixelSize
        const fieldPixelY = pixelY % this.fieldPixelSize

        const worldCoordinateX = Math.round((pixelX - fieldPixelX) / this.fieldPixelSize)
        const worldCoordinateY = Math.round((pixelY - fieldPixelY) / this.fieldPixelSize)

        const worldPos = this.world.getPosition(worldCoordinateX, worldCoordinateY)

        const centerDrawOffsetX = -(worldPos.fieldX * this.fieldPixelSize) - this.surroundingChunkPixelSize - fieldPixelX
        const centerDrawOffsetY = -(worldPos.fieldY * this.fieldPixelSize) - this.surroundingChunkPixelSize - fieldPixelY

        return {
            ...worldPos,
            fieldPixelX: fieldPixelX,
            fieldPixelY: fieldPixelY,
            worldCoordinateX: worldCoordinateX,
            worldCoordinateY: worldCoordinateY,
            centerDrawOffsetX: centerDrawOffsetX,
            centerDrawOffsetY: centerDrawOffsetY,
        }
    }

    renderWorld(
        pixelX: number,
        pixelY: number,
        showChunkBorder: boolean = false,
    ) {
        const pos = this.getPixelPosition(pixelX, pixelY)

        const suroundingChunks = this.loadSuroundingChunks(
            pos.chunkX,
            pos.chunkY,
            this.surroundingChunkToLoad,
        )

        const fieldRows = this.mergedFieldRows(suroundingChunks, showChunkBorder)

        return {
            ...pos,
            fieldRows: fieldRows,
        }
    }

    iterateFields(
        data: WorldRendererData,
        fieldDrawCallback: (
            field: Field,
            pixelX: number,
            pixelY: number,
        ) => void,
    ) {
        for (let i = 0; i < data.fieldRows.length; i++) {
            const fieldRow = data.fieldRows[i] as Field[]

            for (let j = 0; j < fieldRow.length; j++) {
                const field = fieldRow[j] as Field

                fieldDrawCallback(
                    field,
                    data.centerDrawOffsetX + j * this.fieldPixelSize,
                    data.centerDrawOffsetY + i * this.fieldPixelSize,
                )
            }
        }
    }

    loadSuroundingChunks(
        cx: number,
        cy: number,
        sourroundingChunks: number,
    ): Chunk[][] {
        const suroundingChunks: Chunk[][] = []

        for (
            let dy = -sourroundingChunks;
            dy <= sourroundingChunks;
            dy++
        ) {
            const chunkRow: Chunk[] = []

            for (
                let dx = -sourroundingChunks;
                dx <= sourroundingChunks;
                dx++
            ) {
                const ncx = this.world.fixChunkCoordindate(
                    cx + dx,
                )
                const ncy = this.world.fixChunkCoordindate(
                    cy + dy,
                )

                const chunk = this.world.getChunk(ncx, ncy)

                chunkRow.push(chunk)
            }

            suroundingChunks.push(chunkRow)
        }

        const newKeys = suroundingChunks
            .flat()
            .map(c => c.getChunkKey())

        for (const chunkKey of this.world.getLoadedChunkKeys()) {
            if (!newKeys.includes(chunkKey)) {
                this.world.unloadChunkByKey(chunkKey)
            }
        }

        return suroundingChunks
    }

    /**
     * Converts the chunks field rows to merged field rows line by line. first starts with the top chunks and there top lines, then line 2 of each chunk, etc.
     * So we go over each row of the first chunks, then
     * @param chunks
     */
    mergedFieldRows(
        chunks: Chunk[][],
        showChunkBorder: boolean = false,
    ): Field[][] {
        const fields: Field[][] = []

        for (let y = 0; y < chunks.length; y++) {
            const chunkRow = chunks[y] as Chunk[]

            for (
                let row = 0;
                row < this.world.chunkSize;
                row++
            ) {
                let fieldRow: Field[] = []

                for (const chunk of chunkRow) {
                    fieldRow.push(...chunk.getFieldRow(row))
                }

                if (showChunkBorder) {
                    if (row % 16 === 0) {
                        fieldRow = fieldRow.map(
                            (v, i) => {
                                if (i % 4 === 0) {
                                    return new Field("CHUNK_BORDER")
                                }
                                return v
                            }
                        )
                    }

                    if (row % 4 === 0) {
                        fieldRow = fieldRow.map(
                            (v, i) => {
                                if (i % 16 === 0) {
                                    return new Field("CHUNK_BORDER")
                                }
                                return v
                            }
                        )
                    }
                }

                fields.push(fieldRow)
            }
        }

        return fields
    }
}

export interface WorldRendererData extends WorldRendererPostition {
    fieldRows: Field[][],
}
