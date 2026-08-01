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
          <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Recherche avancée" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm" />
          <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm" />
          <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
            {projects.map((project) => <option key={project} value={project}>{project}</option>)}
          </select>
          <select value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
            {providers.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
          </select>
          <select value={modelFilter} onChange={(event) => setModelFilter(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
            {models.map((model) => <option key={model} value={model}>{model}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'pending' | 'completed' | 'failed' | 'cancelled')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
            <option value="all">all</option>
            <option value="pending">pending</option>
            <option value="completed">completed</option>
            <option value="failed">failed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <input type="search" value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)} placeholder="Auteur" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm" />
          <input type="search" value={collaboratorFilter} onChange={(event) => setCollaboratorFilter(event.target.value)} placeholder="Collaborateur" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm" />
          <input type="search" value={versionFilter} onChange={(event) => setVersionFilter(event.target.value)} placeholder="Version" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm" />
          <input type="search" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} placeholder="Type" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <select value={activeSortKey} onChange={(event) => setActiveSortKey(event.target.value as 'createdAt' | 'durationMs' | 'costEstimate')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">
            <option value="createdAt">Tri: date</option>
            <option value="durationMs">Tri: durée</option>
            <option value="costEstimate">Tri: coût</option>
          </select>
          <select value={activeSortOrder} onChange={(event) => setActiveSortOrder(event.target.value as 'asc' | 'desc')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">
            <option value={6}>6 lignes</option>
            <option value={8}>8 lignes</option>
            <option value={12}>12 lignes</option>
          </select>
          <button type="button" onClick={exportFiltered} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Exporter JSON</button>
          <button type="button" onClick={() => CollaborationWorkspaceService.exportHistory('csv')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Exporter CSV</button>
          <button type="button" onClick={() => CollaborationWorkspaceService.exportHistory('markdown')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Exporter Markdown</button>
          <button type="button" onClick={exportHistoryBundle} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Export Bundle</button>
          <button type="button" onClick={() => { HistoryWorkspaceService.clear(); refresh() }} className="rounded-3xl border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] px-4 py-2 text-sm font-semibold text-[#9b2f2f]">Vider</button>
        </div>
      </Section>

      <CollaborationActivityFeed />

      <Section title="Conversations" description="Historique conversationnel enrichi: provider, model, latence, tokens, coût et résultats.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Conversations actives</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{conversationSummary.active}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Conversations archivées</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{conversationSummary.archived}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Tokens</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{conversationSummary.totalTokens}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Coût</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">${conversationSummary.totalCost.toFixed(6)}</p></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => WorkspaceExchangeService.downloadJson('srg-conversations-history.json', ConversationWorkspaceService.listConversations())} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Exporter conversations JSON</button>
          <button type="button" onClick={() => WorkspaceExchangeService.downloadText('srg-conversations-history.txt', ConversationWorkspaceService.listConversations().map((item) => `${item.title} | ${item.provider}/${item.model} | ${item.messages.length} messages`).join('\n'))} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Exporter conversations TXT</button>
          <button type="button" onClick={() => { void navigate({ to: '/chat' }) }} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Ouvrir AI Workspace</button>
        </div>
        <div className="mt-3 rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-xs text-[var(--sea-ink-soft)]">
          <p>Lifecycle: running {conversationSummary.lifecycle.running} • completed {conversationSummary.lifecycle.completed} • cancelled {conversationSummary.lifecycle.cancelled} • failed {conversationSummary.lifecycle.failed}</p>
          <p>Progression streaming moyenne: {conversationSummary.lifecycle.avgStreamProgress}%</p>
          <p>Tokens chart: {conversationSummary.charts.tokens.join(' / ') || 'n/a'}</p>
        </div>
      </Section>

      <Section title="AI Agents History" description="Historique des agents, workflows, automatisations, erreurs et executions.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 text-sm">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Agents</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{agentSummary.agentHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Workflows</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{agentSummary.workflowHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Automatisations</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{agentSummary.automationHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Erreurs</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{agentSummary.errorHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Executions</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{agentSummary.executionHistory.length}</p></div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2 text-xs text-[var(--sea-ink-soft)]">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
            <p className="font-semibold text-[var(--sea-ink)]">Workflow history</p>
            {agentSummary.workflowHistory.slice(0, 6).map((workflow) => <p key={workflow.id}>{workflow.name} | {workflow.status} | {new Date(workflow.updatedAt).toLocaleString()}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
            <p className="font-semibold text-[var(--sea-ink)]">Execution history</p>
            {agentSummary.executionHistory.slice(0, 6).map((execution) => <p key={execution.id}>{execution.sourceType} | {execution.status} | {execution.latencyMs}ms | ${execution.cost.toFixed(6)}</p>)}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => AgentWorkspaceService.exportAgents()} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Exporter agents/workflows</button>
          <button type="button" onClick={() => { void navigate({ to: '/agents' }) }} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Ouvrir AI Agents Workspace</button>
        </div>
      </Section>

      <Section title="Knowledge History" description="Imports, suppressions, indexations, recherches, consultations et exports.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6 text-sm">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Imports</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{knowledgeSummary.importHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Suppressions</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{knowledgeSummary.deletionHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Indexations</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{knowledgeSummary.indexationHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Recherches</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{knowledgeSummary.searchHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Consultations</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{knowledgeSummary.consultationHistory.length}</p></div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Exports</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{knowledgeSummary.exportHistory.length}</p></div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3 text-xs text-[var(--sea-ink-soft)]">
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
            <p className="font-semibold text-[var(--sea-ink)]">Imports</p>
            {knowledgeSummary.importHistory.slice(0, 6).map((item) => <p key={item.id}>{item.type} | {item.documentIds.length} docs | {new Date(item.createdAt).toLocaleString()}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
            <p className="font-semibold text-[var(--sea-ink)]">Searches</p>
            {knowledgeSummary.searchHistory.slice(0, 6).map((item) => <p key={item.id}>{item.query || 'empty'} | {item.resultCount} results | semantic UI {item.semanticUi ? 'yes' : 'no'}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
            <p className="font-semibold text-[var(--sea-ink)]">Exports</p>
            {knowledgeSummary.exportHistory.slice(0, 6).map((item) => <p key={item.id}>{item.format} | {item.documentIds.length} docs | {new Date(item.createdAt).toLocaleString()}</p>)}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => WorkspaceExchangeService.downloadJson('srg-knowledge-history.json', knowledgeSummary)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Exporter history knowledge JSON</button>
          <button type="button" onClick={() => { void navigate({ to: '/knowledge-center' }) }} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Ouvrir Knowledge Workspace</button>
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
              action={<button type="button" onClick={() => { setSearch(''); setDateFilter(''); setProjectFilter('all'); setProviderFilter('all'); setModelFilter('all'); setStatusFilter('all') }} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 text-sm font-semibold text-white">Réinitialiser</button>}
            />
          ) : null}
          {paginatedRecords.map((item) => (
            <article key={item.id} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--sea-ink)]">{item.promptName}</p>
                  <p className="mt-1 text-[var(--sea-ink-soft)]">{item.projectName ?? 'No project'} • {item.provider} / {item.model}</p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-[var(--sea-ink-soft)]">
                  <input type="checkbox" checked={selectedCompareIds.includes(item.id)} onChange={(event) => toggleCompare(item.id, event.target.checked)} />
                  <span>Comparer</span>
                </label>
              </div>
              <p className="mt-3 text-[var(--sea-ink-soft)]">Statut: {item.status} • {new Date(item.createdAt).toLocaleString()} • {item.durationMs} ms • ${item.costEstimate.toFixed(6)}</p>
              <p className="mt-2 line-clamp-3 text-[var(--sea-ink-soft)]">{item.output || item.promptText}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => rerunRecord(item.id)} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-2 text-xs font-semibold text-white">Relancer</button>
                <button type="button" onClick={() => WorkspaceExchangeService.downloadJson(`${item.id}.json`, item)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[var(--sea-ink)]">Exporter</button>
                <button type="button" onClick={() => deleteRecord(item.id)} className="rounded-3xl border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] px-4 py-2 text-xs font-semibold text-[#9b2f2f]">Supprimer</button>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-[var(--sea-ink-soft)]">
          <span>Page {page} / {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 disabled:opacity-50">Précédente</button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 disabled:opacity-50">Suivante</button>
          </div>
        </div>
      </Section>

      {comparedRecords.length === 2 ? (
        <Section title="Comparaison" description="Comparaison de deux runs selectionnes.">
          <div className="grid gap-4 xl:grid-cols-2">
            {comparedRecords.map((item) => (
              <div key={item.id} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
                <p className="font-semibold text-[var(--sea-ink)]">{item.promptName}</p>
                <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{item.provider} / {item.model} • {new Date(item.createdAt).toLocaleString()}</p>
                <pre className="mt-4 whitespace-pre-wrap break-words rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-xs text-[var(--sea-ink)]">{item.output || item.promptText}</pre>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  )
}
