import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import CollaborationActivityFeed from '#/app/components/collaboration/CollaborationActivityFeed'
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
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export const Route = createFileRoute('/history')({
  component: HistoryPage,
})

function HistoryPage() {
  const navigate = useNavigate()
  const historyPreferences = WorkspacePreferencesService.getPreferences()
  const persistedFilters = (historyPreferences.filters.history as Record<string, string | boolean | number> | undefined) || {}
  const persistedSort = (historyPreferences.sorts.history as string | undefined) || 'createdAt:desc'
  const [sortKey, sortOrder] = persistedSort.split(':') as ['createdAt' | 'durationMs' | 'costEstimate', 'asc' | 'desc']
  const [records, setRecords] = useState(() => HistoryWorkspaceService.getRecords())
  const [search, setSearch] = useState(typeof persistedFilters.search === 'string' ? persistedFilters.search : '')
  const [dateFilter, setDateFilter] = useState(typeof persistedFilters.dateFilter === 'string' ? persistedFilters.dateFilter : '')
  const [projectFilter, setProjectFilter] = useState(typeof persistedFilters.projectFilter === 'string' ? persistedFilters.projectFilter : 'all')
  const [providerFilter, setProviderFilter] = useState(typeof persistedFilters.providerFilter === 'string' ? persistedFilters.providerFilter : 'all')
  const [modelFilter, setModelFilter] = useState(typeof persistedFilters.modelFilter === 'string' ? persistedFilters.modelFilter : 'all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'cancelled'>(persistedFilters.statusFilter === 'pending' || persistedFilters.statusFilter === 'completed' || persistedFilters.statusFilter === 'failed' || persistedFilters.statusFilter === 'cancelled' ? persistedFilters.statusFilter : 'all')
  const [authorFilter, setAuthorFilter] = useState(typeof persistedFilters.authorFilter === 'string' ? persistedFilters.authorFilter : '')
  const [collaboratorFilter, setCollaboratorFilter] = useState(typeof persistedFilters.collaboratorFilter === 'string' ? persistedFilters.collaboratorFilter : '')
  const [versionFilter, setVersionFilter] = useState(typeof persistedFilters.versionFilter === 'string' ? persistedFilters.versionFilter : '')
  const [typeFilter, setTypeFilter] = useState(typeof persistedFilters.typeFilter === 'string' ? persistedFilters.typeFilter : '')
  const [activeSortKey, setActiveSortKey] = useState<'createdAt' | 'durationMs' | 'costEstimate'>(sortKey)
  const [activeSortOrder, setActiveSortOrder] = useState<'asc' | 'desc'>(sortOrder)
  const [pageSize, setPageSize] = useState(historyPreferences.tableSizes.history || 8)
  const [page, setPage] = useState(1)
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([])

  useEffect(() => {
    WorkspacePreferencesService.setFilters('history', {
      search,
      dateFilter,
      projectFilter,
      providerFilter,
      modelFilter,
      statusFilter,
      authorFilter,
      collaboratorFilter,
      versionFilter,
      typeFilter,
    })
    WorkspacePreferencesService.setSort('history', `${activeSortKey}:${activeSortOrder}`)
    WorkspacePreferencesService.setTableSize('history', pageSize)
  }, [search, dateFilter, projectFilter, providerFilter, modelFilter, statusFilter, authorFilter, collaboratorFilter, versionFilter, typeFilter, activeSortKey, activeSortOrder, pageSize])

  const projects = useMemo(
    () => ['all', ...Array.from(new Set(records.map((item) => item.projectName).filter((item): item is string => Boolean(item))))],
    [records],
  )
  const providers = useMemo(
    () => ['all', ...Array.from(new Set(records.map((item) => item.provider)))],
    [records],
  )
  const models = useMemo(
    () => ['all', ...Array.from(new Set(records.map((item) => item.model)))],
    [records],
  )

  const filteredRecords = useMemo(
    () =>
      records.filter((item) => {
        const query = search.trim().toLowerCase()
        if (query && !`${item.promptName} ${item.promptText} ${item.output} ${item.provider} ${item.model}`.toLowerCase().includes(query)) {
          return false
        }
        if (dateFilter && !item.createdAt.startsWith(dateFilter)) {
          return false
        }
        if (projectFilter !== 'all' && item.projectName !== projectFilter) {
          return false
        }
        if (providerFilter !== 'all' && item.provider !== providerFilter) {
          return false
        }
        if (modelFilter !== 'all' && item.model !== modelFilter) {
          return false
        }
        if (statusFilter !== 'all' && item.status !== statusFilter) {
          return false
        }
        if (authorFilter && !(item.actorName ?? '').toLowerCase().includes(authorFilter.toLowerCase())) {
          return false
        }
        if (collaboratorFilter && !`${item.promptText} ${item.output}`.toLowerCase().includes(collaboratorFilter.toLowerCase())) {
          return false
        }
        if (versionFilter && !`${item.promptName} ${item.promptText} ${item.output}`.toLowerCase().includes(versionFilter.toLowerCase())) {
          return false
        }
        if (typeFilter && !`${item.requestKind} ${item.eventType ?? ''} ${item.entityType ?? ''}`.toLowerCase().includes(typeFilter.toLowerCase())) {
          return false
        }
        return true
      }),
    [records, search, dateFilter, modelFilter, projectFilter, providerFilter, statusFilter, authorFilter, collaboratorFilter, versionFilter, typeFilter],
  )

  const sortedRecords = useMemo(() => {
    const direction = activeSortOrder === 'asc' ? 1 : -1
    return [...filteredRecords].sort((left, right) => {
      if (activeSortKey === 'durationMs') {
        return (left.durationMs - right.durationMs) * direction
      }
      if (activeSortKey === 'costEstimate') {
        return (left.costEstimate - right.costEstimate) * direction
      }
      return (left.createdAt > right.createdAt ? 1 : -1) * direction
    })
  }, [filteredRecords, activeSortKey, activeSortOrder])

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize))
  const paginatedRecords = sortedRecords.slice((page - 1) * pageSize, page * pageSize)

  const comparedRecords = sortedRecords.filter((item) => selectedCompareIds.includes(item.id)).slice(0, 2)
  const conversationSummary = ConversationWorkspaceService.getGlobalSummary()
  const agentSummary = AgentWorkspaceService.getSummary()
  const knowledgeSummary = KnowledgeWorkspaceService.getSummary()
  const businessPolicySummary = BusinessPolicyWorkspaceService.getSummary()
  const projectExecutionSummary = ProjectExecutionWorkspaceService.getSummary()
  const procurementSummary = ProcurementInventoryWorkspaceService.getSummary()
  const maintenanceSummary = MaintenanceWorkspaceService.getSummary()
  const financeSummary = FinanceWorkspaceService.getSummary()
  const humanResourcesSummary = HumanResourcesWorkspaceService.getSummary()

  const refresh = () => {
    setRecords(HistoryWorkspaceService.getRecords())
  }

  const deleteRecord = (id: string) => {
    HistoryWorkspaceService.deleteRecord(id)
    setSelectedCompareIds((current) => current.filter((item) => item !== id))
    refresh()
  }

  const rerunRecord = (id: string) => {
    const record = records.find((item) => item.id === id)
    if (!record) {
      return
    }

    HistoryWorkspaceService.setPendingRerun({
      promptName: record.promptName,
      promptText: record.promptText,
      provider: record.provider,
      model: record.model,
      projectId: record.projectId,
      projectName: record.projectName,
    })
    void navigate({ to: '/generate' })
  }

  const exportFiltered = () => {
    WorkspaceExchangeService.downloadJson('srg-history-export.json', sortedRecords)
  }

  const exportHistoryBundle = () => {
    CollaborationWorkspaceService.exportHistory('json')
  }

  const toggleCompare = (id: string, checked: boolean) => {
    setSelectedCompareIds((current) => {
      if (checked) {
        return [...current.filter((item) => item !== id), id].slice(-2)
      }
      return current.filter((item) => item !== id)
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="History" description="Filtrez, comparez, exportez et relancez vos executions SRG." />

      <Section title="Filtres" description="Date, projet, provider, modele et statut.">
        <div className="grid gap-3 md:grid-cols-6">
          <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Recherche avancée" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm" />
          <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm" />
          <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm">
            {projects.map((project) => <option key={project} value={project}>{project}</option>)}
          </select>
          <select value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm">
            {providers.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
          </select>
          <select value={modelFilter} onChange={(event) => setModelFilter(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm">
            {models.map((model) => <option key={model} value={model}>{model}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'pending' | 'completed' | 'failed' | 'cancelled')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm">
            <option value="all">all</option>
            <option value="pending">pending</option>
            <option value="completed">completed</option>
            <option value="failed">failed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <input type="search" value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)} placeholder="Auteur" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm" />
          <input type="search" value={collaboratorFilter} onChange={(event) => setCollaboratorFilter(event.target.value)} placeholder="Collaborateur" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm" />
          <input type="search" value={versionFilter} onChange={(event) => setVersionFilter(event.target.value)} placeholder="Version" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm" />
          <input type="search" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} placeholder="Type" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <select value={activeSortKey} onChange={(event) => setActiveSortKey(event.target.value as 'createdAt' | 'durationMs' | 'costEstimate')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">
            <option value="createdAt">Tri: date</option>
            <option value="durationMs">Tri: durée</option>
            <option value="costEstimate">Tri: coût</option>
          </select>
          <select value={activeSortOrder} onChange={(event) => setActiveSortOrder(event.target.value as 'asc' | 'desc')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">
            <option value={6}>6 lignes</option>
            <option value={8}>8 lignes</option>
            <option value={12}>12 lignes</option>
          </select>
          <button type="button" onClick={exportFiltered} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter JSON</button>
          <button type="button" onClick={() => CollaborationWorkspaceService.exportHistory('csv')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter CSV</button>
          <button type="button" onClick={() => CollaborationWorkspaceService.exportHistory('markdown')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter Markdown</button>
          <button type="button" onClick={exportHistoryBundle} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Export Bundle</button>
          <button type="button" onClick={() => { HistoryWorkspaceService.clear(); refresh() }} className="rounded-3xl border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] px-4 py-2 text-sm font-semibold text-[#9b2f2f]">Vider</button>
        </div>
      </Section>

      <CollaborationActivityFeed />

      <Section title="Conversations" description="Historique conversationnel enrichi: provider, model, latence, tokens, coût et résultats.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Conversations actives</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{conversationSummary.active}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Conversations archivées</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{conversationSummary.archived}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Tokens</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{conversationSummary.totalTokens}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Coût</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">${conversationSummary.totalCost.toFixed(6)}</p></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => WorkspaceExchangeService.downloadJson('srg-conversations-history.json', ConversationWorkspaceService.listConversations())} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter conversations JSON</button>
          <button type="button" onClick={() => WorkspaceExchangeService.downloadText('srg-conversations-history.txt', ConversationWorkspaceService.listConversations().map((item) => `${item.title} | ${item.provider}/${item.model} | ${item.messages.length} messages`).join('\n'))} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter conversations TXT</button>
          <button type="button" onClick={() => { void navigate({ to: '/chat' }) }} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir AI Workspace</button>
        </div>
        <div className="mt-3 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-xs text-[var(--srg-text-muted)]">
          <p>Lifecycle: running {conversationSummary.lifecycle.running} • completed {conversationSummary.lifecycle.completed} • cancelled {conversationSummary.lifecycle.cancelled} • failed {conversationSummary.lifecycle.failed}</p>
          <p>Progression streaming moyenne: {conversationSummary.lifecycle.avgStreamProgress}%</p>
          <p>Tokens chart: {conversationSummary.charts.tokens.join(' / ') || 'n/a'}</p>
        </div>
      </Section>

      <Section title="AI Agents History" description="Historique des agents, workflows, automatisations, erreurs et executions.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Agents</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{agentSummary.agentHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Workflows</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{agentSummary.workflowHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Automatisations</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{agentSummary.automationHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Erreurs</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{agentSummary.errorHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Executions</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{agentSummary.executionHistory.length}</p></div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Workflow history</p>
            {agentSummary.workflowHistory.slice(0, 6).map((workflow) => <p key={workflow.id}>{workflow.name} | {workflow.status} | {new Date(workflow.updatedAt).toLocaleString()}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Execution history</p>
            {agentSummary.executionHistory.slice(0, 6).map((execution) => <p key={execution.id}>{execution.sourceType} | {execution.status} | {execution.latencyMs}ms | ${execution.cost.toFixed(6)}</p>)}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => AgentWorkspaceService.exportAgents()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter agents/workflows</button>
          <button type="button" onClick={() => { void navigate({ to: '/agents' }) }} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir AI Agents Workspace</button>
        </div>
      </Section>

      <Section title="Knowledge History" description="Imports, suppressions, indexations, recherches, consultations et exports.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Imports</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.importHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Suppressions</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.deletionHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Indexations</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.indexationHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Recherches</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.searchHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Consultations</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.consultationHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Exports</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.exportHistory.length}</p></div>
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-5 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Decompressions</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.edi.decompressions}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">OCR queued</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.edi.ocrQueued}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">OCR completed</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.edi.ocrCompleted}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">AI answers</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.edi.enterpriseAnswers}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Enterprise reports</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{knowledgeSummary.edi.reports}</p></div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Imports</p>
            {knowledgeSummary.importHistory.slice(0, 6).map((item) => <p key={item.id}>{item.type} | {item.documentIds.length} docs | {new Date(item.createdAt).toLocaleString()}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Searches</p>
            {knowledgeSummary.searchHistory.slice(0, 6).map((item) => <p key={item.id}>{item.query || 'empty'} | {item.resultCount} results | semantic UI {item.semanticUi ? 'yes' : 'no'}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Exports</p>
            {knowledgeSummary.exportHistory.slice(0, 6).map((item) => <p key={item.id}>{item.format} | {item.documentIds.length} docs | {new Date(item.createdAt).toLocaleString()}</p>)}
          </div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Archive distribution</p>
            {knowledgeSummary.edi.byArchiveType.map((item) => <p key={item.type}>{item.type.toUpperCase()} | {item.count}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Top document types</p>
            {knowledgeSummary.edi.byDocumentType.slice(0, 8).map((item) => <p key={item.type}>{item.type} | {item.count}</p>)}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => WorkspaceExchangeService.downloadJson('srg-knowledge-history.json', knowledgeSummary)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter history knowledge JSON</button>
          <button type="button" onClick={() => { void navigate({ to: '/knowledge-center' }) }} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Knowledge Workspace</button>
        </div>
      </Section>

      <Section title="Business Policy & Devis History" description="Politiques, regles, devis, facturation, suggestions d'apprentissage, simulations et reponses IA.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Policies</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{businessPolicySummary.policies}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Coefficients</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{businessPolicySummary.coefficients}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Quotes</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{businessPolicySummary.quotes}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Billing docs</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{businessPolicySummary.billingDocuments}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Simulations</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{businessPolicySummary.simulations}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">AI answers</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{businessPolicySummary.aiAnswers}</p></div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Value snapshot</p>
            <p>Total quote value: {businessPolicySummary.totalQuoteValue.toFixed(2)}</p>
            <p>Total billing value: {businessPolicySummary.totalBillingValue.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Learning</p>
            <p>Suggestions: {businessPolicySummary.learningSuggestions}</p>
            <p>Active policies: {businessPolicySummary.activePolicies}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Catalog</p>
            <p>Supplies: {businessPolicySummary.supplies}</p>
            <p>Labor roles: {businessPolicySummary.laborRoles}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => WorkspaceExchangeService.downloadJson('srg-business-history.json', BusinessPolicyWorkspaceService.getStore())} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter business history JSON</button>
          <button type="button" onClick={() => { void navigate({ to: '/business-policy' }) }} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Business Policy Workspace</button>
          <button type="button" onClick={() => { void navigate({ to: '/devis' }) }} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Ouvrir Devis Workspace</button>
        </div>
      </Section>

      <Section title="Project Execution History" description="Creation, modification, validation, affectation, pointage, commande, reception, rapport, incident et cloture.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Projects</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{projectExecutionSummary.projects}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Work items</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{projectExecutionSummary.workItems}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Sites</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{projectExecutionSummary.sites}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Teams</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{projectExecutionSummary.teams}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Attendance</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{projectExecutionSummary.attendance}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Contracts</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{projectExecutionSummary.contracts}</p></div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Budgets</p>
            <p>Total: {projectExecutionSummary.totalBudget.toFixed(2)}</p>
            <p>Consumed: {projectExecutionSummary.consumedBudget.toFixed(2)}</p>
            <p>Progress: {projectExecutionSummary.progress.toFixed(1)}%</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Risks and incidents</p>
            <p>Delays: {projectExecutionSummary.delays}</p>
            <p>Incidents: {projectExecutionSummary.incidents}</p>
            <p>Open risks: {projectExecutionSummary.risks}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Observability</p>
            <p>Timeline: {projectExecutionSummary.timeline}</p>
            <p>Diagnostics: {projectExecutionSummary.diagnostics}</p>
            <p>Reports: {projectExecutionSummary.reports}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => WorkspaceExchangeService.downloadJson('srg-project-execution-history.json', ProjectExecutionWorkspaceService.getStore())} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter project execution JSON</button>
          <button type="button" onClick={() => { void navigate({ to: '/project-execution' }) }} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Project Execution Workspace</button>
        </div>
      </Section>

      <Section title="Procurement & Inventory History" description="Demandes achat, AO, fournisseurs, commandes, stocks, receptions, logistique et analyses IA.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Requests</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{procurementSummary.requests}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Tenders</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{procurementSummary.tenders}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Suppliers</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{procurementSummary.suppliers}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Orders</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{procurementSummary.orders}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Stock items</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{procurementSummary.stockItems}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Shipments</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{procurementSummary.logistics}</p></div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Financial snapshot</p>
            <p>Request budget: {procurementSummary.requestBudget.toFixed(2)}</p>
            <p>Order value: {procurementSummary.orderValue.toFixed(2)}</p>
            <p>Stock value: {procurementSummary.stockValue.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Risk snapshot</p>
            <p>Low stock: {procurementSummary.lowStock}</p>
            <p>Incidents: {procurementSummary.incidents}</p>
            <p>Non conformities: {procurementSummary.openNonConformities}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Observability</p>
            <p>Timeline: {procurementSummary.timeline}</p>
            <p>Diagnostics: {procurementSummary.diagnostics}</p>
            <p>AI insights: {procurementSummary.aiInsights}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Top suppliers</p>
            {procurementSummary.topSuppliers.slice(0, 8).map((item) => <p key={item.name}>{item.name} | {item.count}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Stock categories</p>
            {procurementSummary.byCategory.slice(0, 8).map((item) => <p key={item.category}>{item.category} | {item.count}</p>)}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => WorkspaceExchangeService.downloadJson('srg-procurement-history.json', ProcurementInventoryWorkspaceService.getStore())} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter procurement JSON</button>
          <button type="button" onClick={() => ProcurementInventoryWorkspaceService.exportOrdersCsv()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter orders CSV</button>
          <button type="button" onClick={() => ProcurementInventoryWorkspaceService.exportStockCsv()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter stock CSV</button>
          <button type="button" onClick={() => { void navigate({ to: '/procurement-inventory' }) }} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Procurement & Inventory Workspace</button>
        </div>
      </Section>

      <Section title="Maintenance History" description="Equipements, interventions, planning, techniciens, pièces, checklists et analyses IA CMMS.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Equipements</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{maintenanceSummary.equipments}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Interventions</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{maintenanceSummary.workOrders}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Techniciens</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{maintenanceSummary.technicians}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Pièces</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{maintenanceSummary.spareParts}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Checklist</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{maintenanceSummary.checklists}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">IA insights</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{maintenanceSummary.aiInsights}</p></div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Performance</p>
            <p>Disponibilité: {maintenanceSummary.availability}%</p>
            <p>MTBF: {maintenanceSummary.mtbf} h</p>
            <p>MTTR: {maintenanceSummary.mttr} h</p>
            <p>OEE: {maintenanceSummary.oee}%</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Risques</p>
            <p>Pannes: {maintenanceSummary.failures}</p>
            <p>Diagnostics: {maintenanceSummary.diagnostics}</p>
            <p>Timeline: {maintenanceSummary.timeline}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Coûts</p>
            <p>Total maintenance: {maintenanceSummary.totalMaintenanceCost.toFixed(2)}</p>
            <p>Downtime: {maintenanceSummary.totalDowntimeMinutes} min</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => WorkspaceExchangeService.downloadJson('srg-maintenance-history.json', MaintenanceWorkspaceService.getStore())} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter maintenance JSON</button>
          <button type="button" onClick={() => MaintenanceWorkspaceService.exportWorkOrdersCsv()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter interventions CSV</button>
          <button type="button" onClick={() => MaintenanceWorkspaceService.exportSparePartsCsv()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter pièces CSV</button>
          <button type="button" onClick={() => { void navigate({ to: '/maintenance' }) }} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Maintenance Workspace</button>
        </div>
      </Section>

      <Section title="Finance History" description="Comptabilite, tresorerie, clients, fournisseurs, budgets, controles et analyses financieres.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Comptes</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{financeSummary.accounts}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Ecritures</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{financeSummary.entries}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Factures clients</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{financeSummary.customerInvoices}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Factures fournisseurs</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{financeSummary.supplierInvoices}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Budgets</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{financeSummary.budgets}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Tresorerie</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{financeSummary.treasuryBalance.toFixed(2)}</p></div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Performance</p>
            <p>Cash flow: {financeSummary.cashFlow.toFixed(2)}</p>
            <p>EBITDA: {financeSummary.ebitda.toFixed(2)}</p>
            <p>ROI: {financeSummary.roi.toFixed(2)}%</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Pilotage</p>
            <p>Ecart budget: {financeSummary.budgetVariance.toFixed(2)}</p>
            <p>Factures clients en retard: {financeSummary.customerOverdue}</p>
            <p>Factures fournisseurs en retard: {financeSummary.supplierOverdue}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Observabilite</p>
            <p>Timeline: {financeSummary.timeline}</p>
            <p>Diagnostics: {financeSummary.diagnostics}</p>
            <p>Journaux audit: {financeSummary.auditLogs}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => FinanceWorkspaceService.exportStore()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter finance JSON</button>
          <button type="button" onClick={() => FinanceWorkspaceService.exportGeneralLedgerCsv()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter grand livre CSV</button>
          <button type="button" onClick={() => FinanceWorkspaceService.exportCustomerAgingCsv()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter clients CSV</button>
          <button type="button" onClick={() => FinanceWorkspaceService.exportSupplierAgingCsv()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter fournisseurs CSV</button>
          <button type="button" onClick={() => { void navigate({ to: '/finance' }) }} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Finance Workspace</button>
        </div>
      </Section>

      <Section title="Human Resources History" description="Employes, organisation, contrats, paie, presences, conges, competences et recrutement.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Employes</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{humanResourcesSummary.employees}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Contrats</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{humanResourcesSummary.contracts}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Paies</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{humanResourcesSummary.payrollRecords}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Presences</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{humanResourcesSummary.attendanceRecords}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Conges</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{humanResourcesSummary.leaveRequests}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Evaluations</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{humanResourcesSummary.evaluations}</p></div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Workforce</p>
            <p>Actifs: {humanResourcesSummary.activeEmployees}</p>
            <p>Org units: {humanResourcesSummary.organizationUnits}</p>
            <p>Skills: {humanResourcesSummary.skills}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Payroll & attendance</p>
            <p>Payroll total: {humanResourcesSummary.payrollTotal.toFixed(2)}</p>
            <p>Attendance hours: {humanResourcesSummary.attendanceHours.toFixed(2)}</p>
            <p>Overtime hours: {humanResourcesSummary.overtimeHours.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Observabilite</p>
            <p>Timeline: {humanResourcesSummary.timeline}</p>
            <p>Diagnostics: {humanResourcesSummary.diagnostics}</p>
            <p>Audit logs: {humanResourcesSummary.auditLogs}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => HumanResourcesWorkspaceService.exportStore()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter RH JSON</button>
          <button type="button" onClick={() => HumanResourcesWorkspaceService.exportEmployeesCsv()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter employes CSV</button>
          <button type="button" onClick={() => HumanResourcesWorkspaceService.exportPayrollCsv()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter paie CSV</button>
          <button type="button" onClick={() => { void navigate({ to: '/human-resources' }) }} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Ouvrir HR Workspace</button>
        </div>
      </Section>

      <Section title="Executions" description="Historique complet des runs visibles.">
        <div className="space-y-3 text-sm">
          {sortedRecords.length === 0 ? (
            <EmptyState
              eyebrow="History"
              illustration={<span aria-hidden>⌛</span>}
              title="Aucun historique"
              description="Aucun run ne correspond aux filtres actifs. Lancez une génération ou réinitialisez la recherche avancée."
              action={<button type="button" onClick={() => { setSearch(''); setDateFilter(''); setProjectFilter('all'); setProviderFilter('all'); setModelFilter('all'); setStatusFilter('all') }} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white">Réinitialiser</button>}
            />
          ) : null}
          {paginatedRecords.map((item) => (
            <article key={item.id} className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--srg-text-title)]">{item.promptName}</p>
                  <p className="mt-1 text-[var(--srg-text-muted)]">{item.projectName ?? 'No project'} • {item.provider} / {item.model}</p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-[var(--srg-text-muted)]">
                  <input type="checkbox" checked={selectedCompareIds.includes(item.id)} onChange={(event) => toggleCompare(item.id, event.target.checked)} />
                  <span>Comparer</span>
                </label>
              </div>
              <p className="mt-3 text-[var(--srg-text-muted)]">Statut: {item.status} • {new Date(item.createdAt).toLocaleString()} • {item.durationMs} ms • ${item.costEstimate.toFixed(6)}</p>
              <p className="mt-2 line-clamp-3 text-[var(--srg-text-muted)]">{item.output || item.promptText}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => rerunRecord(item.id)} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-xs font-semibold text-white">Relancer</button>
                <button type="button" onClick={() => WorkspaceExchangeService.downloadJson(`${item.id}.json`, item)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--srg-text-title)]">Exporter</button>
                <button type="button" onClick={() => deleteRecord(item.id)} className="rounded-3xl border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] px-4 py-2 text-xs font-semibold text-[#9b2f2f]">Supprimer</button>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-[var(--srg-text-muted)]">
          <span>Page {page} / {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 disabled:opacity-50">Précédente</button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 disabled:opacity-50">Suivante</button>
          </div>
        </div>
      </Section>

      {comparedRecords.length === 2 ? (
        <Section title="Comparaison" description="Comparaison de deux runs selectionnes.">
          <div className="grid gap-4 xl:grid-cols-2">
            {comparedRecords.map((item) => (
              <div key={item.id} className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
                <p className="font-semibold text-[var(--srg-text-title)]">{item.promptName}</p>
                <p className="mt-1 text-xs text-[var(--srg-text-muted)]">{item.provider} / {item.model} • {new Date(item.createdAt).toLocaleString()}</p>
                <pre className="mt-4 whitespace-pre-wrap break-words rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-xs text-[var(--srg-text-title)]">{item.output || item.promptText}</pre>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  )
}
