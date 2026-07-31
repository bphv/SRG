import { Link, createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import DashboardGrid from '#/app/components/DashboardGrid'
import OverviewCard from '#/app/components/OverviewCard'
import MetricCard from '#/app/components/MetricCard'
import RecentActivity from '#/app/components/RecentActivity'
import HealthPanel from '#/app/components/HealthPanel'
import QuickActions from '#/app/components/QuickActions'
import SystemResources from '#/app/components/SystemResources'
import Loading from '#/app/components/Loading'
import { useDashboard } from '#/app/hooks/useDashboard'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { dashboardState, loading } = useDashboard()
  const {
    overview,
    kpis,
    recentActivity,
    health,
    systemResources,
    accountSummary,
    latestRuns,
    latestProjects,
    notifications,
    aiConsumption,
  } = dashboardState

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Your SRG command center." />
        <Section title="Actualisation des données" description="Récupération des dernières métriques SRG.">
          <Loading />
        </Section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your SRG command center." />

      <OverviewCard overview={overview} />

      <Section title="Bonjour utilisateur" description={overview.workspaceGreeting}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {accountSummary.map((item) => (
            <div key={item.label} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{item.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="KPI" description="Tableau de bord des indicateurs clés de performance.">
        <DashboardGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Projets" value={`${kpis.projects}`} />
          <MetricCard label="Générations" value={`${kpis.generations}`} />
          <MetricCard label="Prompts" value={`${kpis.prompts}`} />
          <MetricCard label="Providers" value={`${kpis.providers}`} />
        </DashboardGrid>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Temps moyen:</strong> {kpis.averageGenerationTime}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Taux de succes:</strong> {kpis.successRate}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Provider actif:</strong> {overview.activeProvider}</div>
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <RecentActivity items={recentActivity} />
          <HealthPanel items={health} />
          <Section title="Activite recente du workspace" description="Dernieres generations et derniers projets.">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Dernieres generations</p>
                <div className="mt-4 space-y-3 text-sm">
                  {latestRuns.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                      <p className="font-semibold text-[var(--sea-ink)]">{item.title}</p>
                      <p className="mt-1 text-[var(--sea-ink-soft)]">{item.meta}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Derniers projets</p>
                <div className="mt-4 space-y-3 text-sm">
                  {latestProjects.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                      <p className="font-semibold text-[var(--sea-ink)]">{item.title}</p>
                      <p className="mt-1 text-[var(--sea-ink-soft)]">{item.meta}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>
        <div className="space-y-6">
          <QuickActions />
          <SystemResources items={systemResources} />
          <Section title="Notifications" description="Messages systeme, wallet et generation.">
            <div className="space-y-3 text-sm">
              {notifications.map((item) => (
                <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
                  <p className="font-semibold text-[var(--sea-ink)]">{item.title}</p>
                  <p className="mt-1 text-[var(--sea-ink-soft)]">{item.meta}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Consommation IA" description="Graphiques simples de tokens et couts.">
            <div className="space-y-4">
              {aiConsumption.map((item) => {
                const width = Math.min(100, Math.max(8, item.value === 0 ? 8 : item.value % 100))
                return (
                  <div key={item.label} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <p className="font-semibold text-[var(--sea-ink)]">{item.label}</p>
                      <span className="text-[var(--sea-ink-soft)]">{item.value}</span>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-[var(--surface-strong)]">
                      <div className="h-3 rounded-full bg-[var(--lagoon-deep)]" style={{ width: `${width}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-[var(--sea-ink-soft)]">{item.helper}</p>
                  </div>
                )
              })}
            </div>
          </Section>
        </div>
      </div>

      <Section title="Raccourcis" description="Navigation rapide vers les principaux workspaces.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { to: '/projects', label: 'Ouvrir Projets' },
            { to: '/prompt-studio', label: 'Prompt Studio' },
            { to: '/generate', label: 'AI Playground' },
            { to: '/history', label: 'Voir History' },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4 text-sm font-semibold text-[var(--sea-ink)] shadow-[0_18px_34px_rgba(30,90,72,0.08)] transition hover:border-[var(--lagoon)]">
              {item.label}
            </Link>
          ))}
        </div>
      </Section>
    </div>
  )
}
