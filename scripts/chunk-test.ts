import { seededGenerator, type PseudoRand } from "../src/utils/pseudoRand"

const seed = 1234
const rand: PseudoRand = seededGenerator(seed)

const topLeftX0Y0 = rand.clone().hashUint16Int(0 + "," + 0)



const topLeftX0Y1 = rand.clone().hashUint16Int(0 + "," + 1)