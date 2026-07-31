export type ProviderWorkspaceHealth = 'healthy' | 'degraded' | 'offline'

export type ProviderWorkspaceItem = {
  id: string
  label: string
  type: 'llm' | 'vision' | 'audio' | 'image' | 'embedding'
  status: 'enabled' | 'disabled'
  health: ProviderWorkspaceHealth
  quota: string
  latencyMs: number
  costHint: string
  availability: string
  lastTestedAt: string
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
    lastTestedAt: new Date().toISOString(),
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    type: 'llm',
    status: 'enabled',
    health: 'healthy',
    quota: '61% remaining',
    latencyMs: 410,
    costHint: '$0.003 / 1K tokens',
    availability: '99.70%',
    lastTestedAt: new Date().toISOString(),
  },
  {
    id: 'azure-openai',
    label: 'Azure OpenAI',
    type: 'vision',
    status: 'enabled',
    health: 'degraded',
    quota: '48% remaining',
    latencyMs: 620,
    costHint: '$0.004 / 1K tokens',
    availability: '98.90%',
    lastTestedAt: new Date().toISOString(),
  },
  {
    id: 'cohere',
    label: 'Cohere',
    type: 'embedding',
    status: 'disabled',
    health: 'offline',
    quota: '0% provisioned',
    latencyMs: 0,
    costHint: '$0.001 / 1K tokens',
    availability: '0%',
    lastTestedAt: new Date().toISOString(),
  },
  {
    id: 'mock',
    label: 'Mock Provider',
    type: 'image',
    status: 'enabled',
    health: 'healthy',
    quota: 'Unlimited local',
    latencyMs: 40,
    costHint: 'Local sandbox',
    availability: '100%',
    lastTestedAt: new Date().toISOString(),
  },
]

export class ProviderWorkspaceService {
  private static memoryItems = defaultProviders()

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
      return Array.isArray(parsed) ? parsed : defaultProviders()
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
        health: enabled ? (item.id === 'azure-openai' ? 'degraded' : 'healthy') : 'offline',
        latencyMs: enabled ? Math.max(55, Math.round((item.latencyMs || 200) * 0.92)) : 0,
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