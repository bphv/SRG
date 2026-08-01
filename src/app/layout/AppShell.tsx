import { Link, useLocation } from '@tanstack/react-router'
import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { navItems } from '#/app/navigation/navConfig'
import SearchBar from '#/app/components/SearchBar'
import ProviderBadge from '#/app/components/ProviderBadge'
import StatusBadge from '#/app/components/StatusBadge'
import { useNotifications } from '#/app/hooks/useNotifications'
import { useTheme } from '#/app/hooks/useTheme'
import { useBreadcrumb } from '#/app/hooks/useBreadcrumb'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

const NotificationCenter = lazy(() => import('#/app/components/NotificationCenter'))

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const breadcrumbs = useBreadcrumb()
  const notifications = useNotifications()
  const theme = useTheme()
  const [shellSearch, setShellSearch] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => WorkspacePreferencesService.getPreferences().sidebarOpen)
  const [selectedProvider, setSelectedProvider] = useState(() => WorkspacePreferencesService.getPreferences().favoriteProvider)
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)

  const activePage = useMemo(
    () => navItems.find((item) => item.path === location.pathname) ?? navItems[0],
    [location.pathname],
  )

  useEffect(() => {
    WorkspacePreferencesService.setRecentPage(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    WorkspacePreferencesService.setSidebarOpen(isSidebarOpen)
  }, [isSidebarOpen])

  useEffect(() => {
    WorkspacePreferencesService.setFavoriteProvider(selectedProvider)
  }, [selectedProvider])

  return (
    <div className="srg-workspace min-h-screen bg-[var(--srg-bg)] text-[var(--srg-text-body)]">
      <div className="border-b border-[var(--srg-border)] bg-[var(--header-bg)]/95 backdrop-blur-lg backdrop-saturate-150">
        <div className="page-wrap flex flex-wrap items-center gap-3 py-4">
          <Link to="/" className="flex items-center gap-3 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm font-semibold shadow-[var(--srg-shadow-sm)] transition hover:bg-[var(--srg-hover)] no-underline">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--srg-color-primary-500)] text-base text-white">SRG</span>
            <span>SRG Studio</span>
          </Link>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <SearchBar placeholder="Search SRG…" value={shellSearch} onSearch={setShellSearch} onValueChange={setShellSearch} />
            <select
              value={selectedProvider}
              onChange={(event) => setSelectedProvider(event.target.value)}
              className="hidden rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm text-[var(--srg-text-body)] shadow-[var(--srg-shadow-sm)] sm:block"
              aria-label="Select provider"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="azure-openai">Azure OpenAI</option>
              <option value="cohere">Cohere</option>
              <option value="custom">Custom Provider</option>
            </select>
            <button
              type="button"
              className="hidden rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm text-[var(--srg-text-body)] transition hover:bg-[var(--srg-hover)] sm:inline-flex"
              onClick={() => setIsNotificationCenterOpen(true)}
              aria-expanded={isNotificationCenterOpen}
              aria-controls="notification-center-panel"
            >
              Notifications ({notifications.notifications.filter((item) => !item.read).length})
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm font-semibold text-[var(--srg-text-body)] transition hover:bg-[var(--srg-hover)]"
            >
              JD
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm font-semibold text-[var(--srg-text-body)] transition hover:bg-[var(--srg-hover)]"
              onClick={() => theme.setMode(theme.mode === 'light' ? 'dark' : 'light')}
            >
              {theme.resolvedMode === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      <div className="page-wrap grid gap-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className={`${isSidebarOpen ? 'block' : 'hidden'} rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)] lg:block`}>
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="srg-label">Navigation</p>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--srg-text-body)] lg:hidden"
              >
                Masquer
              </button>
            </div>
            <p className="text-sm text-[var(--srg-text-muted)]">
              Explore the SRG workspace and settings.
            </p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`group flex flex-col gap-1 rounded-3xl border px-4 py-3 text-sm no-underline transition hover:border-[var(--srg-color-primary-400)] hover:bg-[var(--srg-hover)] ${
                  activePage.path === item.path ? 'border-[var(--srg-color-primary-400)] bg-[var(--srg-hover)]' : 'border-transparent'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-semibold text-[var(--srg-text-title)]">{item.title}</span>
                <span className="text-xs text-[var(--srg-text-muted)]">{item.description}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">
          <div className="srg-fade-up flex flex-col gap-3 rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5 shadow-[var(--srg-shadow-md)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="srg-label">{activePage.title}</p>
              <h2 className="srg-h2 mt-2 text-2xl font-semibold tracking-tight text-[var(--srg-text-title)]">
                {activePage.description}
              </h2>
              {shellSearch ? <p className="mt-2 text-sm text-[var(--srg-text-muted)]">Recherche active: {shellSearch}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!isSidebarOpen ? (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-xs font-semibold text-[var(--srg-text-body)] lg:hidden"
                >
                  Navigation
                </button>
              ) : null}
              <ProviderBadge provider={selectedProvider === 'custom' ? 'OpenAI' : selectedProvider === 'anthropic' ? 'Anthropic' : selectedProvider === 'azure-openai' ? 'Azure OpenAI' : selectedProvider === 'cohere' ? 'Cohere' : 'OpenAI'} />
              <StatusBadge status="online" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--srg-text-muted)]">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.path} className="inline-flex items-center gap-2">
                {index > 0 ? <span aria-hidden>›</span> : null}
                <Link to={crumb.path} className="text-[var(--srg-text-muted)] hover:text-[var(--srg-text-title)]">
                  {crumb.title}
                </Link>
              </span>
            ))}
          </div>

          {children}
        </main>
      </div>

      {isNotificationCenterOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30 p-4 sm:p-6">
          <div id="notification-center-panel" className="w-full max-w-md">
            <Suspense
              fallback={
                <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 text-sm text-[var(--srg-text-muted)] shadow-[var(--srg-shadow-lg)]">
                  Chargement du centre de notifications…
                </div>
              }
            >
              <NotificationCenter
                notifications={notifications.notifications}
                onClose={() => setIsNotificationCenterOpen(false)}
                onDismiss={notifications.dismiss}
                onClear={notifications.clear}
                onMarkRead={notifications.markRead}
                onMarkAllRead={notifications.markAllRead}
              />
            </Suspense>
          </div>
        </div>
      ) : null}

      <footer className="page-wrap border-t border-[var(--srg-border)] py-10 text-sm text-[var(--srg-text-muted)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>SRG Studio — official shell for the SRG application.</p>
          <p>Built for expansion, routing, and responsive workflows.</p>
        </div>
      </footer>
    </div>
  )
}
