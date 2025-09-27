import { promptNumber } from "../src/utils/input"
import { seededGenerator } from "../src/utils/pseudoRand"

const seed = await promptNumber({
    message: "Enter a seed: (between 0 and 9999999999)",
    maxValue: 9999999999,
    onlyInteger: true,
    noNegative: true,
})

const rand = seededGenerator(seed)

for (let i = 0; i < 10; i++) {
    console.log(" - " + i + ": " + rand.hashUint16Int())
}

