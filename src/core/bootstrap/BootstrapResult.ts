/**
 * BootstrapResult: result for a single bootstrap stage execution.
 */
export interface BootstrapResult {
  stage: string
  success: boolean
  info?: unknown
}
