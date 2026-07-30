/**
 * ComponentCapabilities declares what a component provides and consumes.
 */
export interface ComponentProvides {
  services?: string[]
  events?: string[]
  api?: string[]
}

export interface ComponentConsumes {
  services?: string[]
  events?: string[]
  registries?: string[]
}

export interface ComponentCapabilities {
  provides?: ComponentProvides
  consumes?: ComponentConsumes
}
