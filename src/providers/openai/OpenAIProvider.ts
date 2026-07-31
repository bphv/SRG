import { BaseProvider } from '#/providers/base/BaseProvider'
import type { IProvider } from '#/providers/interfaces/IProvider'
import type { ProviderContract } from '#/contracts/provider/ProviderContract'
import type { ExecutionRequest } from '#/execution/request/ExecutionRequest'
import type { ExecutionResponse } from '#/execution/response/ExecutionResponse'
import type { ProviderHealth } from '#/providers/health/ProviderHealth'
import type { OpenAIConfiguration } from '#/providers/openai/OpenAIConfiguration'
import type { OpenAIResponse } from '#/providers/openai/OpenAIMapper'
import { OpenAIMapper } from '#/providers/openai/OpenAIMapper'
import { OpenAIProviderCapabilities } from '#/providers/openai/OpenAIProviderCapabilities'
import { OpenAIModels } from '#/providers/openai/OpenAIModels'
import { OpenAIClient } from '#/providers/openai/client/OpenAIClient'
import { OpenAIClientFactory } from '#/providers/openai/client/OpenAIClientFactory'

export class OpenAIProvider extends BaseProvider implements IProvider {
  readonly config: OpenAIConfiguration
  readonly model: string
  private readonly mapper = new OpenAIMapper()
  private readonly client: OpenAIClient

  constructor(contract: ProviderContract, config: OpenAIConfiguration = {}) {
    super(contract, 'available')
    this.config = config
    this.model = config.defaultModel ?? OpenAIModels.GPT_4_1
    this.client = new OpenAIClientFactory().create({
      timeout: config.timeout,
      maxRetries: config.maxRetries,
      baseUrl: config.baseUrl,
      organization: config.organization,
      project: config.project,
      headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : undefined,
    })
  }

  async initialize(): Promise<void> {
    await this.client.initialize()
    this.status = 'available'
  }

  async health(): Promise<ProviderHealth> {
    const response = await this.client.health()

    return {
      status: this.status,
      latency: response.latency,
      availability: response.status === 'success' ? 100 : 0,
      lastCheck: new Date().toISOString(),
    }
  }

  supports(capability: string): boolean {
    return Object.keys(OpenAIProviderCapabilities).includes(capability)
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResponse> {
    const clientResponse = await this.client.execute(request)

    const openAIResponse: OpenAIResponse = {
      id: request.id,
      status: clientResponse.status === 'success' ? 'success' : 'error',
      output: clientResponse.content,
      tokensInput: clientResponse.usage?.tokensInput,
      tokensOutput: clientResponse.usage?.tokensOutput,
      durationMs: clientResponse.latency,
      metadata: {
        provider: 'openai',
        model: clientResponse.model,
        clientMetadata: clientResponse.metadata,
      },
    }

    return this.mapper.buildResponse(openAIResponse)
  }

  async shutdown(): Promise<void> {
    await this.client.shutdown()
    this.status = 'offline'
  }
}
