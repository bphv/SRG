import React, { createContext, useContext, useMemo, useState } from 'react'
import type { AppNavItem } from '#/app/navigation/navConfig'
import { navItems } from '#/app/navigation/navConfig'

type NavigationContextValue = {
  items: AppNavItem[]
  activeItem: AppNavItem | undefined
  setActivePath: (path: string) => void
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeItem, setActiveItem] = useState<AppNavItem | undefined>(navItems[0])

  const value = useMemo(
    () => ({
      items: navItems,
      activeItem,
      setActivePath: (path: string) => {
        const next = navItems.find((item) => item.path === path)
        setActiveItem(next)
      },
    }),
    [activeItem],
  )

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigationContext() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigationContext must be used inside NavigationProvider')
  }
  return context
}
