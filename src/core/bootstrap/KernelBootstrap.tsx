'use client'

import { useEffect } from 'react'
import { bootstrapKernel } from '.'

/**
 * Client-side kernel bootstrap component.
 * Guarantees the SRG kernel starts when the UI is mounted.
 */
export default function KernelBootstrap() {
  useEffect(() => {
    bootstrapKernel()
  }, [])

  return null
}
