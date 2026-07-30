import type { PromptTemplate } from '#/prompt/templates/PromptTemplate'

export interface IPromptRepository {
  save(template: PromptTemplate): Promise<void>
  update(id: string, template: Partial<PromptTemplate>): Promise<void>
  delete(id: string): Promise<void>
  find(id: string): Promise<PromptTemplate | undefined>
  findAll(): Promise<PromptTemplate[]>
  findByCategory(category: string): Promise<PromptTemplate[]>
  findByTags(tags: string[]): Promise<PromptTemplate[]>
}
