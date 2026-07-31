import { OpenAIClient } from '#/providers/openai/client/OpenAIClient'
import type { OpenAIClientOptions } from '#/providers/openai/client/OpenAIClientOptions'

export class OpenAIClientFactory {
  create(options: OpenAIClientOptions = {}): OpenAIClient {
    return new OpenAIClient(options)
  }

  destroy(_client: OpenAIClient): void {
    // stub
  }
}
