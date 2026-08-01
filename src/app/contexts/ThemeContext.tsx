import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

type ThemeMode = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  mode: ThemeMode
  resolvedMode: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function resolveThemeMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system')
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const initialMode = WorkspacePreferencesService.getThemeMode()
    setMode(initialMode)
  }, [])

  useEffect(() => {
    const nextResolved = resolveThemeMode(mode)
    setResolvedMode(nextResolved)
    document.documentElement.classList.toggle('dark', nextResolved === 'dark')
    document.documentElement.classList.toggle('light', nextResolved === 'light')
    document.documentElement.setAttribute('data-theme', mode === 'system' ? 'auto' : mode)
    WorkspacePreferencesService.setThemeMode(mode)
  }, [mode])

  useEffect(() => {
    if (mode !== 'system') {
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => setResolvedMode(resolveThemeMode('system'))
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [mode])

  const value = useMemo(
    () => ({ mode, resolvedMode, setMode }),
    [mode, resolvedMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used inside ThemeProvider')
  }
  return context
}
