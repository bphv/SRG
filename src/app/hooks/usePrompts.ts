import { usePromptContext } from '#/app/contexts/PromptContext'

export function usePrompts() {
  return usePromptContext()
}
