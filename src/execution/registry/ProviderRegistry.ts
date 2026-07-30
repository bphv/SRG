import type { ExecutionProvider } from '#/execution/provider/ExecutionProvider'
import type { ProviderCapabilities } from '#/execution/provider/ProviderCapabilities'

export class ProviderRegistry {
  private readonly providers = new Map<string, ExecutionProvider>()

  register(provider: ExecutionProvider): void {
    this.providers.set(provider.id, provider)
  }

  unregister(id: string): void {
    this.providers.delete(id)
  }

  find(id: string): ExecutionProvider | undefined {
    return this.providers.get(id)
  }

  findAll(): ExecutionProvider[] {
    return Array.from(this.providers.values())
  }

  findByCapability(cap: keyof ProviderCapabilities): ExecutionProvider[] {
    const out: ExecutionProvider[] = []
    for (const p of this.providers.values()) {
      if (p.capabilities && p.capabilities[cap]) out.push(p)
    }
    return out
  }
}
