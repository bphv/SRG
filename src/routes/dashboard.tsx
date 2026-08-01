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

      <CollaborationGlobalSearch projects={allProjects} prompts={allPrompts} templates={allTemplates} users={allUsers} />

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

      <Section title="Wallet & credits" description="Suivi rapide de la consommation et du budget visible.">
        <div className="grid gap-4 md:grid-cols-2">
          {walletSummary.map((item) => (
            <div key={item.label} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{item.value}</p>
              <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">{item.helper}</p>
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

      <Section title="Marketplace" description="Publication, partage et qualité des prompts publiés.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Prompts publiés</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{publishedCount}</p>
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Liens de partage</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{shareCount}</p>
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Reviews</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{reviewCount}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {topMarketplace.map((item) => (
            <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm">
              <p className="font-semibold text-[var(--sea-ink)]">{item.title}</p>
              <p className="mt-1 text-[var(--sea-ink-soft)]">{item.authorName} • {item.status}</p>
              <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{item.downloads} downloads • {item.averageRating}/5</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Top téléchargements</p>
            <div className="mt-3 space-y-2 text-sm">
              {topDownloads.map((item) => <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.title} • {item.downloads}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Top reviews</p>
            <div className="mt-3 space-y-2 text-sm">
              {topReviews.map((item) => <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.title} • {item.averageRating}/5</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Top collections</p>
            <div className="mt-3 space-y-2 text-sm">
              {topCollections.map((item) => <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.name} • {item.promptIds.length}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Top auteurs</p>
            <div className="mt-3 space-y-2 text-sm">
              {topAuthors.map((item) => <div key={item.authorName} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.authorName} • {item.count}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Top catégories</p>
            <div className="mt-3 space-y-2 text-sm">
              {topCategories.map((item) => <div key={item.category} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.category} • {item.count}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Prompts Trending</p>
            <div className="mt-3 space-y-2 text-sm">
              {topTrending.map((item) => <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.title} • {item.downloads + item.views + item.copies + item.favorites}</div>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Meilleur partagé</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">
                {mostShared ? `${mostShared.title} • ${topShared[0]?.count ?? 0}` : 'Aucun partage'}
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Mieux noté</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">
                {bestRated ? `${bestRated.title} • ${bestRated.averageRating}/5` : 'Aucune note'}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/reviews" className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Ouvrir la file de modération</Link>
        </div>
      </Section>

      <Section title="Conversations" description="Conversations actives, coût, tokens, latence et tendances provider/modèle.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Conversations actives</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{conversationSummary.active}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Conversations archivées</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{conversationSummary.archived}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Tokens consommés</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{conversationSummary.totalTokens}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Coût</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">${conversationSummary.totalCost.toFixed(6)}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Temps moyen</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{conversationSummary.averageLatencyMs} ms</p></div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Top providers</p>
            <div className="mt-3 space-y-2 text-sm">{conversationSummary.topProviders.map((item) => <div key={item.provider} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.provider} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Top modèles</p>
            <div className="mt-3 space-y-2 text-sm">{conversationSummary.topModels.map((item) => <div key={item.model} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.model} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Top conversations</p>
            <div className="mt-3 space-y-2 text-sm">{conversationSummary.topConversations.map((item) => <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.title} • {item.tokens} tokens</div>)}</div>
          </div>
        </div>
        <div className="mt-4 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)] text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Lifecycle streaming</p>
          <p className="mt-2 text-[var(--sea-ink-soft)]">running {conversationSummary.lifecycle.running} • completed {conversationSummary.lifecycle.completed} • cancelled {conversationSummary.lifecycle.cancelled} • failed {conversationSummary.lifecycle.failed}</p>
          <p className="text-[var(--sea-ink-soft)]">avg progress {conversationSummary.lifecycle.avgStreamProgress}%</p>
          <p className="mt-2 text-xs text-[var(--sea-ink-soft)]">Tokens: {conversationSummary.charts.tokens.join(' / ') || 'n/a'}</p>
          <p className="text-xs text-[var(--sea-ink-soft)]">Costs: {conversationSummary.charts.costs.map((item) => item.toFixed(6)).join(' / ') || 'n/a'}</p>
          <p className="text-xs text-[var(--sea-ink-soft)]">Latency: {conversationSummary.charts.latencies.join(' / ') || 'n/a'}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/chat" className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Ouvrir AI Workspace</Link>
        </div>
      </Section>

      <Section title="AI Agents" description="Agents, automatisations, executions et observabilite.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Nombre d'agents</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{agentSummary.totalAgents}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Agents actifs</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{agentSummary.activeAgents}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Favoris</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{agentSummary.favoriteAgents}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Automatisations</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{agentSummary.automations}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Dernieres executions</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{agentSummary.totalExecutions}</p></div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Cout:</strong> ${agentSummary.totalCost.toFixed(6)}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Credits/Tokens:</strong> {agentSummary.totalTokens}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Temps moyen:</strong> {agentSummary.averageLatencyMs} ms</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Failures:</strong> {agentSummary.failures}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/agents" className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Ouvrir AI Agents Workspace</Link>
        </div>
      </Section>

      <Section title="Knowledge Workspace" description="Documents, collections, imports, indexation, favoris, top categories/tags et volume.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Documents</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{knowledgeSummary.documents}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Collections</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{knowledgeSummary.collections}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Imports</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{knowledgeSummary.imports}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Indexations</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{knowledgeSummary.indexations}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Favoris</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{knowledgeSummary.favorites}</p></div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Top categories</p>
            <div className="mt-3 space-y-2 text-sm">{knowledgeSummary.topCategories.map((item) => <div key={item.category} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.category} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Top tags</p>
            <div className="mt-3 space-y-2 text-sm">{knowledgeSummary.topTags.map((item) => <div key={item.tag} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.tag} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Latest imports</p>
            <div className="mt-3 space-y-2 text-sm">{knowledgeSummary.lastImports.slice(0, 6).map((item) => <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.type} • {item.documentIds.length} docs</div>)}</div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Volume:</strong> {knowledgeSummary.volume}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Import graph:</strong> {knowledgeSummary.charts.imports.join(' / ') || 'n/a'}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Index graph:</strong> {knowledgeSummary.charts.indexations.join(' / ') || 'n/a'}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Search graph:</strong> {knowledgeSummary.charts.searches.join(' / ') || 'n/a'}</div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Decompressions:</strong> {knowledgeSummary.edi.decompressions}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">OCR queued:</strong> {knowledgeSummary.edi.ocrQueued}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">OCR completed:</strong> {knowledgeSummary.edi.ocrCompleted}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">AI answers:</strong> {knowledgeSummary.edi.enterpriseAnswers}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Reports:</strong> {knowledgeSummary.edi.reports}</div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3 text-sm">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Archives</p>
            <div className="mt-3 space-y-2">{knowledgeSummary.edi.byArchiveType.map((item) => <div key={item.type} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.type.toUpperCase()} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Top fournisseurs</p>
            <div className="mt-3 space-y-2">{knowledgeSummary.edi.topFournisseurs.slice(0, 6).map((item) => <div key={item.name} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.name} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Top chantiers</p>
            <div className="mt-3 space-y-2">{knowledgeSummary.edi.topChantiers.slice(0, 6).map((item) => <div key={item.name} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.name} • {item.count}</div>)}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/knowledge-center" className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Knowledge Workspace</Link>
        </div>
      </Section>

      <Section title="Business Policy & Devis" description="Politiques metier, coefficients, fournitures, main d'oeuvre, devis, facturation et simulation.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Policies</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{businessPolicySummary.policies}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Coefficients</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{businessPolicySummary.coefficients}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Supplies</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{businessPolicySummary.supplies}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Labor roles</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{businessPolicySummary.laborRoles}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Devis</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{businessPolicySummary.quotes}</p></div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Billing docs:</strong> {businessPolicySummary.billingDocuments}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Learning suggestions:</strong> {businessPolicySummary.learningSuggestions}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Simulations:</strong> {businessPolicySummary.simulations}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Total quote value:</strong> {businessPolicySummary.totalQuoteValue.toFixed(2)}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/business-policy" className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Business Policy Workspace</Link>
          <Link to="/devis" className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Ouvrir Devis Workspace</Link>
        </div>
      </Section>

      <Section title="Project Execution" description="Suivi execution industrielle: projets, budget, avancement, retards, incidents et risques.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Projects</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{projectExecutionSummary.projects}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Budget total</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{projectExecutionSummary.totalBudget.toFixed(2)}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Budget consomme</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{projectExecutionSummary.consumedBudget.toFixed(2)}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Avancement</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{projectExecutionSummary.progress.toFixed(1)}%</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Retards</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{projectExecutionSummary.delays}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Risques</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{projectExecutionSummary.risks}</p></div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Incidents:</strong> {projectExecutionSummary.incidents}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Top clients:</strong> {projectExecutionSummary.topClients.map((item) => `${item.name} (${item.count})`).join(' | ') || 'n/a'}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Top fournisseurs:</strong> {projectExecutionSummary.topSuppliers.map((item) => `${item.name} (${item.count})`).join(' | ') || 'n/a'}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Top techniciens:</strong> {projectExecutionSummary.topTechnicians.map((item) => `${item.name} (${item.count})`).join(' | ') || 'n/a'}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/project-execution" className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Project Execution Workspace</Link>
        </div>
      </Section>

      <Section title="Procurement & Inventory" description="Demandes d'achat, appels d'offres, fournisseurs, commandes, stocks, receptions et logistique.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Requests</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{procurementSummary.requests}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Tenders</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{procurementSummary.tenders}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Suppliers</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{procurementSummary.suppliers}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Orders</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{procurementSummary.orders}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Stock items</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{procurementSummary.stockItems}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Logistics</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{procurementSummary.logistics}</p></div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Request budget:</strong> {procurementSummary.requestBudget.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Order value:</strong> {procurementSummary.orderValue.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Low stock:</strong> {procurementSummary.lowStock}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Open non-conformities:</strong> {procurementSummary.openNonConformities}</div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3 text-sm">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Top suppliers</p>
            <div className="mt-3 space-y-2">{procurementSummary.topSuppliers.map((item) => <div key={item.name} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.name} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Stock by category</p>
            <div className="mt-3 space-y-2">{procurementSummary.byCategory.slice(0, 8).map((item) => <div key={item.category} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.category} • {item.count}</div>)}</div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Stock by store</p>
            <div className="mt-3 space-y-2">{procurementSummary.byStore.slice(0, 8).map((item) => <div key={item.name} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-3">{item.name} • {item.count}</div>)}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/procurement-inventory" className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Procurement & Inventory Workspace</Link>
        </div>
      </Section>

      <Section title="Maintenance CMMS" description="Equipements, interventions, disponibilité, MTBF/MTTR, OEE, pièces et diagnostics.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Equipements</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{maintenanceSummary.equipments}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Interventions</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{maintenanceSummary.workOrders}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Disponibilité</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{maintenanceSummary.availability}%</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">MTBF</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{maintenanceSummary.mtbf} h</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">MTTR</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{maintenanceSummary.mttr} h</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">OEE</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{maintenanceSummary.oee}%</p></div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Coût maintenance:</strong> {maintenanceSummary.totalMaintenanceCost.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Downtime:</strong> {maintenanceSummary.totalDowntimeMinutes} min</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Pièces:</strong> {maintenanceSummary.spareParts}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Diagnostics:</strong> {maintenanceSummary.diagnostics}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/maintenance" className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Maintenance Workspace</Link>
        </div>
      </Section>

      <Section title="Enterprise Finance" description="Comptabilite, tresorerie, budgets, controle de gestion et analyse financiere.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Comptes</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{financeSummary.accounts}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Ecritures</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{financeSummary.entries}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Factures clients</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{financeSummary.customerInvoices}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Factures fournisseurs</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{financeSummary.supplierInvoices}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Tresorerie</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{financeSummary.treasuryBalance.toFixed(2)}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Marge</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{financeSummary.margin.toFixed(2)}</p></div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Cash Flow:</strong> {financeSummary.cashFlow.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">EBITDA:</strong> {financeSummary.ebitda.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">ROI:</strong> {financeSummary.roi.toFixed(2)}%</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Ecart budget:</strong> {financeSummary.budgetVariance.toFixed(2)}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/finance" className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Finance Workspace</Link>
        </div>
      </Section>

      <Section title="Enterprise Human Resources" description="Ressources humaines, paie, effectifs, competences, recrutement et pilotage workforce.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Employes</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{humanResourcesSummary.employees}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Actifs</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{humanResourcesSummary.activeEmployees}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Contrats</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{humanResourcesSummary.contracts}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Paies</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{humanResourcesSummary.payrollRecords}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Conges</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{humanResourcesSummary.leaveRequests}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Recrutements</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{humanResourcesSummary.recruitments}</p></div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Payroll total:</strong> {humanResourcesSummary.payrollTotal.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Presence heures:</strong> {humanResourcesSummary.attendanceHours.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Overtime:</strong> {humanResourcesSummary.overtimeHours.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]"><strong className="text-[var(--sea-ink)]">Diagnostics:</strong> {humanResourcesSummary.diagnostics}</div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/human-resources" className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Ouvrir HR Workspace</Link>
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
                action={<Link to="/generate" className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 text-sm font-semibold text-white">Lancer une génération</Link>}
              />
            </Section>
          )}
          <HealthPanel items={health} />
          <Section title="Dernieres validations" description="Demandes et validations récentes du workflow collaboratif.">
            <div className="space-y-2 text-sm">
              {latestValidations.length === 0 ? <p className="text-[var(--sea-ink-soft)]">Aucune validation récente.</p> : latestValidations.map((item) => (
                <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                  <p className="font-semibold text-[var(--sea-ink)]">{item.actorName}</p>
                  <p className="mt-1 text-[var(--sea-ink-soft)]">{item.message}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Derniers commentaires" description="Commentaires récents liés aux projets, prompts et templates.">
            <div className="space-y-2 text-sm">
              {latestComments.length === 0 ? <p className="text-[var(--sea-ink-soft)]">Aucun commentaire récent.</p> : latestComments.map((item) => (
                <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                  <p className="font-semibold text-[var(--sea-ink)]">{item.actorName}</p>
                  <p className="mt-1 text-[var(--sea-ink-soft)]">{item.message}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Collaborateurs actifs" description="Utilisateurs actifs sur les espaces collaboratifs.">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {activeCollaborators.length === 0 ? <p className="text-sm text-[var(--sea-ink-soft)]">Aucun collaborateur actif.</p> : activeCollaborators.map((name) => (
                <div key={name} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)]">
                  {name}
                </div>
              ))}
            </div>
          </Section>

          <CollaborationActivityFeed />
          <Section title="Activite recente du workspace" description="Dernieres generations et derniers projets.">
            <div className="grid gap-4 lg:grid-cols-3">
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
              <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Prompts récents</p>
                <div className="mt-4 space-y-3 text-sm">
                  {latestPrompts.map((item) => (
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
                  <div key={item.label} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <p className="font-semibold text-[var(--sea-ink)]">{item.label}</p>
                      <span className="text-[var(--sea-ink-soft)]">{item.value} tokens</span>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-[var(--surface-strong)]">
                      <div className="h-3 rounded-full bg-[var(--lagoon)]" style={{ width: `${width}%` }} />
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
