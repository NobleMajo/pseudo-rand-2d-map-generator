import * as PIXI from 'pixi.js'
import type { JsonObject, JsonType } from './utils/json'

export type TextStyleOptions = PIXI.CanvasTextOptions['style']

export type PixiDebuggerSettings = TextStyleOptions & {
    initialCornerOffsetX: number
    initialCornerOffsetY: number
}

export const defaultPixiDebuggerSettings: PixiDebuggerSettings = {
    fontFamily: "Arial",
    fontSize: 22,
    fill: "#000000",
    align: "left",
    initialCornerOffsetX: 15,
    initialCornerOffsetY: 15,
}

export class PixiDebugger {
    settings: PixiDebuggerSettings
    text: PIXI.Text
    debugData: JsonObject = {}

    constructor(
        options: Partial<PixiDebuggerSettings> = {},
    ) {
        this.settings = {
            ...defaultPixiDebuggerSettings,
            ...options,
        }

        this.text = PixiDebugger.createPixiText(this.settings)
    }

    static createPixiText(
        settings: PixiDebuggerSettings
    ): PIXI.Text {
        const text = new PIXI.Text({
            text: 'loading...',
            style: settings,
        })

        text.x = settings.initialCornerOffsetX
        text.y = settings.initialCornerOffsetY

        return text
    }

    static createDebugText(
        obj: JsonObject
    ): string {
        let text = ""

        for (const key of Object.keys(obj)) {
            if (Array.isArray(obj[key])) {
                text += "\n" + key + ": " + obj[key].map((v) => JSON.stringify(v, null, 4)).join(", ")
            } else if (
                typeof obj[key] === "object" &&
                obj[key] !== null
            ) {
                text += "\n" + key + ":"
                for (const innerKey of Object.keys(obj[key])) {
                    text += "\n  ^ " + innerKey + "=" + JSON.stringify(obj[key][innerKey], null, 4)
                }
            } else {
                text += "\n" + key + "=" + JSON.stringify(obj[key], null, 4)
            }
        }

        return "debug" + text
    }

    visible(visible: boolean) {
        this.text.visible = visible
    }

    setDebugData(key: string, data: JsonType) {
        this.debugData[key] = data
    }

    unsetDebugData(key: string) {
        delete this.debugData[key]
    }

    updateText() {
        this.text.text = PixiDebugger.createDebugText(this.debugData)
    }
}
