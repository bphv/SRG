/**
 * ComponentTypes: Enumerations and aliases for component categorization.
 */
export type ComponentCategory = 'core' | 'knowledge' | 'prompt' | 'agent' | 'generator' | 'connector' | 'plugin' | 'workflow' | 'domain' | 'service' | 'other'

export type ComponentType = string

export type ComponentStatus =
  | 'created'
  | 'registered'
  | 'configured'
  | 'initialized'
  | 'starting'
  | 'running'
  | 'paused'
  | 'stopped'
  | 'disposed'
  | 'failed'
