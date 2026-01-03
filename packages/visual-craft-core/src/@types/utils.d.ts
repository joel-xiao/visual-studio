export type JsonPrimitive = string | number | boolean | null;

export type JsonValue<Extra = never> =
  | JsonPrimitive
  | JsonObject<Extra>
  | JsonArray<Extra>
  | Extra;

export type JsonObject<Extra = never> = { [key: string]: JsonValue<Extra> };

export type JsonArray<Extra = never> = readonly JsonValue<Extra>[];
