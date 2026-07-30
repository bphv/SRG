export interface ProviderCapabilities {
  chat?: boolean
  completion?: boolean
  streaming?: boolean
  vision?: boolean
  image?: boolean
  audio?: boolean
  embedding?: boolean
  toolCalling?: boolean
  jsonMode?: boolean
  structuredOutput?: boolean
  [key: string]: boolean | undefined
}
