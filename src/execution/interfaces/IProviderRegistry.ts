import type { ExecutionProvider } from '#/execution/provider/ExecutionProvider'
import type { ProviderCapabilities } from '#/execution/provider/ProviderCapabilities'

export interface IProviderRegistry {
  register: (provider: ExecutionProvider) => void
  unregister: (id: string) => void
  find: (id: string) => ExecutionProvider | undefined
  findAll: () => ExecutionProvider[]
  findByCapability: (cap: keyof ProviderCapabilities) => ExecutionProvider[]
}
