import type OpenAI from 'openai'
import { BaseTransport } from '#/providers/shared/transport/BaseTransport'
import type { TransportRequest } from '#/providers/shared/transport/TransportRequest'
import type { TransportResponse } from '#/providers/shared/transport/TransportResponse'
import type { OpenAIClientOptions } from '#/providers/openai/client/OpenAIClientOptions'
import type { OpenAIMapper, OpenAISdkRequest } from '#/providers/openai/OpenAIMapper'
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions/completions.js'
import { TimeoutError, NetworkError, AuthenticationError, RateLimitError } from '#/providers/openai/client/OpenAIClientError'

export class OpenAITransport extends BaseTransport {
  private openAI: OpenAI | null = null
  private mapper: OpenAIMapper

  constructor(options: OpenAIClientOptions = {}, mapper: OpenAIMapper) {
    super(options)
    this.mapper = mapper
  }

  setOpenAIClient(openAI: OpenAI): void {
    this.openAI = openAI
  }

  protected async simulateSend(request: TransportRequest): Promise<TransportResponse> {
    if (!this.openAI) {
      throw new NetworkError('OpenAI SDK client is not initialized')
    }

    if (this.timeoutPolicy.expired()) {
      throw new TimeoutError('Request timed out before transport send')
    }

    const sdkRequest: OpenAISdkRequest = this.mapper.buildSdkRequestFromTransportRequest(request)

    const signal = undefined
    const startTime = Date.now()

    try {
      const sdkResponse = await this.retryPolicy.execute(async () => {
        const createArgs = {
          ...sdkRequest,
          signal,
        } as ChatCompletionCreateParamsNonStreaming

        return await this.openAI!.chat.completions.create(createArgs)
      })

      const chatResponse = sdkResponse as ChatCompletion
      if (typeof chatResponse.id !== 'string' || !Array.isArray(chatResponse.choices)) {
        throw new NetworkError('Unexpected OpenAI response shape')
      }

      const latency = Date.now() - startTime
      return this.mapper.buildTransportResponse(chatResponse, request, latency)
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }
      if (error instanceof RateLimitError) {
        throw error
      }
      if (error instanceof TimeoutError) {
        throw error
      }

      const openAIError = error as Error
      const message = openAIError.message.toLowerCase()

      if (message.includes('timeout')) {
        throw new TimeoutError(openAIError.message)
      }
      if (message.includes('rate limit')) {
        throw new RateLimitError(openAIError.message)
      }
      if (message.includes('authentication') || message.includes('invalid_api_key')) {
        throw new AuthenticationError(openAIError.message)
      }

      throw new NetworkError(openAIError.message)
    }
  }
}
