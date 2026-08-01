import { notificationService } from '#/app/services/NotificationService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'

export type WorkflowModule =
  | 'finance'
  | 'procurement'
  | 'maintenance'
  | 'hr'
  | 'crm'
  | 'knowledge'
  | 'projects'
  | 'documents'
  | 'management-control'
  | 'conversation-ai'
  | 'prompt-studio'
  | 'generate'
  | 'reviews'
  | 'administration'

export type WorkflowStepType =
  | 'start'
  | 'condition'
  | 'validation'
  | 'approval'
  | 'branch'
  | 'wait'
  | 'notification'
  | 'task'
  | 'end'

export type WorkflowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export type WorkflowTriggerMode = 'manual' | 'conditional' | 'scheduled' | 'recurring'

export type WorkflowStep = {
  id: string
  name: string
  type: WorkflowStepType
  config: string
  x: number
  y: number
}

export type WorkflowDefinition = {
  id: string
  module: WorkflowModule
  name: string
  description: string
  active: boolean
  triggerMode: WorkflowTriggerMode
  schedule: string
  conditionExpression: string
  version: number
  tags: string[]
  createdAt: string
  updatedAt: string
  steps: WorkflowStep[]
}

export type WorkflowExecutionLog = {
  id: string
  workflowId: string
  workflowName: string
  module: WorkflowModule
  status: WorkflowExecutionStatus
  startedAt: string
  endedAt?: string
  durationMs: number
  latencyMs: number
  automationMode: WorkflowTriggerMode
  success: boolean
  failures: number
  message: string
}

export type WorkflowTemplate = {
  id: string
  module: WorkflowModule
  name: string
  description: string
  tags: string[]
  steps: WorkflowStep[]
}

export type WorkflowWorkspaceStore = {
  workflows: WorkflowDefinition[]
  templates: WorkflowTemplate[]
  logs: WorkflowExecutionLog[]
}

const STORAGE_KEY = 'srg.workflow.workspace.v1'

