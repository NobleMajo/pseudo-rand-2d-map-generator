export type SwitchChangeCallback = (state: boolean, keyId: string) => void | Promise<void>

export class PlayerRenderer {
    keys: Set<string> = new Set()
    switchStates: Record<string, boolean> = {}
    switchCallbacks: Record<string, SwitchChangeCallback> = {}

    public vx: number = 0  // velocity X
    public vy: number = 0  // velocity Y
    public acceleration: number = 0.6 // How fast to accelerate
    public friction: number = 0.99    // Friction when no input (0.85 = 15% speed loss per frame)
    public baseMaxVelocity: number = 10    // Base maximum velocity
    public runMaxVelocity: number = 20    // Maximum velocity when running (shift held)
    public maxVelocity: number = 8    // Current maximum velocity
    public lastFrameTime: number = performance.now()

    constructor(
        public x: number = 0,
        public y: number = 0,
        public maxX: number | undefined = undefined,
        public maxY: number | undefined = undefined,
    ) {
        this.addKeyListeners()
    }

    keyDownHandler: (event: KeyboardEvent) => void = (event) => {
        const keyId = event.code.toLowerCase()

        this.keys.add(keyId)
        if (typeof this.switchStates[keyId] === "boolean") {
            this.switchStates[keyId] = !this.switchStates[keyId]
            if (this.switchCallbacks[keyId]) {
                this.switchCallbacks[keyId](true, keyId)
            }
        }
    }

    keyUpHandler: (event: KeyboardEvent) => void = (event) => {
        const keyId = event.code.toLowerCase()
        this.keys.delete(keyId)
    }

    addKeyListeners() {
        this.removeKeyListeners()
        document.addEventListener('keydown', this.keyDownHandler)
        document.addEventListener('keyup', this.keyUpHandler)
    }

    removeKeyListeners() {
        document.removeEventListener('keydown', this.keyDownHandler)
        document.removeEventListener('keyup', this.keyUpHandler)
    }

    updateMovement() {
        const currentTime = performance.now()
        const deltaTime = (currentTime - this.lastFrameTime) / 16.67
        this.lastFrameTime = currentTime

        // Check if shift is held for run boost
        const isRunning = this.keys.has('shiftleft') || this.keys.has('shiftright')
        this.maxVelocity = isRunning ? this.runMaxVelocity : this.baseMaxVelocity

        let accelX = 0
        let accelY = 0

        if (this.keys.has('keyw')) accelY -= this.acceleration
        if (this.keys.has('keys')) accelY += this.acceleration
        if (this.keys.has('keya')) accelX -= this.acceleration
        if (this.keys.has('keyd')) accelX += this.acceleration

        this.vx += accelX * deltaTime
        this.vy += accelY * deltaTime

        if (accelX === 0) {
            this.vx *= Math.pow(this.friction, deltaTime)
        }
        if (accelY === 0) {
            this.vy *= Math.pow(this.friction, deltaTime)
        }

        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
        if (currentSpeed > this.maxVelocity) {
            const scale = this.maxVelocity / currentSpeed
            this.vx *= scale
            this.vy *= scale
        }

        this.x += this.vx * deltaTime
        this.y += this.vy * deltaTime

        if (Math.abs(this.vx) < 0.01) {
            this.vx = 0
        }
        if (Math.abs(this.vy) < 0.01) {
            this.vy = 0
        }

        if (this.maxX) {
            while (this.x < 0) {
                this.x += this.maxX
            }
            while (this.x >= this.maxX) {
                this.x -= this.maxX
            }
        }
        if (this.maxY) {
            while (this.y < 0) {
                this.y += this.maxY
            }
            while (this.y >= this.maxY) {
                this.y -= this.maxY
            }
        }
    }

    getVelocitySpeed(): number {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    }

    isRunning(): boolean {
        return this.keys.has('shiftleft') || this.keys.has('shiftright')
    }

    isPressed(keyId: string): boolean {
        return this.keys.has(keyId)
    }

    registerSwitch(
        keyId: string,
        stateChangeCallback?: SwitchChangeCallback,
    ) {
        this.switchStates[keyId] = false
        if (stateChangeCallback) {
            this.switchCallbacks[keyId] = stateChangeCallback
        }
    }

    switchState(keyId: string): boolean {
        if (typeof this.switchStates[keyId] !== "boolean") {
            throw new Error(`Switch ${keyId} is not registered`)
        }

        return this.switchStates[keyId]
    }

    unregisterSwitch(keyId: string) {
        delete this.switchStates[keyId]
        delete this.switchCallbacks[keyId]
    }
}

export class MultiKeySwitch {
    constructor(
        public playerRenderer: PlayerRenderer,
        public keyIds: string[],
        public needAllKeys: boolean = false,
        public stateChangeCallback?: SwitchChangeCallback,
    ) {
        for (const keyId of this.keyIds) {
            this.playerRenderer.registerSwitch(keyId, stateChangeCallback)
        }
    }

    state(): boolean {
        for (const keyId of this.keyIds) {
            if (this.needAllKeys) {
                if (!this.playerRenderer.switchStates[keyId]) {
                    return false
                }
            } else {
                if (this.playerRenderer.switchStates[keyId]) {
                    return true
                }
            }
        }

        if (this.needAllKeys) {
            return true
        } else {
            return false
        }
    }

    remove() {
        for (const keyId of this.keyIds) {
            this.playerRenderer.unregisterSwitch(keyId)
        }
    }
}
