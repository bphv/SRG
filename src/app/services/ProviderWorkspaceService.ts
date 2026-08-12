import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'
import { ExecutionEngine } from '#/execution/engine/ExecutionEngine'
import { GeneratorEngine } from '#/generator/engine/GeneratorEngine'
import type { IProvider } from '#/providers/interfaces/IProvider'
import { OpenAIProviderFactory } from '#/providers/openai/OpenAIProviderFactory'
import { ProviderRegistry } from '#/providers/registry/ProviderRegistry'

export type ProviderWorkspaceHealth = 'healthy' | 'degraded' | 'offline'

export type ProviderDiagnosticStatus = 'passed' | 'failed' | 'not_available'

export type ProviderDiagnosticCheck = {
  id: string
  label: string
  status: ProviderDiagnosticStatus
  details: string
  durationMs: number
}

export type ProviderDiagnosticRun = {
  id: string
  providerId: string
  providerLabel: string
  startedAt: string
  completedAt: string
  overallStatus: ProviderDiagnosticStatus
  checks: ProviderDiagnosticCheck[]
  summary: {
    passed: number
    failed: number
    notAvailable: number
  }
}

export type ProviderCapabilityMap = {
  chat: boolean
  streaming: boolean
  reasoning: boolean
  vision: boolean
  image: boolean
  audio: boolean
  embeddings: boolean
  functionCalling: boolean
  toolCalling: boolean
  jsonMode: boolean
  webSearch: boolean
  multimodal: boolean
}

export type ProviderSubscriptionTier = 'free' | 'starter' | 'professional' | 'business' | 'enterprise'

export type ProviderWorkspaceItem = {
  id: string
  label: string
  type: 'llm' | 'vision' | 'audio' | 'image' | 'embedding' | 'router'
  status: 'enabled' | 'disabled'
  health: ProviderWorkspaceHealth
  quota: string
  latencyMs: number
  costHint: string
  availability: string
  sdkVersion: string
  lastSyncedAt: string
  modalities: string[]
  lastTestedAt: string
  wallet: string
  credits: string
  subscription: ProviderSubscriptionTier
  limitations: string[]
  capabilities: ProviderCapabilityMap
}

const STORAGE_KEY = 'srg.providers.workspace.v1'
const TEST_RUNS_KEY = 'srg.providers.workspace.tests.v1'

