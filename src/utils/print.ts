export const unicodeShadeCharacters = " ·‚\":;-_^*o◦○◌◍●◐◑◒◓◔◕•◉◎⬤◯▬▫◙▢▣▤▥▦▧▩◧▭▯▮▰▱▵▴▲△▶▄▅▆▇█▓▒░"

export const drawUint8Map2DRows = (map: number[][], maxValue: number = 255): string[] => {
    let stringMap: string[][] = []

    for (const mapRow of map) {
        let rowStringArray: string[] = []
        for (const value of mapRow) {
            if (Number.isNaN(value)) {
                throw new Error("Value is NaN")
            } else if (value < 0) {
                throw new Error("Value is negative")
            } else if (value > maxValue) {
                throw new Error("Value is greater than maxValue")
            } else if (!Number.isFinite(value)) {
                throw new Error("Value is not finite")
            } else if (value == undefined) {
                throw new Error("Value is undefined")
            }
            const index = Math.floor(value / maxValue * unicodeShadeCharacters.length)
            const stringValue = unicodeShadeCharacters[index]!
            rowStringArray.push(stringValue + stringValue)
        }
        stringMap.push(rowStringArray)
    }


    const stringLines = stringMap.map((v) => {
        return v.join("")
    })

    return stringLines
}

export const drawUint8Map2D = (map: number[][], maxValue: number = 255): string => {
    return drawUint8Map2DRows(map, maxValue).join("\n")
}

export const printUint8Map2D = (map: number[][], maxValue: number = 255): void => {
    const lines = drawUint8Map2D(map, maxValue)

    console.info(lines)
}