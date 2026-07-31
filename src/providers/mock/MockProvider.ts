import { BaseProvider } from '#/providers/base/BaseProvider'
import type { ProviderContract } from '#/contracts/provider/ProviderContract'
import type { ExecutionResponse } from '#/execution/response/ExecutionResponse'
import type { ProviderHealth } from '#/providers/health/ProviderHealth'
import { MockProviderCapabilities } from '#/providers/mock/MockProviderCapabilities'

export class MockProvider extends BaseProvider {
  constructor(contract: ProviderContract) {
    super(contract, 'available')
  }

  async initialize(): Promise<void> {
    this.status = 'available'
  }

  async health(): Promise<ProviderHealth> {
    return {
      status: this.status,
      latency: 0,
      availability: 100,
      lastCheck: new Date().toISOString(),
    }
  }

  supports(capability: string): boolean {
    return Object.keys(MockProviderCapabilities).includes(capability)
  }

  async execute(_request: unknown): Promise<ExecutionResponse> {
    return {
      id: this.id,
      status: 'completed',
      output: 'Mock response generated successfully.',
      artifacts: [],
      logs: ['MockProvider executed successfully.'],
      metrics: {
        tokensInput: 5,
        tokensOutput: 7,
        duration: 0,
      },
      metadata: {
        provider: 'mock',
      },
    }
  }

  async shutdown(): Promise<void> {
    this.status = 'offline'
  }
}
