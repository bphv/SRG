import type { IProviderResolver } from '#/providers/interfaces/IProviderResolver'
import type { IProvider } from '#/providers/interfaces/IProvider'

export class ProviderResolver implements IProviderResolver {
  resolve(providers: IProvider[], _capability?: string): IProvider[] {
    return providers
  }

  resolveBest(providers: IProvider[], _capability?: string): IProvider | undefined {
    return providers.sort((a, b) => b.priority - a.priority)[0]
  }
}
