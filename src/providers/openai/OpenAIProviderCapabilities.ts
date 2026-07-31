export const OpenAIProviderCapabilities = {
  chat: true,
  completion: true,
  streaming: true,
  vision: true,
  image: true,
  audio: true,
  toolCalling: true,
  jsonMode: true,
  structuredOutput: true,
} as const

export type OpenAIProviderCapability = keyof typeof OpenAIProviderCapabilities
