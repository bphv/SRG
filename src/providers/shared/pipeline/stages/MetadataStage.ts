import type { IPipelineStage } from '../interfaces/IPipelineStage'
import type { PipelineContext } from '../context/PipelineContext'

function generateCorrelationId(): string {
  return `corr-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`
}

function generateTraceId(): string {
  return `trace-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`
}

export class MetadataStage implements IPipelineStage {
  readonly name = 'MetadataStage'

  async process(context: PipelineContext): Promise<PipelineContext> {
    const request = context.request
    const metadata = {
      ...context.metadata,
      requestId: request.id,
      timestamp: new Date().toISOString(),
      provider: context.provider ?? 'unknown',
      sdkVersion: 'srg-sdk-placeholder',
      correlationId: generateCorrelationId(),
      traceId: generateTraceId(),
    }

    return {
      ...context,
      metadata,
    }
  }
}
