import type { BackgroundId } from "../map/background";

export const blockSkins: Record<BackgroundId | "CHUNK_BORDER", string> = {
    DIRT: "#8B5A2B",        // earthy brown
    GRASS: "#3FA34D",       // fresh green
    HIGH_GRASS: "#2D6A35",  // darker green
    MUD: "#5C4033",         // deep muddy brown
    STONE: "#7D7D7D",       // neutral gray
    HIGH_STONE: "#5C5C5C",  // darker gray
    ROCK: "#5C5C5C",        // darker gray
    HIGH_ROCK: "#3B3B3B",   // very dark gray
    SAND: "#E4D96F",        // warm yellow sand
    HIGH_SAND: "#C2B14D",   // darker golden sand
    WATER: "#3A8FB7",       // bright blue water
    DEEP_WATER: "#1E5F75",  // darker blue
    SNOW: "#F0F8FF",        // icy white
    HIGH_SNOW: "#DCE6EB",   // slightly darker snow
    ICE: "#B0E0E6",         // pale icy blue
    HARD_ICE: "#7FB6C2",    // mid-tone icy blue
    BLACK_ICE: "#466D75",   // dark icy teal
    CHUNK_BORDER: "#FF00FF", // debugging (magenta)
    ICE_ROCK: "#6C8C94",       // cool gray-blue rock
    HIGH_ICE_ROCK: "#4A5F66",  // darker icy rock
    ICE_STONE: "#8FA6AD",      // lighter frosty stone
    HIGH_ICE_STONE: "#5E7279", // darker frosty stone
}

export const fallbackNotFoundBlockSkin: string = '#ff08ef';

