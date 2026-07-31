import type { AppNavItem } from '#/app/navigation/navConfig'

export type BreadcrumbSegment = {
  title: string
  path: string
}

export function buildBreadcrumbs(pathname: string, navItems: AppNavItem[]): BreadcrumbSegment[] {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  const segments = normalized.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbSegment[] = [
    { title: 'Home', path: '/' },
  ]

  if (segments.length === 0) {
    return breadcrumbs
  }

  let cumulative = ''
  for (const segment of segments) {
    cumulative += `/${segment}`
    const nav = navItems.find((item) => item.path === cumulative)
    breadcrumbs.push({ title: nav?.title ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()), path: cumulative })
  }

  return breadcrumbs
}
