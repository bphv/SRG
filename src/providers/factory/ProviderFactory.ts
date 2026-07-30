import type { IProviderFactory } from '#/providers/interfaces/IProviderFactory'
import type { IProvider } from '#/providers/interfaces/IProvider'

export class ProviderFactory implements IProviderFactory {
  create(provider: IProvider): IProvider {
    return provider
  }

  destroy(_provider: IProvider): void {
    // stub
  }
}
