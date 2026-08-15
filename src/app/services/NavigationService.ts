/**
 * NavigationService — façade de lecture au-dessus de navConfig.
 *
 * SOURCE DE VERITE UNIQUE DE NAVIGATION: src/app/navigation/navConfig.ts (navItems).
 * Ce service ne definit AUCUNE navigation parallele: il expose uniquement
 * des helpers de lecture pour les couches kernel/services qui ne doivent pas
 * importer directement la config UI.
 *
 * Consommateurs UI officiels de navConfig: AppShell, NavigationContext,
 * BreadcrumbService/useBreadcrumb, command palette, settings.
 */
import { navItems } from '#/app/navigation/navConfig'
import type { AppNavItem } from '#/app/navigation/navConfig'

export function getNavigationItems(): AppNavItem[] {
  return navItems
}

export function findNavigationItem(pathname: string): AppNavItem | undefined {
  return navItems.find((item) => item.path === pathname)
}
