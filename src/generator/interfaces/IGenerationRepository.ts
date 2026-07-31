import type { GenerationRequest } from '#/generator/request/GenerationRequest'
import type { GenerationResponse } from '#/generator/response/GenerationResponse'

export interface IGenerationRepository {
  save: (request: GenerationRequest) => Promise<void>
  find: (id: string) => Promise<GenerationRequest | undefined>
  findAll: () => Promise<GenerationRequest[]>
  saveResponse: (response: GenerationResponse) => Promise<void>
  findResponse: (id: string) => Promise<GenerationResponse | undefined>
}