function nowIso(): string {
  return new Date().toISOString()
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

const defaultProviders = (): ProviderWorkspaceItem[] => [
  {
    id: 'openai',
    label: 'OpenAI',
    type: 'llm',
    status: 'enabled',
    health: 'healthy',
    quota: '74% remaining',
    latencyMs: 320,
    costHint: '$0.002 / 1K tokens',
    availability: '99.95%',
    sdkVersion: 'openai@5.2.0',
    lastSyncedAt: new Date().toISOString(),
    modalities: ['streaming', 'json', 'vision', 'audio', 'image'],
    lastTestedAt: new Date().toISOString(),
    wallet: '$128.00',
    credits: '9400',
    subscription: 'professional',
    limitations: ['rate limits by tier', 'vision payload size cap'],
    capabilities: {
      chat: true,
      streaming: true,
      reasoning: true,
      vision: true,
      image: true,
      audio: true,
      embeddings: true,
      functionCalling: true,
      toolCalling: true,
      jsonMode: true,
      webSearch: true,
      multimodal: true,
    },
  },
  {
    id: 'gemini',
    label: 'Gemini',
    type: 'llm',
    status: 'enabled',
    health: 'healthy',
    quota: '68% remaining',
    latencyMs: 360,
    costHint: '$0.0025 / 1K tokens',
    availability: '99.81%',
    sdkVersion: 'google-genai@0.5.0',
    lastSyncedAt: new Date().toISOString(),
    modalities: ['streaming', 'json', 'vision', 'image', 'audio'],
    lastTestedAt: new Date().toISOString(),
    wallet: '$96.00',
    credits: '7100',
    subscription: 'business',
    limitations: ['regional availability differences'],
    capabilities: {
      chat: true,
      streaming: true,
      reasoning: true,
      vision: true,
      image: true,
      audio: true,
      embeddings: true,
      functionCalling: true,
      toolCalling: true,
      jsonMode: true,
      webSearch: true,
      multimodal: true,
    },
  },
  {
    id: 'claude',
    label: 'Claude',
    type: 'llm',
    status: 'enabled',
    health: 'healthy',
    quota: '57% remaining',
    latencyMs: 430,
    costHint: '$0.003 / 1K tokens',
    availability: '99.72%',
    sdkVersion: 'anthropic@1.18.0',
    lastSyncedAt: new Date().toISOString(),
    modalities: ['streaming', 'json', 'vision'],
    lastTestedAt: new Date().toISOString(),
    wallet: '$84.00',
    credits: '5200',
    subscription: 'professional',
    limitations: ['image generation not native'],
    capabilities: {
      chat: true,
      streaming: true,
      reasoning: true,
      vision: true,
      image: false,
      audio: false,
      embeddings: false,
      functionCalling: true,
      toolCalling: true,
      jsonMode: true,
      webSearch: false,
      multimodal: true,
    },
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    type: 'llm',
    status: 'enabled',
    health: 'healthy',
    quota: '54% remaining',
    latencyMs: 445,
    costHint: '$0.0032 / 1K tokens',
    availability: '99.68%',
    sdkVersion: 'anthropic@1.18.0',
    lastSyncedAt: new Date().toISOString(),
    modalities: ['streaming', 'json', 'vision'],
    lastTestedAt: new Date().toISOString(),
    wallet: '$80.00',
    credits: '4980',
    subscription: 'professional',
    limitations: ['single vendor endpoint quota'],
    capabilities: {
      chat: true,
      streaming: true,
      reasoning: true,
      vision: true,
      image: false,
      audio: false,
      embeddings: false,
      functionCalling: true,
      toolCalling: true,
      jsonMode: true,
      webSearch: false,
      multimodal: true,
    },
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    type: 'router',
    status: 'enabled',
    health: 'healthy',
    quota: '62% remaining',
    latencyMs: 470,
    costHint: 'mixed provider pricing',
    availability: '99.64%',
    sdkVersion: 'openrouter@0.8.1',
    lastSyncedAt: new Date().toISOString(),
    modalities: ['streaming', 'json', 'vision', 'image', 'audio', 'embedding'],
    lastTestedAt: new Date().toISOString(),
    wallet: '$112.00',
    credits: '8600',
    subscription: 'business',
    limitations: ['upstream provider variability'],
    capabilities: {
      chat: true,
      streaming: true,
      reasoning: true,
      vision: true,
      image: true,
      audio: true,
      embeddings: true,
      functionCalling: true,
      toolCalling: true,
      jsonMode: true,
      webSearch: false,
      multimodal: true,
    },
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    type: 'llm',
    status: 'enabled',
    health: 'degraded',
    quota: '42% remaining',
    latencyMs: 690,
    costHint: '$0.0018 / 1K tokens',
    availability: '98.94%',
    sdkVersion: 'deepseek@1.1.2',
    lastSyncedAt: new Date().toISOString(),
    modalities: ['streaming', 'json'],
    lastTestedAt: new Date().toISOString(),
    wallet: '$62.00',
    credits: '3900',
    subscription: 'starter',
    limitations: ['peak-time latency spikes'],
    capabilities: {
      chat: true,
      streaming: true,
      reasoning: true,
      vision: false,
      image: false,
      audio: false,
      embeddings: true,
      functionCalling: true,
      toolCalling: true,
      jsonMode: true,
      webSearch: false,
      multimodal: false,
    },
  },
  {
    id: 'mistral',
    label: 'Mistral',
    type: 'llm',
    status: 'enabled',
    health: 'healthy',
    quota: '59% remaining',
    latencyMs: 380,
    costHint: '$0.0022 / 1K tokens',
    availability: '99.76%',
    sdkVersion: 'mistralai@1.2.3',
    lastSyncedAt: new Date().toISOString(),
    modalities: ['streaming', 'json', 'embedding'],
    lastTestedAt: new Date().toISOString(),
    wallet: '$74.00',
    credits: '4760',
    subscription: 'professional',
    limitations: ['vision requires partner endpoint'],
    capabilities: {
      chat: true,
      streaming: true,
      reasoning: true,
      vision: false,
      image: false,
      audio: false,
      embeddings: true,
      functionCalling: true,
      toolCalling: true,
      jsonMode: true,
      webSearch: false,
      multimodal: false,
    },
  },
  {
    id: 'grok',
    label: 'Grok',
    type: 'llm',
    status: 'enabled',
    health: 'degraded',
    quota: '38% remaining',
    latencyMs: 740,
    costHint: '$0.0035 / 1K tokens',
    availability: '98.66%',
    sdkVersion: 'xai@0.9.0',
    lastSyncedAt: new Date().toISOString(),
    modalities: ['streaming', 'json', 'image'],
    lastTestedAt: new Date().toISOString(),
    wallet: '$58.00',
    credits: '3120',
    subscription: 'starter',
    limitations: ['tool calling in preview'],
    capabilities: {
      chat: true,
      streaming: true,
      reasoning: true,
      vision: true,
      image: true,
      audio: false,
      embeddings: false,
      functionCalling: true,
      toolCalling: true,
      jsonMode: true,
      webSearch: true,
      multimodal: true,
    },
  },
  {
    id: 'qwen',
    label: 'Qwen',
    type: 'llm',
    status: 'enabled',
    health: 'healthy',
    quota: '64% remaining',
    latencyMs: 410,
    costHint: '$0.0015 / 1K tokens',
    availability: '99.52%',
    sdkVersion: 'qwen@0.6.4',
    lastSyncedAt: new Date().toISOString(),
    modalities: ['streaming', 'json', 'vision', 'audio'],
    lastTestedAt: new Date().toISOString(),
    wallet: '$70.00',
    credits: '5010',
    subscription: 'business',
    limitations: ['regional endpoint variance'],
    capabilities: {
      chat: true,
      streaming: true,
      reasoning: true,
      vision: true,
      image: false,
      audio: true,
      embeddings: true,
      functionCalling: true,
      toolCalling: true,
      jsonMode: true,
      webSearch: false,
      multimodal: true,
    },
  },
]

export class ProviderWorkspaceService {
  private static memoryItems = defaultProviders()
  private static memoryRuns: ProviderDiagnosticRun[] = []

  private static normalize(item: Partial<ProviderWorkspaceItem>, fallback: ProviderWorkspaceItem): ProviderWorkspaceItem {
    return {
      ...fallback,
      ...item,
      modalities: Array.isArray(item.modalities) ? item.modalities : fallback.modalities,
      limitations: Array.isArray(item.limitations) ? item.limitations : fallback.limitations,
      capabilities: {
        ...fallback.capabilities,
        ...(item.capabilities ?? {}),
      },
    }
  }

  static getCapabilityTaxonomy(item: ProviderWorkspaceItem): Array<{ category: string; capabilities: string[] }> {
    const enabled = Object.entries(item.capabilities).filter(([, value]) => value).map(([key]) => key)
    return [
      {
        category: 'core',
        capabilities: enabled.filter((value) => value === 'chat' || value === 'streaming' || value === 'reasoning' || value === 'jsonMode'),
      },
      {
        category: 'multimodal',
        capabilities: enabled.filter((value) => value === 'vision' || value === 'image' || value === 'audio' || value === 'multimodal'),
      },
      {
        category: 'orchestration',
        capabilities: enabled.filter((value) => value === 'toolCalling' || value === 'functionCalling' || value === 'webSearch' || value === 'embeddings'),
      },
    ]
  }

  static list(): ProviderWorkspaceItem[] {
    if (typeof window === 'undefined') {
      return this.memoryItems
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const next = defaultProviders()
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      }

      const parsed = JSON.parse(raw) as ProviderWorkspaceItem[]
      if (!Array.isArray(parsed)) {
        return defaultProviders()
      }
      const defaults = defaultProviders()
      return parsed.map((item, index) => this.normalize(item, defaults[index] ?? defaults[0]))
    } catch {
      return defaultProviders()
    }
  }

  static toggle(providerId: string): ProviderWorkspaceItem[] {
    const next: ProviderWorkspaceItem[] = this.list().map((item) =>
      item.id === providerId
        ? {
            ...item,
            status: item.status === 'enabled' ? 'disabled' : 'enabled',
            health: item.status === 'enabled' ? 'offline' : 'healthy',
            latencyMs: item.status === 'enabled' ? 0 : Math.max(60, item.latencyMs || 260),
            availability: item.status === 'enabled' ? '0%' : item.availability,
            lastSyncedAt: new Date().toISOString(),
            lastTestedAt: new Date().toISOString(),
          }
        : item,
    )
    this.persist(next)
    return next
  }

  static listTestRuns(): ProviderDiagnosticRun[] {
    if (typeof window === 'undefined') {
      return this.memoryRuns
    }

    try {
      const raw = window.localStorage.getItem(TEST_RUNS_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as ProviderDiagnosticRun[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  static getLatestTestRun(providerId: string): ProviderDiagnosticRun | undefined {
    return this.listTestRuns().find((item) => item.providerId === providerId)
  }

  static downloadTestRun(runId: string, format: 'json' | 'markdown'): void {
    const run = this.listTestRuns().find((item) => item.id === runId)
    if (!run) return

    if (format === 'json') {
      WorkspaceExchangeService.downloadJson(`srg-provider-test-${run.providerId}.json`, run)
      return
    }

    const lines = [
      `# Provider Test Report - ${run.providerLabel}`,
      '',
      `- Provider: ${run.providerId}`,
      `- Started: ${run.startedAt}`,
      `- Completed: ${run.completedAt}`,
      `- Overall status: ${run.overallStatus}`,
      `- Passed: ${run.summary.passed}`,
      `- Failed: ${run.summary.failed}`,
      `- Not available: ${run.summary.notAvailable}`,
      '',
      '## Checks',
      '',
      ...run.checks.flatMap((check) => [
        `### ${check.label}`,
        `- Status: ${check.status}`,
        `- Duration: ${check.durationMs} ms`,
        `- Details: ${check.details}`,
        '',
      ]),
    ]
    WorkspaceExchangeService.downloadText(`srg-provider-test-${run.providerId}.md`, lines.join('\n'), 'text/markdown;charset=utf-8')
  }

  static async test(providerId: string): Promise<{ providers: ProviderWorkspaceItem[]; run: ProviderDiagnosticRun }> {
    const providerItem = this.list().find((item) => item.id === providerId)
    if (!providerItem) {
      throw new Error(`Unknown provider: ${providerId}`)
    }

    const startedAt = nowIso()
    const checks: ProviderDiagnosticCheck[] = []
    const adapter = this.createRuntimeAdapter(providerItem)

    checks.push({
      id: id('ptest-check'),
      label: 'Workspace catalog entry',
      status: 'passed',
      details: `${providerItem.label} is registered in the workspace catalog with status ${providerItem.status}.`,
      durationMs: 0,
    })

    checks.push({
      id: id('ptest-check'),
      label: 'Concrete provider adapter',
      status: adapter.provider ? 'passed' : 'failed',
      details: adapter.provider
        ? `Adapter ${adapter.adapterName} is available for runtime diagnostics.`
        : `No concrete adapter is implemented for ${providerItem.label}; catalog entry exists but runtime certification cannot execute.`,
      durationMs: 0,
    })

    if (!adapter.provider) {
      checks.push(this.notAvailableCheck('Configuration', 'Runtime adapter unavailable, configuration check skipped.'))
      checks.push(this.notAvailableCheck('Provider initialization', 'Runtime adapter unavailable, initialization skipped.'))
      checks.push(this.notAvailableCheck('Provider health', 'Runtime adapter unavailable, health check skipped.'))
      checks.push(this.notAvailableCheck('Execution engine request', 'Runtime adapter unavailable, execution engine request skipped.'))
      checks.push(this.notAvailableCheck('Generator engine request', 'Runtime adapter unavailable, generator engine request skipped.'))
      return this.completeTestRun(providerItem, startedAt, checks)
    }

    const configurationCheckStartedAt = Date.now()
    if (adapter.requiresApiKey && !adapter.apiKeyConfigured) {
      checks.push({
        id: id('ptest-check'),
        label: 'Configuration',
        status: 'failed',
        details: 'Required runtime secret is missing: VITE_OPENAI_API_KEY.',
        durationMs: Date.now() - configurationCheckStartedAt,
      })
      checks.push(this.notAvailableCheck('Provider initialization', 'Configuration failed, initialization skipped.'))
      checks.push(this.notAvailableCheck('Provider health', 'Configuration failed, health check skipped.'))
      checks.push(this.notAvailableCheck('Execution engine request', 'Configuration failed, execution engine request skipped.'))
      checks.push(this.notAvailableCheck('Generator engine request', 'Configuration failed, generator engine request skipped.'))
      return this.completeTestRun(providerItem, startedAt, checks)
    }

    checks.push({
      id: id('ptest-check'),
      label: 'Configuration',
      status: 'passed',
      details: adapter.requiresApiKey ? 'Runtime secret detected for provider diagnostics.' : 'No external secret required for this adapter.',
      durationMs: Date.now() - configurationCheckStartedAt,
    })

    try {
      const initializeStartedAt = Date.now()
      await adapter.provider.initialize()
      checks.push({
        id: id('ptest-check'),
        label: 'Provider initialization',
        status: 'passed',
        details: 'Provider adapter initialized successfully.',
        durationMs: Date.now() - initializeStartedAt,
      })

      const healthStartedAt = Date.now()
      const health = await adapter.provider.health()
      checks.push({
        id: id('ptest-check'),
        label: 'Provider health',
        status: health.availability > 0 ? 'passed' : 'failed',
        details: `Status=${health.status}; availability=${health.availability}; latency=${health.latency}.`,
        durationMs: Date.now() - healthStartedAt,
      })

      const registry = new ProviderRegistry()
      registry.register(adapter.provider)

      const executionStartedAt = Date.now()
      const executionEngine = new ExecutionEngine(
        {
          id: `provider-test-execution-${providerItem.id}`,
          name: 'Provider Test Execution Engine',
          category: 'service',
        },
        {},
        { providerRegistry: registry },
      )
      const executionResponse = await executionEngine.execute({
        id: id('ptest-execution'),
        generationId: id('ptest-generation'),
        input: 'Return exactly the token OK.',
        prompt: 'Return exactly the token OK.',
        metadata: { source: 'provider-diagnostics' },
      })
      checks.push({
        id: id('ptest-check'),
        label: 'Execution engine request',
        status: executionResponse.status === 'completed' ? 'passed' : 'failed',
        details: executionResponse.status === 'completed'
          ? `Execution completed with ${String(executionResponse.output ?? '').slice(0, 80) || 'empty output'}.`
          : `Execution failed: ${(executionResponse.errors ?? []).join(', ') || 'unknown error'}`,
        durationMs: Date.now() - executionStartedAt,
      })

      const generationStartedAt = Date.now()
      const generatorEngine = new GeneratorEngine(
        {
          id: `provider-test-generator-${providerItem.id}`,
          name: 'Provider Test Generator Engine',
          category: 'service',
        },
        {},
        { executionEngine },
      )
      const generationResponse = await generatorEngine.generate({
        id: id('ptest-generator'),
        task: 'Return exactly the token OK.',
        promptId: 'Return exactly the token OK.',
        metadata: { source: 'provider-diagnostics' },
      })
      checks.push({
        id: id('ptest-check'),
        label: 'Generator engine request',
        status: generationResponse.status === 'completed' ? 'passed' : 'failed',
        details: generationResponse.status === 'completed'
          ? `Generation completed with ${String(generationResponse.content ?? '').slice(0, 80) || 'empty output'}.`
          : `Generation failed: ${(generationResponse.errors ?? generationResponse.warnings ?? []).join(', ') || 'unknown error'}`,
        durationMs: Date.now() - generationStartedAt,
      })
    } catch (error) {
      checks.push({
        id: id('ptest-check'),
        label: 'Provider runtime failure',
        status: 'failed',
        details: error instanceof Error ? error.message : 'Unknown runtime failure.',
        durationMs: 0,
      })
    } finally {
      await adapter.provider.shutdown().catch(() => undefined)
    }

    return this.completeTestRun(providerItem, startedAt, checks)
  }

  private static persist(items: ProviderWorkspaceItem[]): void {
    if (typeof window === 'undefined') {
      this.memoryItems = items
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }

  private static persistRuns(runs: ProviderDiagnosticRun[]): void {
    if (typeof window === 'undefined') {
      this.memoryRuns = runs
      return
    }

    window.localStorage.setItem(TEST_RUNS_KEY, JSON.stringify(runs))
  }

  private static notAvailableCheck(label: string, details: string): ProviderDiagnosticCheck {
    return {
      id: id('ptest-check'),
      label,
      status: 'not_available',
      details,
      durationMs: 0,
    }
  }

  private static completeTestRun(providerItem: ProviderWorkspaceItem, startedAt: string, checks: ProviderDiagnosticCheck[]): { providers: ProviderWorkspaceItem[]; run: ProviderDiagnosticRun } {
    const summary = checks.reduce(
      (acc, check) => {
        if (check.status === 'passed') acc.passed += 1
        if (check.status === 'failed') acc.failed += 1
        if (check.status === 'not_available') acc.notAvailable += 1
        return acc
      },
      { passed: 0, failed: 0, notAvailable: 0 },
    )

    const overallStatus: ProviderDiagnosticStatus = summary.failed > 0 ? 'failed' : summary.notAvailable > 0 ? 'not_available' : 'passed'
    const latencyCheck = checks.find((item) => item.label === 'Provider health')
    const latencyMatch = latencyCheck?.details.match(/latency=(\d+)/)
    const providerHealth: ProviderWorkspaceHealth = overallStatus === 'passed' ? 'healthy' : overallStatus === 'failed' ? 'degraded' : 'offline'
    const nextProviders: ProviderWorkspaceItem[] = this.list().map((item) => (
      item.id === providerItem.id
        ? {
            ...item,
            health: providerHealth,
            latencyMs: latencyMatch ? Number(latencyMatch[1]) : item.latencyMs,
            availability: overallStatus === 'passed' ? item.availability : overallStatus === 'failed' ? 'runtime issues detected' : 'adapter unavailable',
            lastSyncedAt: nowIso(),
            lastTestedAt: nowIso(),
          }
        : item
    ))
    this.persist(nextProviders)

    const run: ProviderDiagnosticRun = {
      id: id('ptest-run'),
      providerId: providerItem.id,
      providerLabel: providerItem.label,
      startedAt,
      completedAt: nowIso(),
      overallStatus,
      checks,
      summary,
    }

    this.persistRuns([run, ...this.listTestRuns()].slice(0, 80))
    return { providers: nextProviders, run }
  }

  private static createRuntimeAdapter(providerItem: ProviderWorkspaceItem): {
    provider?: IProvider
    adapterName?: string
    requiresApiKey: boolean
    apiKeyConfigured: boolean
  } {
    if (providerItem.id === 'openai') {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
      return {
        provider: new OpenAIProviderFactory().create(
          {
            id: 'openai',
            name: 'OpenAI',
            capabilities: ['chat', 'completion', 'streaming', 'jsonMode', 'structuredOutput'],
            priority: 100,
          },
          {
            apiKey,
            defaultModel: 'gpt-4.1-mini',
          },
        ),
        adapterName: 'OpenAIProvider',
        requiresApiKey: true,
        apiKeyConfigured: typeof apiKey === 'string' && apiKey.trim().length > 0,
      }
    }

    return {
      provider: undefined,
      adapterName: undefined,
      requiresApiKey: false,
      apiKeyConfigured: false,
    }
  }
}