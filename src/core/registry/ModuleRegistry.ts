import { BaseRegistry } from './RegistryTypes'
import type { RegistryEntry } from './RegistryTypes'

export interface ModuleEntry extends RegistryEntry {
  name: string
  description?: string
}

export class ModuleRegistry extends BaseRegistry<ModuleEntry> {}
