export type ThemePreferenceMode = 'light' | 'dark' | 'system'

export type WorkspacePreferences = {
  sidebarOpen: boolean
  themeMode: ThemePreferenceMode
  favoriteProvider: string
  favoriteModel: string
  recentPage: string
  pageLayouts: Record<string, string>
  tableSizes: Record<string, number>
  visibleColumns: Record<string, string[]>
  sorts: Record<string, string>
  filters: Record<string, Record<string, string | boolean | number>>
  favorites: Record<string, string[]>
}

const STORAGE_KEY = 'srg.workspace.preferences.v1'

const defaultPreferences = (): WorkspacePreferences => ({
  sidebarOpen: true,
  themeMode: 'system',
  favoriteProvider: 'openai',
  favoriteModel: 'gpt-4.1',
  recentPage: '/dashboard',
  pageLayouts: {},
  tableSizes: {},
  visibleColumns: {},
  sorts: {},
  filters: {},
  favorites: {},
})

export class WorkspacePreferencesService {
  private static memoryPreferences = defaultPreferences()

  static getPreferences(): WorkspacePreferences {
    if (typeof window === 'undefined') {
      return this.memoryPreferences
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const next = defaultPreferences()
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      }

      const parsed = JSON.parse(raw) as Partial<WorkspacePreferences>
      return {
        ...defaultPreferences(),
        ...parsed,
        pageLayouts: { ...defaultPreferences().pageLayouts, ...parsed.pageLayouts },
        tableSizes: { ...defaultPreferences().tableSizes, ...parsed.tableSizes },
        visibleColumns: { ...defaultPreferences().visibleColumns, ...parsed.visibleColumns },
        sorts: { ...defaultPreferences().sorts, ...parsed.sorts },
        filters: { ...defaultPreferences().filters, ...parsed.filters },
        favorites: { ...defaultPreferences().favorites, ...parsed.favorites },
      }
    } catch {
      return defaultPreferences()
    }
  }

  static setPreferences(next: WorkspacePreferences): WorkspacePreferences {
    this.memoryPreferences = next
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
    return next
  }

  static resetPreferences(): WorkspacePreferences {
    return this.setPreferences(defaultPreferences())
  }

  static updatePreferences(updater: (current: WorkspacePreferences) => WorkspacePreferences): WorkspacePreferences {
    const next = updater(this.getPreferences())
    return this.setPreferences(next)
  }

  static getThemeMode(): ThemePreferenceMode {
    return this.getPreferences().themeMode
  }

  static setThemeMode(mode: ThemePreferenceMode): void {
    this.updatePreferences((current) => ({ ...current, themeMode: mode }))
  }

  static setRecentPage(path: string): void {
    this.updatePreferences((current) => ({ ...current, recentPage: path }))
  }

  static setSidebarOpen(sidebarOpen: boolean): void {
    this.updatePreferences((current) => ({ ...current, sidebarOpen }))
  }

  static setFavoriteProvider(provider: string): void {
    this.updatePreferences((current) => ({ ...current, favoriteProvider: provider }))
  }

  static setFavoriteModel(model: string): void {
    this.updatePreferences((current) => ({ ...current, favoriteModel: model }))
  }

  static setPageLayout(pageId: string, layout: string): void {
    this.updatePreferences((current) => ({
      ...current,
      pageLayouts: { ...current.pageLayouts, [pageId]: layout },
    }))
  }

  static setTableSize(pageId: string, size: number): void {
    this.updatePreferences((current) => ({
      ...current,
      tableSizes: { ...current.tableSizes, [pageId]: size },
    }))
  }

  static setVisibleColumns(pageId: string, columns: string[]): void {
    this.updatePreferences((current) => ({
      ...current,
      visibleColumns: { ...current.visibleColumns, [pageId]: columns },
    }))
  }

  static setSort(pageId: string, sort: string): void {
    this.updatePreferences((current) => ({
      ...current,
      sorts: { ...current.sorts, [pageId]: sort },
    }))
  }

  static setFilters(pageId: string, filters: Record<string, string | boolean | number>): void {
    this.updatePreferences((current) => ({
      ...current,
      filters: { ...current.filters, [pageId]: filters },
    }))
  }

  static setFavorites(scope: string, ids: string[]): void {
    this.updatePreferences((current) => ({
      ...current,
      favorites: { ...current.favorites, [scope]: ids },
    }))
  }
}