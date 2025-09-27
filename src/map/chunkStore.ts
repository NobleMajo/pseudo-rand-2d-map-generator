import { Chunk } from "./chunk"
import { Field } from "./field"
import {
    parseChunkKey,
    type ChunkStore,
    type World,
} from "./world"

export interface ChunkGenerator {
    generate(
        worldSize: number,
        chunkSize: number,
        cx: number,
        cy: number,
    ): Field[][]
}

export class LocalStorageChunkStore implements ChunkStore {
    constructor(public generator: ChunkGenerator) { }

    load(world: World, cx: number, cy: number): Chunk {
        const chunkKey = parseChunkKey(cx, cy)

        const fieldData = localStorage.getItem(
            parseChunkKey(cx, cy),
        )

        if (typeof fieldData == "string") {
            return Chunk.parse(cx, cy, fieldData, world)
        }

        console.log("chunk not found, generating it: ", cx, cy)

        return new Chunk(
            cx,
            cy,
            this.generator.generate(
                world.worldSize,
                world.chunkSize,
                cx,
                cy,
            ),
            world,
        )
    }

    save(chunk: Chunk): void {
        if (!chunk.hasChanged()) {
            return
        }

        console.log(
            "chunk has changed, saving it: ",
            chunk.x,
            chunk.y,
        )

        localStorage.setItem(
            parseChunkKey(chunk.x, chunk.y),
            chunk.serialize(),
        )
    }
}
