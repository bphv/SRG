import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export type AskSrgRuntimeSession = {
  conversationId: string
  tenantId: string
  userId: string
  workspace: string
  language: string
  voiceEnabled: boolean
  favoriteCommands: string[]
  recentCommands: string[]
  recentDocuments: string[]
}

export type AskSrgSkillCategory =
  | 'Documents'
  | 'Finance'
  | 'RH'
  | 'Maintenance'
  | 'Achats'
  | 'CRM'
  | 'Qualité'
  | 'Projets'
  | 'Workflow'
  | 'Knowledge'
  | 'Analytics'
  | 'Administration'

export type AskSrgSkillStatus = 'Prepared' | 'Placeholder'

export type AskSrgSkillItem = {
  id: string
  name: string
  category: AskSrgSkillCategory
  description: string
  icon: string
  status: AskSrgSkillStatus
  supportedWorkspaces: string[]
  suggestedPrompts: string[]
}

type AskSrgRuntimeContextValue = {
  session: AskSrgRuntimeSession
  skillsRegistry: AskSrgSkillItem[]
  skillsCategories: AskSrgSkillCategory[]
  suggestedPrompts: string[]
  recentSkills: string[]
  favoriteSkills: string[]
  updateSession: (patch: Partial<AskSrgRuntimeSession>) => void
  setVoiceEnabled: (enabled: boolean) => void
  toggleFavoriteCommand: (command: string) => void
  pushRecentCommand: (command: string) => void
  pushRecentDocument: (document: string) => void
  useSkill: (skillId: string) => void
  toggleFavoriteSkill: (skillId: string) => void
}

const ASK_SRG_RUNTIME_KEY = 'ask-srg-runtime-session'

const SKILLS_CATEGORIES: AskSrgSkillCategory[] = [
  'Documents',
  'Finance',
  'RH',
  'Maintenance',
  'Achats',
  'CRM',
  'Qualité',
  'Projets',
  'Workflow',
  'Knowledge',
  'Analytics',
  'Administration',
]

const SUGGESTED_PROMPTS = [
  'Résumer un document',
  'Comparer deux contrats',
  'Créer un rapport',
  'Analyser les dépenses',
  'Créer un workflow',
  'Lister les interventions',
  'Exporter les résultats',
]

