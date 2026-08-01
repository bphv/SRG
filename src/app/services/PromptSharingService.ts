import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export type SharingScope = 'private_copy' | 'public_copy' | 'organization' | 'team'
export type SharingPermission = 'read_only' | 'read_write'

export type PromptShareLink = {
  id: string
  promptId: string
  url: string
  scope: SharingScope
  permission: SharingPermission
  expiresAt?: string
  enabled: boolean
  createdAt: string
  createdBy: string
}

const STORAGE_KEY = 'srg.prompt.sharing.v1'

function nowIso() {
  return new Date().toISOString()
}

export class PromptSharingService {
  private static memory: PromptShareLink[] = []

  static list(promptId?: string): PromptShareLink[] {
    const data = this.readStorage().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    return promptId ? data.filter((item) => item.promptId === promptId) : data
  }

  static createShare(input: {
    promptId: string
    promptName: string
    scope: SharingScope
    permission: SharingPermission
    expiresAt?: string
    createdBy: string
  }): PromptShareLink {
    const url = WorkspaceExchangeService.createShareLink('prompt', input.promptId, input.promptName)
    const share: PromptShareLink = {
      id: `share-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      promptId: input.promptId,
      url,
      scope: input.scope,
      permission: input.permission,
      expiresAt: input.expiresAt,
      enabled: true,
      createdAt: nowIso(),
      createdBy: input.createdBy,
    }

    this.writeStorage([share, ...this.list()])

    notificationService.publish({
      title: 'partage cree',
      message: `${input.createdBy} created share link for ${input.promptId}.`,
      level: 'info',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    HistoryWorkspaceService.addRecord({
      id: `history-share-${Date.now()}`,
      promptName: 'Prompt share',
      promptText: `${input.promptId} ${input.scope} ${input.permission}`,
      output: url,
      provider: 'workspace',
      model: 'sharing',
      status: 'completed',
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      eventType: 'modification',
      entityType: 'prompt',
      entityId: input.promptId,
      actorName: input.createdBy,
    })

    return share
  }

  static disableShare(id: string): void {
    this.writeStorage(this.list().map((item) => (item.id === id ? { ...item, enabled: false } : item)))
  }

  static duplicateShare(id: string): PromptShareLink | undefined {
    const item = this.list().find((entry) => entry.id === id)
    if (!item) return undefined
    return this.createShare({
      promptId: item.promptId,
      promptName: item.promptId,
      scope: item.scope,
      permission: item.permission,
      expiresAt: item.expiresAt,
      createdBy: item.createdBy,
    })
  }

  private static readStorage(): PromptShareLink[] {
    if (typeof window === 'undefined') return this.memory
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as PromptShareLink[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private static writeStorage(links: PromptShareLink[]): void {
    this.memory = links
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
    }
  }
}
