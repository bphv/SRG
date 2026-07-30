import type { ProviderCapabilities } from './ProviderCapabilities'

export interface ExecutionProvider {
  id: string
  name: string
  version?: string
  capabilities: ProviderCapabilities
  priority?: number
  enabled?: boolean
  metadata?: Record<string, unknown>

  canHandle?(capability: keyof ProviderCapabilities): boolean
  execute?(request: unknown): Promise<unknown>
}
