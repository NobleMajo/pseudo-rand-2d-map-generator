import * as PIXI from 'pixi.js'
import { PixiDebugger } from './debugger'
import { SeedChunkGenerator } from "./map/chunkGenerator"
import { LocalStorageChunkStore } from "./map/chunkStore"
import { World } from "./map/world"
import { seededGenerator } from "./utils/pseudoRand"
import { blockSkins, fallbackNotFoundBlockSkin } from './view/blockSkin'
import {
    PlayerRenderer
} from "./view/player"
import {
    WorldRenderer
} from "./view/worldRenderer"

const updateStatus = (status: string) => {
    document.title = status
    console.log("STATUS: " + status)
}

updateStatus("Init pixi.js...")
const app = new PIXI.Application()

await app.init({
    width: 1920,
    height: 1080,
    backgroundColor: 0x1099bb,
    antialias: false,
    resolution: window.devicePixelRatio || 1,
})

document.body.appendChild(app.canvas)

const worldContainer = new PIXI.Container()
const playerContainer = new PIXI.Container()

const worldGraphics = new PIXI.Graphics()
worldContainer.addChild(worldGraphics)

let playerGraphics = new PIXI.Graphics()
playerContainer.addChild(playerGraphics)

app.stage.addChild(worldContainer)
app.stage.addChild(playerContainer)

worldContainer.x = app.screen.width / 2
worldContainer.y = app.screen.height / 2
playerContainer.x = app.screen.width / 2
playerContainer.y = app.screen.height / 2

updateStatus("Init debug data...")
const debug = new PixiDebugger()
app.stage.addChild(debug.text)

updateStatus("Init seed...")
const seedGenerator = seededGenerator(1)

updateStatus("Init chunk store...")
const chunkGenerator = new SeedChunkGenerator(seedGenerator, 0)

updateStatus("Init chunk store...")
const chunkStore = new LocalStorageChunkStore(chunkGenerator)

updateStatus("Init world...")
const world = new World(chunkStore, 256)

updateStatus("Init world view...")
const worldView = new WorldRenderer(world, 32, 2)

updateStatus("Init player renderer...")
const playerRenderer = new PlayerRenderer()
playerRenderer.maxX = worldView.worldPixelSize
playerRenderer.maxY = worldView.worldPixelSize

updateStatus("Start rendering...")

app.ticker.minFPS = 10
app.ticker.maxFPS = 60

const debugKeyId = "digit0"

playerRenderer.registerSwitch(debugKeyId)

const gameLoop = (ticker: PIXI.Ticker) => {
    playerRenderer.updateMovement()
    const velo = playerRenderer.getVelocitySpeed()

    debug.setDebugData("player", {
        x: Math.round(playerRenderer.x * 100) / 100,
        y: Math.round(playerRenderer.y * 100) / 100,
        veloX: Math.round(playerRenderer.vx * 100) / 100,
        veloY: Math.round(playerRenderer.vy * 100) / 100,
        speed: Math.round(velo * 100) / 100,
        running: playerRenderer.isRunning(),
        maxSpeed: playerRenderer.maxVelocity,
    })

    debug.setDebugData("fps", Math.round(ticker.FPS))

    // Clear and redraw player (fix memory leak)
    playerGraphics.clear()
    playerGraphics.circle(0, 0, 8)
    playerGraphics.fill(0xFF0000)

    const worldRenderData = worldView.renderWorld(
        playerRenderer.x,
        playerRenderer.y,
        playerRenderer.switchState(debugKeyId),
    )

    debug.setDebugData("world", {
        chunkX: worldRenderData.chunkX,
        chunkY: worldRenderData.chunkY,
        firstFieldX: worldRenderData.centerDrawOffsetX,
        firstFieldY: worldRenderData.centerDrawOffsetY,
    })
    debug.visible(playerRenderer.switchState(debugKeyId))

    // Clear and redraw world using single graphics object (major performance improvement)
    worldGraphics.clear()
    worldView.iterateFields(
        worldRenderData,
        (field, pixelX, pixelY) => {
            worldGraphics.rect(pixelX, pixelY, worldView.fieldPixelSize, worldView.fieldPixelSize)
            worldGraphics.fill(
                blockSkins[field.backgroundId] ?? fallbackNotFoundBlockSkin
            )
        },
    )

    debug.updateText()
}

app.ticker.add(gameLoop)

window.addEventListener('beforeunload', () => {
    playerRenderer.removeKeyListeners()
    app.destroy({
        releaseGlobalResources: true,
        removeView: true,
    })
})

updateStatus("Ready!")