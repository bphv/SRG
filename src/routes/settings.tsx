import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import { useNotifications } from '#/app/hooks/useNotifications'
import { useTheme } from '#/app/hooks/useTheme'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const theme = useTheme()
  const notifications = useNotifications()
  const [preferences, setPreferences] = useState(() => WorkspacePreferencesService.getPreferences())
  const [status, setStatus] = useState('')

  const syncPreferences = (updater: Parameters<typeof WorkspacePreferencesService.updatePreferences>[0], message: string) => {
    const next = WorkspacePreferencesService.updatePreferences(updater)
    setPreferences(next)
    setStatus(message)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configurez les préférences persistées du workspace, les layouts et les paramètres d’affichage."
        actions={
          <button
            type="button"
            onClick={() => {
              const next = WorkspacePreferencesService.resetPreferences()
              setPreferences(next)
              theme.setMode(next.themeMode)
              setStatus('Préférences réinitialisées.')
            }}
            className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)]"
          >
            Réinitialiser
          </button>
        }
      />

      <Section title="Workspace shell" description="Sidebar, thème et dernière page ouverte.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink)]">
            <span className="mb-3 block font-semibold">Sidebar</span>
            <span className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.sidebarOpen}
                onChange={(event) => syncPreferences((current) => ({ ...current, sidebarOpen: event.target.checked }), 'Préférence de sidebar enregistrée.')}
              />
              <span>{preferences.sidebarOpen ? 'Ouverte' : 'Réduite'}</span>
            </span>
          </label>

          <label className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink)]">
            <span className="mb-3 block font-semibold">Thème</span>
            <select
              value={theme.mode}
              onChange={(event) => {
                theme.setMode(event.target.value as 'light' | 'dark' | 'system')
                setPreferences(WorkspacePreferencesService.getPreferences())
                setStatus('Préférence de thème enregistrée.')
              }}
              className="w-full rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </label>

          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink)]">
            <span className="mb-3 block font-semibold">Dernière page</span>
            <p className="text-[var(--sea-ink-soft)]">{preferences.recentPage}</p>
          </div>

          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink)]">
            <span className="mb-3 block font-semibold">Notifications</span>
            <p className="text-[var(--sea-ink-soft)]">{notifications.notifications.filter((item) => !item.read).length} non lue(s)</p>
          </div>
        </div>
      </Section>

      <Section title="AI defaults" description="Provider et modèle favoris réutilisés dans les workspaces.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-[var(--sea-ink)]">
            <span className="font-semibold">Provider favori</span>
            <select
              value={preferences.favoriteProvider}
              onChange={(event) => syncPreferences((current) => ({ ...current, favoriteProvider: event.target.value }), 'Provider favori mis à jour.')}
              className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="azure-openai">Azure OpenAI</option>
              <option value="cohere">Cohere</option>
              <option value="mock">Mock</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm text-[var(--sea-ink)]">
            <span className="font-semibold">Modèle favori</span>
            <input
              value={preferences.favoriteModel}
              onChange={(event) => syncPreferences((current) => ({ ...current, favoriteModel: event.target.value }), 'Modèle favori mis à jour.')}
              className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3"
            />
          </label>
        </div>
      </Section>

      <Section title="Layouts et tables" description="Vue, taille des tableaux, tri et colonnes visibles persistés côté application.">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
            <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Layouts</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                { id: 'projects', label: 'Projects' },
                { id: 'prompt-templates', label: 'Templates' },
                { id: 'history', label: 'History' },
                { id: 'providers', label: 'Providers' },
              ].map((item) => (
                <label key={item.id} className="grid gap-2 text-sm text-[var(--sea-ink)]">
                  <span className="font-semibold">{item.label}</span>
                  <select
                    value={preferences.pageLayouts[item.id] ?? 'grid'}
                    onChange={(event) => syncPreferences((current) => ({
                      ...current,
                      pageLayouts: { ...current.pageLayouts, [item.id]: event.target.value },
                    }), `Layout ${item.label} enregistré.`)}
                    className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3"
                  >
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                    <option value="split">Split</option>
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
            <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Tables</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                { id: 'history', label: 'History size' },
                { id: 'providers', label: 'Providers size' },
                { id: 'notifications', label: 'Notifications size' },
                { id: 'sessions', label: 'Sessions size' },
              ].map((item) => (
                <label key={item.id} className="grid gap-2 text-sm text-[var(--sea-ink)]">
                  <span className="font-semibold">{item.label}</span>
                  <input
                    type="number"
                    min={3}
                    max={50}
                    value={preferences.tableSizes[item.id] ?? 8}
                    onChange={(event) => syncPreferences((current) => ({
                      ...current,
                      tableSizes: { ...current.tableSizes, [item.id]: Number(event.target.value) },
                    }), `Taille ${item.label} enregistrée.`)}
                    className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Colonnes, tri et filtres" description="Aperçu des préférences enregistrées par workspace.">
        {Object.keys(preferences.sorts).length === 0 && Object.keys(preferences.filters).length === 0 ? (
          <EmptyState
            eyebrow="Préférences"
            illustration={<span aria-hidden>☰</span>}
            title="Aucune préférence avancée enregistrée"
            description="Les tris, filtres et colonnes visibles apparaîtront ici dès qu’une page les persiste."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
              <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Tris</h3>
              <pre className="mt-4 whitespace-pre-wrap break-words text-xs text-[var(--sea-ink-soft)]">{JSON.stringify(preferences.sorts, null, 2)}</pre>
            </div>
            <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
              <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Filtres</h3>
              <pre className="mt-4 whitespace-pre-wrap break-words text-xs text-[var(--sea-ink-soft)]">{JSON.stringify(preferences.filters, null, 2)}</pre>
            </div>
            <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
              <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Colonnes visibles</h3>
              <pre className="mt-4 whitespace-pre-wrap break-words text-xs text-[var(--sea-ink-soft)]">{JSON.stringify(preferences.visibleColumns, null, 2)}</pre>
            </div>
          </div>
        )}
      </Section>

      {status ? <p className="text-sm text-[var(--sea-ink-soft)]">{status}</p> : null}
    </div>
  )
}
