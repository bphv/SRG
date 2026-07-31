import { useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'
import { buildBreadcrumbs } from '#/app/services/BreadcrumbService'
import { navItems } from '#/app/navigation/navConfig'

export function useBreadcrumb() {
  const location = useLocation()

  return useMemo(
    () => buildBreadcrumbs(location.pathname, navItems),
    [location.pathname],
  )
}
