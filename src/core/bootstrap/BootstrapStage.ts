/**
 * BootstrapStage: identifiers for each bootstrap step.
 */
export type BootstrapStage =
  | 'loadConfiguration'
  | 'initializeLogger'
  | 'buildRegistry'
  | 'discoverComponents'
  | 'registerComponents'
  | 'configureComponents'
  | 'initializeComponents'
  | 'validateComponents'
  | 'startComponents'
  | 'healthCheck'
  | 'ready'

export const ALL_BOOTSTRAP_STAGES: BootstrapStage[] = [
  'loadConfiguration',
  'initializeLogger',
  'buildRegistry',
  'discoverComponents',
  'registerComponents',
  'configureComponents',
  'initializeComponents',
  'validateComponents',
  'startComponents',
  'healthCheck',
  'ready',
]
