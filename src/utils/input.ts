

let inputPromise: Promise<string> | undefined = undefined
export type Prompt = (err: string | undefined, lastInput: string | undefined) => Error | null | void

export interface PromptLineSettings {
    message: string,
    prompt: Prompt,
    maxLength: number,
    minLength: number,
    allowedChars: Set<string> | string | undefined,
    encoding: BufferEncoding,
    readStream: NodeJS.ReadStream,
    extraValidation: undefined | ((value: string) => string | undefined),
}

export const defaultPromptLineSettings: PromptLineSettings = {
    message: "Enter input:",
    prompt: undefined as any,
    maxLength: -1,
    minLength: -1,
    allowedChars: undefined,
    encoding: "utf8",
    readStream: process.stdin,
    extraValidation: undefined,
}

export const readLine = async (): Promise<string> => {
    const iterator = console[Symbol.asyncIterator]()
    const value = await iterator.next().then((v) => v.value)

    if (iterator.return) {
        await iterator.return()
    }

    return value
}

/**
 * Prompts the user for a string line of input
 * @param options - the settings for the prompt line
 * @returns 
 */
export const promptLine = (
    options: Partial<PromptLineSettings>,
): Promise<string> => {
    const settings: PromptLineSettings = {
        ...defaultPromptLineSettings,
        ...options,
    }

    if (!settings.prompt) {
        settings.prompt = (err) => {
            if (err) {
                console.error("Input error: " + err)
            }
            console.info(settings.message)
        }
    }

    settings.readStream.setEncoding(settings.encoding)

    let currentPromise: Promise<string>

    currentPromise = new Promise<string>(
        async (res, rej) => {
            if (inputPromise) {
                // input is locked, replace old with new to create a chain/queue of promises if locked
                const oldInputPromise = inputPromise
                // this way next promise will wait for this promise
                inputPromise = currentPromise
                // wait for previous promise to be resolved
                await oldInputPromise
            } else {
                inputPromise = currentPromise
            }

            const allowedSet: Set<string> | undefined = !settings.allowedChars ?
                undefined :
                typeof settings.allowedChars === "string"
                    ? new Set(settings.allowedChars.split(""))
                    : settings.allowedChars

            const validate = (value: string): string | undefined => {
                if (settings.minLength > 0 && value.length < settings.minLength) {
                    return `Input must be at least ${settings.minLength} characters.`
                }
                if (settings.maxLength > 0 && value.length > settings.maxLength) {
                    return `Input must be at most ${settings.maxLength} characters.`
                }
                if (allowedSet) {
                    for (const ch of value) {
                        if (!allowedSet.has(ch)) {
                            return `Character not allowed: "${ch}"`
                        }
                    }
                }

                if (settings.extraValidation) {
                    return settings.extraValidation(value)
                }

                return undefined
            }

            const rejectOnBeforePrompt = (err: string | undefined, lastInput: string | undefined): boolean => {
                const err2 = settings.prompt(err, lastInput)

                if (err2 === null) {
                    return true
                }

                if (!err2) {
                    return false
                }
                rej(err2)
                return true
            }

            try {
                // no early abort for first prompt
                settings.prompt(undefined, undefined)

                while (true) {
                    const line = await readLine()
                    const err = validate(line)

                    if (err) {
                        // handle early abort
                        if (rejectOnBeforePrompt(err, line)) {
                            return
                        }
                        continue
                    }

                    res(line)
                    return
                }
            } catch (err) {
                rej(err)
            } finally {
                // remove the new promise from the chain if it was not resolved
                if (inputPromise === currentPromise) {
                    inputPromise = undefined
                }
            }
        }
    )

    return currentPromise
}

export interface PromptNumberSettings extends PromptLineSettings {
    minValue: number | undefined,
    maxValue: number | undefined,
    onlyInteger: boolean,
    noPositive: boolean,
    noNegative: boolean,
    allowNaN: boolean,
    allowInfinity: boolean,
}

export const defaultPromptNumberSettings: PromptNumberSettings = {
    ...defaultPromptLineSettings,
    minValue: undefined,
    maxValue: undefined,
    onlyInteger: false,
    noPositive: false,
    noNegative: false,
    allowNaN: false,
    allowInfinity: false,
}

export const promptNumber = (
    options: Partial<PromptNumberSettings>,
): Promise<number> => {
    const settings: PromptNumberSettings = {
        ...defaultPromptNumberSettings,
        ...options,
    }

    const validate = (value: string): string | undefined => {
        const number = Number(value.trim())

        if (!settings.allowNaN && Number.isNaN(number)) {
            return "Entered value is not a number"
        }
        if (settings.onlyInteger && !Number.isInteger(number)) {
            return "Input must be an integer"
        }
        if (settings.noNegative && number < 0) {
            return "Negative numbers are not allowed"
        }
        if (settings.noPositive && number > 0) {
            return "Positive numbers are not allowed"
        }

        if (settings.minValue !== undefined && number < settings.minValue) {
            return `Input must be greater than ${settings.minValue}`
        }
        if (settings.maxValue !== undefined && number > settings.maxValue) {
            return `Input must be less than ${settings.maxValue}`
        }
        return undefined
    }

    return promptLine({
        ...settings,
        extraValidation: validate,
    }).then(Number)
}