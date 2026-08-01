import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import PageHeader from '#/app/components/PageHeader'
import SearchBar from '#/app/components/SearchBar'
import Section from '#/app/components/Section'
import { useBusiness } from '#/app/hooks/useBusiness'
import { CollaborationWorkspaceService } from '#/app/services/CollaborationWorkspaceService'
import type { ProviderWorkspaceHealth, ProviderWorkspaceItem } from '#/app/services/ProviderWorkspaceService'
import { ProviderWorkspaceService } from '#/app/services/ProviderWorkspaceService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'
import DataTable from '#/app/components/ui/DataTable'
import type { DataTableColumn } from '#/app/components/ui/DataTable'
import Button from '#/app/components/ui/Button'
import { Field, FieldGroup, FormSection } from '#/app/components/ui/FormPrimitives'

export const Route = createFileRoute('/providers')({
  component: ProvidersPage,
})

function ProvidersPage() {
  const business = useBusiness()
  const [providers, setProviders] = useState(() => ProviderWorkspaceService.list())
  const preferences = WorkspacePreferencesService.getPreferences()
  const [search, setSearch] = useState('')
  const [healthFilter, setHealthFilter] = useState<'all' | ProviderWorkspaceHealth>('all')
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

  const toggleProvider = (provider: ProviderWorkspaceItem) => {
    setProviders(ProviderWorkspaceService.toggle(provider.id))
    CollaborationWorkspaceService.logProviderUpdated({
      actorId,
      actorName,
      providerId: provider.id,
      action: provider.status === 'enabled' ? 'disabled' : 'enabled',
    })
  }

  const testProvider = (provider: ProviderWorkspaceItem) => {
    setProviders(ProviderWorkspaceService.test(provider.id))
    CollaborationWorkspaceService.logProviderUpdated({
      actorId,
      actorName,
      providerId: provider.id,
      action: 'tested',
    })
  }

  const bulkActions = [
    {
      label: 'Enable selected',
      onClick: (rows: ProviderWorkspaceItem[]) => {
        let next = ProviderWorkspaceService.list()
        rows.forEach((row) => {
          const current = next.find((item) => item.id === row.id)
          if (current?.status === 'disabled') {
            next = ProviderWorkspaceService.toggle(row.id)
            CollaborationWorkspaceService.logProviderUpdated({
              actorId,
              actorName,
              providerId: row.id,
              action: 'enabled',
            })
          }
        })
        setProviders(next)
      },
    },
    {
      label: 'Disable selected',
      onClick: (rows: ProviderWorkspaceItem[]) => {
        let next = ProviderWorkspaceService.list()
        rows.forEach((row) => {
          const current = next.find((item) => item.id === row.id)
          if (current?.status === 'enabled') {
            next = ProviderWorkspaceService.toggle(row.id)
            CollaborationWorkspaceService.logProviderUpdated({
              actorId,
              actorName,
              providerId: row.id,
              action: 'disabled',
            })
          }
        })
        setProviders(next)
      },
    },
    {
      label: 'Test selected',
      onClick: (rows: ProviderWorkspaceItem[]) => {
        let next = ProviderWorkspaceService.list()
        rows.forEach((row) => {
          next = ProviderWorkspaceService.test(row.id)
          CollaborationWorkspaceService.logProviderUpdated({
            actorId,
            actorName,
            providerId: row.id,
            action: 'tested',
          })
        })
        setProviders(next)
      },
    },
  ]

  const columns: Array<DataTableColumn<ProviderWorkspaceItem>> = [
    {
      key: 'label',
      label: 'Provider',
      sortable: true,
      render: (row: ProviderWorkspaceItem) => (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--srg-text-title)]">{row.label}</p>
          <p className="text-xs text-[var(--srg-text-muted)]">{row.type} · {row.sdkVersion}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: ProviderWorkspaceItem) => (
        <span className="rounded-full bg-[var(--srg-surface-strong)] px-3 py-1 text-xs text-[var(--srg-text-muted)]">{row.status}</span>
      ),
    },
    {
      key: 'health',
      label: 'Health',
      sortable: true,
      render: (row: ProviderWorkspaceItem) => (
        <span className="rounded-full bg-[var(--srg-surface-strong)] px-3 py-1 text-xs text-[var(--srg-text-muted)]">{row.health}</span>
      ),
    },
    {
      key: 'latencyMs',
      label: 'Latency',
      sortable: true,
      render: (row: ProviderWorkspaceItem) => `${row.latencyMs} ms`,
    },
    {
      key: 'quota',
      label: 'Quota',
      sortable: true,
    },
    {
      key: 'costHint',
      label: 'Cost',
      sortable: true,
    },
    {
      key: 'modalities',
      label: 'Modalities',
      render: (row: ProviderWorkspaceItem) => row.modalities.join(', '),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (row: ProviderWorkspaceItem) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => toggleProvider(row)}>{row.status === 'enabled' ? 'Disable' : 'Enable'}</Button>
          <Button size="sm" variant="secondary" onClick={() => testProvider(row)}>Test</Button>
          <Button size="sm" variant="secondary" onClick={() => setFavoriteProvider(row.id)}>{favoriteProvider === row.id ? 'Favorite active' : 'Set favorite'}</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Providers" description="Status, health, quota, latency, cost and availability of AI providers." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Providers actifs</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{enabledCount}</p></div>
        <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Sains</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{providers.filter((item) => item.health === 'healthy').length}</p></div>
        <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Latence moyenne</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{averageLatency} ms</p></div>
        <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Disponibilite max</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">100%</p></div>
      </div>

      <Section title="Provider operations" description="Search, filter, sort and run bulk actions with persisted table settings.">
        <FormSection title="Filters" description="Workspace-level filters for provider operations.">
          <FieldGroup columns={3}>
            <Field label="Search">
              <SearchBar
                placeholder="Search provider, SDK or modality"
                value={search}
                onSearch={(value) => setSearch(value)}
                onValueChange={setSearch}
                instant
                persistKey="providers-search"
              />
            </Field>
            <Field label="Health state">
              <select value={healthFilter} onChange={(event) => setHealthFilter(event.target.value as 'all' | ProviderWorkspaceHealth)}>
                <option value="all">All states</option>
                <option value="healthy">Healthy</option>
                <option value="degraded">Degraded</option>
                <option value="offline">Offline</option>
              </select>
            </Field>
            <Field label="Favorite provider" hint="Persisted in workspace preferences.">
              <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm text-[var(--srg-text-title)]">{favoriteProvider}</div>
            </Field>
          </FieldGroup>
        </FormSection>

        {filteredProviders.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              eyebrow="Providers"
              illustration={<span aria-hidden>◎</span>}
              title="No provider visible"
              description="No provider matches the active search or health filter."
            />
          </div>
        ) : (
          <div className="mt-4">
            <DataTable
              tableId="providers-workspace-table"
              title="Provider inventory"
              rows={filteredProviders}
              columns={columns}
              searchable={false}
              pageSize={8}
              exportFileName="srg-providers-table.csv"
              multiSelect
              bulkActions={bulkActions}
            />
          </div>
        )}
      </Section>
    </div>
  )
}
