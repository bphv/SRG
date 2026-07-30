import type { PromptTemplate } from '#/prompt/templates/PromptTemplate'

/**
 * PromptRenderer: render templates and variables into final prompt strings (stubs).
 */
export class PromptRenderer {
  render(template: PromptTemplate, _variables?: Record<string, unknown>): string {
    // stub: naive interpolation could be implemented later
    return template.content ?? ''
  }

  renderVariables(_template: PromptTemplate): Record<string, unknown> {
    return {}
  }
}
