export interface OpenAIClientResponse {
  status: 'success' | 'failed'
  provider: 'openai'
  model: string
  content?: string
  usage?: {
    tokensInput?: number
    tokensOutput?: number
  }
  latency: number
  metadata?: Record<string, unknown>
}
