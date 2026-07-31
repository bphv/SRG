import type { IProvider } from '#/providers/interfaces/IProvider'

export interface IProviderResolver {
  resolve: (providers: IProvider[], capability?: string) => IProvider[]
  resolveBest: (providers: IProvider[], capability?: string) => IProvider | undefined
}
