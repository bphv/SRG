import type { Component } from './Component'
import type { ComponentMetadata } from './ComponentMetadata'

/**
 * ComponentManager manages component registration and lifecycle.
 * All methods are stubs and contain no business logic at this stage.
 */
export class ComponentManager {
  private readonly components = new Map<string, Component>()

  install(metadata: ComponentMetadata): Component {
    // stub: create or register component
    const comp = metadata as unknown as Component
    this.components.set(metadata.id, comp)
    return comp
  }

  uninstall(id: string): void {
    this.components.delete(id)
  }

  activate(_id: string): void {
    // stub
  }

  deactivate(_id: string): void {
    // stub
  }

  update(_id: string, _metadata: Partial<ComponentMetadata>): void {
    // stub
  }

  load(id: string): Component | undefined {
    return this.components.get(id)
  }

  unload(id: string): void {
    this.components.delete(id)
  }

  list(): Component[] {
    return Array.from(this.components.values())
  }

  clear(): void {
    this.components.clear()
  }
}
