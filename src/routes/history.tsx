import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import PageHeader from '#/app/components/PageHeader'
import SearchBar from '#/app/components/SearchBar'
import Section from '#/app/components/Section'
import CollaborationActivityFeed from '#/app/components/collaboration/CollaborationActivityFeed'
import DataTable from '#/app/components/ui/DataTable'
import type { DataTableColumn } from '#/app/components/ui/DataTable'
import { Field, FieldGroup, FormSection } from '#/app/components/ui/FormPrimitives'
import { useNotifications } from '#/app/hooks/useNotifications'
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
  const notifications = useNotifications()
  const searchHostRef = useRef<HTMLDivElement | null>(null)
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
  }, [search, dateFilter, projectFilter, providerFilter, modelFilter, statusFilter, authorFilter, collaboratorFilter, versionFilter, typeFilter, activeSortKey, activeSortOrder])

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
    notifications.publish({
      title: 'Historique mis à jour',
      message: `Run ${id} supprimé.`,
      level: 'info',
      priority: 'low',
      category: 'generation',
      read: false,
      channels: ['email'],
    })
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
    notifications.publish({
      title: 'Relance préparée',
      message: `Le run ${record.promptName} est chargé dans Generate.`,
      level: 'info',
      priority: 'medium',
      category: 'generation',
      read: false,
      channels: ['email'],
    })
    void navigate({ to: '/generate' })
  }

  const exportFiltered = () => {
    WorkspaceExchangeService.downloadJson('srg-history-export.json', sortedRecords)
    notifications.publish({
      title: 'Export history',
      message: 'Le fichier JSON filtré a été exporté.',
      level: 'success',
      priority: 'low',
      category: 'system',
      read: false,
      channels: ['email'],
    })
  }

  const exportHistoryBundle = () => {
    CollaborationWorkspaceService.exportHistory('json')
  }

  const resetFilters = () => {
    setSearch('')
    setDateFilter('')
    setProjectFilter('all')
    setProviderFilter('all')
    setModelFilter('all')
    setStatusFilter('all')
    setAuthorFilter('')
    setCollaboratorFilter('')
    setVersionFilter('')
    setTypeFilter('')
  }

  const toggleCompare = (id: string, checked: boolean) => {
    setSelectedCompareIds((current) => {
      if (checked) {
        return [...current.filter((item) => item !== id), id].slice(-2)
      }
      return current.filter((item) => item !== id)
    })
  }

  const executionColumns: Array<DataTableColumn<(typeof sortedRecords)[number]>> = [
    {
      key: 'promptName',
      label: 'Prompt',
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--srg-text-title)]">{row.promptName}</p>
          <p className="text-xs text-[var(--srg-text-muted)]">{row.projectName ?? 'No project'} • {row.provider}/{row.model}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <span className="rounded-full bg-[var(--srg-surface-strong)] px-2 py-1 text-xs text-[var(--srg-text-muted)]">{row.status}</span>,
    },
    {
      key: 'durationMs',
      label: 'Duration',
      sortable: true,
      render: (row) => `${row.durationMs} ms`,
    },
    {
      key: 'costEstimate',
      label: 'Cost',
      sortable: true,
      render: (row) => `$${row.costEstimate.toFixed(6)}`,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      key: 'output',
      label: 'Preview',
      render: (row) => <span className="line-clamp-2 text-xs text-[var(--srg-text-muted)]">{row.output || row.promptText}</span>,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => rerunRecord(row.id)} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-1.5 text-xs font-semibold text-white">Relancer</button>
          <button type="button" onClick={() => WorkspaceExchangeService.downloadJson(`${row.id}.json`, row)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--srg-text-title)]">Exporter</button>
          <button type="button" onClick={() => deleteRecord(row.id)} className="rounded-2xl border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] px-3 py-1.5 text-xs font-semibold text-[#9b2f2f]">Supprimer</button>
          <label className="inline-flex items-center gap-1 text-xs text-[var(--srg-text-muted)]">
            <input type="checkbox" checked={selectedCompareIds.includes(row.id)} onChange={(event) => toggleCompare(row.id, event.target.checked)} />
            <span>Comparer</span>
          </label>
        </div>
      ),
    },
  ]

  const bulkActions = [
    {
      label: 'Exporter sélection',
      onClick: (rows: typeof sortedRecords) => {
        WorkspaceExchangeService.downloadJson('srg-history-selected.json', rows)
      },
    },
    {
      label: 'Supprimer sélection',
      onClick: (rows: typeof sortedRecords) => {
        rows.forEach((row) => HistoryWorkspaceService.deleteRecord(row.id))
        refresh()
      },
    },
  ]

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        const input = searchHostRef.current?.querySelector('input')
        input?.focus()
      }

      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'e') {
        event.preventDefault()
        exportFiltered()
      }

      if (event.ctrlKey && event.shiftKey && event.key === 'Backspace') {
        event.preventDefault()
        resetFilters()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return (
    <div className="space-y-6">
      <PageHeader title="History" description="Filtrez, comparez, exportez et relancez vos executions SRG." />

      <Section title="Filtres" description="Date, projet, provider, modele et statut.">
        <FormSection title="Recherche avancée" description="Filtres persistés, historique de recherche et raccourcis clavier (Ctrl+K, Ctrl+Shift+E, Ctrl+Shift+Backspace).">
          <FieldGroup columns={3}>
            <Field label="Recherche">
              <div ref={searchHostRef}>
                <SearchBar
                  value={search}
                  onSearch={(value) => setSearch(value)}
                  onValueChange={setSearch}
                  placeholder="Recherche avancée"
                  instant
                  persistKey="history-search"
                />
              </div>
            </Field>
            <Field label="Date">
              <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
            </Field>
            <Field label="Statut">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'pending' | 'completed' | 'failed' | 'cancelled')}>
                <option value="all">all</option>
                <option value="pending">pending</option>
                <option value="completed">completed</option>
                <option value="failed">failed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </Field>
            <Field label="Projet">
              <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
                {projects.map((project) => <option key={project} value={project}>{project}</option>)}
              </select>
            </Field>
            <Field label="Provider">
              <select value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)}>
                {providers.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
              </select>
            </Field>
            <Field label="Modèle">
              <select value={modelFilter} onChange={(event) => setModelFilter(event.target.value)}>
                {models.map((model) => <option key={model} value={model}>{model}</option>)}
              </select>
            </Field>
            <Field label="Auteur">
              <input type="search" value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)} placeholder="Auteur" />
            </Field>
            <Field label="Collaborateur">
              <input type="search" value={collaboratorFilter} onChange={(event) => setCollaboratorFilter(event.target.value)} placeholder="Collaborateur" />
            </Field>
            <Field label="Version">
              <input type="search" value={versionFilter} onChange={(event) => setVersionFilter(event.target.value)} placeholder="Version" />
            </Field>
            <Field label="Type">
              <input type="search" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} placeholder="Type" />
            </Field>
            <Field label="Tri clé">
              <select value={activeSortKey} onChange={(event) => setActiveSortKey(event.target.value as 'createdAt' | 'durationMs' | 'costEstimate')}>
                <option value="createdAt">Tri: date</option>
                <option value="durationMs">Tri: durée</option>
                <option value="costEstimate">Tri: coût</option>
              </select>
            </Field>
            <Field label="Tri ordre">
              <select value={activeSortOrder} onChange={(event) => setActiveSortOrder(event.target.value as 'asc' | 'desc')}>
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </Field>
          </FieldGroup>
        </FormSection>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={exportFiltered} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter JSON</button>
          <button type="button" onClick={() => CollaborationWorkspaceService.exportHistory('csv')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter CSV</button>
          <button type="button" onClick={() => CollaborationWorkspaceService.exportHistory('markdown')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter Markdown</button>
          <button type="button" onClick={exportHistoryBundle} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Export Bundle</button>
          <button type="button" onClick={() => { HistoryWorkspaceService.clear(); refresh() }} className="rounded-3xl border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] px-4 py-2 text-sm font-semibold text-[#9b2f2f]">Vider</button>
          <button type="button" onClick={resetFilters} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Réinitialiser filtres</button>
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
        {sortedRecords.length === 0 ? (
          <EmptyState
            eyebrow="History"
            illustration={<span aria-hidden>⌛</span>}
            title="Aucun historique"
            description="Aucun run ne correspond aux filtres actifs. Lancez une génération ou réinitialisez la recherche avancée."
            action={<button type="button" onClick={resetFilters} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white">Réinitialiser</button>}
          />
        ) : (
          <DataTable
            tableId="history-executions"
            title="Runs"
            rows={sortedRecords}
            columns={executionColumns}
            searchable={false}
            pageSize={8}
            exportFileName="srg-history-executions.csv"
            multiSelect
            bulkActions={bulkActions}
          />
        )}
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
