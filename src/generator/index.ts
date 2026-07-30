export * from './engine/GeneratorEngine'
export * from './engine/GeneratorEngineContext'
export * from './engine/GeneratorEngineOptions'
export * from './engine/GeneratorEngineState'
export * from './engine/GeneratorEngineResult'

export * from './request/GenerationRequest'
export * from './response/GenerationResponse'

export * from './pipeline/GenerationPipeline'
export * from './pipeline/PipelineStage'

export * from './context/GenerationContext'

export * from './strategy/GenerationStrategy'

export * from './repository/GenerationRepository'

export * from './interfaces/IGeneratorEngine'
export * from './interfaces/IGenerationRepository'
export * from './interfaces/IGenerationPipeline'
export * from './interfaces/IGenerationStrategy'

export * from './types/GeneratorTypes'
/**
 * Generator module placeholder.
 * Future implementation will orchestrate project generation workflows.
 */
export interface GeneratorService {
  generateProject(templateName: string, options?: Record<string, unknown>): Promise<unknown>
}

export class GeneratorServiceImpl implements GeneratorService {
  async generateProject(templateName: string, options: Record<string, unknown> = {}): Promise<unknown> {
    return Promise.resolve({ templateName, options })
  }
}
