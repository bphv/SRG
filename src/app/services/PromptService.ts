import { ProjectService } from '#/app/services/ProjectService'

export type PromptStatus = 'active' | 'archived' | 'draft'
export type PromptCategory = 'summary' | 'onboarding' | 'research' | 'marketing' | 'utility'
export type PromptProvider = 'OpenAI' | 'Anthropic' | 'Azure OpenAI' | 'Cohere'
export type PromptLanguage = 'Français' | 'English' | 'Español' | 'Deutsch'

export type PromptVariable = {
  name: string
  description: string
  example: string
  required: boolean
  value?: string
}

export type PromptVersion = {
  id: string
  version: number
  date: string
  author: string
  comment: string
  content: string
  variables: PromptVariable[]
}

export type Prompt = {
  id: string
  projectId: string
  name: string
  description: string
  category: PromptCategory
  tags: string[]
  content: string
  provider: PromptProvider
  model: string
  language: PromptLanguage
  status: PromptStatus
  favorite: boolean
  createdAt: string
  updatedAt: string
  runCount: number
  averageLatencyMs: number
  lastRunAt: string
  versions: PromptVersion[]
}

export type PromptFilters = {
  query: string
  projectId: string | 'all'
  status: PromptStatus | 'all'
  provider: PromptProvider | 'all'
  category: PromptCategory | 'all'
  favoritesOnly: boolean
  viewMode: 'grid' | 'list'
  sortKey: 'updatedAt' | 'createdAt' | 'runCount' | 'name'
  sortOrder: 'asc' | 'desc'
}

export type PromptCreatePayload = {
  projectId: string
  name: string
  description: string
  category: PromptCategory
  tags: string[]
  content: string
  provider: PromptProvider
  model: string
  language: PromptLanguage
  variables: PromptVariable[]
}

export type PromptUpdatePayload = Partial<Omit<Prompt, 'id' | 'createdAt' | 'projectId'>> & {
  variables?: PromptVariable[]
  versionComment?: string
}

export type PromptPublicationRecord = {
  promptId: string
  publishedAt: string
  visibility: 'internal' | 'public'
}

const STORAGE_KEY = 'srg.workspace.prompts.v1'
const PUBLICATIONS_KEY = 'srg.workspace.prompt-publications.v1'

