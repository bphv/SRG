export interface OpenAIClientOptions {
  apiKey?: string
  timeout?: number
  maxRetries?: number
  baseUrl?: string
  organization?: string
  project?: string
  headers?: Record<string, string>
  sdkVersion?: string
}
