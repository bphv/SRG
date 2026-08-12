import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { navItems } from '#/app/navigation/navConfig'
import SmartInputBar from '#/app/components/SmartInputBar'
import ProviderBadge from '#/app/components/ProviderBadge'
import StatusBadge from '#/app/components/StatusBadge'
import TenantSwitcher from '#/app/components/TenantSwitcher'
import { useAskSrgRuntimeContext } from '#/app/contexts/AskSrgRuntimeContext'
import { useTenantContext } from '#/app/contexts/TenantContext'
import { useNotifications } from '#/app/hooks/useNotifications'
import { useTheme } from '#/app/hooks/useTheme'
import { useBreadcrumb } from '#/app/hooks/useBreadcrumb'
import { useBusiness } from '#/app/hooks/useBusiness'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

const NotificationCenter = lazy(() => import('#/app/components/NotificationCenter'))

function getNavSection(itemPath: string): string {
  if (itemPath.startsWith('/dashboard')) {
    return 'Accueil'
  }
  if (itemPath.startsWith('/chat')) {
    return 'Ask SRG'
  }
  if (itemPath.startsWith('/projects') || itemPath.startsWith('/project-execution') || itemPath.startsWith('/finance') || itemPath.startsWith('/human-resources') || itemPath.startsWith('/maintenance') || itemPath.startsWith('/procurement-inventory')) {
    return 'Workspaces'
  }
  if (itemPath.startsWith('/knowledge-center') || itemPath.startsWith('/knowledge-intelligence')) {
    return 'Centre de connaissances'
  }
  if (itemPath.startsWith('/prompt') || itemPath.startsWith('/reviews')) {
    return 'Documents'
  }
  if (itemPath.startsWith('/history')) {
    return 'Historique'
  }
  if (itemPath.startsWith('/enterprise-insights') || itemPath.startsWith('/strategic-advisor') || itemPath.startsWith('/observability') || itemPath.startsWith('/management-control')) {
    return 'Analyses'
  }
  if (itemPath.startsWith('/workflow-automation') || itemPath.startsWith('/agents') || itemPath.startsWith('/generate')) {
    return 'Automatisation'
  }
  if (itemPath.startsWith('/administration') || itemPath.startsWith('/auth') || itemPath.startsWith('/providers')) {
    return 'Administration'
  }
  if (itemPath.startsWith('/settings') || itemPath.startsWith('/profile')) {
    return 'Parametres'
  }
  return 'Reunions'
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const breadcrumbs = useBreadcrumb()
  const notifications = useNotifications()
  const theme = useTheme()
  const tenant = useTenantContext()
  const askSrgRuntime = useAskSrgRuntimeContext()
  const business = useBusiness()
  const [shellSearch, setShellSearch] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => WorkspacePreferencesService.getPreferences().sidebarOpen)
  const [selectedProvider, setSelectedProvider] = useState(() => WorkspacePreferencesService.getPreferences().favoriteProvider)
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [commandRevision, setCommandRevision] = useState(0)

  const activePage = useMemo(
    () => navItems.find((item) => item.path === location.pathname) ?? navItems[0],
    [location.pathname],
  )

  const commandActions = useMemo(() => {
    const prefs = WorkspacePreferencesService.getPreferences()
    return [
      {
        id: 'cmd-theme-toggle',
        title: 'Toggle Theme',
        description: 'Switch between light and dark mode',
        run: () => theme.setMode(theme.mode === 'light' ? 'dark' : 'light'),
      },
      {
        id: 'cmd-sidebar-toggle',
        title: isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar',
        description: 'Toggle workspace navigation sidebar',
        run: () => setIsSidebarOpen((current) => !current),
      },
      {
        id: 'cmd-notifications',
        title: 'Open Notifications',
        description: 'Open notification center panel',
        run: () => setIsNotificationCenterOpen(true),
      },
      {
        id: 'cmd-recent-page',
        title: 'Go To Recent Page',
        description: prefs.recentPage,
        run: () => navigate({ to: prefs.recentPage as never }),
      },
    ]
  }, [isSidebarOpen, navigate, theme])

  const allCommands = useMemo(() => {
    const navCommands = navItems.map((item) => ({
      id: `nav-${item.id}`,
      title: item.title,
      description: item.description,
      run: () => navigate({ to: item.path as never }),
      favoriteScope: 'commands-nav',
    }))

    return [...navCommands, ...commandActions]
  }, [commandActions, navigate])

  const filteredCommands = useMemo(() => {
    const query = commandQuery.trim().toLowerCase()
    const prefs = WorkspacePreferencesService.getPreferences()
    const ranked = allCommands
      .filter((command) => {
        if (!query) return true
        return `${command.title} ${command.description}`.toLowerCase().includes(query)
      })
      .sort((left, right) => {
        const leftFav = prefs.commandFavorites.includes(left.id) ? 1 : 0
        const rightFav = prefs.commandFavorites.includes(right.id) ? 1 : 0
        return rightFav - leftFav
      })

    return ranked.slice(0, 18)
  }, [allCommands, commandQuery, commandRevision])

  const navSections = useMemo(() => {
    const grouped = new Map<string, typeof navItems>()
    navItems.forEach((item) => {
      const section = getNavSection(item.path)
      const current = grouped.get(section) ?? []
      grouped.set(section, [...current, item])
    })
    return Array.from(grouped.entries())
  }, [])

  useEffect(() => {
    WorkspacePreferencesService.setRecentPage(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    WorkspacePreferencesService.setSidebarOpen(isSidebarOpen)
  }, [isSidebarOpen])

  useEffect(() => {
    WorkspacePreferencesService.setFavoriteProvider(selectedProvider)
  }, [selectedProvider])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsCommandPaletteOpen(true)
        return
      }

      if (event.key === 'Escape') {
        setIsCommandPaletteOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const runCommand = (commandId: string) => {
    const command = allCommands.find((item) => item.id === commandId)
    if (!command) return
    command.run()
    setIsCommandPaletteOpen(false)
  }

  const runtimeBadges = [
    { label: 'Ask SRG Ready', status: 'Prepared' },
    { label: 'Tenant Ready', status: 'Prepared' },
    { label: 'Memory Ready', status: 'Placeholder' },
  ]

  const isFocusExperience =
    location.pathname === '/' ||
    location.pathname === '/chat' ||
    location.pathname === '/account-pending' ||
    location.pathname === '/categories' ||
    location.pathname.startsWith('/category/') ||
    location.pathname.startsWith('/conversation/')

  useEffect(() => {
    const userId = business.currentSession?.userId
    if (!userId) {
      return
    }

    const user = business.snapshot.users.find((item) => item.id === userId)
    if (!user) {
      return
    }

    const hasAccess = user.role === 'SuperAdmin' || user.role === 'Admin' || user.accountStatus === 'APPROVED'
    if (hasAccess) {
      return
    }

    const allowedPath =
      location.pathname === '/' ||
      location.pathname === '/auth' ||
      location.pathname === '/account-pending' ||
      location.pathname === '/chat' ||
      location.pathname === '/categories' ||
      location.pathname.startsWith('/category/') ||
      location.pathname.startsWith('/conversation/')

    if (!allowedPath) {
      navigate({ to: '/account-pending', search: { status: user.accountStatus } })
    }
  }, [business.currentSession?.userId, business.snapshot.users, location.pathname, navigate])

  if (isFocusExperience) {
    return <>{children}</>
  }

  return (
    <div className="srg-workspace min-h-screen bg-[var(--srg-bg)] text-[var(--srg-text-body)]">
      <div className="srg-glass-header">
        <div className="page-wrap flex flex-wrap items-center gap-3 py-4">
          <Link to="/" className="flex items-center gap-3 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm font-semibold shadow-[var(--srg-shadow-sm)] transition hover:bg-[var(--srg-hover)] no-underline">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--srg-color-primary-500)] text-base text-white">SRG</span>
            <span>SRG Enterprise Intelligence Platform</span>
          </Link>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <div className="min-w-[20rem] max-w-[40rem] flex-1">
              <SmartInputBar
              placeholder="Search Enterprise Intelligence"
              value={shellSearch}
              onSubmit={(value) => {
                setShellSearch(value)
                WorkspacePreferencesService.pushRecentSearch(value)
              }}
              onValueChange={setShellSearch}
              mode="search"
              persistKey="app-shell-search"
              submitLabel="Rechercher"
              showDropzone={false}
              compact
            />
            </div>
            <button
              type="button"
              className="hidden rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-xs font-semibold text-[var(--srg-text-muted)] transition hover:bg-[var(--srg-hover)] lg:inline-flex"
              onClick={() => setIsCommandPaletteOpen(true)}
              aria-label="Open command palette"
            >
              Ctrl + K
            </button>
            <div className="hidden xl:block">
              <TenantSwitcher />
            </div>
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
              className="hidden rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm text-[var(--srg-text-body)] transition hover:bg-[var(--srg-hover)] lg:inline-flex"
              onClick={() => navigate({ to: '/history' })}
              aria-label="Open calendar and timeline"
            >
              Calendrier
            </button>
            <button
              type="button"
              className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-body)] transition hover:bg-[var(--srg-hover)]"
              onClick={() => navigate({ to: '/chat' })}
              aria-label="Open Ask SRG"
            >
              Ask SRG
            </button>
            <button
              type="button"
              className="hidden rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm text-[var(--srg-text-body)] transition hover:bg-[var(--srg-hover)] lg:inline-flex"
              onClick={() => navigate({ to: '/profile' })}
              aria-label="Open profile"
            >
              Profil
            </button>
            <div className="hidden rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-xs text-[var(--srg-text-muted)] lg:block">
              <p className="font-semibold text-[var(--srg-text-title)]">{tenant.activeUser}</p>
              <p>{tenant.activeEnterprise}</p>
              <p className="mt-1">Tenant: {tenant.tenantId}</p>
            </div>
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

      <div className="page-wrap grid gap-6 py-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          className={`${isSidebarOpen ? 'block' : 'hidden'} srg-premium-panel srg-shell-sidebar p-5 lg:block`}
        >
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
          <nav className="space-y-3">
            {navSections.map(([sectionName, sectionItems]) => (
              <div key={sectionName}>
                <div className="srg-nav-section-title">{sectionName}</div>
                <div className="srg-nav-divider" />
                <div className="space-y-2">
                  {sectionItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`srg-shell-nav-link group flex flex-col gap-1 rounded-3xl border px-4 py-3 text-sm no-underline transition ${
                        activePage.path === item.path ? 'border-[var(--srg-color-warning-500)] bg-[color-mix(in_oklab,var(--srg-official-gold)_14%,var(--srg-official-navy))]' : 'border-transparent'
                      }`}
                      data-active={activePage.path === item.path ? 'true' : 'false'}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="font-semibold text-[var(--srg-shell-text)]">{item.title}</span>
                      <span className="text-xs text-[var(--srg-shell-muted)]">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="srg-shell-context mt-5 rounded-2xl border p-3 text-xs text-[var(--srg-shell-muted)]">
            <p className="font-semibold text-[var(--srg-shell-text)]">Workspace actif</p>
            <p className="mt-1">{tenant.workspaceName}</p>
            <p className="mt-1">Tenant: {tenant.tenantId}</p>
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-[color-mix(in_oklab,var(--srg-official-gold)_24%,transparent)] bg-[color-mix(in_oklab,white_6%,transparent)] px-3 py-2 text-xs font-semibold text-[var(--srg-shell-text)]"
              onClick={() => navigate({ to: '/chat' })}
            >
              Open Ask SRG
            </button>
          </div>

          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.18em] text-[var(--srg-shell-muted)]">SRG Enterprise Navigation</p>
        </aside>

        <main className="space-y-6">
          <div className="srg-shell-summary srg-fade-up flex flex-col gap-3 rounded-[2rem] border p-5 shadow-[var(--srg-shadow-md)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="srg-label">{activePage.title}</p>
              <h2 className="srg-h2 mt-2 text-2xl font-semibold tracking-tight text-[var(--srg-text-title)]">
                {activePage.description}
              </h2>
              {shellSearch ? <p className="mt-2 text-sm text-[var(--srg-text-muted)]">Recherche active: {shellSearch}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {runtimeBadges.map((badge) => (
                  <span
                    key={badge.label}
                    className={`srg-badge ${badge.label.includes('Ask SRG') ? 'srg-badge-ai' : badge.label.includes('Tenant') ? 'srg-badge-tenant' : 'srg-badge-ready'}`}
                  >
                    <span className="h-2 w-2 rounded-full bg-[var(--srg-color-primary-500)]" />
                    {badge.label}: {badge.status}
                  </span>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-xs text-[var(--srg-text-muted)]">
                  <p className="font-semibold text-[var(--srg-text-body)]">Active enterprise</p>
                  <p className="mt-1">{tenant.activeEnterprise}</p>
                  <p className="mt-1">{tenant.workspaceName} · {tenant.tenantId}</p>
                </div>
                <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-xs text-[var(--srg-text-muted)]">
                  <p className="font-semibold text-[var(--srg-text-body)]">Workspace Context</p>
                  <p className="mt-1">Workspace courant: {askSrgRuntime.session.workspace}</p>
                  <p className="mt-1">Entreprise: {tenant.activeEnterprise}</p>
                  <p className="mt-1">Utilisateur: {askSrgRuntime.session.userId}</p>
                  <p className="mt-1">Langue: {askSrgRuntime.session.language}</p>
                  <p className="mt-1">Module actif: {activePage.title}</p>
                </div>
                <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-xs text-[var(--srg-text-muted)]">
                  <p className="font-semibold text-[var(--srg-text-body)]">Consulted modules</p>
                  <p className="mt-1">{tenant.consultedModules.join(' · ')}</p>
                  <p className="mt-1">Conversations: {tenant.conversations}</p>
                  <p className="mt-1">Documents: {tenant.documents}</p>
                </div>
              </div>
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

          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[var(--srg-text-muted)]">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <span key={crumb.path} className="inline-flex items-center gap-2">
                  {index > 0 ? <span aria-hidden>›</span> : null}
                  <Link to={crumb.path} className="text-[var(--srg-text-muted)] hover:text-[var(--srg-text-title)]" aria-current={isLast ? 'page' : undefined}>
                    {crumb.title}
                  </Link>
                </span>
              )
            })}
          </nav>

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

      {isCommandPaletteOpen ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/35 p-4 pt-20" role="dialog" aria-modal="true" aria-label="Command palette">
          <div className="w-full max-w-2xl rounded-[1.5rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 shadow-[var(--srg-shadow-lg)]">
            <SmartInputBar
              placeholder="Type a command or search a page"
              value={commandQuery}
              onSubmit={setCommandQuery}
              onValueChange={setCommandQuery}
              mode="command"
              submitLabel="Executer"
              showDropzone={false}
            />
            <div className="mt-3 max-h-[60vh] overflow-y-auto">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--srg-text-muted)]">Quick commands</p>
                <button
                  type="button"
                  className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-2 py-1 text-xs text-[var(--srg-text-muted)]"
                  onClick={() => setIsCommandPaletteOpen(false)}
                >
                  Esc
                </button>
              </div>
              <div className="space-y-2">
                {filteredCommands.map((command) => {
                  const favorite = WorkspacePreferencesService.getPreferences().commandFavorites.includes(command.id)
                  return (
                    <div key={command.id} className="flex items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-2">
                      <button
                        type="button"
                        onClick={() => runCommand(command.id)}
                        className="flex-1 rounded-xl px-2 py-2 text-left transition hover:bg-[var(--srg-hover)]"
                      >
                        <p className="text-sm font-semibold text-[var(--srg-text-title)]">{command.title}</p>
                        <p className="text-xs text-[var(--srg-text-muted)]">{command.description}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          WorkspacePreferencesService.toggleCommandFavorite(command.id)
                          setCommandRevision((current) => current + 1)
                        }}
                        className={`rounded-xl border px-2 py-1 text-xs ${favorite ? 'border-[var(--srg-color-primary-400)] bg-[var(--srg-hover)] text-[var(--srg-color-primary-600)]' : 'border-[var(--srg-border)] bg-[var(--srg-surface)] text-[var(--srg-text-muted)]'}`}
                        aria-label={`Toggle favorite for ${command.title}`}
                      >
                        {favorite ? '★' : '☆'}
                      </button>
                    </div>
                  )
                })}
                {filteredCommands.length === 0 ? (
                  <p className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-muted)]">
                    No command found for this query.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="srg-shell-footer mt-8 py-10 text-sm">
        <div className="page-wrap">
        <div className="grid gap-6 lg:grid-cols-5">
          <div>
            <p className="srg-footer-title font-semibold">SRG</p>
            <p className="mt-2 text-xs">Enterprise Premium Intelligence Platform</p>
            <p className="mt-2 text-xs">Devise: Build clarity at scale.</p>
          </div>
          <div>
            <p className="srg-footer-title font-semibold">Navigation rapide</p>
            <div className="mt-2 space-y-1 text-xs">
              <p>Dashboard</p>
              <p>Ask SRG</p>
              <p>Enterprise Insights</p>
              <p>Workflow Automation</p>
            </div>
          </div>
          <div>
            <p className="srg-footer-title font-semibold">Solutions & Ressources</p>
            <div className="mt-2 space-y-1 text-xs">
              <p>Operations</p>
              <p>Finance</p>
              <p>Knowledge Center</p>
              <p>Developers</p>
            </div>
          </div>
          <div>
            <p className="srg-footer-title font-semibold">Confidentialite & Contact</p>
            <div className="mt-2 space-y-1 text-xs">
              <p>Confidentialite</p>
              <p>Conformite</p>
              <p>Contact</p>
              <p>Reseaux sociaux</p>
            </div>
          </div>
          <div>
            <p className="srg-footer-title font-semibold">Preferences</p>
            <div className="mt-2 space-y-2 text-xs">
              <select aria-label="Language selector" className="w-full rounded-xl border px-2 py-1">
                <option>Francais</option>
                <option>English</option>
                <option>Español</option>
              </select>
              <p>Theme: {theme.resolvedMode}</p>
              <p>Version: v1.0.0-premium</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-[color-mix(in_oklab,var(--srg-official-gold)_18%,transparent)] pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SRG Enterprise Intelligence Platform</p>
          <p>All rights reserved.</p>
        </div>
        </div>
      </footer>
    </div>
  )
}
