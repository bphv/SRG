import { createFileRoute } from '@tanstack/react-router'
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
  const { overview, kpis, recentActivity, health, systemResources } = dashboardState

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

      <Section title="KPI" description="Tableau de bord des indicateurs clés de performance.">
        <DashboardGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Projets" value={`${kpis.projects}`} />
          <MetricCard label="Générations" value={`${kpis.generations}`} />
          <MetricCard label="Prompts" value={`${kpis.prompts}`} />
          <MetricCard label="Providers" value={`${kpis.providers}`} />
        </DashboardGrid>
      </Section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <RecentActivity items={recentActivity} />
          <HealthPanel items={health} />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <SystemResources items={systemResources} />
        </div>
      </div>
    </div>
  )
}
