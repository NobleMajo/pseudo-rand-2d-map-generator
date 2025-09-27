import type { JsonObject } from "../utils/json"

export interface BlockTypeProperties {
    /**
     * Can a player stand on this tile?
     */
    walkable: boolean | undefined,
    /**
     * Movement speed multiplier when traversing (100 = normal movement speed, only integers).
     */
    movementMultiplier: number | undefined,
    /**
     * Surface traction; lower = more slippery / preserves momentum.
     */
    friction: number | undefined,
    /**
     * Can a plant grow on this tile?
     */
    plantable: boolean | undefined,
    /**
     * 
     */
    circularCollider: number | undefined, // radius of the collider, 100 = 1 blockType
}

export const defaultBlockTypeProperties: BlockTypeProperties = {
    walkable: false,
    plantable: false,
    movementMultiplier: undefined,
    friction: undefined,
    circularCollider: undefined,
}

export type BlockType = { id: string } & BlockTypeProperties

export function createBlockType(
    id: string,
    options: Partial<BlockTypeProperties>
): BlockType {
    return {
        ...defaultBlockTypeProperties,
        ...options,
        id,
    }
}

export function initBlockTypeProperties(
    options: Partial<BlockTypeProperties>
): BlockTypeProperties {
    return {
        ...defaultBlockTypeProperties,
        ...options,
    }
}

export const BlockTypeDefinitions = {
    WALK_PATH: initBlockTypeProperties({
        walkable: true,
        movementMultiplier: 120,
        friction: 100,
        plantable: false,
    }),
    STONE_PATH: initBlockTypeProperties({
        walkable: true,
        movementMultiplier: 140,
        friction: 100,
        plantable: false,
    }),
    STREET_PATH: initBlockTypeProperties({
        walkable: true,
        movementMultiplier: 160,
        friction: 100,
        plantable: false,
    }),
    LANTERN: initBlockTypeProperties({
        walkable: false,
        movementMultiplier: 100,
        friction: 100,
        plantable: false,
        circularCollider: 30,
    }),
    POLE_LANTERN: initBlockTypeProperties({
        walkable: false,
        movementMultiplier: 100,
        friction: 100,
        plantable: false,
        circularCollider: 10,
    }),
    SMALL_TREE: initBlockTypeProperties({
        walkable: false,
        movementMultiplier: 100,
        friction: 100,
        plantable: false,
        circularCollider: 20,
    }),
    TREE: initBlockTypeProperties({
        walkable: false,
        movementMultiplier: 100,
        friction: 100,
        plantable: false,
        circularCollider: 60,
    }),
    BIG_TREE: initBlockTypeProperties({
        walkable: false,
        movementMultiplier: 100,
        friction: 100,
        plantable: false,
        circularCollider: 100,
    }),
    GIANT_TREE: initBlockTypeProperties({
        walkable: false,
        movementMultiplier: 100,
        friction: 100,
        plantable: false,
        circularCollider: 120,
    }),
    SMALL_ROCK: initBlockTypeProperties({
        walkable: false,
        movementMultiplier: 100,
        friction: 100,
        plantable: false,
        circularCollider: 40,
    }),
    ROCK: initBlockTypeProperties({
        walkable: false,
        movementMultiplier: 100,
        friction: 100,
        plantable: false,
        circularCollider: 70,
    }),
    BIG_ROCK: initBlockTypeProperties({
        walkable: false,
        movementMultiplier: 100,
        friction: 100,
        plantable: false,
        circularCollider: 90,
    }),
    GIANT_ROCK: initBlockTypeProperties({
        walkable: false,
        movementMultiplier: 100,
        friction: 100,
        plantable: false,
        circularCollider: 140,
    }),
} as const

export type BlockTypeId = keyof typeof BlockTypeDefinitions

export const BlockTypes: Record<BlockTypeId, BlockType> = {} as any
for (const key of Object.keys(BlockTypeDefinitions) as BlockTypeId[]) {
    BlockTypes[key] = createBlockType(key, BlockTypeDefinitions[key])
}

export type Block = {
    typeId: BlockTypeId,
    meta?: JsonObject,
}


