import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { PromptMarketplaceService } from '#/app/services/PromptMarketplaceService'

export type PublishingStage = 'draft' | 'review' | 'approved' | 'rejected' | 'published' | 'archived' | 'retired'
export type SemverBump = 'major' | 'minor' | 'patch'

export type PublishingRecord = {
  promptId: string
  stage: PublishingStage
  version: string
  notes: string
  updatedAt: string
}

const STORAGE_KEY = 'srg.prompt.publishing.v1'

function nowIso() {
  return new Date().toISOString()
}

function bumpVersion(version: string, bump: SemverBump): string {
  const [major, minor, patch] = version.split('.').map((value) => Number(value) || 0)
  if (bump === 'major') return `${major + 1}.0.0`
  if (bump === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

export class PromptPublishingService {
  private static memory: PublishingRecord[] = []

  static list(): PublishingRecord[] {
    return this.readStorage().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }

  static get(promptId: string): PublishingRecord {
    return this.list().find((item) => item.promptId === promptId) ?? {
      promptId,
      stage: 'draft',
      version: '1.0.0',
      notes: 'Initial draft',
      updatedAt: nowIso(),
    }
  }

  static transition(input: {
    promptId: string
    next: PublishingStage
    actorName: string
    notes: string
    bump?: SemverBump
  }): PublishingRecord {
    const current = this.get(input.promptId)
    const nextVersion = input.bump ? bumpVersion(current.version, input.bump) : current.version
    const record: PublishingRecord = {
      promptId: input.promptId,
      stage: input.next,
      version: nextVersion,
      notes: input.notes,
      updatedAt: nowIso(),
    }

    this.persist(record)

    const marketplace = PromptMarketplaceService.list().find((item) => item.promptId === input.promptId)
    if (marketplace) {
      PromptMarketplaceService.upsert({
        ...marketplace,
        status: input.next,
        version: nextVersion,
        updatedAt: nowIso(),
        publishedAt: input.next === 'published' ? nowIso() : marketplace.publishedAt,
      })
    }

    const notif =
      input.next === 'approved'
        ? { title: 'publication acceptee', level: 'success' as const }
        : input.next === 'rejected'
          ? { title: 'publication refusee', level: 'warning' as const }
          : { title: 'publication mise a jour', level: 'info' as const }

    notificationService.publish({
      title: notif.title,
      message: `${input.actorName} moved prompt ${input.promptId} to ${input.next} (${nextVersion}).`,
      level: notif.level,
      priority: 'high',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    HistoryWorkspaceService.addRecord({
      id: `history-publish-${Date.now()}`,
      promptName: 'Publishing workflow',
      promptText: `${input.promptId} -> ${input.next}`,
      output: input.notes,
      provider: 'workspace',
      model: 'publishing',
      status: 'completed',
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      eventType: input.next === 'published' ? 'publication' : input.next === 'archived' ? 'archiving' : 'validation',
      entityType: 'prompt',
      entityId: input.promptId,
      actorName: input.actorName,
    })

    return record
  }

  static compareVersions(left: string, right: string): { left: PublishingRecord; right: PublishingRecord; diff: string } {
    const leftRecord = this.get(left)
    const rightRecord = this.get(right)
    return {
      left: leftRecord,
      right: rightRecord,
      diff: `${leftRecord.promptId}@${leftRecord.version} (${leftRecord.stage}) vs ${rightRecord.promptId}@${rightRecord.version} (${rightRecord.stage})`,
    }
  }

  static rollback(promptId: string, toVersion: string, actorName: string): PublishingRecord {
    const current = this.get(promptId)
    const next: PublishingRecord = {
      ...current,
      version: toVersion,
      notes: `Rollback to ${toVersion}`,
      updatedAt: nowIso(),
    }
    this.persist(next)

    notificationService.publish({
      title: 'version restauree',
      message: `${actorName} rolled back prompt ${promptId} to ${toVersion}.`,
      level: 'info',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    return next
  }

  private static readStorage(): PublishingRecord[] {
    if (typeof window === 'undefined') return this.memory
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as PublishingRecord[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private static persist(record: PublishingRecord): void {
    const next = [record, ...this.list().filter((item) => item.promptId !== record.promptId)]
    this.memory = next
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
  }
}
