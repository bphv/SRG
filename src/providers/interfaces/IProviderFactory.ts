import type { IProvider } from '#/providers/interfaces/IProvider'

export interface IProviderFactory {
  create: (provider: IProvider) => IProvider
  destroy: (provider: IProvider) => void
}
