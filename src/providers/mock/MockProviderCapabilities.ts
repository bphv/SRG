export const MockProviderCapabilities = {
  chat: true,
  completion: true,
  streaming: false,
  vision: false,
  image: false,
  audio: false,
  toolCalling: false,
  jsonMode: true,
  structuredOutput: true,
} as const

export type MockProviderCapability = keyof typeof MockProviderCapabilities
