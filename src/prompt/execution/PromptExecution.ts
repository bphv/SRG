/**
 * PromptExecution: container for prepared execution info.
 */
export interface PromptExecution {
  id: string
  prompt: string
  variables?: Record<string, unknown>
  metadata?: Record<string, unknown>
}
