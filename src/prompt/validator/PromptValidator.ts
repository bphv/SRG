import type { PromptTemplate } from '#/prompt/templates/PromptTemplate'

/**
 * PromptValidator: validate templates and variables (stubs).
 */
export class PromptValidator {
  validate(_template: PromptTemplate): boolean {
    return true
  }

  validateVariables(_vars: Record<string, unknown>): boolean {
    return true
  }

  validateTemplate(_template: PromptTemplate): boolean {
    return true
  }
}
