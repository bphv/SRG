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
import EmptyState from '#/app/components/EmptyState'
import WorkspaceSkeleton from '#/app/components/WorkspaceSkeleton'
import CollaborationActivityFeed from '#/app/components/collaboration/CollaborationActivityFeed'
import CollaborationGlobalSearch from '#/app/components/collaboration/CollaborationGlobalSearch'
import { useBusiness } from '#/app/hooks/useBusiness'
import { useDashboard } from '#/app/hooks/useDashboard'
import { ProjectService } from '#/app/services/ProjectService'
import { PromptService } from '#/app/services/PromptService'
import { CollaborationWorkspaceService } from '#/app/services/CollaborationWorkspaceService'
import { ConversationWorkspaceService } from '#/app/services/ConversationWorkspaceService'
import { AgentWorkspaceService } from '#/app/services/AgentWorkspaceService'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'
import { BusinessPolicyWorkspaceService } from '#/app/services/BusinessPolicyWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'
import { ProcurementInventoryWorkspaceService } from '#/app/services/ProcurementInventoryWorkspaceService'
import { MaintenanceWorkspaceService } from '#/app/services/MaintenanceWorkspaceService'
import { FinanceWorkspaceService } from '#/app/services/FinanceWorkspaceService'
import { HumanResourcesWorkspaceService } from '#/app/services/HumanResourcesWorkspaceService'
import { PromptCollectionService } from '#/app/services/PromptCollectionService'
import { PromptMarketplaceService } from '#/app/services/PromptMarketplaceService'
import { PromptReviewService } from '#/app/services/PromptReviewService'
import { PromptSharingService } from '#/app/services/PromptSharingService'
import { WorkflowWorkspaceService } from '#/app/services/WorkflowWorkspaceService'
import { EnterpriseInsightsWorkspaceService } from '#/app/services/EnterpriseInsightsWorkspaceService'
import { KnowledgeIntelligenceWorkspaceService } from '#/app/services/KnowledgeIntelligenceWorkspaceService'
import { StrategicAdvisorWorkspaceService } from '#/app/services/StrategicAdvisorWorkspaceService'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const business = useBusiness()
  const { dashboardState, loading } = useDashboard()
  const {
    overview,
    kpis,
    recentActivity,
    health,
    systemResources,
    accountSummary,
    walletSummary,
    latestRuns,
    latestProjects,
    latestPrompts,
    notifications,
    aiConsumption,
    activityChart,
  } = dashboardState

  const allProjects = ProjectService.getProjects().map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
  }))
  const allPrompts = PromptService.getPrompts().map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
  }))
  const allTemplates = allPrompts.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
  }))
  const allUsers = business.snapshot.users.map((item) => ({ id: item.id, username: item.username }))
  const recentCollabActivity = CollaborationWorkspaceService.getActivity('week').slice(0, 8)
  const latestValidations = recentCollabActivity.filter((item) => item.type.startsWith('validation')).slice(0, 4)
  const latestComments = recentCollabActivity.filter((item) => item.type === 'comment.added').slice(0, 4)
  const activeCollaborators = Array.from(
    new Set(
      CollaborationWorkspaceService.getStore().collaborators
        .filter((item) => item.status === 'active')
        .map((item) => item.username),
    ),
  ).slice(0, 8)
  const marketplaceRecords = PromptMarketplaceService.applyFilters(
    PromptMarketplaceService.hydrateFromPrompts('System'),
    PromptMarketplaceService.getFilters(),
  )
  const topMarketplace = [...marketplaceRecords].slice(0, 4)
  const publishedCount = marketplaceRecords.filter((item) => item.status === 'published').length
  const shareRecords = PromptSharingService.list()
  const reviewRecords = PromptReviewService.list()
  const collections = PromptCollectionService.list()

  const topDownloads = [...marketplaceRecords].sort((left, right) => right.downloads - left.downloads).slice(0, 4)
  const topReviews = [...marketplaceRecords].sort((left, right) => right.averageRating - left.averageRating || right.reviewCount - left.reviewCount).slice(0, 4)
  const topTrending = [...marketplaceRecords]
    .sort((left, right) => right.downloads + right.views + right.copies + right.favorites - (left.downloads + left.views + left.copies + left.favorites))
    .slice(0, 4)
  const topShared = Array.from(
    shareRecords.reduce((acc, share) => acc.set(share.promptId, (acc.get(share.promptId) ?? 0) + 1), new Map<string, number>()).entries(),
  )
    .map(([promptId, count]) => ({ promptId, count, prompt: marketplaceRecords.find((item) => item.promptId === promptId) }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 4)
  const topAuthors = Array.from(
    marketplaceRecords.reduce((acc, item) => acc.set(item.authorName, (acc.get(item.authorName) ?? 0) + 1), new Map<string, number>()).entries(),
  )
    .map(([authorName, count]) => ({ authorName, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 4)
  const topCategories = Array.from(
    marketplaceRecords.reduce((acc, item) => acc.set(item.category, (acc.get(item.category) ?? 0) + 1), new Map<string, number>()).entries(),
  )
    .map(([category, count]) => ({ category, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 4)
  const bestRated = [...marketplaceRecords].sort((left, right) => right.averageRating - left.averageRating || right.reviewCount - left.reviewCount).at(0)
  const mostShared = topShared.at(0)?.prompt
  const shareCount = shareRecords.length
  const reviewCount = reviewRecords.length
  const topCollections = [...collections].sort((left, right) => right.promptIds.length - left.promptIds.length).slice(0, 4)
  const conversationSummary = ConversationWorkspaceService.getGlobalSummary()
  const agentSummary = AgentWorkspaceService.getSummary()
  const knowledgeSummary = KnowledgeWorkspaceService.getSummary()
  const businessPolicySummary = BusinessPolicyWorkspaceService.getSummary()
  const projectExecutionSummary = ProjectExecutionWorkspaceService.getSummary()
  const procurementSummary = ProcurementInventoryWorkspaceService.getSummary()
  const maintenanceSummary = MaintenanceWorkspaceService.getSummary()
  const financeSummary = FinanceWorkspaceService.getSummary()
  const humanResourcesSummary = HumanResourcesWorkspaceService.getSummary()
  const workflowSummary = WorkflowWorkspaceService.getDashboardSummary()
  const enterpriseInsightsSummary = EnterpriseInsightsWorkspaceService.getExecutiveDashboard()
  const knowledgeIntelligenceSummary = KnowledgeIntelligenceWorkspaceService.getDashboardSummary()
  const strategicAdvisorSummary = StrategicAdvisorWorkspaceService.getExecutiveDashboard()
  const lastUpdated = `${overview.date} • ${overview.time}`
  const topAlerts = [...notifications].slice(0, 4)
  const topRisks = health.filter((item) => item.status !== 'online').slice(0, 4)
  const topOpportunities = [
    ...latestProjects.map((item) => ({ id: item.id, title: item.title, meta: item.meta })),
    ...latestPrompts.map((item) => ({ id: item.id, title: item.title, meta: item.meta })),
  ].slice(0, 4)
  const enterpriseReadiness = [
    { label: 'API status', value: 'UI Preview Only', helper: 'Future backend hookup ready from Settings.' },
    { label: 'Tenant mode', value: 'Prepared', helper: 'Visual isolation labels are ready.' },
    { label: 'Connectors', value: '23 Coming Soon', helper: 'ERP, CRM, cloud storage, BI, communication and industrial systems staged.' },
    { label: 'Security', value: 'Placeholder', helper: 'OAuth, JWT, permissions and audit logs reserved.' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Your SRG command center." />
        <WorkspaceSkeleton variant="dashboard" description="Récupération des dernières métriques SRG." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your SRG command center." />

      <OverviewCard overview={overview} />

      <Section title="Executive Summary" description="Vue consolidée des alertes, risques, opportunités et accès directs aux modules visibles.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Statut global</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">Operational</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Dernière mise à jour</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{lastUpdated}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top alerts</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{topAlerts.length}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top risks</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{topRisks.length}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top opportunities</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{topOpportunities.length}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Recent activity</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{recentActivity.length}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3 text-sm">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top alerts</p>
            <div className="mt-3 space-y-2 text-[var(--srg-text-muted)]">
              {topAlerts.length === 0 ? <p>Aucune alerte.</p> : topAlerts.map((item) => <p key={item.id}>{item.title} • {item.meta}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top risks</p>
            <div className="mt-3 space-y-2 text-[var(--srg-text-muted)]">
              {topRisks.length === 0 ? <p>Etat global stable.</p> : topRisks.map((item) => <p key={item.id}>{item.title} • {item.status} • {item.description}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top opportunities</p>
            <div className="mt-3 space-y-2 text-[var(--srg-text-muted)]">
              {topOpportunities.map((item) => <p key={item.id}>{item.title} • {item.meta}</p>)}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/enterprise-insights" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Voir Enterprise Insights</Link>
          <Link to="/strategic-advisor" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir Strategic Advisor</Link>
          <Link to="/knowledge-intelligence" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir Knowledge Intelligence</Link>
          <Link to="/workflow-automation" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir Workflow Automation</Link>
          <Link to="/history" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir History</Link>
          <Link to="/observability" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir Observability</Link>
        </div>
      </Section>

      <Section title="Enterprise Readiness" description="Préparation visuelle multi-entreprises sans backend ni API active.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {enterpriseReadiness.map((item) => (
            <div key={item.label} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{item.value}</p>
              <p className="mt-3 text-sm text-[var(--srg-text-muted)]">{item.helper}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/settings" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Configurer l’enterprise</Link>
          <Link to="/administration" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir Administration</Link>
          <Link to="/profile" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir Profile</Link>
        </div>
      </Section>

      <CollaborationGlobalSearch projects={allProjects} prompts={allPrompts} templates={allTemplates} users={allUsers} />

      <Section title="Bonjour utilisateur" description={overview.workspaceGreeting}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {accountSummary.map((item) => (
            <div key={item.label} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{item.value}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Wallet & credits" description="Suivi rapide de la consommation et du budget visible.">
        <div className="grid gap-4 md:grid-cols-2">
          {walletSummary.map((item) => (
            <div key={item.label} className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{item.value}</p>
              <p className="mt-3 text-sm text-[var(--srg-text-muted)]">{item.helper}</p>
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
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Temps moyen:</strong> {kpis.averageGenerationTime}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Taux de succes:</strong> {kpis.successRate}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Provider actif:</strong> {overview.activeProvider}</div>
        </div>
      </Section>

      <Section title="Enterprise Intelligence" description="Executive summary, top risks, opportunities and recommendations.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Confidence</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{enterpriseInsightsSummary.executiveSummary.confidence}%</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top recommendations</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{enterpriseInsightsSummary.topRecommendations.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top risks</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{enterpriseInsightsSummary.topRisks.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top opportunities</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{enterpriseInsightsSummary.topOpportunities.length}</p></div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2 text-sm">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Executive summary</p>
            <p className="mt-2 text-[var(--srg-text-muted)]">{enterpriseInsightsSummary.executiveSummary.overview}</p>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top recommendation</p>
            <p className="mt-2 text-[var(--srg-text-muted)]">{enterpriseInsightsSummary.topRecommendations[0]?.title ?? 'n/a'}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/enterprise-insights" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Enterprise Insights</Link>
        </div>
      </Section>

      <Section title="Strategic Advisor" description="Priorisation, recommandations, plans, simulations et actions strategiques.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Priorites</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{strategicAdvisorSummary.topPriorities.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Decisions</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{strategicAdvisorSummary.topDecisions.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Risques</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{strategicAdvisorSummary.strategicRisks.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Opportunites</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{strategicAdvisorSummary.strategicOpportunities.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Actions</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{strategicAdvisorSummary.strategicActions.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Confiance</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{strategicAdvisorSummary.confidence}%</p></div>
        </div>
        <div className="mt-4 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-xs text-[var(--srg-text-muted)]">
          <p>Timeline: {strategicAdvisorSummary.strategicTimeline.slice(0, 6).join(' | ') || 'n/a'}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/strategic-advisor" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Strategic Advisor</Link>
        </div>
      </Section>

      <Section title="Marketplace" description="Publication, partage et qualité des prompts publiés.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Prompts publiés</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{publishedCount}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Liens de partage</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{shareCount}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Reviews</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{reviewCount}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {topMarketplace.map((item) => (
            <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
              <p className="font-semibold text-[var(--srg-text-title)]">{item.title}</p>
              <p className="mt-1 text-[var(--srg-text-muted)]">{item.authorName} • {item.status}</p>
              <p className="mt-1 text-xs text-[var(--srg-text-muted)]">{item.downloads} downloads • {item.averageRating}/5</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top téléchargements</p>
            <div className="mt-3 space-y-2 text-sm">
              {topDownloads.map((item) => <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.title} • {item.downloads}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top reviews</p>
            <div className="mt-3 space-y-2 text-sm">
              {topReviews.map((item) => <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.title} • {item.averageRating}/5</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top collections</p>
            <div className="mt-3 space-y-2 text-sm">
              {topCollections.map((item) => <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.name} • {item.promptIds.length}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top auteurs</p>
            <div className="mt-3 space-y-2 text-sm">
              {topAuthors.map((item) => <div key={item.authorName} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.authorName} • {item.count}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top catégories</p>
            <div className="mt-3 space-y-2 text-sm">
              {topCategories.map((item) => <div key={item.category} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.category} • {item.count}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Prompts Trending</p>
            <div className="mt-3 space-y-2 text-sm">
              {topTrending.map((item) => <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.title} • {item.downloads + item.views + item.copies + item.favorites}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Meilleur partagé</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
                {mostShared ? `${mostShared.title} • ${topShared[0]?.count ?? 0}` : 'Aucun partage'}
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Mieux noté</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
                {bestRated ? `${bestRated.title} • ${bestRated.averageRating}/5` : 'Aucune note'}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/reviews" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir la file de modération</Link>
        </div>
      </Section>

      <Section title="Conversations" description="Conversations actives, coût, tokens, latence et tendances provider/modèle.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Conversations actives</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{conversationSummary.active}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Conversations archivées</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{conversationSummary.archived}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Tokens consommés</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{conversationSummary.totalTokens}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Coût</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">${conversationSummary.totalCost.toFixed(6)}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Temps moyen</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{conversationSummary.averageLatencyMs} ms</p></div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top providers</p>
            <div className="mt-3 space-y-2 text-sm">{conversationSummary.topProviders.map((item) => <div key={item.provider} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.provider} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top modèles</p>
            <div className="mt-3 space-y-2 text-sm">{conversationSummary.topModels.map((item) => <div key={item.model} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.model} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top conversations</p>
            <div className="mt-3 space-y-2 text-sm">{conversationSummary.topConversations.map((item) => <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.title} • {item.tokens} tokens</div>)}</div>
          </div>
        </div>
        <div className="mt-4 rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)] text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Lifecycle streaming</p>
          <p className="mt-2 text-[var(--srg-text-muted)]">running {conversationSummary.lifecycle.running} • completed {conversationSummary.lifecycle.completed} • cancelled {conversationSummary.lifecycle.cancelled} • failed {conversationSummary.lifecycle.failed}</p>
          <p className="text-[var(--srg-text-muted)]">avg progress {conversationSummary.lifecycle.avgStreamProgress}%</p>
          <p className="mt-2 text-xs text-[var(--srg-text-muted)]">Tokens: {conversationSummary.charts.tokens.join(' / ') || 'n/a'}</p>
          <p className="text-xs text-[var(--srg-text-muted)]">Costs: {conversationSummary.charts.costs.map((item) => item.toFixed(6)).join(' / ') || 'n/a'}</p>
          <p className="text-xs text-[var(--srg-text-muted)]">Latency: {conversationSummary.charts.latencies.join(' / ') || 'n/a'}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/chat" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir AI Workspace</Link>
        </div>
      </Section>

      <Section title="AI Agents" description="Agents, automatisations, executions et observabilite.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Nombre d'agents</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{agentSummary.totalAgents}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Agents actifs</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{agentSummary.activeAgents}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Favoris</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{agentSummary.favoriteAgents}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Automatisations</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{agentSummary.automations}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Dernieres executions</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{agentSummary.totalExecutions}</p></div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Cout:</strong> ${agentSummary.totalCost.toFixed(6)}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Credits/Tokens:</strong> {agentSummary.totalTokens}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Temps moyen:</strong> {agentSummary.averageLatencyMs} ms</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Failures:</strong> {agentSummary.failures}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/agents" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir AI Agents Workspace</Link>
        </div>
      </Section>

      <Section title="Workflow Automation" description="Workflows transverses, simulation et orchestration intelligente.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Workflows</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{workflowSummary.totalWorkflows}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Actifs</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{workflowSummary.active}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Terminés</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{workflowSummary.completed}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Échoués</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{workflowSummary.failed}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Temps moyen</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{workflowSummary.avgDurationMs} ms</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Succès</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{workflowSummary.successRate}%</p></div>
        </div>
        <div className="mt-4 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-xs text-[var(--srg-text-muted)]">
          <p>Timeline: {workflowSummary.timeline.slice(0, 6).join(' | ') || 'n/a'}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/workflow-automation" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Workflow Automation</Link>
        </div>
      </Section>

      <Section title="Knowledge Workspace" description="Documents, collections, imports, indexation, favoris, top categories/tags et volume.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Documents</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.documents}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Collections</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.collections}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Imports</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.imports}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Indexations</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.indexations}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Favoris</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.favorites}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Critiques</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{knowledgeIntelligenceSummary.criticalDocuments}</p></div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top categories</p>
            <div className="mt-3 space-y-2 text-sm">{knowledgeSummary.topCategories.map((item) => <div key={item.category} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.category} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top tags</p>
            <div className="mt-3 space-y-2 text-sm">{knowledgeSummary.topTags.map((item) => <div key={item.tag} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.tag} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Latest imports</p>
            <div className="mt-3 space-y-2 text-sm">{knowledgeSummary.lastImports.slice(0, 6).map((item) => <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.type} • {item.documentIds.length} docs</div>)}</div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Volume:</strong> {knowledgeSummary.volume}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Import graph:</strong> {knowledgeSummary.charts.imports.join(' / ') || 'n/a'}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Index graph:</strong> {knowledgeSummary.charts.indexations.join(' / ') || 'n/a'}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Search graph:</strong> {knowledgeSummary.charts.searches.join(' / ') || 'n/a'}</div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Decompressions:</strong> {knowledgeSummary.edi.decompressions}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">OCR queued:</strong> {knowledgeSummary.edi.ocrQueued}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">OCR completed:</strong> {knowledgeSummary.edi.ocrCompleted}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">AI answers:</strong> {knowledgeSummary.edi.enterpriseAnswers}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Reports:</strong> {knowledgeSummary.edi.reports}</div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3 text-sm">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Archives</p>
            <div className="mt-3 space-y-2">{knowledgeSummary.edi.byArchiveType.map((item) => <div key={item.type} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.type.toUpperCase()} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top fournisseurs</p>
            <div className="mt-3 space-y-2">{knowledgeSummary.edi.topFournisseurs.slice(0, 6).map((item) => <div key={item.name} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.name} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top chantiers</p>
            <div className="mt-3 space-y-2">{knowledgeSummary.edi.topChantiers.slice(0, 6).map((item) => <div key={item.name} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.name} • {item.count}</div>)}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/knowledge-center" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Knowledge Workspace</Link>
          <Link to="/knowledge-intelligence" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir Knowledge Intelligence</Link>
        </div>
      </Section>

      <Section title="Business Policy & Devis" description="Politiques metier, coefficients, fournitures, main d'oeuvre, devis, facturation et simulation.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Policies</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{businessPolicySummary.policies}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Coefficients</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{businessPolicySummary.coefficients}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Supplies</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{businessPolicySummary.supplies}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Labor roles</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{businessPolicySummary.laborRoles}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Devis</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{businessPolicySummary.quotes}</p></div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Billing docs:</strong> {businessPolicySummary.billingDocuments}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Learning suggestions:</strong> {businessPolicySummary.learningSuggestions}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Simulations:</strong> {businessPolicySummary.simulations}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Total quote value:</strong> {businessPolicySummary.totalQuoteValue.toFixed(2)}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/business-policy" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Business Policy Workspace</Link>
          <Link to="/devis" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir Devis Workspace</Link>
        </div>
      </Section>

      <Section title="Project Execution" description="Suivi execution industrielle: projets, budget, avancement, retards, incidents et risques.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Projects</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{projectExecutionSummary.projects}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Budget total</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{projectExecutionSummary.totalBudget.toFixed(2)}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Budget consomme</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{projectExecutionSummary.consumedBudget.toFixed(2)}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Avancement</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{projectExecutionSummary.progress.toFixed(1)}%</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Retards</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{projectExecutionSummary.delays}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Risques</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{projectExecutionSummary.risks}</p></div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Incidents:</strong> {projectExecutionSummary.incidents}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Top clients:</strong> {projectExecutionSummary.topClients.map((item) => `${item.name} (${item.count})`).join(' | ') || 'n/a'}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Top fournisseurs:</strong> {projectExecutionSummary.topSuppliers.map((item) => `${item.name} (${item.count})`).join(' | ') || 'n/a'}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Top techniciens:</strong> {projectExecutionSummary.topTechnicians.map((item) => `${item.name} (${item.count})`).join(' | ') || 'n/a'}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/project-execution" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Project Execution Workspace</Link>
        </div>
      </Section>

      <Section title="Procurement & Inventory" description="Demandes d'achat, appels d'offres, fournisseurs, commandes, stocks, receptions et logistique.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Requests</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{procurementSummary.requests}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Tenders</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{procurementSummary.tenders}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Suppliers</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{procurementSummary.suppliers}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Orders</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{procurementSummary.orders}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Stock items</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{procurementSummary.stockItems}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Logistics</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{procurementSummary.logistics}</p></div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Request budget:</strong> {procurementSummary.requestBudget.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Order value:</strong> {procurementSummary.orderValue.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Low stock:</strong> {procurementSummary.lowStock}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Open non-conformities:</strong> {procurementSummary.openNonConformities}</div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3 text-sm">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top suppliers</p>
            <div className="mt-3 space-y-2">{procurementSummary.topSuppliers.map((item) => <div key={item.name} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.name} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Stock by category</p>
            <div className="mt-3 space-y-2">{procurementSummary.byCategory.slice(0, 8).map((item) => <div key={item.category} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.category} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Stock by store</p>
            <div className="mt-3 space-y-2">{procurementSummary.byStore.slice(0, 8).map((item) => <div key={item.name} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">{item.name} • {item.count}</div>)}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/procurement-inventory" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Procurement & Inventory Workspace</Link>
        </div>
      </Section>

      <Section title="Maintenance CMMS" description="Equipements, interventions, disponibilité, MTBF/MTTR, OEE, pièces et diagnostics.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Equipements</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{maintenanceSummary.equipments}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Interventions</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{maintenanceSummary.workOrders}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Disponibilité</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{maintenanceSummary.availability}%</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">MTBF</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{maintenanceSummary.mtbf} h</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">MTTR</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{maintenanceSummary.mttr} h</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">OEE</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{maintenanceSummary.oee}%</p></div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Coût maintenance:</strong> {maintenanceSummary.totalMaintenanceCost.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Downtime:</strong> {maintenanceSummary.totalDowntimeMinutes} min</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Pièces:</strong> {maintenanceSummary.spareParts}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Diagnostics:</strong> {maintenanceSummary.diagnostics}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/maintenance" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Maintenance Workspace</Link>
        </div>
      </Section>

      <Section title="Enterprise Finance" description="Comptabilite, tresorerie, budgets, controle de gestion et analyse financiere.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Comptes</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{financeSummary.accounts}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Ecritures</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{financeSummary.entries}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Factures clients</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{financeSummary.customerInvoices}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Factures fournisseurs</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{financeSummary.supplierInvoices}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Tresorerie</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{financeSummary.treasuryBalance.toFixed(2)}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Marge</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{financeSummary.margin.toFixed(2)}</p></div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Cash Flow:</strong> {financeSummary.cashFlow.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">EBITDA:</strong> {financeSummary.ebitda.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">ROI:</strong> {financeSummary.roi.toFixed(2)}%</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Ecart budget:</strong> {financeSummary.budgetVariance.toFixed(2)}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/finance" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Finance Workspace</Link>
        </div>
      </Section>

      <Section title="Enterprise Human Resources" description="Ressources humaines, paie, effectifs, competences, recrutement et pilotage workforce.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Employes</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{humanResourcesSummary.employees}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Actifs</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{humanResourcesSummary.activeEmployees}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Contrats</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{humanResourcesSummary.contracts}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Paies</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{humanResourcesSummary.payrollRecords}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Conges</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{humanResourcesSummary.leaveRequests}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Recrutements</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{humanResourcesSummary.recruitments}</p></div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Payroll total:</strong> {humanResourcesSummary.payrollTotal.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Presence heures:</strong> {humanResourcesSummary.attendanceHours.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Overtime:</strong> {humanResourcesSummary.overtimeHours.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]"><strong className="text-[var(--srg-text-title)]">Diagnostics:</strong> {humanResourcesSummary.diagnostics}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/human-resources" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir HR Workspace</Link>
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {recentActivity.length > 0 ? <RecentActivity items={recentActivity} /> : (
            <Section title="Activité récente" description="Exécutions et événements récents du workspace.">
              <EmptyState
                eyebrow="Dashboard"
                illustration={<span aria-hidden>◌</span>}
                title="Aucune activité récente"
                description="L’activité apparaîtra ici après vos premières générations ou modifications de prompts."
                action={<Link to="/generate" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white">Lancer une génération</Link>}
              />
            </Section>
          )}
          <HealthPanel items={health} />
          <Section title="Dernieres validations" description="Demandes et validations récentes du workflow collaboratif.">
            <div className="space-y-2 text-sm">
              {latestValidations.length === 0 ? <p className="text-[var(--srg-text-muted)]">Aucune validation récente.</p> : latestValidations.map((item) => (
                <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
                  <p className="font-semibold text-[var(--srg-text-title)]">{item.actorName}</p>
                  <p className="mt-1 text-[var(--srg-text-muted)]">{item.message}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Derniers commentaires" description="Commentaires récents liés aux projets, prompts et templates.">
            <div className="space-y-2 text-sm">
              {latestComments.length === 0 ? <p className="text-[var(--srg-text-muted)]">Aucun commentaire récent.</p> : latestComments.map((item) => (
                <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
                  <p className="font-semibold text-[var(--srg-text-title)]">{item.actorName}</p>
                  <p className="mt-1 text-[var(--srg-text-muted)]">{item.message}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Collaborateurs actifs" description="Utilisateurs actifs sur les espaces collaboratifs.">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {activeCollaborators.length === 0 ? <p className="text-sm text-[var(--srg-text-muted)]">Aucun collaborateur actif.</p> : activeCollaborators.map((name) => (
                <div key={name} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)]">
                  {name}
                </div>
              ))}
            </div>
          </Section>

          <CollaborationActivityFeed />
          <Section title="Activite recente du workspace" description="Dernieres generations et derniers projets.">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Dernieres generations</p>
                <div className="mt-4 space-y-3 text-sm">
                  {latestRuns.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
                      <p className="font-semibold text-[var(--srg-text-title)]">{item.title}</p>
                      <p className="mt-1 text-[var(--srg-text-muted)]">{item.meta}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Derniers projets</p>
                <div className="mt-4 space-y-3 text-sm">
                  {latestProjects.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
                      <p className="font-semibold text-[var(--srg-text-title)]">{item.title}</p>
                      <p className="mt-1 text-[var(--srg-text-muted)]">{item.meta}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Prompts récents</p>
                <div className="mt-4 space-y-3 text-sm">
                  {latestPrompts.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
                      <p className="font-semibold text-[var(--srg-text-title)]">{item.title}</p>
                      <p className="mt-1 text-[var(--srg-text-muted)]">{item.meta}</p>
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
                <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 shadow-[var(--srg-shadow-md)]">
                  <p className="font-semibold text-[var(--srg-text-title)]">{item.title}</p>
                  <p className="mt-1 text-[var(--srg-text-muted)]">{item.meta}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Consommation IA" description="Graphiques simples de tokens et couts.">
            <div className="space-y-4">
              {aiConsumption.map((item) => {
                const width = Math.min(100, Math.max(8, item.value === 0 ? 8 : item.value % 100))
                return (
                  <div key={item.label} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 shadow-[var(--srg-shadow-md)]">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <p className="font-semibold text-[var(--srg-text-title)]">{item.label}</p>
                      <span className="text-[var(--srg-text-muted)]">{item.value}</span>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-[var(--srg-surface-strong)]">
                      <div className="h-3 rounded-full bg-[var(--srg-color-primary-500)]" style={{ width: `${width}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-[var(--srg-text-muted)]">{item.helper}</p>
                  </div>
                )
              })}
            </div>
          </Section>
          <Section title="Statistiques IA" description="Distribution récente des volumes par run.">
            <div className="space-y-4">
              {activityChart.length === 0 ? (
                <EmptyState
                  eyebrow="Dashboard"
                  illustration={<span aria-hidden>▤</span>}
                  title="Aucune statistique exploitable"
                  description="Les graphiques d’activité apparaîtront dès que des runs seront enregistrés dans History."
                />
              ) : activityChart.map((item) => {
                const width = Math.min(100, Math.max(10, item.value % 100 || 10))
                return (
                  <div key={item.label} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 shadow-[var(--srg-shadow-md)]">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <p className="font-semibold text-[var(--srg-text-title)]">{item.label}</p>
                      <span className="text-[var(--srg-text-muted)]">{item.value} tokens</span>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-[var(--srg-surface-strong)]">
                      <div className="h-3 rounded-full bg-[var(--srg-color-primary-400)]" style={{ width: `${width}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-[var(--srg-text-muted)]">{item.helper}</p>
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
            <Link key={item.to} to={item.to} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-4 text-sm font-semibold text-[var(--srg-text-title)] shadow-[var(--srg-shadow-md)] transition hover:border-[var(--srg-color-primary-400)]">
              {item.label}
            </Link>
          ))}
        </div>
      </Section>
    </div>
  )
}