function nowIso(): string {
  return new Date().toISOString()
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function defaultSteps(): WorkflowStep[] {
  return [
    { id: id('step'), name: 'Start', type: 'start', config: 'entry', x: 40, y: 40 },
    { id: id('step'), name: 'Validation', type: 'validation', config: 'requiredFields=true', x: 220, y: 40 },
    { id: id('step'), name: 'Approval', type: 'approval', config: 'level=manager', x: 400, y: 40 },
    { id: id('step'), name: 'Task', type: 'task', config: 'execute=workspaceAction', x: 580, y: 40 },
    { id: id('step'), name: 'End', type: 'end', config: 'close=true', x: 760, y: 40 },
  ]
}

function buildTemplate(module: WorkflowModule, name: string, description: string, tags: string[]): WorkflowTemplate {
  return {
    id: id('tpl'),
    module,
    name,
    description,
    tags,
    steps: defaultSteps(),
  }
}

function defaultTemplates(): WorkflowTemplate[] {
  return [
    buildTemplate('finance', 'Finance Approval Flow', 'Validation, approval and accounting close workflow.', ['approval', 'budget']),
    buildTemplate('procurement', 'Procurement Validation', 'Request to purchase order with conditional routing.', ['validation', 'purchase']),
    buildTemplate('maintenance', 'Maintenance Work Order', 'Incident triage, assignment, execution and close.', ['maintenance', 'incident']),
    buildTemplate('hr', 'HR Leave Approval', 'Leave request with reminders and escalation.', ['hr', 'approval']),
    buildTemplate('crm', 'CRM Follow-up', 'Lead qualification and reminders workflow.', ['crm', 'follow-up']),
    buildTemplate('knowledge', 'Knowledge Publishing', 'Review and publication of knowledge documents.', ['knowledge', 'publication']),
    buildTemplate('projects', 'Project Change Control', 'Change request validation and impact approval.', ['projects', 'change']),
    buildTemplate('documents', 'Document Lifecycle', 'Draft, review, approval and archive lifecycle.', ['documents', 'lifecycle']),
    buildTemplate('management-control', 'Controlling KPI Cycle', 'Periodic KPI collection and validation.', ['kpi', 'recurring']),
    buildTemplate('conversation-ai', 'Conversation Quality Gate', 'Conversation QA and diagnostics workflow.', ['conversation', 'quality']),
    buildTemplate('prompt-studio', 'Prompt Publishing', 'Prompt review, approval and publish workflow.', ['prompt', 'review']),
    buildTemplate('generate', 'Generate Run Governance', 'Generation readiness and post-run notifications.', ['generate', 'governance']),
    buildTemplate('reviews', 'Review Moderation', 'Moderation approvals and escalation workflow.', ['reviews', 'moderation']),
    buildTemplate('administration', 'Admin Access Review', 'Access review and revocation workflow.', ['administration', 'security']),
  ]
}

function defaultStore(): WorkflowWorkspaceStore {
  const templates = defaultTemplates()
  const seed = templates.slice(0, 4).map((template, index) => {
    const createdAt = nowIso()
    const workflow: WorkflowDefinition = {
      id: id('wf'),
      module: template.module,
      name: template.name,
      description: template.description,
      active: index < 3,
      triggerMode: index % 2 === 0 ? 'manual' : 'scheduled',
      schedule: index % 2 === 0 ? '' : 'daily 08:00',
      conditionExpression: '',
      version: 1,
      tags: template.tags,
      createdAt,
      updatedAt: createdAt,
      steps: template.steps,
    }

    return workflow
  })

  return {
    workflows: seed,
    templates,
    logs: [],
  }
}

export class WorkflowWorkspaceService {
  private static memoryStore: WorkflowWorkspaceStore = defaultStore()

  static getStore(): WorkflowWorkspaceStore {
    if (typeof window === 'undefined') {
      return this.memoryStore
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const next = defaultStore()
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      }

      const parsed = JSON.parse(raw) as Partial<WorkflowWorkspaceStore>
      const fallback = defaultStore()
      return {
        workflows: Array.isArray(parsed.workflows) ? parsed.workflows : fallback.workflows,
        templates: Array.isArray(parsed.templates) ? parsed.templates : fallback.templates,
        logs: Array.isArray(parsed.logs) ? parsed.logs : fallback.logs,
      }
    } catch {
      return defaultStore()
    }
  }

  static persist(store: WorkflowWorkspaceStore): void {
    this.memoryStore = store
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }

  static list(): WorkflowDefinition[] {
    return this.getStore().workflows.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }

  static listTemplates(): WorkflowTemplate[] {
    return [...this.getStore().templates]
  }

  static listLogs(): WorkflowExecutionLog[] {
    return this.getStore().logs.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  }

  static createWorkflow(input: {
    module: WorkflowModule
    name: string
    description: string
    triggerMode: WorkflowTriggerMode
    schedule?: string
    conditionExpression?: string
    tags?: string[]
    steps?: WorkflowStep[]
  }): WorkflowDefinition {
    const store = this.getStore()
    const createdAt = nowIso()
    const workflow: WorkflowDefinition = {
      id: id('wf'),
      module: input.module,
      name: input.name.trim() || 'Untitled workflow',
      description: input.description.trim(),
      active: false,
      triggerMode: input.triggerMode,
      schedule: input.schedule ?? '',
      conditionExpression: input.conditionExpression ?? '',
      version: 1,
      tags: input.tags ?? [],
      createdAt,
      updatedAt: createdAt,
      steps: input.steps && input.steps.length > 0 ? input.steps : defaultSteps(),
    }

    this.persist({ ...store, workflows: [workflow, ...store.workflows] })
    notificationService.publish({
      title: 'Workflow créé',
      message: `${workflow.name} a été créé.`,
      level: 'success',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })
    this.pushHistory(workflow, 'creation', 'Workflow created')
    return workflow
  }

  static updateWorkflow(idValue: string, patch: Partial<WorkflowDefinition>): WorkflowDefinition | undefined {
    const store = this.getStore()
    let updated: WorkflowDefinition | undefined
    const workflows = store.workflows.map((workflow) => {
      if (workflow.id !== idValue) return workflow
      updated = {
        ...workflow,
        ...patch,
        id: workflow.id,
        createdAt: workflow.createdAt,
        updatedAt: nowIso(),
      }
      return updated
    })
    this.persist({ ...store, workflows })

    if (updated) {
      this.pushHistory(updated, 'modification', 'Workflow updated')
    }

    return updated
  }

  static deleteWorkflow(idValue: string): void {
    const store = this.getStore()
    const target = store.workflows.find((workflow) => workflow.id === idValue)
    if (!target) return

    this.persist({
      ...store,
      workflows: store.workflows.filter((workflow) => workflow.id !== idValue),
    })
    notificationService.publish({
      title: 'Workflow supprimé',
      message: `${target.name} a été supprimé.`,
      level: 'warning',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })
    this.pushHistory(target, 'archiving', 'Workflow deleted')
  }

  static activateWorkflow(idValue: string): WorkflowDefinition | undefined {
    const updated = this.updateWorkflow(idValue, { active: true })
    if (updated) {
      notificationService.publish({
        title: 'Workflow activé',
        message: `${updated.name} est maintenant actif.`,
        level: 'success',
        priority: 'low',
        category: 'system',
        read: false,
        channels: ['email'],
      })
      this.pushHistory(updated, 'publication', 'Workflow activated')
    }
    return updated
  }

  static deactivateWorkflow(idValue: string): WorkflowDefinition | undefined {
    const updated = this.updateWorkflow(idValue, { active: false })
    if (updated) {
      notificationService.publish({
        title: 'Workflow désactivé',
        message: `${updated.name} est maintenant inactif.`,
        level: 'warning',
        priority: 'low',
        category: 'system',
        read: false,
        channels: ['email'],
      })
      this.pushHistory(updated, 'archiving', 'Workflow deactivated')
    }
    return updated
  }

  static duplicateWorkflow(idValue: string): WorkflowDefinition | undefined {
    const source = this.getStore().workflows.find((workflow) => workflow.id === idValue)
    if (!source) return undefined

    const duplicated = this.createWorkflow({
      module: source.module,
      name: `${source.name} (copy)`,
      description: source.description,
      triggerMode: source.triggerMode,
      schedule: source.schedule,
      conditionExpression: source.conditionExpression,
      tags: source.tags,
      steps: source.steps.map((step) => ({ ...step, id: id('step') })),
    })

    notificationService.publish({
      title: 'Workflow dupliqué',
      message: `${source.name} a été cloné.`,
      level: 'info',
      priority: 'low',
      category: 'system',
      read: false,
      channels: ['email'],
    })
    return duplicated
  }

  static versionWorkflow(idValue: string): WorkflowDefinition | undefined {
    const source = this.getStore().workflows.find((workflow) => workflow.id === idValue)
    if (!source) return undefined

    const nextVersion = source.version + 1
    const updated = this.updateWorkflow(idValue, { version: nextVersion })
    if (updated) {
      this.pushHistory(updated, 'version', `Workflow versioned to v${nextVersion}`)
    }
    return updated
  }

  static cloneTemplate(templateId: string): WorkflowDefinition | undefined {
    const template = this.getStore().templates.find((item) => item.id === templateId)
    if (!template) return undefined

    return this.createWorkflow({
      module: template.module,
      name: `${template.name} clone`,
      description: template.description,
      triggerMode: 'manual',
      tags: template.tags,
      steps: template.steps.map((step) => ({ ...step, id: id('step') })),
    })
  }

  static importWorkflows(rawJson: string): { imported: number; errors: number } {
    let imported = 0
    let errors = 0
    const store = this.getStore()

    try {
      const parsed = JSON.parse(rawJson) as unknown
      const rows = Array.isArray(parsed)
        ? parsed
        : (typeof parsed === 'object' && parsed && 'workflows' in parsed && Array.isArray((parsed as { workflows: unknown[] }).workflows)
          ? (parsed as { workflows: unknown[] }).workflows
          : [])

      const nextWorkflows = [...store.workflows]
      rows.forEach((row) => {
        const candidate = row as Partial<WorkflowDefinition>
        if (!candidate.name || !candidate.module || !Array.isArray(candidate.steps)) {
          errors += 1
          return
        }

        const createdAt = nowIso()
        nextWorkflows.unshift({
          id: id('wf'),
          module: candidate.module,
          name: candidate.name,
          description: candidate.description ?? '',
          active: Boolean(candidate.active),
          triggerMode: candidate.triggerMode ?? 'manual',
          schedule: candidate.schedule ?? '',
          conditionExpression: candidate.conditionExpression ?? '',
          version: typeof candidate.version === 'number' ? Math.max(1, candidate.version) : 1,
          tags: Array.isArray(candidate.tags) ? candidate.tags : [],
          createdAt,
          updatedAt: createdAt,
          steps: candidate.steps.map((step) => ({
            id: id('step'),
            name: step.name,
            type: step.type,
            config: step.config,
            x: typeof step.x === 'number' ? step.x : 40,
            y: typeof step.y === 'number' ? step.y : 40,
          })),
        })
        imported += 1
      })

      this.persist({ ...store, workflows: nextWorkflows.slice(0, 200) })
      if (imported > 0) {
        notificationService.publish({
          title: 'Import workflow',
          message: `${imported} workflow(s) importé(s).`,
          level: 'success',
          priority: 'medium',
          category: 'system',
          read: false,
          channels: ['email'],
        })
      }
    } catch {
      errors += 1
    }

    return { imported, errors }
  }

  static exportWorkflows(): void {
    WorkspaceExchangeService.downloadJson('srg-workflows-export.json', this.getStore().workflows)
  }

  static exportLogs(): void {
    WorkspaceExchangeService.downloadJson('srg-workflow-logs.json', this.getStore().logs)
  }

  static simulateWorkflow(idValue: string): WorkflowExecutionLog | undefined {
    const store = this.getStore()
    const workflow = store.workflows.find((item) => item.id === idValue)
    if (!workflow) return undefined

    const startedAt = nowIso()
    const latencyMs = 120 + workflow.steps.length * 45
    const success = workflow.steps.some((item) => item.type === 'end')
    const status: WorkflowExecutionStatus = success ? 'completed' : 'failed'
    const failures = success ? 0 : 1
    const endedAt = nowIso()
    const log: WorkflowExecutionLog = {
      id: id('wflog'),
      workflowId: workflow.id,
      workflowName: workflow.name,
      module: workflow.module,
      status,
      startedAt,
      endedAt,
      durationMs: latencyMs,
      latencyMs,
      automationMode: workflow.triggerMode,
      success,
      failures,
      message: success ? 'Simulation completed successfully.' : 'Simulation failed: workflow has no terminal step.',
    }

    this.persist({ ...store, logs: [log, ...store.logs].slice(0, 400) })

    notificationService.publish({
      title: success ? 'Workflow simulé avec succès' : 'Échec simulation workflow',
      message: `${workflow.name} • ${log.message}`,
      level: success ? 'success' : 'error',
      priority: success ? 'low' : 'high',
      category: 'generation',
      read: false,
      channels: success ? ['email'] : ['email', 'whatsapp'],
    })

    this.pushHistory(
      workflow,
      success ? 'validation' : 'comment',
      success ? 'Workflow simulation succeeded' : 'Workflow simulation failed',
      status,
      latencyMs,
    )

    return log
  }

  static addLog(log: WorkflowExecutionLog): void {
    const store = this.getStore()
    this.persist({ ...store, logs: [log, ...store.logs].slice(0, 400) })
  }

  static reorderStep(workflowId: string, fromIndex: number, toIndex: number): WorkflowDefinition | undefined {
    const workflow = this.getStore().workflows.find((item) => item.id === workflowId)
    if (!workflow) return undefined
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= workflow.steps.length || toIndex >= workflow.steps.length) return workflow

    const next = [...workflow.steps]
    const [step] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, step)
    return this.updateWorkflow(workflowId, { steps: next })
  }

  static copyStep(workflowId: string, stepId: string): WorkflowDefinition | undefined {
    const workflow = this.getStore().workflows.find((item) => item.id === workflowId)
    if (!workflow) return undefined
    const index = workflow.steps.findIndex((step) => step.id === stepId)
    if (index < 0) return workflow

    const source = workflow.steps[index]
    const copied: WorkflowStep = {
      ...source,
      id: id('step'),
      name: `${source.name} copy`,
      x: source.x + 24,
      y: source.y + 24,
    }
    const next = [...workflow.steps]
    next.splice(index + 1, 0, copied)
    return this.updateWorkflow(workflowId, { steps: next })
  }

  static removeStep(workflowId: string, stepId: string): WorkflowDefinition | undefined {
    const workflow = this.getStore().workflows.find((item) => item.id === workflowId)
    if (!workflow) return undefined
    if (workflow.steps.length <= 1) return workflow

    return this.updateWorkflow(workflowId, { steps: workflow.steps.filter((step) => step.id !== stepId) })
  }

  static addStep(workflowId: string, type: WorkflowStepType): WorkflowDefinition | undefined {
    const workflow = this.getStore().workflows.find((item) => item.id === workflowId)
    if (!workflow) return undefined

    const nextStep: WorkflowStep = {
      id: id('step'),
      name: `${type.toUpperCase()} step`,
      type,
      config: '',
      x: 40 + workflow.steps.length * 60,
      y: 120,
    }

    return this.updateWorkflow(workflowId, { steps: [...workflow.steps, nextStep] })
  }

  static moveStep(workflowId: string, stepId: string, x: number, y: number): WorkflowDefinition | undefined {
    const workflow = this.getStore().workflows.find((item) => item.id === workflowId)
    if (!workflow) return undefined

    return this.updateWorkflow(workflowId, {
      steps: workflow.steps.map((step) => (step.id === stepId ? { ...step, x, y } : step)),
    })
  }

  static getDashboardSummary() {
    const store = this.getStore()
    const workflows = store.workflows
    const logs = store.logs
    const active = workflows.filter((item) => item.active).length
    const completed = logs.filter((item) => item.status === 'completed').length
    const failed = logs.filter((item) => item.status === 'failed').length
    const avgDurationMs = logs.length > 0 ? Math.round(logs.reduce((sum, item) => sum + item.durationMs, 0) / logs.length) : 0
    const successRate = logs.length > 0 ? Number(((completed / logs.length) * 100).toFixed(1)) : 0
    const failureRate = logs.length > 0 ? Number(((failed / logs.length) * 100).toFixed(1)) : 0

    const byModule = workflows.reduce<Record<WorkflowModule, number>>((acc, workflow) => {
      acc[workflow.module] += 1
      return acc
    }, {
      finance: 0,
      procurement: 0,
      maintenance: 0,
      hr: 0,
      crm: 0,
      knowledge: 0,
      projects: 0,
      documents: 0,
      'management-control': 0,
      'conversation-ai': 0,
      'prompt-studio': 0,
      generate: 0,
      reviews: 0,
      administration: 0,
    })

    const timeline = logs.slice(0, 20).map((item) => `${item.workflowName} • ${item.status} • ${new Date(item.startedAt).toLocaleString()}`)

    return {
      totalWorkflows: workflows.length,
      active,
      completed,
      failed,
      avgDurationMs,
      successRate,
      failureRate,
      byModule,
      timeline,
    }
  }

  static getObservability() {
    const logs = this.listLogs()
    const diagnostics = logs.slice(0, 20).map((item) => ({
      id: item.id,
      workflowId: item.workflowId,
      status: item.status,
      latencyMs: item.latencyMs,
      failures: item.failures,
      message: item.message,
      at: item.startedAt,
    }))

    const metrics = {
      events: logs.length,
      latencyAvg: logs.length > 0 ? Math.round(logs.reduce((sum, item) => sum + item.latencyMs, 0) / logs.length) : 0,
      latencyP95: logs.length > 0
        ? [...logs].map((item) => item.latencyMs).sort((a, b) => a - b)[Math.floor(logs.length * 0.95) - 1] ?? 0
        : 0,
      success: logs.filter((item) => item.success).length,
      failures: logs.filter((item) => !item.success).length,
    }

    const executionGraph = logs.slice(0, 30).map((item) => ({
      id: item.id,
      label: item.workflowName,
      status: item.status,
      latencyMs: item.latencyMs,
      module: item.module,
      at: item.startedAt,
    }))

    return { diagnostics, metrics, executionGraph }
  }

  static setSearchFavorites(values: string[]): void {
    WorkspacePreferencesService.setFavorites('workflow-search', values)
  }

  static getSearchFavorites(): string[] {
    return WorkspacePreferencesService.getPreferences().favorites['workflow-search'] ?? []
  }

  private static pushHistory(
    workflow: WorkflowDefinition,
    eventType: 'creation' | 'modification' | 'validation' | 'publication' | 'archiving' | 'comment' | 'version',
    message: string,
    status: WorkflowExecutionStatus = 'completed',
    durationMs = 0,
  ) {
    HistoryWorkspaceService.addRecord({
      id: id('history-workflow'),
      promptName: `Workflow • ${workflow.name}`,
      promptText: workflow.description,
      output: message,
      provider: 'workflow-engine',
      model: workflow.triggerMode,
      status: status === 'failed' ? 'failed' : status === 'cancelled' ? 'cancelled' : status === 'pending' ? 'pending' : 'completed',
      durationMs,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'workflow',
      entityType: 'workflow',
      entityId: workflow.id,
      eventType,
      actorName: 'Workflow Workspace',
    })
  }
}
