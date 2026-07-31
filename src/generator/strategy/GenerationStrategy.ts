import type { GenerationRequest } from '#/generator/request/GenerationRequest'
import type { GenerationResponse } from '#/generator/response/GenerationResponse'
import type { GenerationContext } from '#/generator/context/GenerationContext'

/**
 * GenerationStrategy: defines strategy interface for generation orchestration (stub).
 */
export interface GenerationStrategy {
  execute: (context: GenerationContext, request: GenerationRequest) => Promise<GenerationResponse>
}
