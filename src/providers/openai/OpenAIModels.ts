export const OpenAIModels = {
  GPT_5: 'gpt-5',
  GPT_5_MINI: 'gpt-5-mini',
  GPT_5_5: 'gpt-5.5',
  GPT_4_1: 'gpt-4.1',
  O4_MINI: 'o4-mini',
} as const

export type OpenAIModel = (typeof OpenAIModels)[keyof typeof OpenAIModels]
