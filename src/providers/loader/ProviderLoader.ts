import type { IProviderLoader } from '#/providers/interfaces/IProviderLoader'
import type { IProvider } from '#/providers/interfaces/IProvider'

export class ProviderLoader implements IProviderLoader {
  async load(_source: string): Promise<IProvider[]> {
    return []
  }

  async discover(): Promise<IProvider[]> {
    return []
  }

  async reload(): Promise<IProvider[]> {
    return []
  }
}
