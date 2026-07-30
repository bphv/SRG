import type { JsonValue } from '#/types'
import type { ComponentCategory, ComponentType, ComponentStatus } from './ComponentTypes'

/**
 * ComponentMetadata describes the static metadata for any SRG component.
 */
export interface ComponentMetadata {
  id: string
  uuid?: string
  name: string
  displayName?: string
  version?: string
  author?: string
  owner?: string
  createdAt?: string
  updatedAt?: string
  status?: ComponentStatus
  category?: ComponentCategory
  domain?: string
  license?: string
  description?: string
  documentation?: string
  homepage?: string
  repository?: string
  keywords?: string[]
  configuration?: Record<string, JsonValue>
  tags?: string[]
  dependencies?: string[]
  type?: ComponentType
}
