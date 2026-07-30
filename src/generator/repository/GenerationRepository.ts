import type { GenerationRequest } from '#/generator/request/GenerationRequest'
import type { GenerationResponse } from '#/generator/response/GenerationResponse'

/**
 * GenerationRepository: in-memory store for generation runs (stubs).
 */
export class GenerationRepository {
  private readonly requests = new Map<string, GenerationRequest>()
  private readonly responses = new Map<string, GenerationResponse>()

  async save(request: GenerationRequest): Promise<void> {
    this.requests.set(request.id, request)
  }

  async update(_id: string, _payload: Partial<GenerationResponse>): Promise<void> {
    // stub
  }

  async delete(_id: string): Promise<void> {
    // stub
  }

  async find(id: string): Promise<GenerationRequest | undefined> {
    return this.requests.get(id)
  }

  async findAll(): Promise<GenerationRequest[]> {
    return Array.from(this.requests.values())
  }

  async saveResponse(response: GenerationResponse): Promise<void> {
    this.responses.set(response.id, response)
  }

  async findResponse(id: string): Promise<GenerationResponse | undefined> {
    return this.responses.get(id)
  }
}
