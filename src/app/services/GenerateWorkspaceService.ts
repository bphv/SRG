export type GenerateProviderChoice =
  | 'auto'
  | 'openai'
  | 'gemini'
  | 'claude'
  | 'anthropic'
  | 'openrouter'
  | 'deepseek'
  | 'mistral'
  | 'grok'
  | 'qwen'
  | 'mock'

export type GenerateOutputFormat = 'text' | 'markdown' | 'json' | 'code' | 'image' | 'audio'

export type GenerateWorkspacePreferences = {
  providerChoice: GenerateProviderChoice
  model: string
  temperature: number
  topP: number
  topK: number
  maxTokens: number
  seed: number
  streaming: boolean
  jsonMode: boolean
  reasoning: boolean
  tools: boolean
  vision: boolean
  image: boolean
  audio: boolean
  splitView: boolean
  fullscreen: boolean
  outputFormat: GenerateOutputFormat
}

export type GenerateWorkspaceDraft = {
  selectedPromptId: string | null
  selectedTemplateId: string
  promptName: string
  promptContent: string
  variables: Record<string, string>
}

const PREFS_KEY = 'srg.generate.workspace.preferences.v1'
const DRAFT_KEY = 'srg.generate.workspace.draft.v1'

const defaultPreferences = (): GenerateWorkspacePreferences => ({
  providerChoice: 'auto',
  model: 'gpt-5',
  temperature: 0.7,
  topP: 1,
  topK: 40,
  maxTokens: 1200,
  seed: 42,
  streaming: true,
  jsonMode: false,
  reasoning: false,
  tools: false,
  vision: false,
  image: false,
  audio: false,
  splitView: true,
  fullscreen: false,
  outputFormat: 'markdown',
})

const defaultDraft = (): GenerateWorkspaceDraft => ({
  selectedPromptId: null,
  selectedTemplateId: '',
  promptName: '',
  promptContent: '',
  variables: {},
})

export class GenerateWorkspaceService {
  private static memoryPreferences = defaultPreferences()
  private static memoryDraft = defaultDraft()

  static getPreferences(): GenerateWorkspacePreferences {
    if (typeof window === 'undefined') {
      return this.memoryPreferences
    }

    try {
      const raw = window.localStorage.getItem(PREFS_KEY)
      if (!raw) {
        const next = defaultPreferences()
        window.localStorage.setItem(PREFS_KEY, JSON.stringify(next))
        return next
      }

      const parsed = JSON.parse(raw) as Partial<GenerateWorkspacePreferences>
      return { ...defaultPreferences(), ...parsed }
    } catch {
      return defaultPreferences()
    }
  }

  static setPreferences(next: GenerateWorkspacePreferences): void {
    this.memoryPreferences = next
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(next))
    }
  }

  static getDraft(): GenerateWorkspaceDraft {
    if (typeof window === 'undefined') {
      return this.memoryDraft
    }

    try {
      const raw = window.localStorage.getItem(DRAFT_KEY)
      if (!raw) {
        return defaultDraft()
      }

      const parsed = JSON.parse(raw) as Partial<GenerateWorkspaceDraft>
      return {
        ...defaultDraft(),
        ...parsed,
        variables: { ...defaultDraft().variables, ...parsed.variables },
      }
    } catch {
      return defaultDraft()
    }
  }

  static saveDraft(draft: GenerateWorkspaceDraft): void {
    this.memoryDraft = draft
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }
  }

  static clearDraft(): void {
    this.memoryDraft = defaultDraft()
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(DRAFT_KEY)
    }
  }
}