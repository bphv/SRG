import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import { useBusiness } from '#/app/hooks/useBusiness'
import { CollaborationWorkspaceService } from '#/app/services/CollaborationWorkspaceService'
import { ProviderWorkspaceService } from '#/app/services/ProviderWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export const Route = createFileRoute('/providers')({
  component: ProvidersPage,
})

function ProvidersPage() {
  const business = useBusiness()
  const [providers, setProviders] = useState(() => ProviderWorkspaceService.list())
  const [testRuns, setTestRuns] = useState(() => ProviderWorkspaceService.listTestRuns())
  const [runningProviderId, setRunningProviderId] = useState<string | null>(null)
  const preferences = WorkspacePreferencesService.getPreferences()
  const [search, setSearch] = useState('')
  const [healthFilter, setHealthFilter] = useState<'all' | 'healthy' | 'degraded' | 'offline'>('all')
  const [favoriteProvider, setFavoriteProvider] = useState(preferences.favoriteProvider)
  const actorId = business.currentSession ? business.currentSession.userId : (business.snapshot.users[0]?.id ?? 'system')
  const actorName = business.snapshot.users.find((item) => item.id === actorId)?.username ?? 'System'

  useEffect(() => {
    WorkspacePreferencesService.setFavoriteProvider(favoriteProvider)
  }, [favoriteProvider])

  const filteredProviders = useMemo(() => providers.filter((provider) => {
    const query = search.trim().toLowerCase()
    if (healthFilter !== 'all' && provider.health !== healthFilter) {
      return false
    }
    if (!query) {
      return true
    }
    return `${provider.label} ${provider.sdkVersion} ${provider.type} ${provider.modalities.join(' ')}`.toLowerCase().includes(query)
  }), [providers, search, healthFilter])

  const latestRuns = useMemo(
    () => new Map(testRuns.map((run) => [run.providerId, run])),
    [testRuns],
  )

  const enabledCount = providers.filter((item) => item.status === 'enabled').length

  return (
    <div className="space-y-6">
      <PageHeader title="Providers" description="Statut, sante, quota, latence, cout et disponibilite des providers IA." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Providers actifs</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{enabledCount}</p></div>
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Sains</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{providers.filter((item) => item.health === 'healthy').length}</p></div>
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Latence moyenne</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{Math.round(providers.reduce((sum, item) => sum + item.latencyMs, 0) / Math.max(1, providers.length))} ms</p></div>
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Disponibilite max</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">100%</p></div>
      </div>

      <Section title="Providers" description="Activez, desactivez ou testez chaque provider visible du workspace.">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un provider, SDK ou modalité" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm" />
          <select value={healthFilter} onChange={(event) => setHealthFilter(event.target.value as 'all' | 'healthy' | 'degraded' | 'offline')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
            <option value="all">Tous les états</option>
            <option value="healthy">Healthy</option>
            <option value="degraded">Degraded</option>
            <option value="offline">Offline</option>
          </select>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink-soft)]">Provider favori: <span className="font-semibold text-[var(--sea-ink)]">{favoriteProvider}</span></div>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredProviders.length === 0 ? (
            <div className="xl:col-span-2">
              <EmptyState
                eyebrow="Providers"
                illustration={<span aria-hidden>◎</span>}
                title="Aucun provider visible"
                description="Aucun provider ne correspond à la recherche ou au filtre de santé actuel."
              />
            </div>
          ) : null}
          {filteredProviders.map((provider) => (
            <article key={provider.id} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">{provider.type}</p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--sea-ink)]">{provider.label}</h3>
                </div>
                <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs text-[var(--sea-ink-soft)]">{provider.health}</span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-[var(--sea-ink-soft)] sm:grid-cols-2">
                <p><strong>Statut:</strong> {provider.status}</p>
                <p><strong>Quota:</strong> {provider.quota}</p>
                <p><strong>Latence:</strong> {provider.latencyMs} ms</p>
                <p><strong>Cout:</strong> {provider.costHint}</p>
                <p><strong>Disponibilite:</strong> {provider.availability}</p>
                <p><strong>Version SDK:</strong> {provider.sdkVersion}</p>
                <p><strong>Derniere synchro:</strong> {new Date(provider.lastSyncedAt).toLocaleString()}</p>
                <p><strong>Modalites:</strong> {provider.modalities.join(', ')}</p>
                <p><strong>Dernier test:</strong> {new Date(provider.lastTestedAt).toLocaleString()}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProviders(ProviderWorkspaceService.toggle(provider.id))
                    CollaborationWorkspaceService.logProviderUpdated({
                      actorId,
                      actorName,
                      providerId: provider.id,
                      action: provider.status === 'enabled' ? 'disabled' : 'enabled',
                    })
                  }}
                  className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-xs font-semibold text-white"
                >
                  {provider.status === 'enabled' ? 'Desactiver' : 'Activer'}
                </button>
                <button
                  type="button"
                  disabled={runningProviderId === provider.id}
                  onClick={() => {
                    setRunningProviderId(provider.id)
                    void ProviderWorkspaceService.test(provider.id)
                      .then(({ providers: nextProviders, run }) => {
                        setProviders(nextProviders)
                        setTestRuns(ProviderWorkspaceService.listTestRuns())
                        CollaborationWorkspaceService.logProviderUpdated({
                          actorId,
                          actorName,
                          providerId: provider.id,
                          action: 'tested',
                        })
                        notificationService.publish({
                          title: 'Provider test completed',
                          message: `${provider.label}: ${run.overallStatus} (${run.summary.passed} pass, ${run.summary.failed} fail, ${run.summary.notAvailable} n/a).`,
                          level: run.overallStatus === 'passed' ? 'success' : run.overallStatus === 'failed' ? 'warning' : 'info',
                          priority: 'medium',
                          category: 'system',
                          read: false,
                        })
                      })
                      .catch((error) => {
                        notificationService.publish({
                          title: 'Provider test failed',
                          message: error instanceof Error ? error.message : 'Unable to run provider diagnostics.',
                          level: 'error',
                          priority: 'high',
                          category: 'system',
                          read: false,
                        })
                      })
                      .finally(() => setRunningProviderId(null))
                  }}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--sea-ink)]"
                >
                  {runningProviderId === provider.id ? 'Test en cours...' : 'Tester'}
                </button>
                <button type="button" onClick={() => setFavoriteProvider(provider.id)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--sea-ink)]">
                  {favoriteProvider === provider.id ? 'Favori actif' : 'Définir favori'}
                </button>
              </div>
              {latestRuns.get(provider.id) ? (
                <div className="mt-4 rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink-soft)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-[var(--sea-ink)]">Dernier diagnostic: {latestRuns.get(provider.id)?.overallStatus}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => ProviderWorkspaceService.downloadTestRun(latestRuns.get(provider.id)!.id, 'json')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--sea-ink)]">Export JSON</button>
                      <button type="button" onClick={() => ProviderWorkspaceService.downloadTestRun(latestRuns.get(provider.id)!.id, 'markdown')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--sea-ink)]">Export Markdown</button>
                    </div>
                  </div>
                  <p className="mt-2">Pass: {latestRuns.get(provider.id)?.summary.passed} | Fail: {latestRuns.get(provider.id)?.summary.failed} | N/A: {latestRuns.get(provider.id)?.summary.notAvailable}</p>
                  <div className="mt-3 space-y-2">
                    {latestRuns.get(provider.id)?.checks.map((check) => (
                      <div key={check.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
                        <p className="font-semibold text-[var(--sea-ink)]">{check.label} · {check.status}</p>
                        <p>{check.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </Section>
    </div>
  )
}
