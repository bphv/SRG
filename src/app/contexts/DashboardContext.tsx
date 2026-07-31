import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DashboardService, type DashboardState } from '#/app/services/DashboardService'

type DashboardContextValue = {
  dashboardState: DashboardState
  loading: boolean
  refresh: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [dashboardState, setDashboardState] = useState<DashboardState>(DashboardService.getDashboardState())
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 250))
    setDashboardState(DashboardService.getDashboardState())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({ dashboardState, loading, refresh }),
    [dashboardState, loading],
  )

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboardContext() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboardContext must be used inside DashboardProvider')
  }
  return context
}
