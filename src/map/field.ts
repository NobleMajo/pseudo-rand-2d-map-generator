import type { JsonObject, JsonType } from "../utils/json"
import { Backgrounds, type Background, type BackgroundId } from "./background"
import { BlockTypes, type Block, type BlockType, type BlockTypeId } from "./block"

export class Field {
    private changeState: string

    constructor(
        public backgroundId: BackgroundId,
        public block?: Block | undefined,
    ) {
        this.changeState = this.loadCurrentChangeState()
    }

    stringify(): string {
        const state: JsonType[] = [this.backgroundId]

        if (this.block) {
            state.push(this.block.typeId)
            if (this.block.meta) {
                state.push(this.block.meta)
            }
        }

        return JSON.stringify(state)
    }

    static parse(serializedField: string): Field {
        const [backgroundId, blockTypeId, blockMeta] = JSON.parse(serializedField) as [BackgroundId, BlockTypeId | undefined, JsonObject | undefined]

        if (typeof backgroundId !== "string" || backgroundId.length === 0) {
            throw new Error("Invalid or empty backgroundId in serialized field:'" + serializedField.split("'").join("\\'") + "'")
        }

        return new Field(
            backgroundId,
            blockTypeId ? {
                typeId: blockTypeId,
                meta: blockMeta,
            } : undefined,
        )
    }

    loadCurrentChangeState(): string {
        let state = this.backgroundId

        if (this.block) {
            state += "/" + this.block.typeId
            if (this.block.meta) {
                state += "/" + fastStringHash(JSON.stringify(this.block.meta))
            }
        }

        return state
    }

    getChangeState(): string {
        return this.changeState
    }

    hasChanged(): boolean {
        return this.changeState !== this.loadCurrentChangeState()
    }

    getBlockType(): BlockType | undefined {
        if (!this.block) {
            return undefined
        }
        return BlockTypes[this.block.typeId]
    }

    hasBlock(): boolean {
        return this.block != undefined
    }

    getBackground(): Background {
        return Backgrounds[this.backgroundId]
    }

    isBuildable(): boolean {
        return Backgrounds[this.backgroundId].buildable
    }

    isWalkable(): boolean {
        const blockType = this.getBlockType()
        if (blockType) {
            if (blockType.walkable != undefined) {
                return blockType.walkable
            }
        }

        return Backgrounds[this.backgroundId].walkable
    }

    getMovementMultiplier(): number {
        const blockType = this.getBlockType()
        if (blockType) {
            if (blockType.movementMultiplier != undefined) {
                return blockType.movementMultiplier
            }
        }

        return Backgrounds[this.backgroundId].movementMultiplier
    }

    getFriction(): number {
        const blockType = this.getBlockType()
        if (blockType) {
            if (blockType.friction != undefined) {
                return blockType.friction
            }
        }
        return Backgrounds[this.backgroundId].friction
    }

    isPlantable(): boolean {
        const blockType = this.getBlockType()
        if (blockType) {
            if (blockType.plantable != undefined) {
                return blockType.plantable
            }
        }
        return Backgrounds[this.backgroundId].plantable
    }
}

function fastStringHash(str: string): number {
    if (str.length === 0) {
        return 0
    }

    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i)
        hash |= 0
    }
    return hash
}