const initialPrompts: Prompt[] = [
  {
    id: 'prompt-1',
    projectId: 'project-1',
    name: 'Résumé de release notes',
    description: 'Génère un résumé clair et orienté produit à partir des notes de version.',
    category: 'marketing',
    tags: ['release', 'résumé', 'marketing'],
    content: 'Résumé les notes de version suivantes pour un public produit :\n\n{{promptContent}}\n\nLangue : {{language}}',
    provider: 'OpenAI',
    model: 'gpt-4.1',
    language: 'Français',
    status: 'active',
    favorite: true,
    createdAt: '2026-07-01',
    updatedAt: '2026-07-20',
    runCount: 34,
    averageLatencyMs: 820,
    lastRunAt: '2026-07-25',
    versions: [
      {
        id: 'prompt-1-v1',
        version: 1,
        date: '2026-07-01',
        author: 'Alex',
        comment: 'Initial prompt.',
        content: 'Résumé les notes de version suivantes pour un public produit :\n\n{{promptContent}}\n\nLangue : {{language}}',
        variables: [
          { name: 'promptContent', description: 'Contenu à résumer.', example: 'Release v1.2.3 ...', required: true },
          { name: 'language', description: 'Langue souhaitée pour la sortie.', example: 'Français', required: true },
        ],
      },
    ],
  },
  {
    id: 'prompt-2',
    projectId: 'project-2',
    name: 'Onboarding assistant',
    description: 'Crée un guide d’accueil personnalisé pour un nouvel employé.',
    category: 'onboarding',
    tags: ['onboarding', 'RH', 'guide'],
    content: 'Tu es un assistant RH. Génère un onboarding pour {{user}} sur le projet {{projectName}} en utilisant le ton {{tone}}.',
    provider: 'Anthropic',
    model: 'claude-3',
    language: 'English',
    status: 'active',
    favorite: false,
    createdAt: '2026-06-14',
    updatedAt: '2026-07-18',
    runCount: 18,
    averageLatencyMs: 720,
    lastRunAt: '2026-07-23',
    versions: [
      {
        id: 'prompt-2-v1',
        version: 1,
        date: '2026-06-14',
        author: 'Marie',
        comment: 'Version initiale.',
        content: 'Tu es un assistant RH. Génère un onboarding pour {{user}} sur le projet {{projectName}} en utilisant le ton {{tone}}.',
        variables: [
          { name: 'user', description: 'Nom de l’utilisateur final.', example: 'Sophie', required: true },
          { name: 'projectName', description: 'Nom du projet associé.', example: 'SRG Launch', required: true },
          { name: 'tone', description: 'Ton du message.', example: 'professionnel', required: true },
        ],
      },
    ],
  },
  {
    id: 'prompt-3',
    projectId: 'project-3',
    name: 'Analyse de données',
    description: 'Produit un rapport d’analyse synthétique à partir de données brutes.',
    category: 'research',
    tags: ['analyse', 'data', 'rapport'],
    content: 'Lis ces résultats et génère une synthèse exécutive avec recommandations :\n\n{{promptContent}}\n\nFormat : bullet points.',
    provider: 'Azure OpenAI',
    model: 'o4-mini',
    language: 'Français',
    status: 'draft',
    favorite: false,
    createdAt: '2026-07-07',
    updatedAt: '2026-07-22',
    runCount: 5,
    averageLatencyMs: 530,
    lastRunAt: '2026-07-22',
    versions: [
      {
        id: 'prompt-3-v1',
        version: 1,
        date: '2026-07-07',
        author: 'Pierre',
        comment: 'Draft initial.',
        content: 'Lis ces résultats et génère une synthèse exécutive avec recommandations :\n\n{{promptContent}}\n\nFormat : bullet points.',
        variables: [
          { name: 'promptContent', description: 'Données brutes ou résultats.', example: 'Taux de conversion...', required: true },
        ],
      },
    ],
  },
]

function createVersion(prompt: Prompt, comment = 'Sauvegarde automatique'): PromptVersion {
  const latestVersion = prompt.versions[prompt.versions.length - 1]

  return {
    id: `${prompt.id}-v${prompt.versions.length + 1}`,
    version: prompt.versions.length + 1,
    date: new Date().toISOString().split('T')[0],
    author: 'System',
    comment,
    content: prompt.content,
    variables: latestVersion.variables,
  }
}

export class PromptService {
  private static prompts: Prompt[] = [...initialPrompts]
  private static publications: PromptPublicationRecord[] = []

  static getPrompts(): Prompt[] {
    this.prompts = this.readPrompts()
    return [...this.prompts].sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
  }

  static getPrompt(id: string): Prompt | undefined {
    return this.prompts.find((prompt) => prompt.id === id)
  }

  static getHistory(id: string) {
    return this.getPrompt(id)?.versions ?? []
  }

  static createPrompt(payload: PromptCreatePayload): Prompt {
    const nowDate = new Date().toISOString().split('T')[0]
    const prompt: Prompt = {
      id: `prompt-${Math.random().toString(36).slice(2, 10)}`,
      projectId: payload.projectId,
      name: payload.name,
      description: payload.description,
      category: payload.category,
      tags: payload.tags,
      content: payload.content,
      provider: payload.provider,
      model: payload.model,
      language: payload.language,
      status: 'active',
      favorite: false,
      createdAt: nowDate,
      updatedAt: nowDate,
      runCount: 0,
      averageLatencyMs: 0,
      lastRunAt: nowDate,
      versions: [
        {
          id: `${payload.name.toLowerCase().replace(/\s+/g, '-')}-v1`,
          version: 1,
          date: nowDate,
          author: 'Creator',
          comment: 'Création du prompt.',
          content: payload.content,
          variables: payload.variables,
        },
      ],
    }

    this.persistPrompts([prompt, ...this.getPrompts()])
    return prompt
  }

