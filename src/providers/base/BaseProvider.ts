import type { ProviderContract } from '#/contracts/provider/ProviderContract'
import type { ProviderStatus } from '#/providers/types/ProviderTypes'
import type { IProvider } from '#/providers/interfaces/IProvider'
import type { ProviderHealth } from '#/providers/health/ProviderHealth'

export abstract class BaseProvider implements IProvider {
  readonly id: string
  readonly name: string
  readonly version?: string
  readonly priority: number
  readonly capabilities: string[]
  status: ProviderStatus
  readonly metadata?: Record<string, unknown>

  constructor(contract: ProviderContract, status: ProviderStatus = 'initialized') {
    this.id = contract.id
    this.name = contract.name
    this.version = contract.version
    this.priority = contract.priority ?? 0
    this.capabilities = contract.capabilities
    this.status = status
    this.metadata = contract.metadata
  }

  async initialize(): Promise<void> {
    // stub
  }

  async health(): Promise<ProviderHealth> {
    return {
      status: this.status,
      latency: 0,
      availability: 0,
      lastCheck: new Date().toISOString(),
    }
  }

  supports(capability: string): boolean {
    return this.capabilities.includes(capability)
  }

  async execute(_request: unknown): Promise<unknown> {
    return Promise.resolve(undefined)
  }

  async shutdown(): Promise<void> {
    // stub
  }
}
