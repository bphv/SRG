import type { PromptVariable } from '#/app/services/PromptService'

export function replaceVariables(content: string, variables: Record<string, string>): string {
  return content.replace(/{{\s*([\w]+)\s*}}/g, (_, name) => variables[name] ?? `{{${name}}}`)
}

export function buildDefaultVariables(variables: PromptVariable[]) {
  return variables.reduce<Record<string, string>>((acc, variable) => {
    acc[variable.name] = variable.value ?? ''
    return acc
  }, {})
}
