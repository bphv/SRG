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
