import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import { ProviderWorkspaceService } from '#/app/services/ProviderWorkspaceService'

export const Route = createFileRoute('/providers')({
  component: ProvidersPage,
})

function ProvidersPage() {
  const [providers, setProviders] = useState(() => ProviderWorkspaceService.list())

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
        <div className="grid gap-4 xl:grid-cols-2">
          {providers.map((provider) => (
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
                <p><strong>Dernier test:</strong> {new Date(provider.lastTestedAt).toLocaleString()}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setProviders(ProviderWorkspaceService.toggle(provider.id))} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-xs font-semibold text-white">
                  {provider.status === 'enabled' ? 'Desactiver' : 'Activer'}
                </button>
                <button type="button" onClick={() => setProviders(ProviderWorkspaceService.test(provider.id))} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--sea-ink)]">
                  Tester
                </button>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  )
}
