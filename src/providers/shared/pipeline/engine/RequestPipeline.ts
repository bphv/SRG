import type { IRequestPipeline } from '../interfaces/IRequestPipeline'
import type { PipelineContext, PipelineError, PipelineWarning } from '../context/PipelineContext'
import type { IPipelineStage } from '../interfaces/IPipelineStage'
import type { ExecutionRequest } from '#/execution/request/ExecutionRequest'
import type { PipelineResult } from './PipelineResult'
import type { TransportRequest } from '../../transport/TransportRequest'

export class RequestPipeline implements IRequestPipeline {
  private stages: IPipelineStage[] = []

  registerStage(stage: IPipelineStage): void {
    if (!this.stages.includes(stage)) {
      this.stages.push(stage)
    }
  }

  removeStage(stage: IPipelineStage): void {
    this.stages = this.stages.filter((item) => item !== stage)
  }

  async execute(
    request: ExecutionRequest,
    provider?: string,
    configuration: Record<string, unknown> = {},
    options: Record<string, unknown> = {},
  ): Promise<PipelineResult> {
    const context: PipelineContext = {
      request,
      provider,
      configuration,
      options,
      metadata: {},
      errors: [],
      warnings: [],
    }

    let currentContext = context

    for (const stage of this.stages) {
      try {
        currentContext = await stage.process(currentContext)
      } catch (error) {
        const pipelineError: PipelineError = {
          message: (error as Error).message,
          details: {
            stage: stage.name,
          },
        }

        const warnings: PipelineWarning[] = currentContext.warnings ?? []
        const errors: PipelineError[] = [...(currentContext.errors ?? []), pipelineError]

        return {
          success: false,
          transportRequest: currentContext.transportRequest,
          errors,
          warnings,
          metadata: currentContext.metadata ?? {},
        }
      }

      if (currentContext.errors && currentContext.errors.length > 0) {
        return {
          success: false,
          transportRequest: currentContext.transportRequest,
          errors: currentContext.errors,
          warnings: currentContext.warnings ?? [],
          metadata: currentContext.metadata ?? {},
        }
      }
    }

    const selectedModel =
      typeof currentContext.metadata?.selectedModel === 'string'
        ? currentContext.metadata.selectedModel
        : 'gpt-4.1'

    const transportRequest: TransportRequest = {
      id: currentContext.request.id,
      provider: currentContext.provider ?? 'unknown',
      model: selectedModel,
      endpoint: typeof currentContext.configuration?.endpoint === 'string' ? currentContext.configuration.endpoint : '/ai/request',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': typeof currentContext.options?.userAgent === 'string' ? currentContext.options.userAgent : 'srg-transport/1.0',
      },
      body: {
        input: currentContext.request.input,
        prompt: currentContext.request.prompt,
        options: currentContext.request.options,
        metadata: currentContext.metadata,
      },
      metadata: {
        ...(currentContext.metadata ?? {}),
      },
    }

    currentContext.transportRequest = transportRequest

    return {
      success: true,
      transportRequest,
      errors: currentContext.errors ?? [],
      warnings: currentContext.warnings ?? [],
      metadata: currentContext.metadata ?? {},
    }
  }

  clear(): void {
    this.stages = []
  }

  getStages(): IPipelineStage[] {
    return [...this.stages]
  }
}
