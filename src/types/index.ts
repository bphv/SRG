export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export interface KernelOptions {
  name?: string
  env?: string
}
