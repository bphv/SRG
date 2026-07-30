import { BaseRegistry } from './RegistryTypes'
import type { RegistryEntry } from './RegistryTypes'

export interface PromptEntry extends RegistryEntry {
  name: string
  description?: string
}

export class PromptRegistry extends BaseRegistry<PromptEntry> {}
