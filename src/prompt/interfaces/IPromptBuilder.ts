import type { PromptTemplate } from '#/prompt/templates/PromptTemplate'

export interface IPromptBuilder {
  create: (template: PromptTemplate) => PromptTemplate
  compose: (...templates: PromptTemplate[]) => PromptTemplate
  merge: (base: PromptTemplate, overlay: Partial<PromptTemplate>) => PromptTemplate
  extend: (template: PromptTemplate, patch: Partial<PromptTemplate>) => PromptTemplate
}
