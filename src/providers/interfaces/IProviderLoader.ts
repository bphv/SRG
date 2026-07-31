import type { IProvider } from '#/providers/interfaces/IProvider'

export interface IProviderLoader {
  load: (source: string) => Promise<IProvider[]>
  discover: () => Promise<IProvider[]>
  reload: () => Promise<IProvider[]>
}