  static updatePrompt(id: string, updates: PromptUpdatePayload): Prompt | undefined {
    const next = this.prompts.map((prompt) => {
      if (prompt.id !== id) return prompt
      const updatedPrompt = {
        ...prompt,
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0],
      }

      const shouldVersion = updates.content !== undefined || updates.description !== undefined || updates.tags !== undefined || updates.variables !== undefined
      if (shouldVersion) {
        const nextVersion = createVersion(updatedPrompt, updates.versionComment ?? 'Mise à jour')
        if (updates.variables) {
          nextVersion.variables = updates.variables
        }
        updatedPrompt.versions = [...updatedPrompt.versions, nextVersion]
      }

      return updatedPrompt
    })

    this.persistPrompts(next)
    return this.getPrompt(id)
  }

  static deletePrompt(id: string): void {
    this.persistPrompts(this.getPrompts().filter((prompt) => prompt.id !== id))
  }

  static duplicatePrompt(id: string): Prompt | undefined {
    const prompt = this.getPrompt(id)
    if (!prompt) return undefined

    const nowDateDup = new Date().toISOString().split('T')[0]
    const duplicated: Prompt = {
      ...prompt,
      id: `prompt-${Math.random().toString(36).slice(2, 10)}`,
      name: `${prompt.name} (Copie)`,
      createdAt: nowDateDup,
      updatedAt: nowDateDup,
      favorite: false,
      versions: prompt.versions.map((version, index) => ({
        ...version,
        id: `${prompt.id}-copy-v${index + 1}`,
      })),
    }

    this.persistPrompts([duplicated, ...this.getPrompts()])
    return duplicated
  }

  static archivePrompt(id: string): Prompt | undefined {
    return this.updatePrompt(id, { status: 'archived' })
  }

  static favoritePrompt(id: string): Prompt | undefined {
    const prompt = this.getPrompt(id)
    if (!prompt) return undefined

    return this.updatePrompt(id, { favorite: !prompt.favorite })
  }

  static publishPrompt(id: string, visibility: 'internal' | 'public' = 'internal'): Prompt | undefined {
    const prompt = this.getPrompt(id)
    if (!prompt) {
      return undefined
    }

    const nextPrompt = this.updatePrompt(id, {
      status: 'active',
      versionComment: visibility === 'public' ? 'Publication publique' : 'Publication interne',
    })

    if (!nextPrompt) {
      return undefined
    }

    this.persistPublications([
      {
        promptId: id,
        publishedAt: new Date().toISOString(),
        visibility,
      },
      ...this.publications.filter((item) => item.promptId !== id),
    ])

    return nextPrompt
  }

  static getPublication(promptId: string): PromptPublicationRecord | undefined {
    this.publications = this.readPublications()
    return this.publications.find((item) => item.promptId === promptId)
  }

  static getProjectName(projectId: string) {
    return ProjectService.getProject(projectId)?.name ?? 'Unknown project'
  }

  private static readPrompts(): Prompt[] {
    if (typeof window === 'undefined') {
      return this.prompts
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPrompts))
        return [...initialPrompts]
      }

      const parsed = JSON.parse(raw) as Prompt[]
      return Array.isArray(parsed) ? parsed : [...initialPrompts]
    } catch {
      return [...initialPrompts]
    }
  }

  private static readPublications(): PromptPublicationRecord[] {
    if (typeof window === 'undefined') {
      return this.publications
    }

    try {
      const raw = window.localStorage.getItem(PUBLICATIONS_KEY)
      if (!raw) {
        return []
      }

      const parsed = JSON.parse(raw) as PromptPublicationRecord[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private static persistPrompts(prompts: Prompt[]): void {
    this.prompts = prompts
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts))
    }
  }

  private static persistPublications(publications: PromptPublicationRecord[]): void {
    this.publications = publications
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PUBLICATIONS_KEY, JSON.stringify(publications))
    }
  }
}
