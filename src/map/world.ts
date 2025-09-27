import type { Chunk } from "./chunk"

export interface ChunkStore {
    load: (world: World, cx: number, cy: number) => Chunk
    save: (chunk: Chunk) => void
}

export function parseChunkKey(cx: number, cy: number): string {
    return cx + "-" + cy
}

/**
 * Chunked 2d world handeling its chunks.
 */
export class World {
    loadedChunks: Record<string, Chunk> = {}
    maxFieldSize: number

    constructor(
        public store: ChunkStore,
        public worldSize: number,
        public chunkSize: number = 16,
    ) {
        this.maxFieldSize = worldSize * chunkSize
    }

    getLoadedChunks(): Chunk[] {
        return Object.values(this.loadedChunks)
    }

    getLoadedChunkKeys(): string[] {
        return Object.keys(this.loadedChunks)
    }

    getChunk(cx: number, cy: number): Chunk {
        const chunkKey = parseChunkKey(cx, cy)

        if (this.loadedChunks[chunkKey]) {
            return this.loadedChunks[chunkKey]
        }

        return (this.loadedChunks[chunkKey] = this.store.load(
            this,
            cx,
            cy,
        ))
    }

    unloadChunkByKey(chunkKey: string): void {
        const chunk = this.loadedChunks[chunkKey]
        if (!chunk) {
            return
        }

        delete this.loadedChunks[chunkKey]
        this.store.save(chunk)
    }

    unloadChunkByCoordinate(cx: number, cy: number): void {
        this.unloadChunkByKey(parseChunkKey(cx, cy))
    }

    unloadChunk(chunk: Chunk): void {
        this.unloadChunkByKey(chunk.getChunkKey())
    }

    getPosition(
        x: number,
        y: number
    ): WorldPosition {
        const fieldX = x % this.chunkSize
        const fieldY = y % this.chunkSize

        let chunkX = Math.round((x - fieldX) / this.chunkSize)
        let chunkY = Math.round((y - fieldY) / this.chunkSize)

        while (chunkX < 0) {
            chunkX += this.worldSize
        }
        while (chunkY < 0) {
            chunkY += this.worldSize
        }

        while (chunkX >= this.worldSize) {
            chunkX -= this.worldSize
        }
        while (chunkY >= this.worldSize) {
            chunkY -= this.worldSize
        }

        return {
            chunkX: chunkX,
            chunkY: chunkY,
            fieldX: fieldX,
            fieldY: fieldY,
        }
    }

    fixChunkCoordindate(c: number): number {
        while (c < 0) {
            c += this.worldSize
        }

        while (c >= this.worldSize) {
            c -= this.worldSize
        }

        return c
    }
}

export interface WorldPosition {
    chunkX: number,
    chunkY: number,
    fieldX: number,
    fieldY: number,
}