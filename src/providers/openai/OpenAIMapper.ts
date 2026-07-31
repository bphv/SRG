import type { ExecutionRequest } from '#/execution/request/ExecutionRequest'
import type { ExecutionResponse } from '#/execution/response/ExecutionResponse'
import type { TransportRequest } from '#/providers/shared/transport/TransportRequest'
import type { TransportResponse } from '#/providers/shared/transport/TransportResponse'
import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletion,
} from 'openai/resources/chat/completions/completions.js'

export interface OpenAIRequest {
  model: string
  prompt?: string
  input?: string
  maxTokens?: number
  temperature?: number
  metadata?: Record<string, unknown>
}

export interface OpenAIResponse {
  id: string
  status: 'success' | 'error'
  output?: string
  tokensInput?: number
  tokensOutput?: number
  durationMs?: number
  metadata?: Record<string, unknown>
  errorMessage?: string
}

export type OpenAISdkRequest = ChatCompletionCreateParamsNonStreaming & {
  model: string
}

export class OpenAIMapper {
  buildRequest(executionRequest: ExecutionRequest, model: string): OpenAIRequest {
    return {
      model,
      prompt: executionRequest.prompt ?? executionRequest.input,
      input: executionRequest.input,
      metadata: executionRequest.metadata,
    }
  }

  buildSdkRequest(openAIRequest: OpenAIRequest): OpenAISdkRequest {
    return {
      model: openAIRequest.model,
      messages: [
        {
          role: 'user',
          content: openAIRequest.prompt ?? openAIRequest.input ?? '',
        },
      ],
    }
  }

  buildSdkRequestFromTransportRequest(request: TransportRequest): OpenAISdkRequest {
    return {
      model: request.model,
      messages: [
        {
          role: 'user',
          content:
            typeof request.body === 'string'
              ? request.body
              : request.body && typeof request.body === 'object' && 'prompt' in request.body
              ? (request.body as any).prompt
              : JSON.stringify(request.body),
        },
      ],
    }
  }

  buildResponse(openAIResponse: OpenAIResponse): ExecutionResponse {
    return {
      id: openAIResponse.id,
      status: openAIResponse.status === 'success' ? 'completed' : 'failed',
      output: openAIResponse.output,
      artifacts: [],
      logs: [],
      metrics: {
        tokensInput: openAIResponse.tokensInput ?? 0,
        tokensOutput: openAIResponse.tokensOutput ?? 0,
        duration: openAIResponse.durationMs ?? 0,
      },
      metadata: openAIResponse.metadata as Record<string, import('#/types').JsonValue> | undefined,
      errors: openAIResponse.status === 'error' ? [openAIResponse.errorMessage ?? 'unknown_error'] : undefined,
    }
  }

  buildTransportResponse(sdkResponse: ChatCompletion, request: TransportRequest, latency: number): TransportResponse {
    return {
      status: 'success',
      provider: request.provider,
      model: sdkResponse.model,
      headers: request.headers ?? {},
      body: {
        id: sdkResponse.id,
        text: sdkResponse.choices?.[0]?.message?.content ?? undefined,
        usage: sdkResponse.usage,
      },
      latency,
      metadata: {
        sdk: 'openai',
        requestId: request.id,
      },
    }
  }
}
