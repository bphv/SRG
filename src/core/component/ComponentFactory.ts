import type { ComponentMetadata } from './ComponentMetadata'
import type { Component } from './Component'

/**
 * ComponentFactory: minimal generic factory to create components from metadata.
 * No business logic is implemented here — it merely maps metadata to a component instance.
 */
export interface ComponentFactory {
  create(metadata: ComponentMetadata): Component
}

export class DefaultComponentFactory implements ComponentFactory {
  create(metadata: ComponentMetadata): Component {
    // Basic default implementation: create a lightweight component wrapper.
    // Concrete engines will provide real implementations later.
    return new (class {
      metadata = metadata
      capabilities = {}
      state = { id: metadata.id, status: 'created' as const }
      context = {}
    })() as Component
  }
}
