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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--sea-ink)]">
      <div className="border-b border-[var(--line)] bg-[var(--header-bg)]/95 backdrop-blur-lg backdrop-saturate-150">
        <div className="page-wrap flex flex-wrap items-center gap-3 py-4">
          <Link to="/" className="flex items-center gap-3 rounded-3xl bg-[var(--surface)] px-4 py-3 text-sm font-semibold shadow-[0_18px_34px_rgba(30,90,72,0.08)] transition hover:bg-[var(--surface-strong)]">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--lagoon)] text-base">SRG</span>
            <span>SRG Studio</span>
          </Link>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <SearchBar placeholder="Search SRG…" value={shellSearch} onSearch={setShellSearch} onValueChange={setShellSearch} />
            <select
              value={selectedProvider}
              onChange={(event) => setSelectedProvider(event.target.value)}
              className="hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.08)] sm:block"
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
              className="hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--sea-ink)] transition hover:bg-[var(--surface-strong)] sm:inline-flex"
              onClick={() => setIsNotificationCenterOpen(true)}
              aria-expanded={isNotificationCenterOpen}
              aria-controls="notification-center-panel"
            >
              Notifications ({notifications.notifications.filter((item) => !item.read).length})
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:bg-[var(--surface-strong)]"
            >
              JD
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:bg-[var(--surface-strong)]"
              onClick={() => theme.setMode(theme.mode === 'light' ? 'dark' : 'light')}
            >
              {theme.resolvedMode === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      <div className="page-wrap grid gap-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className={`${isSidebarOpen ? 'block' : 'hidden'} rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)] lg:block`}>
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--lagoon-deep)]">Navigation</p>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--sea-ink)] lg:hidden"
              >
                Masquer
              </button>
            </div>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Explore the SRG workspace and settings.
            </p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`group flex flex-col gap-1 rounded-3xl border px-4 py-3 text-sm no-underline transition hover:border-[var(--lagoon)] hover:bg-[var(--surface-strong)] ${
                  activePage.path === item.path ? 'border-[var(--lagoon)] bg-[var(--surface-strong)]' : 'border-transparent'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-semibold text-[var(--sea-ink)]">{item.title}</span>
                <span className="text-xs text-[var(--sea-ink-soft)]">{item.description}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">
          <div className="flex flex-col gap-3 rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--lagoon-deep)]">{activePage.title}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--sea-ink)]">
                {activePage.description}
              </h2>
              {shellSearch ? <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">Recherche active: {shellSearch}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!isSidebarOpen ? (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--sea-ink)] lg:hidden"
                >
                  Navigation
                </button>
              ) : null}
              <ProviderBadge provider={selectedProvider === 'custom' ? 'OpenAI' : selectedProvider === 'anthropic' ? 'Anthropic' : selectedProvider === 'azure-openai' ? 'Azure OpenAI' : selectedProvider === 'cohere' ? 'Cohere' : 'OpenAI'} />
              <StatusBadge status="online" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--sea-ink-soft)]">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.path} className="inline-flex items-center gap-2">
                {index > 0 ? <span aria-hidden>›</span> : null}
                <Link to={crumb.path} className="text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]">
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
                <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--sea-ink-soft)] shadow-[0_24px_50px_rgba(13,30,14,0.26)]">
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

      <footer className="page-wrap border-t border-[var(--line)] py-10 text-sm text-[var(--sea-ink-soft)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>SRG Studio — official shell for the SRG application.</p>
          <p>Built for expansion, routing, and responsive workflows.</p>
        </div>
      </footer>
    </div>
  )
}
