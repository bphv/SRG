import type { Prompt, PromptVariable, PromptProvider } from '#/app/services/PromptService'

export type PromptTestResult = {
  output: string
  tokens: number
  durationMs: number
  model: string
  provider: PromptProvider
  status: 'success' | 'error'
  error?: string
}

export function runPromptTest(prompt: Prompt, provider: PromptProvider, model: string, values: Record<string, string>): PromptTestResult {
  const missing = prompt.versions[0]?.variables.filter((variable) => variable.required && !values[variable.name]) ?? []

  if (missing.length > 0) {
    return {
      output: '',
      tokens: 0,
      durationMs: 0,
      model,
      provider,
      status: 'error',
      error: `Variables requises manquantes : ${missing.map((variable) => variable.name).join(', ')}`,
    }
  }

  const replaced = prompt.content.replace(/{{\s*([\w]+)\s*}}/g, (_, name) => values[name] ?? `{{${name}}}`)
  const output = `Réponse simulée pour ${prompt.name} avec ${provider}/${model} :\n\n${replaced}\n\n---\nRéponse générée avec succès.`
  const tokens = Math.max(20, Math.ceil(replaced.length / 5))
  const durationMs = 300 + Math.round(tokens * 2.5)

  return {
    output,
    tokens,
    durationMs,
    model,
    provider,
    status: 'success',
  }
}
