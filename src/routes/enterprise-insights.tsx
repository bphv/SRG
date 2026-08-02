import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import NotificationCenter from '#/app/components/NotificationCenter'
import PageHeader from '#/app/components/PageHeader'
import SearchBar from '#/app/components/SearchBar'
import Section from '#/app/components/Section'
import DataTable from '#/app/components/ui/DataTable'
import type { DataTableColumn } from '#/app/components/ui/DataTable'
import {
  CollapsibleFormSection,
  Field,
  FieldGroup,
  FormSection,
  FormToolbar,
  SmartInputField,
  ValidationMessage,
} from '#/app/components/ui/FormPrimitives'
import Button from '#/app/components/ui/Button'
import { useNotifications } from '#/app/hooks/useNotifications'
import { EnterpriseInsightsWorkspaceService } from '#/app/services/EnterpriseInsightsWorkspaceService'
import type {
  AssistantAnswer,
  DecisionHistoryItem,
  EnterpriseRecommendation,
  InsightEvent,
  InsightView,
} from '#/app/services/EnterpriseInsightsWorkspaceService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export const Route = createFileRoute('/enterprise-insights')({
  component: EnterpriseInsightsPage,
})

const VIEW_OPTIONS: InsightView[] = [
  'executive',
  'finance',
  'hr',
  'maintenance',
  'procurement',
  'crm',
  'projects',
  'ai',
  'documents',
  'workflows',
]

