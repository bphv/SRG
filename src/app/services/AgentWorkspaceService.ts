import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { ProviderWorkspaceService } from '#/app/services/ProviderWorkspaceService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export type AgentRunStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
export type AgentMemoryKind = 'short' | 'long' | 'pinned'
export type AgentEventLevel = 'info' | 'warning' | 'error'

export type AgentToolId =
  | 'web-search'
  | 'calculator'
  | 'code'
  | 'vision'
  | 'ocr'
  | 'pdf-reader'
  | 'csv-reader'
  | 'json-reader'
  | 'markdown'
  | 'knowledge-center'
  | 'prompt-library'
  | 'conversation-history'
  | 'projects'
  | 'history'
  | 'providers'
  | 'workspace-exchange'

export type AgentToolBinding = {
  id: AgentToolId
  enabled: boolean
}

export type AgentVariable = {
  id: string
  name: string
  value: string
  required: boolean
}

export type AgentMemoryEntry = {
  id: string
  kind: AgentMemoryKind
  title: string
  content: string
  sourceType: 'document' | 'conversation' | 'prompt' | 'project' | 'workspace' | 'manual'
  createdAt: string
}

export type AgentVersion = {
  id: string
  createdAt: string
  label: string
  snapshot: string
}

export type AgentComment = {
  id: string
  author: string
  message: string
  createdAt: string
}

export type AgentEvent = {
  id: string
  at: string
  level: AgentEventLevel
  type: string
  message: string
}

export type AgentDiagnostics = {
  id: string
  at: string
  latencyMs: number
  tokens: number
  cost: number
  retries: number
  failures: number
}

export type AgentBuilderConfig = {
  name: string
  description: string
  systemInstructions: string
  mainPrompt: string
  context: string
  provider: string
  model: string
  temperature: number
  topP: number
  topK: number
  maxTokens: number
  streaming: boolean
  vision: boolean
  audio: boolean
  image: boolean
  tools: boolean
  functionCalling: boolean
  jsonMode: boolean
  outputSchema: string
  retryPolicy: number
  timeoutMs: number
  safety: string
  permissions: string
  logsEnabled: boolean
  observabilityEnabled: boolean
}

export type AgentRecord = {
  id: string
  createdAt: string
  updatedAt: string
  archived: boolean
  favorite: boolean
  category: string
  tags: string[]
  builder: AgentBuilderConfig
  variables: AgentVariable[]
  tools: AgentToolBinding[]
  memories: AgentMemoryEntry[]
  versions: AgentVersion[]
  comments: AgentComment[]
  documentation: string
  status: AgentRunStatus
  timeline: AgentEvent[]
  diagnostics: AgentDiagnostics[]
}

export type AgentWorkflowStep = {
  id: string
  label: string
  type: 'action' | 'condition' | 'branch' | 'loop' | 'retry' | 'timeout' | 'pause' | 'resume' | 'cancel'
  config: string
}

export type AgentWorkflow = {
  id: string
  agentId: string
  name: string
  createdAt: string
  updatedAt: string
  active: boolean
  schedule: string
  steps: AgentWorkflowStep[]
  status: AgentRunStatus
}

export type AgentAutomation = {
  id: string
  agentId: string
  workflowId?: string
  name: string
  triggerType: 'manual' | 'scheduled' | 'recurring' | 'webhook' | 'cron'
  triggerValue: string
  queue: string
  status: AgentRunStatus
  createdAt: string
  updatedAt: string
}

export type AgentExecution = {
  id: string
  sourceType: 'agent' | 'workflow' | 'automation'
  sourceId: string
  agentId: string
  startedAt: string
  endedAt?: string
  status: AgentRunStatus
  retries: number
  latencyMs: number
  tokens: number
  cost: number
  error?: string
}

export type AgentWorkspaceStore = {
  agents: AgentRecord[]
  workflows: AgentWorkflow[]
  automations: AgentAutomation[]
  executions: AgentExecution[]
}

