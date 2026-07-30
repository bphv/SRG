import type { PromptTemplate } from '#/prompt/templates/PromptTemplate'

/**
 * PromptBuilder: compose and build prompt templates (stubs).
 */
export class PromptBuilder {
  create(template: PromptTemplate): PromptTemplate {
    return template
  }

  compose(...templates: PromptTemplate[]): PromptTemplate {
    // stub: simple merge
    return templates[templates.length - 1]
  }

  merge(base: PromptTemplate, overlay: Partial<PromptTemplate>): PromptTemplate {
    return { ...base, ...overlay }
  }

  extend(template: PromptTemplate, patch: Partial<PromptTemplate>): PromptTemplate {
    return { ...template, ...patch }
  }
}
