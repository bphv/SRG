import type { PromptTemplate } from '#/prompt/templates/PromptTemplate'

export interface IPromptRenderer {
  render: (template: PromptTemplate, variables?: Record<string, unknown>) => string
  renderVariables: (template: PromptTemplate) => Record<string, unknown>
}
