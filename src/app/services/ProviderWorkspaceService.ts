export type ProviderWorkspaceHealth = 'healthy' | 'degraded' | 'offline'

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

  static test(providerId: string): ProviderWorkspaceItem[] {
    const next: ProviderWorkspaceItem[] = this.list().map((item) => {
      if (item.id !== providerId) {
        return item
      }

      const enabled = item.status === 'enabled'
      return {
        ...item,
        health: enabled && item.id !== 'deepseek' && item.id !== 'grok' ? 'healthy' : enabled ? 'degraded' : 'offline',
        latencyMs: enabled ? Math.max(55, Math.round((item.latencyMs || 200) * 0.92)) : 0,
        availability: enabled ? item.availability : '0%',
        lastSyncedAt: new Date().toISOString(),
        lastTestedAt: new Date().toISOString(),
      }
    })
    this.persist(next)
    return next
  }

  private static persist(items: ProviderWorkspaceItem[]): void {
    if (typeof window === 'undefined') {
      this.memoryItems = items
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }
}