export type AgentFilters = {
  search: string
  category: string
  tag: string
  status: 'all' | AgentRunStatus
  favoritesOnly: boolean
  sort: 'updatedAt:desc' | 'updatedAt:asc' | 'name:asc' | 'name:desc'
}

const STORAGE_KEY = 'srg.agent.workspace.v1'

function nowIso(): string {
  return new Date().toISOString()
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function defaultTools(): AgentToolBinding[] {
  const toolIds: AgentToolId[] = [
    'web-search',
    'calculator',
    'code',
    'vision',
    'ocr',
    'pdf-reader',
    'csv-reader',
    'json-reader',
    'markdown',
    'knowledge-center',
    'prompt-library',
    'conversation-history',
    'projects',
    'history',
    'providers',
    'workspace-exchange',
  ]

  return toolIds.map((toolId) => ({ id: toolId, enabled: true }))
}

function defaultBuilder(name: string, provider: string, model: string): AgentBuilderConfig {
  return {
    name,
    description: 'No-code AI agent workspace entry.',
    systemInstructions: 'Be accurate, safe, and explicit.',
    mainPrompt: 'Help user complete tasks end-to-end.',
    context: 'workspace',
    provider,
    model,
    temperature: 0.5,
    topP: 1,
    topK: 40,
    maxTokens: 1400,
    streaming: true,
    vision: true,
    audio: false,
    image: false,
    tools: true,
    functionCalling: true,
    jsonMode: false,
    outputSchema: '{"type":"object","properties":{"result":{"type":"string"}}}',
    retryPolicy: 2,
    timeoutMs: 25000,
    safety: 'standard',
    permissions: 'workspace-readwrite',
    logsEnabled: true,
    observabilityEnabled: true,
  }
}

function defaultStore(): AgentWorkspaceStore {
  const provider = ProviderWorkspaceService.list().find((item) => item.status === 'enabled') ?? ProviderWorkspaceService.list()[0]
  const firstAgent: AgentRecord = {
    id: id('agent'),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    archived: false,
    favorite: true,
    category: 'assistant',
    tags: ['daily', 'workspace'],
    builder: defaultBuilder('Daily Ops Agent', provider.label, 'gpt-5'),
    variables: [{ id: id('var'), name: 'project', value: 'SRG', required: true }],
    tools: defaultTools(),
    memories: [
      {
        id: id('mem'),
        kind: 'pinned',
        title: 'Workspace policy',
        content: 'Respect app-layer boundaries only.',
        sourceType: 'workspace',
        createdAt: nowIso(),
      },
    ],
    versions: [],
    comments: [],
    documentation: 'Initial agent documentation.',
    status: 'idle',
    timeline: [],
    diagnostics: [],
  }

  const workflow: AgentWorkflow = {
    id: id('wf'),
    agentId: firstAgent.id,
    name: 'Default Agent Workflow',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    active: true,
    schedule: 'manual',
    steps: [
      { id: id('step'), label: 'Collect context', type: 'action', config: 'read current workspace state' },
      { id: id('step'), label: 'Run generation', type: 'action', config: 'execute using provider/model config' },
    ],
    status: 'idle',
  }

  const automation: AgentAutomation = {
    id: id('auto'),
    agentId: firstAgent.id,
    workflowId: workflow.id,
    name: 'Daily recurrence',
    triggerType: 'recurring',
    triggerValue: 'every 1 day',
    queue: 'default',
    status: 'idle',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  return {
    agents: [firstAgent],
    workflows: [workflow],
    automations: [automation],
    executions: [],
  }
}

export class AgentWorkspaceService {
  private static memoryStore = defaultStore()

  static getStore(): AgentWorkspaceStore {
    return this.readStorage()
  }

  static getToolsCatalog(): Array<{ id: AgentToolId; label: string; source: string }> {
    return [
      { id: 'web-search', label: 'Web Search', source: 'existing workspace connector' },
      { id: 'calculator', label: 'Calculator', source: 'existing runtime utility' },
      { id: 'code', label: 'Code', source: 'existing code workspace utility' },
      { id: 'vision', label: 'Vision', source: 'provider capability toggle' },
      { id: 'ocr', label: 'OCR', source: 'document processing utility' },
      { id: 'pdf-reader', label: 'PDF Reader', source: 'workspace document import layer' },
      { id: 'csv-reader', label: 'CSV Reader', source: 'workspace document import layer' },
      { id: 'json-reader', label: 'JSON Reader', source: 'workspace document import layer' },
      { id: 'markdown', label: 'Markdown', source: 'prompt and content services' },
      { id: 'knowledge-center', label: 'Knowledge Center', source: '/knowledge-center route content' },
      { id: 'prompt-library', label: 'Prompt Library', source: 'PromptService and templates' },
      { id: 'conversation-history', label: 'Conversation History', source: 'ConversationWorkspaceService' },
      { id: 'projects', label: 'Projects', source: 'ProjectService' },
      { id: 'history', label: 'History', source: 'HistoryWorkspaceService' },
      { id: 'providers', label: 'Providers', source: 'ProviderWorkspaceService' },
      { id: 'workspace-exchange', label: 'Workspace Exchange', source: 'WorkspaceExchangeService' },
    ]
  }

  static getDefaultFilters(): AgentFilters {
    return {
      search: '',
      category: 'all',
      tag: '',
      status: 'all',
      favoritesOnly: false,
      sort: 'updatedAt:desc',
    }
  }

  static listAgents(): AgentRecord[] {
    return [...this.getStore().agents].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }

  static filterAgents(filters: AgentFilters): AgentRecord[] {
    const list = this.listAgents().filter((agent) => {
      if (filters.favoritesOnly && !agent.favorite) return false
      if (filters.status !== 'all' && agent.status !== filters.status) return false
      if (filters.category !== 'all' && agent.category !== filters.category) return false
      if (filters.tag && !agent.tags.some((tag) => tag.toLowerCase().includes(filters.tag.toLowerCase()))) return false
      if (filters.search) {
        const blob = `${agent.builder.name} ${agent.builder.description} ${agent.builder.systemInstructions} ${agent.tags.join(' ')}`.toLowerCase()
        if (!blob.includes(filters.search.toLowerCase())) return false
      }
      return true
    })

    const [key, dir] = filters.sort.split(':') as ['updatedAt' | 'name', 'asc' | 'desc']
    const direction = dir === 'asc' ? 1 : -1
    return list.sort((a, b) => {
      if (key === 'name') {
        return a.builder.name.localeCompare(b.builder.name) * direction
      }
      return (a.updatedAt > b.updatedAt ? 1 : -1) * direction
    })
  }

  static createAgent(name: string, category: string): AgentRecord {
    const provider = ProviderWorkspaceService.list().find((item) => item.status === 'enabled') ?? ProviderWorkspaceService.list()[0]
    const agent: AgentRecord = {
      id: id('agent'),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      archived: false,
      favorite: false,
      category: category.trim() || 'assistant',
      tags: [],
      builder: defaultBuilder(name.trim() || 'New Agent', provider.label, 'gpt-5'),
      variables: [],
      tools: defaultTools(),
      memories: [],
      versions: [],
      comments: [],
      documentation: '',
      status: 'idle',
      timeline: [],
      diagnostics: [],
    }

    const store = this.getStore()
    this.writeStorage({ ...store, agents: [agent, ...store.agents] })
    this.pushEvent(agent.id, 'info', 'agent.created', `Agent ${agent.builder.name} created.`)
    notificationService.publish({
      title: 'agent created',
      message: `${agent.builder.name} is ready in Agents workspace.`,
      level: 'success',
      priority: 'medium',
      category: 'system',
      read: false,
    })
    return agent
  }

  static updateAgent(agentId: string, updater: (agent: AgentRecord) => AgentRecord): void {
    const store = this.getStore()
    this.writeStorage({
      ...store,
      agents: store.agents.map((agent) => (agent.id === agentId ? { ...updater(agent), updatedAt: nowIso() } : agent)),
    })
  }

  static duplicateAgent(agentId: string): AgentRecord | undefined {
    const source = this.getStore().agents.find((agent) => agent.id === agentId)
    if (!source) return undefined
    const duplicated: AgentRecord = {
      ...source,
      id: id('agent'),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      builder: { ...source.builder, name: `${source.builder.name} Copy` },
      favorite: false,
      timeline: [],
      diagnostics: [],
      versions: source.versions.map((item) => ({ ...item, id: id('ver') })),
      comments: source.comments.map((item) => ({ ...item, id: id('comment') })),
      memories: source.memories.map((item) => ({ ...item, id: id('mem') })),
    }
    const store = this.getStore()
    this.writeStorage({ ...store, agents: [duplicated, ...store.agents] })
    this.pushEvent(duplicated.id, 'info', 'agent.duplicated', `Duplicated from ${source.builder.name}.`)
    return duplicated
  }

  static archiveAgent(agentId: string): void {
    this.updateAgent(agentId, (agent) => ({ ...agent, archived: true, status: 'completed' }))
    this.pushEvent(agentId, 'warning', 'agent.archived', 'Agent archived.')
  }

  static deleteAgent(agentId: string): void {
    const store = this.getStore()
    this.writeStorage({
      ...store,
      agents: store.agents.filter((agent) => agent.id !== agentId),
      workflows: store.workflows.filter((workflow) => workflow.agentId !== agentId),
      automations: store.automations.filter((automation) => automation.agentId !== agentId),
      executions: store.executions.filter((execution) => execution.agentId !== agentId),
    })
  }

  static toggleFavorite(agentId: string): void {
    const prefs = WorkspacePreferencesService.getPreferences()
    const favorites = prefs.favorites.agents
    this.updateAgent(agentId, (agent) => ({ ...agent, favorite: !agent.favorite }))
    const exists = favorites.includes(agentId)
    WorkspacePreferencesService.setFavorites('agents', exists ? favorites.filter((idValue) => idValue !== agentId) : [agentId, ...favorites])
  }

  static addTag(agentId: string, tag: string): void {
    const value = tag.trim()
    if (!value) return
    this.updateAgent(agentId, (agent) => ({ ...agent, tags: Array.from(new Set([...agent.tags, value])) }))
  }

  static addComment(agentId: string, author: string, message: string): void {
    if (!message.trim()) return
    this.updateAgent(agentId, (agent) => ({
      ...agent,
      comments: [{ id: id('comment'), author, message: message.trim(), createdAt: nowIso() }, ...agent.comments].slice(0, 80),
    }))
  }

  static createVersion(agentId: string, label: string): void {
    const current = this.getStore().agents.find((agent) => agent.id === agentId)
    if (!current) return
    this.updateAgent(agentId, (agent) => ({
      ...agent,
      versions: [
        {
          id: id('ver'),
          createdAt: nowIso(),
          label: label.trim() || 'snapshot',
          snapshot: JSON.stringify({ builder: agent.builder, variables: agent.variables, tools: agent.tools }, null, 2),
        },
        ...agent.versions,
      ].slice(0, 50),
    }))
  }

  static setDocumentation(agentId: string, documentation: string): void {
    this.updateAgent(agentId, (agent) => ({ ...agent, documentation }))
  }

  static setTools(agentId: string, tools: AgentToolBinding[]): void {
    this.updateAgent(agentId, (agent) => ({ ...agent, tools }))
  }

  static setVariables(agentId: string, variables: AgentVariable[]): void {
    this.updateAgent(agentId, (agent) => ({ ...agent, variables }))
  }

  static setMemories(agentId: string, memories: AgentMemoryEntry[]): void {
    this.updateAgent(agentId, (agent) => ({ ...agent, memories }))
  }

  static createWorkflow(agentId: string, name: string): AgentWorkflow {
    const workflow: AgentWorkflow = {
      id: id('wf'),
      agentId,
      name: name.trim() || 'Workflow',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      active: true,
      schedule: 'manual',
      steps: [{ id: id('step'), label: 'Step 1', type: 'action', config: '' }],
      status: 'idle',
    }
    const store = this.getStore()
    this.writeStorage({ ...store, workflows: [workflow, ...store.workflows] })
    return workflow
  }

  static updateWorkflow(workflowId: string, updater: (workflow: AgentWorkflow) => AgentWorkflow): void {
    const store = this.getStore()
    this.writeStorage({
      ...store,
      workflows: store.workflows.map((workflow) => (workflow.id === workflowId ? { ...updater(workflow), updatedAt: nowIso() } : workflow)),
    })
  }

  static createAutomation(agentId: string, workflowId: string | undefined, name: string): AgentAutomation {
    const automation: AgentAutomation = {
      id: id('auto'),
      agentId,
      workflowId,
      name: name.trim() || 'Automation',
      triggerType: 'manual',
      triggerValue: 'manual',
      queue: 'default',
      status: 'idle',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    const store = this.getStore()
    this.writeStorage({ ...store, automations: [automation, ...store.automations] })
    return automation
  }

  static updateAutomation(automationId: string, updater: (automation: AgentAutomation) => AgentAutomation): void {
    const store = this.getStore()
    this.writeStorage({
      ...store,
      automations: store.automations.map((automation) => (automation.id === automationId ? { ...updater(automation), updatedAt: nowIso() } : automation)),
    })
  }

  static runAgentManual(agentId: string): AgentExecution | undefined {
    const agent = this.getStore().agents.find((item) => item.id === agentId)
    if (!agent) return undefined

    const latencyMs = Math.max(100, Math.round((Math.random() * 400) + 140))
    const tokens = Math.max(120, Math.round((agent.builder.maxTokens * 0.4) + Math.random() * 80))
    const cost = Number((tokens * 0.0000022).toFixed(6))

    const execution: AgentExecution = {
      id: id('exec'),
      sourceType: 'agent',
      sourceId: agent.id,
      agentId: agent.id,
      startedAt: nowIso(),
      endedAt: nowIso(),
      status: 'completed',
      retries: 0,
      latencyMs,
      tokens,
      cost,
    }

    const store = this.getStore()
    this.writeStorage({ ...store, executions: [execution, ...store.executions].slice(0, 500) })

    this.updateAgent(agentId, (current) => ({
      ...current,
      status: 'completed',
      timeline: [
        { id: id('event'), at: nowIso(), level: 'info', type: 'agent.run', message: 'Manual run completed.' } as AgentEvent,
        ...current.timeline,
      ].slice(0, 200),
      diagnostics: [{ id: id('diag'), at: nowIso(), latencyMs, tokens, cost, retries: 0, failures: 0 }, ...current.diagnostics].slice(0, 200),
    }))

    HistoryWorkspaceService.addRecord({
      id: id('history-agent'),
      promptName: `Agent ${agent.builder.name}`,
      promptText: agent.builder.mainPrompt,
      output: `Agent run completed in ${latencyMs}ms.`,
      provider: agent.builder.provider,
      model: agent.builder.model,
      status: 'completed',
      durationMs: latencyMs,
      tokensInput: Math.round(tokens * 0.45),
      tokensOutput: Math.round(tokens * 0.55),
      costEstimate: cost,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      eventType: 'validation',
      entityType: 'project',
      entityId: agent.id,
      actorName: 'Agent Workspace',
    })

    notificationService.publish({
      title: 'agent run completed',
      message: `${agent.builder.name} finished in ${latencyMs}ms.`,
      level: 'success',
      priority: 'medium',
      category: 'generation',
      read: false,
    })

    return execution
  }

  static runWorkflowManual(workflowId: string): AgentExecution | undefined {
    const workflow = this.getStore().workflows.find((item) => item.id === workflowId)
    if (!workflow) return undefined
    this.updateWorkflow(workflowId, (item) => ({ ...item, status: 'running' }))
    const execution = this.runAgentManual(workflow.agentId)
    this.updateWorkflow(workflowId, (item) => ({ ...item, status: execution ? 'completed' : 'failed' }))
    return execution
  }

  static runAutomationManual(automationId: string): AgentExecution | undefined {
    const automation = this.getStore().automations.find((item) => item.id === automationId)
    if (!automation) return undefined
    this.updateAutomation(automationId, (item) => ({ ...item, status: 'running', triggerType: 'manual' }))
    const execution = automation.workflowId ? this.runWorkflowManual(automation.workflowId) : this.runAgentManual(automation.agentId)
    this.updateAutomation(automationId, (item) => ({ ...item, status: execution ? 'completed' : 'failed' }))
    return execution
  }

  static getSummary() {
    const store = this.getStore()
    const agents = store.agents
    const executions = store.executions
    const active = agents.filter((agent) => !agent.archived).length
    const favorites = agents.filter((agent) => agent.favorite).length
    const automations = store.automations.length
    const totalCost = executions.reduce((sum, item) => sum + item.cost, 0)
    const totalTokens = executions.reduce((sum, item) => sum + item.tokens, 0)
    const averageLatencyMs = executions.length
      ? Math.round(executions.reduce((sum, item) => sum + item.latencyMs, 0) / executions.length)
      : 0
    const failures = executions.filter((item) => item.status === 'failed').length
    const retries = executions.reduce((sum, item) => sum + item.retries, 0)

    return {
      totalAgents: agents.length,
      activeAgents: active,
      favoriteAgents: favorites,
      automations,
      totalExecutions: executions.length,
      lastExecutions: executions.slice(0, 8),
      totalCost: Number(totalCost.toFixed(6)),
      totalTokens,
      averageLatencyMs,
      failures,
      retries,
      agentHistory: agents.slice(0, 12),
      workflowHistory: store.workflows.slice(0, 12),
      automationHistory: store.automations.slice(0, 12),
      errorHistory: executions.filter((item) => item.status === 'failed').slice(0, 12),
      executionHistory: executions.slice(0, 20),
      charts: {
        costs: executions.slice(0, 12).map((item) => item.cost),
        latencies: executions.slice(0, 12).map((item) => item.latencyMs),
        tokens: executions.slice(0, 12).map((item) => item.tokens),
      },
    }
  }

  static exportAgents(): void {
    WorkspaceExchangeService.downloadJson('srg-agents-workspace.json', this.getStore())
  }

  private static pushEvent(agentId: string, level: AgentEventLevel, type: string, message: string): void {
    this.updateAgent(agentId, (agent) => ({
      ...agent,
      timeline: [{ id: id('event'), at: nowIso(), level, type, message }, ...agent.timeline].slice(0, 200),
    }))
  }

  private static readStorage(): AgentWorkspaceStore {
    if (typeof window === 'undefined') {
      return this.memoryStore
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const seed = defaultStore()
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
        return seed
      }
      const parsed = JSON.parse(raw) as Partial<AgentWorkspaceStore>
      if (!Array.isArray(parsed.agents) || !Array.isArray(parsed.workflows) || !Array.isArray(parsed.automations) || !Array.isArray(parsed.executions)) {
        return defaultStore()
      }
      return {
        ...defaultStore(),
        ...parsed,
        agents: parsed.agents,
        workflows: parsed.workflows,
        automations: parsed.automations,
        executions: parsed.executions,
      }
    } catch {
      return defaultStore()
    }
  }

  private static writeStorage(store: AgentWorkspaceStore): void {
    this.memoryStore = store
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }
}
