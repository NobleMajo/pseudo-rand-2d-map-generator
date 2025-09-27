

export type BaseJsonType = string | number | boolean | null | undefined
export type JsonType = BaseJsonType | JsonHolder
export type JsonHolder = JsonArray | JsonObject
export type JsonArray = JsonType[]
export type JsonObject = { [key: string]: JsonType }