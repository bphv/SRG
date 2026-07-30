import { BaseRegistry } from './RegistryTypes'
import type { RegistryEntry } from './RegistryTypes'

export interface DomainEntry extends RegistryEntry {
  name: string
  description?: string
}

export class DomainRegistry extends BaseRegistry<DomainEntry> {}
