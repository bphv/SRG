import type { PromptTemplate } from '#/prompt/templates/PromptTemplate'

export interface IPromptValidator {
  validate(template: PromptTemplate): boolean
  validateVariables(vars: Record<string, unknown>): boolean
  validateTemplate(template: PromptTemplate): boolean
}
