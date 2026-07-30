import type { ComponentMetadata } from './ComponentMetadata'
import type { ComponentCapabilities } from './ComponentCapabilities'
import type { ComponentState } from './ComponentState'
import { ComponentLifecycle } from './ComponentLifecycle'
import type { ComponentContext } from './ComponentContext'

/**
 * Component: base class for all SRG components.
 * Combines metadata, capabilities, lifecycle, state and runtime context.
 */
export abstract class Component extends ComponentLifecycle {
  readonly metadata: ComponentMetadata
  readonly capabilities: ComponentCapabilities
  state: ComponentState
  context: ComponentContext

  constructor(metadata: ComponentMetadata, capabilities: ComponentCapabilities = {}, context: ComponentContext = {}) {
    super()
    this.metadata = metadata
    this.capabilities = capabilities
    this.context = context
    this.state = { id: metadata.id, status: metadata.status ?? 'created' }
  }

  // Lifecycle methods inherited from ComponentLifecycle (stubs).
}

export type ComponentConstructor<T extends Component = Component> = new (metadata: ComponentMetadata, capabilities?: ComponentCapabilities, context?: ComponentContext) => T
