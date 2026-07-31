export type ProjectStatus = 'active' | 'archived' | 'draft'
export type ProjectType = 'content' | 'research' | 'product'
export type ProjectProvider = 'OpenAI' | 'Anthropic' | 'Azure OpenAI' | 'Cohere'

export type Project = {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  generationCount: number
  promptCount: number
  provider: ProjectProvider
  status: ProjectStatus
  favorite: boolean
  type: ProjectType
  language: string
}

export type ProjectFilters = {
  query: string
  status: ProjectStatus | 'all'
  provider: ProjectProvider | 'all'
  type: ProjectType | 'all'
  viewMode: 'grid' | 'list'
  sortKey: 'updatedAt' | 'createdAt' | 'generationCount' | 'name'
  sortOrder: 'asc' | 'desc'
}

export type ProjectCreatePayload = {
  name: string
  description: string
  provider: ProjectProvider
  language: string
  type: ProjectType
}

export type ProjectUpdatePayload = Partial<Omit<Project, 'id' | 'createdAt'>>

const initialProjects: Project[] = [
  {
    id: 'project-1',
    name: 'SRG Launch Campaign',
    description: 'Centralise les prompts et les livrables pour le lancement produit.',
    createdAt: '2026-02-14',
    updatedAt: '2026-07-18',
    generationCount: 48,
    promptCount: 124,
    provider: 'OpenAI',
    status: 'active',
    favorite: true,
    type: 'product',
    language: 'Français',
  },
  {
    id: 'project-2',
    name: 'Knowledge Center',
    description: 'Documentation interne et templates de prompts pour l’équipe.',
    createdAt: '2026-01-09',
    updatedAt: '2026-07-12',
    generationCount: 92,
    promptCount: 212,
    provider: 'Anthropic',
    status: 'active',
    favorite: false,
    type: 'research',
    language: 'English',
  },
  {
    id: 'project-3',
    name: 'Pipeline Quality Audit',
    description: 'Vérification de la qualité des données et des modèles de sortie.',
    createdAt: '2026-03-22',
    updatedAt: '2026-06-28',
    generationCount: 31,
    promptCount: 56,
    provider: 'Azure OpenAI',
    status: 'archived',
    favorite: false,
    type: 'research',
    language: 'Français',
  },
  {
    id: 'project-4',
    name: 'Persona Builder',
    description: 'Création de profils utilisateurs et scénarios d’usage.',
    createdAt: '2026-05-04',
    updatedAt: '2026-07-25',
    generationCount: 67,
    promptCount: 143,
    provider: 'OpenAI',
    status: 'active',
    favorite: true,
    type: 'content',
    language: 'English',
  },
  {
    id: 'project-5',
    name: 'Feature Exploration',
    description: 'Prototype de nouvelles idées produit et messages marketing.',
    createdAt: '2026-06-19',
    updatedAt: '2026-07-24',
    generationCount: 15,
    promptCount: 42,
    provider: 'Cohere',
    status: 'draft',
    favorite: false,
    type: 'product',
    language: 'French',
  },
]

export class ProjectService {
  private static projects: Project[] = [...initialProjects]

  static getProjects(): Project[] {
    return [...this.projects].sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
  }

  static getProject(id: string): Project | undefined {
    return this.projects.find((project) => project.id === id)
  }

  static createProject(payload: ProjectCreatePayload): Project {
    const now = new Date().toISOString().split('T')[0]
    const project: Project = {
      id: `project-${Math.random().toString(36).slice(2, 10)}`,
      name: payload.name,
      description: payload.description,
      createdAt: now,
      updatedAt: now,
      generationCount: 0,
      promptCount: 0,
      provider: payload.provider,
      status: 'active',
      favorite: false,
      type: payload.type,
      language: payload.language,
    }

    this.projects = [project, ...this.projects]
    return project
  }

  static updateProject(id: string, updates: ProjectUpdatePayload): Project | undefined {
    const next = this.projects.map((project) => {
      if (project.id !== id) return project
      return {
        ...project,
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0],
      }
    })

    this.projects = next
    return this.getProject(id)
  }

  static archiveProject(id: string): Project | undefined {
    return this.updateProject(id, { status: 'archived' })
  }

  static deleteProject(id: string): void {
    this.projects = this.projects.filter((project) => project.id !== id)
  }

  static duplicateProject(id: string): Project | undefined {
    const project = this.getProject(id)
    if (!project) return undefined

    const duplicated = {
      ...project,
      id: `project-${Math.random().toString(36).slice(2, 10)}`,
      name: `${project.name} (Copie)`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      favorite: false,
    }

    this.projects = [duplicated, ...this.projects]
    return duplicated
  }

  static favoriteProject(id: string): Project | undefined {
    const project = this.getProject(id)
    if (!project) return undefined

    return this.updateProject(id, { favorite: !project.favorite })
  }
}
