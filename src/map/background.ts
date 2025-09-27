
export interface BackgroundProperties {
    /**
     * Can a block be built on this tile?
     */
    buildable: boolean,

    /**
    * Can a player stand on this tile?
    */
    walkable: boolean,
    /**
     * Movement speed multiplier when traversing (100 = normal movement speed, only integers).
     */
    movementMultiplier: number,
    /**
     * Surface traction; lower = more slippery / preserves momentum.
     */
    friction: number,
    /**
     * Can a plant grow on this tile?
     */
    plantable: boolean,
}

export const defaultBackgroundProperties: BackgroundProperties = {
    walkable: true,
    buildable: true,
    plantable: false,
    movementMultiplier: 100, // 100 = normal movement speed
    friction: 100, // 0-100
}

export type Background = { id: string } & BackgroundProperties

export function createBackground(
    id: string,
    options: Partial<BackgroundProperties>
): Background {
    return {
        ...defaultBackgroundProperties,
        ...options,
        id,
    }
}

export function initBackgroundProperties(
    options: Partial<BackgroundProperties>
): BackgroundProperties {
    return {
        ...defaultBackgroundProperties,
        ...options,
    }
}

export const BackgroundDefinitions = {
    CHUNK_BORDER: initBackgroundProperties({}),
    DIRT: initBackgroundProperties({
        plantable: true,
        friction: 100,
        movementMultiplier: 94,
    }),
    GRASS: initBackgroundProperties({
        plantable: true,
        friction: 100,
        movementMultiplier: 90,
    }),
    HIGH_GRASS: initBackgroundProperties({
        plantable: true,
        friction: 100,
        movementMultiplier: 90,
    }),
    MUD: initBackgroundProperties({
        plantable: true,
        friction: 90,
        movementMultiplier: 80,
    }),
    HIGH_STONE: initBackgroundProperties({
        movementMultiplier: 70,
    }),
    STONE: initBackgroundProperties({}),
    ROCK: initBackgroundProperties({
        movementMultiplier: 90,
    }),
    HIGH_ROCK: initBackgroundProperties({
        movementMultiplier: 70,
    }),
    SAND: initBackgroundProperties({
        friction: 100,
        movementMultiplier: 80,
    }),
    HIGH_SAND: initBackgroundProperties({
        friction: 100,
        movementMultiplier: 70,
    }),
    WATER: initBackgroundProperties({
        friction: 90,
        movementMultiplier: 80,
    }),
    DEEP_WATER: initBackgroundProperties({
        friction: 90,
        movementMultiplier: 80,
    }),
    SNOW: initBackgroundProperties({
        friction: 90,
        movementMultiplier: 80,
    }),
    HIGH_SNOW: initBackgroundProperties({
        friction: 100,
        movementMultiplier: 30,
    }),
    ICE: initBackgroundProperties({
        friction: 30,
        movementMultiplier: 60,
    }),
    HARD_ICE: initBackgroundProperties({
        friction: 20,
        movementMultiplier: 50,
    }),
    BLACK_ICE: initBackgroundProperties({
        friction: 0,
        movementMultiplier: 40,
    }),
    ICE_ROCK: initBackgroundProperties({
        friction: 20,
        movementMultiplier: 50,
    }),
    HIGH_ICE_ROCK: initBackgroundProperties({
        friction: 20,
        movementMultiplier: 50,
    }),
    ICE_STONE: initBackgroundProperties({
        friction: 20,
        movementMultiplier: 50,
    }),
    HIGH_ICE_STONE: initBackgroundProperties({
        friction: 20,
        movementMultiplier: 50,
    }),
} as const

export type BackgroundId = keyof typeof BackgroundDefinitions

export const Backgrounds: Record<BackgroundId, Background> = {} as any
for (const key of Object.keys(BackgroundDefinitions) as BackgroundId[]) {
    Backgrounds[key] = createBackground(key, BackgroundDefinitions[key])
}

