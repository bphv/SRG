import { OpenAIProvider } from '#/providers/openai/OpenAIProvider'
import type { ProviderContract } from '#/contracts/provider/ProviderContract'
import type { OpenAIConfiguration } from '#/providers/openai/OpenAIConfiguration'

export class OpenAIProviderFactory {
  create(contract: ProviderContract, config: OpenAIConfiguration = {}): OpenAIProvider {
    return new OpenAIProvider(contract, config)
  }
}