const SKILLS_REGISTRY: AskSrgSkillItem[] = [
  {
    id: 'skill-doc-summary',
    name: 'Document Summary',
    category: 'Documents',
    description: 'Placeholder summary of enterprise documents.',
    icon: 'DOC',
    status: 'Prepared',
    supportedWorkspaces: ['/knowledge-intelligence', '/knowledge-center', '/history'],
    suggestedPrompts: ['Résumer un document', 'Comparer deux contrats'],
  },
  {
    id: 'skill-finance-spend',
    name: 'Spend Analysis',
    category: 'Finance',
    description: 'Placeholder expense analysis by period.',
    icon: 'FIN',
    status: 'Prepared',
    supportedWorkspaces: ['/finance', '/dashboard', '/enterprise-insights'],
    suggestedPrompts: ['Analyser les dépenses', 'Créer un rapport'],
  },
  {
    id: 'skill-rh-snapshot',
    name: 'RH Snapshot',
    category: 'RH',
    description: 'Placeholder RH workforce snapshot.',
    icon: 'RH',
    status: 'Placeholder',
    supportedWorkspaces: ['/human-resources', '/dashboard'],
    suggestedPrompts: ['Créer un rapport'],
  },
  {
    id: 'skill-maintenance-open',
    name: 'Open Interventions',
    category: 'Maintenance',
    description: 'Placeholder list of open interventions.',
    icon: 'MNT',
    status: 'Prepared',
    supportedWorkspaces: ['/maintenance', '/dashboard'],
    suggestedPrompts: ['Lister les interventions', 'Exporter les résultats'],
  },
  {
    id: 'skill-achats-comparison',
    name: 'Supplier Comparison',
    category: 'Achats',
    description: 'Placeholder comparison for procurement records.',
    icon: 'BUY',
    status: 'Prepared',
    supportedWorkspaces: ['/procurement-inventory', '/dashboard'],
    suggestedPrompts: ['Comparer deux contrats', 'Créer un rapport'],
  },
  {
    id: 'skill-crm-thread',
    name: 'CRM Conversation Insights',
    category: 'CRM',
    description: 'Placeholder insights from CRM conversations.',
    icon: 'CRM',
    status: 'Placeholder',
    supportedWorkspaces: ['/chat', '/history'],
    suggestedPrompts: ['Créer un rapport'],
  },
  {
    id: 'skill-quality-check',
    name: 'Quality Checklist',
    category: 'Qualité',
    description: 'Placeholder quality control summary.',
    icon: 'QLT',
    status: 'Placeholder',
    supportedWorkspaces: ['/workflow-automation', '/history'],
    suggestedPrompts: ['Créer un workflow'],
  },
  {
    id: 'skill-project-status',
    name: 'Project Status Digest',
    category: 'Projets',
    description: 'Placeholder project status digest.',
    icon: 'PRJ',
    status: 'Prepared',
    supportedWorkspaces: ['/project-execution', '/dashboard', '/strategic-advisor'],
    suggestedPrompts: ['Créer un rapport', 'Exporter les résultats'],
  },
  {
    id: 'skill-workflow-draft',
    name: 'Workflow Draft',
    category: 'Workflow',
    description: 'Placeholder workflow draft creation.',
    icon: 'WFL',
    status: 'Prepared',
    supportedWorkspaces: ['/workflow-automation', '/strategic-advisor'],
    suggestedPrompts: ['Créer un workflow', 'Exporter les résultats'],
  },
  {
    id: 'skill-knowledge-search',
    name: 'Knowledge Search',
    category: 'Knowledge',
    description: 'Placeholder semantic-like lookup from local context.',
    icon: 'KNW',
    status: 'Prepared',
    supportedWorkspaces: ['/knowledge-intelligence', '/knowledge-center', '/history'],
    suggestedPrompts: ['Résumer un document', 'Comparer deux contrats'],
  },
  {
    id: 'skill-analytics-snapshot',
    name: 'Analytics Snapshot',
    category: 'Analytics',
    description: 'Placeholder analytics snapshot generation.',
    icon: 'ANL',
    status: 'Prepared',
    supportedWorkspaces: ['/enterprise-insights', '/dashboard'],
    suggestedPrompts: ['Créer un rapport', 'Analyser les dépenses'],
  },
  {
    id: 'skill-admin-setup',
    name: 'Admin Setup Guide',
    category: 'Administration',
    description: 'Placeholder admin checks and setup helper.',
    icon: 'ADM',
    status: 'Placeholder',
    supportedWorkspaces: ['/administration', '/settings', '/profile'],
    suggestedPrompts: ['Créer un rapport', 'Exporter les résultats'],
  },
]

const DEFAULT_SESSION: AskSrgRuntimeSession = {
  conversationId: 'conv-ask-srg-placeholder',
  tenantId: 'tenant-srg-industries-holding',
  userId: 'enterprise-user-placeholder',
  workspace: 'Ask SRG Home',
  language: 'Français',
  voiceEnabled: false,
  favoriteCommands: ['/search', '/rapport'],
  recentCommands: ['Posez une question à Ask SRG'],
  recentDocuments: ['Contrat Razel 2022', 'Rapport maintenance T4'],
}

const AskSrgRuntimeContext = createContext<AskSrgRuntimeContextValue | undefined>(undefined)

function toStringValue(value: string | boolean | number | undefined, fallback: string) {
  return typeof value === 'string' ? value : fallback
}

function toBooleanValue(value: string | boolean | number | undefined, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function toListValue(value: string | boolean | number | undefined, fallback: string[]) {
  if (typeof value !== 'string') {
    return fallback
  }

  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) {
      return fallback
    }
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return fallback
  }
}

function readStoredSession(): AskSrgRuntimeSession {
  const record = WorkspacePreferencesService.getPreferences().filters[ASK_SRG_RUNTIME_KEY] ?? {}

  return {
    conversationId: toStringValue(record.conversationId, DEFAULT_SESSION.conversationId),
    tenantId: toStringValue(record.tenantId, DEFAULT_SESSION.tenantId),
    userId: toStringValue(record.userId, DEFAULT_SESSION.userId),
    workspace: toStringValue(record.workspace, DEFAULT_SESSION.workspace),
    language: toStringValue(record.language, DEFAULT_SESSION.language),
    voiceEnabled: toBooleanValue(record.voiceEnabled, DEFAULT_SESSION.voiceEnabled),
    favoriteCommands: toListValue(record.favoriteCommands, DEFAULT_SESSION.favoriteCommands),
    recentCommands: toListValue(record.recentCommands, DEFAULT_SESSION.recentCommands),
    recentDocuments: toListValue(record.recentDocuments, DEFAULT_SESSION.recentDocuments),
  }
}

