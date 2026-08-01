export type WorkspaceHistoryStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

export type WorkspaceHistoryRecord = {
  id: string
  promptName: string
  promptText: string
  output: string
  provider: string
  model: string
  status: WorkspaceHistoryStatus
  durationMs: number
  tokensInput: number
  tokensOutput: number
  costEstimate: number
  createdAt: string
  requestKind: 'generation' | 'prompt-test' | 'collaboration' | 'workflow'
  projectId?: string
  projectName?: string
  templateId?: string
  variables?: Record<string, string>
  estimatedCredits?: number
  creditsUsed?: number
  latencyMs?: number
  providerSdkVersion?: string
  actorName?: string
  entityType?: 'project' | 'prompt' | 'template' | 'workflow'
  entityId?: string
  eventType?:
    | 'creation'
    | 'modification'
    | 'validation'
    | 'publication'
    | 'archiving'
    | 'comment'
    | 'version'
    | 'collaborator'
}

const STORAGE_KEY = 'srg.workspace.history.v1'
const PENDING_RERUN_KEY = 'srg.workspace.history.rerun.v1'

export type WorkspaceRerunDraft = {
  promptName: string
  promptText: string
  provider: string
  model: string
  projectId?: string
  projectName?: string
}

export class HistoryWorkspaceService {
  private static memoryRecords: WorkspaceHistoryRecord[] = []

  static getRecords(): WorkspaceHistoryRecord[] {
    const payload = this.readStorage()
    return [...payload].sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
  }

  static addRecord(record: WorkspaceHistoryRecord): WorkspaceHistoryRecord {
    const next = [record, ...this.getRecords().filter((item) => item.id !== record.id)].slice(0, 200)
    this.writeStorage(next)
    return record
  }

  static deleteRecord(id: string): void {
    this.writeStorage(this.getRecords().filter((item) => item.id !== id))
  }

  static clear(): void {
    this.writeStorage([])
  }

  static importRecords(records: WorkspaceHistoryRecord[]): void {
    this.writeStorage(records.slice(0, 200))
  }

  static exportRecords(): string {
    return JSON.stringify(this.getRecords(), null, 2)
  }

  static setPendingRerun(draft: WorkspaceRerunDraft): void {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(PENDING_RERUN_KEY, JSON.stringify(draft))
  }

  static consumePendingRerun(): WorkspaceRerunDraft | undefined {
    if (typeof window === 'undefined') {
      return undefined
    }

    const raw = window.localStorage.getItem(PENDING_RERUN_KEY)
    if (!raw) {
      return undefined
    }

    window.localStorage.removeItem(PENDING_RERUN_KEY)

    try {
      const parsed = JSON.parse(raw) as WorkspaceRerunDraft
      if (typeof parsed.promptText !== 'string') {
        return undefined
      }
      return parsed
    } catch {
      return undefined
    }
  }

  private static readStorage(): WorkspaceHistoryRecord[] {
    if (typeof window === 'undefined') {
      return this.memoryRecords
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        return []
      }

      const parsed = JSON.parse(raw) as WorkspaceHistoryRecord[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private static writeStorage(records: WorkspaceHistoryRecord[]): void {
    if (typeof window === 'undefined') {
      this.memoryRecords = records
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }
}