import type { IProvider } from '#/providers/interfaces/IProvider'

export interface IProviderRegistry {
  register: (provider: IProvider) => void
  unregister: (id: string) => void
  find: (id: string) => IProvider | undefined
  findAll: () => IProvider[]
  findByCapability: (capability: string) => IProvider[]
}
