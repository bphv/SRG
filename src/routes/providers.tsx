import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import { useBusiness } from '#/app/hooks/useBusiness'
import { CollaborationWorkspaceService } from '#/app/services/CollaborationWorkspaceService'
import { ProviderWorkspaceService } from '#/app/services/ProviderWorkspaceService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export const Route = createFileRoute('/providers')({
  component: ProvidersPage,
})

function ProvidersPage() {
  const business = useBusiness()
  const [providers, setProviders] = useState(() => ProviderWorkspaceService.list())
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

  const enabledCount = providers.filter((item) => item.status === 'enabled').length
  const averageLatency = Math.round(providers.reduce((sum, item) => sum + item.latencyMs, 0) / Math.max(1, providers.length))

  return (
    <div className="space-y-6">
      <PageHeader title="Providers" description="Statut, sante, quota, latence, cout et disponibilite des providers IA." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Providers actifs</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{enabledCount}</p></div>
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Sains</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{providers.filter((item) => item.health === 'healthy').length}</p></div>
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Latence moyenne</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{averageLatency} ms</p></div>
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
                <p><strong>Health:</strong> {provider.health}</p>
                <p><strong>Quota:</strong> {provider.quota}</p>
                <p><strong>Latence:</strong> {provider.latencyMs} ms</p>
                <p><strong>Cout:</strong> {provider.costHint}</p>
                <p><strong>Disponibilite:</strong> {provider.availability}</p>
                <p><strong>Version SDK:</strong> {provider.sdkVersion}</p>
                <p><strong>Wallet:</strong> {provider.wallet}</p>
                <p><strong>Credits:</strong> {provider.credits}</p>
                <p><strong>Abonnement:</strong> {provider.subscription}</p>
                <p><strong>Derniere synchro:</strong> {new Date(provider.lastSyncedAt).toLocaleString()}</p>
                <p><strong>Modalites:</strong> {provider.modalities.join(', ')}</p>
                <p><strong>Dernier test:</strong> {new Date(provider.lastTestedAt).toLocaleString()}</p>
              </div>
              <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-3 text-xs">
                <p className="font-semibold text-[var(--sea-ink)]">Matrice de capacités</p>
                <div className="mt-2 space-y-2 text-[var(--sea-ink-soft)]">
                  {ProviderWorkspaceService.getCapabilityTaxonomy(provider).map((group) => (
                    <p key={group.category}><strong>{group.category}:</strong> {group.capabilities.length > 0 ? group.capabilities.join(', ') : 'none'}</p>
                  ))}
                </div>
                <p className="mt-2 text-[var(--sea-ink-soft)]"><strong>Limitations:</strong> {provider.limitations.join(', ')}</p>
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
                  onClick={() => {
                    setProviders(ProviderWorkspaceService.test(provider.id))
                    CollaborationWorkspaceService.logProviderUpdated({
                      actorId,
                      actorName,
                      providerId: provider.id,
                      action: 'tested',
                    })
                  }}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--sea-ink)]"
                >
                  Tester
                </button>
                <button type="button" onClick={() => setFavoriteProvider(provider.id)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--sea-ink)]">
                  {favoriteProvider === provider.id ? 'Favori actif' : 'Définir favori'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  )
}
