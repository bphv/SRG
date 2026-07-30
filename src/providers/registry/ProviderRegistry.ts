import type { IProviderRegistry } from '#/providers/interfaces/IProviderRegistry'
import type { IProvider } from '#/providers/interfaces/IProvider'

export class ProviderRegistry implements IProviderRegistry {
  private readonly providers = new Map<string, IProvider>()

  register(provider: IProvider): void {
    this.providers.set(provider.id, provider)
  }

  unregister(id: string): void {
    this.providers.delete(id)
  }

  find(id: string): IProvider | undefined {
    return this.providers.get(id)
  }

  findAll(): IProvider[] {
    return Array.from(this.providers.values())
  }

  findByCapability(capability: string): IProvider[] {
    return Array.from(this.providers.values()).filter((provider) => provider.supports(capability))
  }
}