function EnterpriseInsightsPage() {
  const notifications = useNotifications()
  const searchHostRef = useRef<HTMLDivElement | null>(null)

  const [tick, setTick] = useState(0)
  const [search, setSearch] = useState('')
  const [viewFilter, setViewFilter] = useState<InsightView | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [assistantQuestion, setAssistantQuestion] = useState('')
  const [assistantAnswer, setAssistantAnswer] = useState<AssistantAnswer | null>(null)
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)

  const insightsViews = useMemo(() => EnterpriseInsightsWorkspaceService.getInsightsViews(), [tick])
  const executive = useMemo(() => EnterpriseInsightsWorkspaceService.getExecutiveDashboard(), [tick])
  const recommendations = useMemo(() => EnterpriseInsightsWorkspaceService.buildRecommendations(), [tick])
  const decisionHistory = useMemo(() => EnterpriseInsightsWorkspaceService.getDecisionHistory(), [tick])
  const recommendationsHistory = useMemo(() => EnterpriseInsightsWorkspaceService.getRecommendationsHistory(), [tick])
  const comparisonsHistory = useMemo(() => EnterpriseInsightsWorkspaceService.getComparisonsHistory(), [tick])
  const observability = useMemo(() => EnterpriseInsightsWorkspaceService.getObservability(), [tick])
  const assistantAnswers = useMemo(() => EnterpriseInsightsWorkspaceService.getAssistantAnswers(), [tick])
  const searchFavorites = useMemo(() => EnterpriseInsightsWorkspaceService.getSearchFavorites(), [tick])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        const input = searchHostRef.current?.querySelector('input')
        input?.focus()
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'r') {
        event.preventDefault()
        refreshInsights()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    refreshInsights()
  }, [])

  const refreshInsights = () => {
    const result = EnterpriseInsightsWorkspaceService.refreshAndPersistInsights()
    notifications.publish({
      title: 'Enterprise insights refreshed',
      message: `${result.recommendations.length} recommendations, ${result.events.length} events synchronized.`,
      level: 'success',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })
    setTick((current) => current + 1)
  }

  const toggleFavoriteSearch = () => {
    const normalized = search.trim()
    if (!normalized) return
    const existingFavorites = EnterpriseInsightsWorkspaceService.getSearchFavorites()
    const next = existingFavorites.includes(normalized)
      ? existingFavorites.filter((item) => item !== normalized)
      : [normalized, ...existingFavorites].slice(0, 16)
    EnterpriseInsightsWorkspaceService.setSearchFavorites(next)
    setTick((value) => value + 1)
  }

  const filteredRecommendations = useMemo(() => {
    const query = search.trim().toLowerCase()
    return recommendations.filter((item) => {
      if (viewFilter !== 'all' && item.view !== viewFilter) return false
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false
      if (!query) return true
      return `${item.title} ${item.description} ${item.justification} ${item.source}`.toLowerCase().includes(query)
    })
  }, [recommendations, search, viewFilter, priorityFilter])

  const recommendationColumns: Array<DataTableColumn<EnterpriseRecommendation>> = [
    {
      key: 'title',
      label: 'Recommendation',
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--srg-text-title)]">{row.title}</p>
          <p className="text-xs text-[var(--srg-text-muted)]">{row.description}</p>
        </div>
      ),
    },
    { key: 'view', label: 'View', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'impact', label: 'Impact', sortable: true, render: (row) => `${row.impact}%` },
    { key: 'urgency', label: 'Urgency', sortable: true, render: (row) => `${row.urgency}%` },
    { key: 'confidence', label: 'Confidence', sortable: true, render: (row) => `${row.confidence}%` },
    { key: 'source', label: 'Source' },
    { key: 'justification', label: 'Justification' },
  ]

  const historyColumns: Array<DataTableColumn<DecisionHistoryItem>> = [
    { key: 'type', label: 'Type', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'detail', label: 'Detail' },
    { key: 'source', label: 'Source' },
    { key: 'createdAt', label: 'Created', sortable: true, render: (row) => new Date(row.createdAt).toLocaleString() },
  ]

  const eventColumns: Array<DataTableColumn<InsightEvent>> = [
    { key: 'type', label: 'Event', sortable: true },
    { key: 'view', label: 'View', sortable: true },
    { key: 'severity', label: 'Severity', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'detail', label: 'Detail' },
    { key: 'createdAt', label: 'Created', sortable: true, render: (row) => new Date(row.createdAt).toLocaleString() },
  ]

  const askAssistant = () => {
    const text = assistantQuestion.trim()
    if (!text) {
      setAssistantAnswer(null)
      return
    }
    const answer = EnterpriseInsightsWorkspaceService.askDecisionAssistant(text)
    setAssistantAnswer(answer)
    notifications.publish({
      title: 'Decision assistant answer ready',
      message: `Confidence ${answer.confidence}% • Source ${answer.source}`,
      level: 'info',
      priority: 'low',
      category: 'system',
      read: false,
      channels: ['email'],
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Insights"
        description="Enterprise intelligence and decision support: analyze, compare, explain, recommend, justify and predict."
      />

      <Section title="Quick Actions" description="Create, modify, export, share, history, favorites and search shortcuts.">
        <div className="flex flex-wrap gap-2">
          <Link to="/generate" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Créer</Link>
          <Link to="/projects" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Modifier</Link>
          <Button variant="secondary" onClick={() => EnterpriseInsightsWorkspaceService.exportDecisionHistory()}>Exporter</Button>
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(window.location.href)}>Partager</Button>
          <Link to="/history" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Historique</Link>
          <Button variant="secondary" onClick={toggleFavoriteSearch}>Favoris</Button>
          <Button variant="secondary" onClick={() => searchHostRef.current?.querySelector('input')?.focus()}>Recherche</Button>
          <Button variant="secondary" onClick={() => setShowNotificationCenter((value) => !value)}>Notifications</Button>
          <Link to="/dashboard" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Dashboard</Link>
          <Link to="/strategic-advisor" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Strategic Advisor</Link>
          <Link to="/knowledge-intelligence" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Knowledge</Link>
          <Link to="/workflow-automation" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Workflow</Link>
          <Link to="/observability" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Observability</Link>
        </div>
      </Section>

      {showNotificationCenter ? (
        <Section title="Notification Center" description="Centralized notifications across decision recommendations and risk events.">
          <NotificationCenter
            notifications={notifications.notifications}
            onClose={() => setShowNotificationCenter(false)}
            onDismiss={notifications.dismiss}
            onClear={notifications.clear}
            onMarkRead={notifications.markRead}
            onMarkAllRead={notifications.markAllRead}
          />
        </Section>
      ) : null}

      <Section title="Elements associes" description="Navigation contextuelle vers documents, workflows, projets, fournisseurs, equipements et historiques.">
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Insights</p>
            <p className="text-[var(--srg-text-muted)]">Recommendations: {executive.topRecommendations.length}</p>
            <p className="text-[var(--srg-text-muted)]">Risks: {executive.topRisks.length}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Documents/Workflows</p>
            <p className="text-[var(--srg-text-muted)]">Documents indexes: {insightsViews.documents.indexations}</p>
            <p className="text-[var(--srg-text-muted)]">Workflow success: {insightsViews.workflows.summary.successRate}%</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Operations</p>
            <p className="text-[var(--srg-text-muted)]">Projects progress: {insightsViews.projects.progress}%</p>
            <p className="text-[var(--srg-text-muted)]">Maintenance availability: {insightsViews.maintenance.availability}%</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/knowledge-center" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir le document associe</Link>
          <Link to="/workflow-automation" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir le workflow associe</Link>
          <Link to="/project-execution" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir le projet associe</Link>
          <Link to="/procurement-inventory" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir le fournisseur associe</Link>
          <Link to="/maintenance" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir l'equipement associe</Link>
          <Link to="/history" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir les historiques associes</Link>
        </div>
      </Section>

      <Section title="Executive Summary" description="Top KPIs, risks, opportunities, recommendations and timeline.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {executive.topKpis.map((item) => (
            <div key={item.label} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{String(item.value)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-muted)]">
            <p className="font-semibold text-[var(--srg-text-title)]">Top Risks</p>
            {executive.topRisks.slice(0, 6).map((item) => <p key={item}>{item}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-muted)]">
            <p className="font-semibold text-[var(--srg-text-title)]">Top Opportunities</p>
            {executive.topOpportunities.slice(0, 6).map((item) => <p key={item}>{item}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-muted)]">
            <p className="font-semibold text-[var(--srg-text-title)]">Executive Timeline</p>
            {executive.executiveTimeline.slice(0, 8).map((item) => <p key={item}>{item}</p>)}
          </div>
        </div>
      </Section>

      <Section title="Decision Assistant" description="Ask enterprise decision support questions and get explainable answers.">
        <FormSection title="Decision Q&A" description="Ctrl+K focus search • Ctrl+Shift+R refresh insights.">
          <FieldGroup columns={2}>
            <SmartInputField
              id="enterprise-insights-question"
              label="Question"
              value={assistantQuestion}
              onValueChange={setAssistantQuestion}
              placeholder="What should be monitored today?"
              required
              autosaveLabel="Question history"
            />
            <Field label="Quick questions" hint="Use these grounded prompts based on existing workspace data.">
              <select
                aria-label="Quick assistant prompts"
                value={assistantQuestion}
                onChange={(event) => setAssistantQuestion(event.target.value)}
              >
                <option value="">Select a question</option>
                {assistantAnswers.map((item) => <option key={item.question} value={item.question}>{item.question}</option>)}
              </select>
            </Field>
          </FieldGroup>
          <FormToolbar autosaveLabel="Enterprise assistant prompt history">
            <Button onClick={askAssistant}>Ask Assistant</Button>
            <Button variant="secondary" onClick={refreshInsights}>Refresh Insights</Button>
          </FormToolbar>
          {assistantAnswer ? (
            <div className="mt-3 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
              <p className="font-semibold text-[var(--srg-text-title)]">{assistantAnswer.question}</p>
              <p className="mt-2 text-[var(--srg-text-muted)]">{assistantAnswer.answer}</p>
              <ValidationMessage variant="hint">
                Confidence {assistantAnswer.confidence}% • Source {assistantAnswer.source} • {assistantAnswer.justification}
              </ValidationMessage>
            </div>
          ) : null}
        </FormSection>
      </Section>

      <Section title="Top Recommendations" description="Priority, impact, urgency, confidence, source and justification.">
        <FormSection title="Recommendation filters" description="Enterprise SearchBar with persisted query and favorites.">
          <FieldGroup columns={3}>
            <Field label="Search">
              <div ref={searchHostRef}>
                <SearchBar
                  value={search}
                  onSearch={setSearch}
                  onValueChange={setSearch}
                  placeholder="Search risks, opportunities, recommendations"
                  instant
                  persistKey="enterprise-insights-search"
                />
              </div>
            </Field>
            <Field label="View">
              <select value={viewFilter} onChange={(event) => setViewFilter(event.target.value as InsightView | 'all')}>
                <option value="all">all</option>
                {VIEW_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as 'all' | 'high' | 'medium' | 'low')}>
                <option value="all">all</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </Field>
          </FieldGroup>
          <FormToolbar autosaveLabel="WorkspacePreferencesService">
            <Button variant="secondary" size="sm" onClick={toggleFavoriteSearch}>Toggle Favorite Query</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowNotificationCenter((value) => !value)}>Notifications</Button>
            {searchFavorites.map((item) => (
              <button
                key={item}
                type="button"
                className="srg-badge srg-badge-neutral"
                onClick={() => setSearch(item)}
              >
                {item}
              </button>
            ))}
          </FormToolbar>
        </FormSection>

        {filteredRecommendations.length === 0 ? (
          <EmptyState
            eyebrow="Recommendations"
            illustration={<span aria-hidden>◌</span>}
            title="No recommendation for current filters"
            description="Refresh insights or clear filters to display decision recommendations."
          />
        ) : (
          <DataTable
            tableId="enterprise-insights-recommendations"
            title="Decision recommendations"
            rows={filteredRecommendations}
            columns={recommendationColumns}
            searchable={false}
            pageSize={8}
            exportFileName="srg-enterprise-insights-recommendations.csv"
            multiSelect
            bulkActions={[
              {
                label: 'Export selected JSON',
                onClick: (rows) => WorkspaceExchangeService.downloadJson('srg-enterprise-insights-selected-recommendations.json', rows),
              },
            ]}
          />
        )}
      </Section>

      <Section title="Transverse Analyses" description="Evolution, comparisons, gaps, trends, correlations, anomalies, best and weak points, alerts and opportunities.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm">
            <p className="font-semibold text-[var(--srg-text-title)]">Evolution</p>
            {executive.analysis.evolution.map((item) => <p key={item} className="text-[var(--srg-text-muted)]">{item}</p>)}
            <p className="mt-3 font-semibold text-[var(--srg-text-title)]">Comparisons</p>
            {executive.analysis.comparisons.map((item) => <p key={item} className="text-[var(--srg-text-muted)]">{item}</p>)}
            <p className="mt-3 font-semibold text-[var(--srg-text-title)]">Gaps</p>
            {executive.analysis.gaps.map((item) => <p key={item} className="text-[var(--srg-text-muted)]">{item}</p>)}
            <p className="mt-3 font-semibold text-[var(--srg-text-title)]">Trends</p>
            {executive.analysis.trends.map((item) => <p key={item} className="text-[var(--srg-text-muted)]">{item}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm">
            <p className="font-semibold text-[var(--srg-text-title)]">Correlations</p>
            {executive.analysis.correlations.map((item) => <p key={item} className="text-[var(--srg-text-muted)]">{item}</p>)}
            <p className="mt-3 font-semibold text-[var(--srg-text-title)]">Anomalies</p>
            {executive.analysis.anomalies.map((item) => <p key={item} className="text-[var(--srg-text-muted)]">{item}</p>)}
            <p className="mt-3 font-semibold text-[var(--srg-text-title)]">Best Performances</p>
            {executive.analysis.bestPerformances.map((item) => <p key={item} className="text-[var(--srg-text-muted)]">{item}</p>)}
            <p className="mt-3 font-semibold text-[var(--srg-text-title)]">Weak Points</p>
            {executive.analysis.weakPoints.map((item) => <p key={item} className="text-[var(--srg-text-muted)]">{item}</p>)}
            <p className="mt-3 font-semibold text-[var(--srg-text-title)]">Alerts</p>
            {executive.analysis.alerts.map((item) => <p key={item} className="text-[var(--srg-text-muted)]">{item}</p>)}
            <p className="mt-3 font-semibold text-[var(--srg-text-title)]">Opportunities</p>
            {executive.analysis.opportunities.map((item) => <p key={item} className="text-[var(--srg-text-muted)]">{item}</p>)}
          </div>
        </div>
      </Section>

      <Section title="Domain Views" description="Executive, Finance, HR, Maintenance, Procurement, CRM, Projects, AI, Documents and Workflows.">
        <div className="space-y-3">
          <CollapsibleFormSection id="insight-view-executive" title="Executive" description="General management lens.">
            <p className="text-sm text-[var(--srg-text-muted)]">Revenue {insightsViews.executive.revenue.toFixed(2)} • Margin {insightsViews.executive.margin.toFixed(2)} • Cash flow {insightsViews.executive.cashFlow.toFixed(2)} • Open risks {insightsViews.executive.openRisks}</p>
          </CollapsibleFormSection>
          <CollapsibleFormSection id="insight-view-finance" title="Finance" description="Financial steering and variance analysis.">
            <p className="text-sm text-[var(--srg-text-muted)]">Accounts {insightsViews.finance.accounts} • Entries {insightsViews.finance.entries} • Overdue customers {insightsViews.finance.customerOverdue} • Budget variance {insightsViews.finance.budgetVariance.toFixed(2)}</p>
          </CollapsibleFormSection>
          <CollapsibleFormSection id="insight-view-hr" title="HR" description="Workforce capability and performance.">
            <p className="text-sm text-[var(--srg-text-muted)]">Employees {insightsViews.hr.employees} • Active {insightsViews.hr.activeEmployees} • Leave pending {insightsViews.hr.leavePending} • Training programs {insightsViews.hr.trainings}</p>
          </CollapsibleFormSection>
          <CollapsibleFormSection id="insight-view-maintenance" title="Maintenance" description="Asset health and intervention reliability.">
            <p className="text-sm text-[var(--srg-text-muted)]">Equipments {insightsViews.maintenance.equipments} • Failures {insightsViews.maintenance.failures} • MTBF {insightsViews.maintenance.mtbf}h • OEE {insightsViews.maintenance.oee}%</p>
          </CollapsibleFormSection>
          <CollapsibleFormSection id="insight-view-procurement" title="Procurement" description="Suppliers, stock and fulfillment risk.">
            <p className="text-sm text-[var(--srg-text-muted)]">Suppliers {insightsViews.procurement.suppliers} • Orders {insightsViews.procurement.orders} • Low stock {insightsViews.procurement.lowStock} • Incidents {insightsViews.procurement.incidents}</p>
          </CollapsibleFormSection>
          <CollapsibleFormSection id="insight-view-crm" title="CRM" description="Customer interaction health through conversation insights.">
            <p className="text-sm text-[var(--srg-text-muted)]">Active conversations {insightsViews.crm.activeConversations} • Archived {insightsViews.crm.archivedConversations} • Average stream progress {insightsViews.crm.lifecycle.avgStreamProgress}%</p>
          </CollapsibleFormSection>
          <CollapsibleFormSection id="insight-view-projects" title="Projects" description="Execution progress, delays and risk load.">
            <p className="text-sm text-[var(--srg-text-muted)]">Projects {insightsViews.projects.projects} • Delays {insightsViews.projects.delays} • Risks {insightsViews.projects.risks} • Diagnostics {insightsViews.projects.diagnostics}</p>
          </CollapsibleFormSection>
          <CollapsibleFormSection id="insight-view-ai" title="AI" description="Provider quality and agent performance.">
            <p className="text-sm text-[var(--srg-text-muted)]">Enabled providers {insightsViews.ai.enabledProviders} • Degraded providers {insightsViews.ai.degradedProviders} • Executions {insightsViews.ai.totalExecutions} • Failures {insightsViews.ai.failures}</p>
          </CollapsibleFormSection>
          <CollapsibleFormSection id="insight-view-documents" title="Documents" description="Knowledge and document intelligence indicators.">
            <p className="text-sm text-[var(--srg-text-muted)]">Documents {insightsViews.documents.documents} • Indexations {insightsViews.documents.indexations} • Searches {insightsViews.documents.searchHistory.length} • AI answers {insightsViews.documents.edi.enterpriseAnswers}</p>
          </CollapsibleFormSection>
          <CollapsibleFormSection id="insight-view-workflows" title="Workflows" description="Automation throughput and reliability.">
            <p className="text-sm text-[var(--srg-text-muted)]">Workflows {insightsViews.workflows.summary.totalWorkflows} • Active {insightsViews.workflows.summary.active} • Failed {insightsViews.workflows.summary.failed} • Success {insightsViews.workflows.summary.successRate}%</p>
          </CollapsibleFormSection>
        </div>
      </Section>

      <Section title="Decision History" description="Decision history, recommendations history, comparisons history and exports.">
        <DataTable
          tableId="enterprise-insights-decision-history"
          title="Decision History"
          rows={decisionHistory}
          columns={historyColumns}
          searchable
          pageSize={8}
          exportFileName="srg-enterprise-insights-decision-history.csv"
          multiSelect
          bulkActions={[
            { label: 'Export selected JSON', onClick: (rows) => WorkspaceExchangeService.downloadJson('srg-enterprise-insights-decision-history-selected.json', rows) },
          ]}
        />
        <DataTable
          tableId="enterprise-insights-recommendation-history"
          title="Recommendations History"
          rows={recommendationsHistory}
          columns={historyColumns}
          searchable
          pageSize={8}
          exportFileName="srg-enterprise-insights-recommendations-history.csv"
          multiSelect
          bulkActions={[
            { label: 'Export selected JSON', onClick: (rows) => WorkspaceExchangeService.downloadJson('srg-enterprise-insights-recommendations-history-selected.json', rows) },
          ]}
        />
        <DataTable
          tableId="enterprise-insights-comparison-history"
          title="Comparisons History"
          rows={comparisonsHistory}
          columns={historyColumns}
          searchable
          pageSize={8}
          exportFileName="srg-enterprise-insights-comparisons-history.csv"
          multiSelect
          bulkActions={[
            { label: 'Export selected JSON', onClick: (rows) => WorkspaceExchangeService.downloadJson('srg-enterprise-insights-comparisons-history-selected.json', rows) },
          ]}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => EnterpriseInsightsWorkspaceService.exportDecisionHistory()}>Export Decision History</Button>
          <Button variant="secondary" onClick={() => EnterpriseInsightsWorkspaceService.exportRecommendationsHistory()}>Export Recommendations History</Button>
          <Button variant="secondary" onClick={() => EnterpriseInsightsWorkspaceService.exportComparisonsHistory()}>Export Comparisons History</Button>
        </div>
      </Section>

      <Section title="Observability" description="Decision events, insight metrics, recommendation metrics, prediction metrics and diagnostic timeline.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Refreshes</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{observability.insightMetrics.refreshes}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Decision events</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{observability.insightMetrics.events}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Recommendations</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{observability.recommendationMetrics.totalRecommendations}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Predictions</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{observability.predictionMetrics.totalPredictions}</p></div>
        </div>

        <DataTable
          tableId="enterprise-insights-events"
          title="Decision Events"
          rows={observability.decisionEvents}
          columns={eventColumns}
          searchable
          pageSize={8}
          exportFileName="srg-enterprise-insights-events.csv"
        />

        <DataTable
          tableId="enterprise-insights-diagnostic-timeline"
          title="Diagnostic Timeline"
          rows={observability.diagnosticTimeline}
          columns={[
            { key: 'date', label: 'Date', sortable: true },
            { key: 'riskCount', label: 'Risks', sortable: true },
            { key: 'opportunityCount', label: 'Opportunities', sortable: true },
            { key: 'recommendationCount', label: 'Recommendations', sortable: true },
            { key: 'predictionCount', label: 'Predictions', sortable: true },
            { key: 'avgConfidence', label: 'Avg confidence', sortable: true, render: (row) => `${row.avgConfidence}%` },
          ]}
          searchable
          pageSize={8}
          exportFileName="srg-enterprise-insights-diagnostic-timeline.csv"
        />
      </Section>
    </div>
  )
}