function toFilters(session: AskSrgRuntimeSession, recentSkills: string[], favoriteSkills: string[]) {
  return {
    conversationId: session.conversationId,
    tenantId: session.tenantId,
    userId: session.userId,
    workspace: session.workspace,
    language: session.language,
    voiceEnabled: session.voiceEnabled,
    favoriteCommands: JSON.stringify(session.favoriteCommands.slice(0, 12)),
    recentCommands: JSON.stringify(session.recentCommands.slice(0, 12)),
    recentDocuments: JSON.stringify(session.recentDocuments.slice(0, 12)),
    recentSkills: JSON.stringify(recentSkills.slice(0, 20)),
    favoriteSkills: JSON.stringify(favoriteSkills.slice(0, 20)),
  }
}

function dedupeAndLimit(values: string[], max = 12) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean))).slice(0, max)
}

function readStoredSkillIds(key: 'favoriteSkills' | 'recentSkills') {
  const record = WorkspacePreferencesService.getPreferences().filters[ASK_SRG_RUNTIME_KEY] ?? {}
  return toListValue(record[key], [])
}

export function AskSrgRuntimeProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AskSrgRuntimeSession>(() => readStoredSession())
  const [recentSkills, setRecentSkills] = useState<string[]>(() => readStoredSkillIds('recentSkills'))
  const [favoriteSkills, setFavoriteSkills] = useState<string[]>(() => readStoredSkillIds('favoriteSkills'))

  useEffect(() => {
    WorkspacePreferencesService.setFilters(ASK_SRG_RUNTIME_KEY, toFilters(session, recentSkills, favoriteSkills))
  }, [favoriteSkills, recentSkills, session])

  const value = useMemo<AskSrgRuntimeContextValue>(
    () => ({
      session,
      skillsRegistry: SKILLS_REGISTRY,
      skillsCategories: SKILLS_CATEGORIES,
      suggestedPrompts: SUGGESTED_PROMPTS,
      recentSkills,
      favoriteSkills,
      updateSession: (patch) => {
        setSession((current) => ({
          ...current,
          ...patch,
          favoriteCommands: patch.favoriteCommands ? dedupeAndLimit(patch.favoriteCommands) : current.favoriteCommands,
          recentCommands: patch.recentCommands ? dedupeAndLimit(patch.recentCommands) : current.recentCommands,
          recentDocuments: patch.recentDocuments ? dedupeAndLimit(patch.recentDocuments) : current.recentDocuments,
        }))
      },
      setVoiceEnabled: (enabled) => {
        setSession((current) => ({ ...current, voiceEnabled: enabled }))
      },
      toggleFavoriteCommand: (command) => {
        const normalized = command.trim()
        if (!normalized) return

        setSession((current) => {
          const exists = current.favoriteCommands.some((item) => item.toLowerCase() === normalized.toLowerCase())
          return {
            ...current,
            favoriteCommands: exists
              ? current.favoriteCommands.filter((item) => item.toLowerCase() !== normalized.toLowerCase())
              : dedupeAndLimit([normalized, ...current.favoriteCommands]),
          }
        })
      },
      pushRecentCommand: (command) => {
        const normalized = command.trim()
        if (!normalized) return

        setSession((current) => ({
          ...current,
          recentCommands: dedupeAndLimit([normalized, ...current.recentCommands]),
        }))
      },
      pushRecentDocument: (document) => {
        const normalized = document.trim()
        if (!normalized) return

        setSession((current) => ({
          ...current,
          recentDocuments: dedupeAndLimit([normalized, ...current.recentDocuments]),
        }))
      },
      useSkill: (skillId) => {
        const normalized = skillId.trim()
        if (!normalized) return

        setRecentSkills((current) => dedupeAndLimit([normalized, ...current], 20))
      },
      toggleFavoriteSkill: (skillId) => {
        const normalized = skillId.trim()
        if (!normalized) return

        setFavoriteSkills((current) => {
          const exists = current.some((item) => item.toLowerCase() === normalized.toLowerCase())
          if (exists) {
            return current.filter((item) => item.toLowerCase() !== normalized.toLowerCase())
          }
          return dedupeAndLimit([normalized, ...current], 20)
        })
      },
    }),
    [favoriteSkills, recentSkills, session],
  )

  return <AskSrgRuntimeContext.Provider value={value}>{children}</AskSrgRuntimeContext.Provider>
}

export function useAskSrgRuntimeContext() {
  const context = useContext(AskSrgRuntimeContext)
  if (!context) {
    throw new Error('useAskSrgRuntimeContext must be used inside AskSrgRuntimeProvider')
  }
  return context
}
