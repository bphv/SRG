/**
 * LifecycleHooks: definition of lifecycle hook names.
 */
export type LifecycleHook =
  | 'beforeInitialize'
  | 'afterInitialize'
  | 'beforeStart'
  | 'afterStart'
  | 'beforeStop'
  | 'afterStop'
  | 'beforeShutdown'
  | 'afterShutdown'

export interface LifecycleHooksMap {
  [hookName: string]: (() => Promise<void> | void)[]
}
