import type { PromptTemplate } from '#/prompt/templates/PromptTemplate'

/**
 * PromptRepository: minimal in-memory repository for prompt templates.
 */
export class PromptRepository {
  private readonly store = new Map<string, PromptTemplate>()

  async save(template: PromptTemplate): Promise<void> {
    this.store.set(template.id, template)
  }

  async update(_id: string, _template: Partial<PromptTemplate>): Promise<void> {
    // stub
  }

  async delete(_id: string): Promise<void> {
    // stub
  }

  async find(id: string): Promise<PromptTemplate | undefined> {
    return this.store.get(id)
  }

  async findAll(): Promise<PromptTemplate[]> {
    return Array.from(this.store.values())
  }

  async findByCategory(_category: string): Promise<PromptTemplate[]> {
    return []
  }

  async findByTags(_tags: string[]): Promise<PromptTemplate[]> {
    return []
  }
}
