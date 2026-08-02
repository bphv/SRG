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

type AskSrgRuntimeContextValue = {
  session: AskSrgRuntimeSession
  updateSession: (patch: Partial<AskSrgRuntimeSession>) => void
  setVoiceEnabled: (enabled: boolean) => void
  toggleFavoriteCommand: (command: string) => void
  pushRecentCommand: (command: string) => void
  pushRecentDocument: (document: string) => void
}

const ASK_SRG_RUNTIME_KEY = 'ask-srg-runtime-session'

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

function toFilters(session: AskSrgRuntimeSession) {
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
  }
}

function dedupeAndLimit(values: string[], max = 12) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean))).slice(0, max)
}

export function AskSrgRuntimeProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AskSrgRuntimeSession>(() => readStoredSession())

  useEffect(() => {
    WorkspacePreferencesService.setFilters(ASK_SRG_RUNTIME_KEY, toFilters(session))
  }, [session])

  const value = useMemo<AskSrgRuntimeContextValue>(
    () => ({
      session,
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
    }),
    [session],
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