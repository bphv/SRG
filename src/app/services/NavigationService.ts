import { navItems, type AppNavItem } from '#/app/navigation/navConfig'

export function getNavigationItems(): AppNavItem[] {
  return navItems
}

export function findNavigationItem(pathname: string): AppNavItem | undefined {
  return navItems.find((item) => item.path === pathname)
}
