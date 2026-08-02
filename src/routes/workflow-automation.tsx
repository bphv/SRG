import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import PageHeader from '#/app/components/PageHeader'
import SearchBar from '#/app/components/SearchBar'
import Section from '#/app/components/Section'
import DataTable from '#/app/components/ui/DataTable'
import type { DataTableColumn } from '#/app/components/ui/DataTable'
import {
  CollapsibleFormSection,
  Field,
  FieldGroup,
  FormProgress,
  FormSection,
  FormToolbar,
  SmartInputField,
  SwitchField,
  ValidationMessage,
} from '#/app/components/ui/FormPrimitives'
import Button from '#/app/components/ui/Button'
import {
  WorkflowWorkspaceService,
} from '#/app/services/WorkflowWorkspaceService'
import type {
  WorkflowDefinition,
  WorkflowExecutionLog,
  WorkflowModule,
  WorkflowStepType,
  WorkflowTemplate,
  WorkflowTriggerMode,
} from '#/app/services/WorkflowWorkspaceService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export const Route = createFileRoute('/workflow-automation')({
  component: WorkflowAutomationPage,
})

function WorkflowAutomationPage() {
  const [tick, setTick] = useState(0)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [module, setModule] = useState<WorkflowModule>('finance')
  const [triggerMode, setTriggerMode] = useState<WorkflowTriggerMode>('manual')
  const [schedule, setSchedule] = useState('')
  const [conditionExpression, setConditionExpression] = useState('')
  const [tags, setTags] = useState('')
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState<WorkflowModule | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [importPayload, setImportPayload] = useState('')
  const [lastImportReport, setLastImportReport] = useState('')
  const [stepTypeToAdd, setStepTypeToAdd] = useState<WorkflowStepType>('task')

  const workflows = useMemo(() => WorkflowWorkspaceService.list(), [tick])
  const templates = useMemo(() => WorkflowWorkspaceService.listTemplates(), [tick])
  const logs = useMemo(() => WorkflowWorkspaceService.listLogs(), [tick])
  const summary = useMemo(() => WorkflowWorkspaceService.getDashboardSummary(), [tick])
  const observability = useMemo(() => WorkflowWorkspaceService.getObservability(), [tick])

  const searchFavorites = useMemo(() => WorkflowWorkspaceService.getSearchFavorites(), [tick])

  const selectedWorkflow = useMemo(
    () => workflows.find((item) => item.id === selectedWorkflowId) ?? workflows.at(0),
    [workflows, selectedWorkflowId],
  )

  const filteredWorkflows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return workflows.filter((workflow) => {
      if (moduleFilter !== 'all' && workflow.module !== moduleFilter) return false
      if (statusFilter === 'active' && !workflow.active) return false
      if (statusFilter === 'inactive' && workflow.active) return false
      if (!query) return true
      return `${workflow.name} ${workflow.description} ${workflow.module} ${workflow.tags.join(' ')}`.toLowerCase().includes(query)
    })
  }, [workflows, search, moduleFilter, statusFilter])

  useEffect(() => {
    const firstWorkflow = workflows.at(0)
    if (!selectedWorkflowId && firstWorkflow) {
      setSelectedWorkflowId(firstWorkflow.id)
    }
  }, [selectedWorkflowId, workflows])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        const input = document.querySelector<HTMLInputElement>('input[list="workflow-name-history"]')
        input?.focus()
      }

      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'w') {
        event.preventDefault()
        if (selectedWorkflow) {
          WorkflowWorkspaceService.simulateWorkflow(selectedWorkflow.id)
          setTick((current) => current + 1)
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedWorkflow])

  const refresh = () => setTick((current) => current + 1)

  const createWorkflow = () => {
    if (!name.trim()) {
      return
    }

    const created = WorkflowWorkspaceService.createWorkflow({
      module,
      name,
      description,
      triggerMode,
      schedule,
      conditionExpression,
      tags: tags.split(',').map((item) => item.trim()).filter(Boolean),
    })
    setSelectedWorkflowId(created.id)
    setName('')
    setDescription('')
    setSchedule('')
    setConditionExpression('')
    setTags('')
    refresh()
  }

  const toggleFavoriteSearch = () => {
    const normalized = search.trim()
    if (!normalized) return
    const current = WorkflowWorkspaceService.getSearchFavorites()
    const next = current.includes(normalized)
      ? current.filter((item) => item !== normalized)
      : [normalized, ...current].slice(0, 12)
    WorkflowWorkspaceService.setSearchFavorites(next)
    refresh()
  }

  const workflowsColumns: Array<DataTableColumn<WorkflowDefinition>> = [
    {
      key: 'name',
      label: 'Workflow',
      sortable: true,
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedWorkflowId(row.id)}
          className="text-left text-sm font-semibold text-[var(--srg-text-title)] underline-offset-2 hover:underline"
        >
          {row.name}
        </button>
      ),
    },
    { key: 'module', label: 'Module', sortable: true },
    {
      key: 'active',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span className="rounded-full bg-[var(--srg-surface-strong)] px-2 py-1 text-xs text-[var(--srg-text-muted)]">
          {row.active ? 'active' : 'inactive'}
        </span>
      ),
    },
    { key: 'triggerMode', label: 'Trigger', sortable: true },
    { key: 'version', label: 'Version', sortable: true, render: (row) => `v${row.version}` },
    {
      key: 'id',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => { WorkflowWorkspaceService.duplicateWorkflow(row.id); refresh() }}>Dupliquer</Button>
          <Button size="sm" variant="secondary" onClick={() => { WorkflowWorkspaceService.versionWorkflow(row.id); refresh() }}>Versionner</Button>
          <Button size="sm" variant="secondary" onClick={() => { WorkflowWorkspaceService.simulateWorkflow(row.id); refresh() }}>Simuler</Button>
          <Button size="sm" variant={row.active ? 'warning' : 'success'} onClick={() => { row.active ? WorkflowWorkspaceService.deactivateWorkflow(row.id) : WorkflowWorkspaceService.activateWorkflow(row.id); refresh() }}>
            {row.active ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
      ),
    },
  ]

  const templatesColumns: Array<DataTableColumn<WorkflowTemplate>> = [
    { key: 'name', label: 'Template', sortable: true },
    { key: 'module', label: 'Module', sortable: true },
    { key: 'description', label: 'Description' },
    {
      key: 'id',
      label: 'Action',
      render: (row) => (
        <Button size="sm" variant="secondary" onClick={() => { WorkflowWorkspaceService.cloneTemplate(row.id); refresh() }}>
          Cloner
        </Button>
      ),
    },
  ]

  const logsColumns: Array<DataTableColumn<WorkflowExecutionLog>> = [
    { key: 'workflowName', label: 'Workflow', sortable: true },
    { key: 'module', label: 'Module', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <span className="rounded-full bg-[var(--srg-surface-strong)] px-2 py-1 text-xs text-[var(--srg-text-muted)]">{row.status}</span>,
    },
    { key: 'automationMode', label: 'Mode', sortable: true },
    { key: 'latencyMs', label: 'Latency', sortable: true, render: (row) => `${row.latencyMs} ms` },
    { key: 'startedAt', label: 'Started', sortable: true, render: (row) => new Date(row.startedAt).toLocaleString() },
    { key: 'message', label: 'Message' },
  ]

  const progressTotal = selectedWorkflow ? selectedWorkflow.steps.length : 0
  const progressCompleted = selectedWorkflow
    ? selectedWorkflow.steps.filter((step) => step.type === 'validation' || step.type === 'approval' || step.type === 'end').length
    : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Automation"
        description="Enterprise workflow designer, library, execution logs and observability."
      />

      <Section title="Elements associes" description="Workflow ↔ tous les workspaces via navigation contextuelle.">
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Workflows</p>
            <p className="text-[var(--srg-text-muted)]">Total: {summary.totalWorkflows}</p>
            <p className="text-[var(--srg-text-muted)]">Actifs: {summary.active}</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Execution</p>
            <p className="text-[var(--srg-text-muted)]">Succes: {summary.successRate}%</p>
            <p className="text-[var(--srg-text-muted)]">Echecs: {summary.failureRate}%</p>
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Observability</p>
            <p className="text-[var(--srg-text-muted)]">Events: {observability.metrics.events}</p>
            <p className="text-[var(--srg-text-muted)]">Latency avg: {observability.metrics.latencyAvg} ms</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/dashboard" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Dashboard</Link>
          <Link to="/history" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans History</Link>
          <Link to="/observability" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Observability</Link>
          <Link to="/knowledge-intelligence" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Knowledge</Link>
          <Link to="/project-execution" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Projects</Link>
          <Link to="/finance" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Finance</Link>
          <Link to="/maintenance" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Maintenance</Link>
          <Link to="/procurement-inventory" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Procurement</Link>
          <Link to="/human-resources" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans RH</Link>
          <Link to="/chat" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans CRM</Link>
          <Link to="/enterprise-insights" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Enterprise Insights</Link>
          <Link to="/strategic-advisor" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Voir dans Strategic Advisor</Link>
        </div>
      </Section>

      <Section title="Workflow Dashboard" description="Active, completed, failed, latency and distribution.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Actifs</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.active}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Terminés</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.completed}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Échoués</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.failed}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Temps moyen</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.avgDurationMs} ms</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Succès</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.successRate}%</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Échecs</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.failureRate}%</p></div>
        </div>
        <div className="mt-4 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-xs text-[var(--srg-text-muted)]">
          <p>Timeline: {summary.timeline.slice(0, 5).join(' | ') || 'n/a'}</p>
        </div>
      </Section>

      <Section title="Recherche" description="SearchBar enterprise: instant search, history, favorites and persistence.">
        <FormSection title="Workflow Search" description="Ctrl+Alt+N focus sur le nom workflow, Ctrl+Shift+W simulation rapide.">
          <FieldGroup columns={3}>
            <Field label="Recherche">
              <SearchBar
                value={search}
                onSearch={setSearch}
                onValueChange={setSearch}
                placeholder="Search workflow, module, tags"
                instant
                persistKey="workflow-automation-search"
              />
            </Field>
            <Field label="Module">
              <select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value as WorkflowModule | 'all')}>
                <option value="all">all</option>
                <option value="finance">finance</option>
                <option value="procurement">procurement</option>
                <option value="maintenance">maintenance</option>
                <option value="hr">hr</option>
                <option value="crm">crm</option>
                <option value="knowledge">knowledge</option>
                <option value="projects">projects</option>
                <option value="documents">documents</option>
                <option value="management-control">management-control</option>
                <option value="conversation-ai">conversation-ai</option>
                <option value="prompt-studio">prompt-studio</option>
                <option value="generate">generate</option>
                <option value="reviews">reviews</option>
                <option value="administration">administration</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}>
                <option value="all">all</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </Field>
          </FieldGroup>
          <FormToolbar autosaveLabel="WorkspacePreferencesService">
            <Button variant="secondary" size="sm" onClick={toggleFavoriteSearch}>Toggle Favorite Query</Button>
            {searchFavorites.map((item) => (
              <button key={item} type="button" className="srg-badge srg-badge-neutral" onClick={() => setSearch(item)}>{item}</button>
            ))}
          </FormToolbar>
        </FormSection>
      </Section>

      <Section title="Workflow Library" description="Template library per module with clone action.">
        <DataTable
          tableId="workflow-templates-library"
          title="Templates"
          rows={templates}
          columns={templatesColumns}
          searchable
          pageSize={8}
          exportFileName="srg-workflow-templates.csv"
        />
      </Section>

      <Section title="Workflow Catalog" description="Create, activate, deactivate, duplicate, version and simulate workflows.">
        <CollapsibleFormSection id="workflow-create" title="Créer workflow" description="Toutes les valeurs sont persistées côté service/historique.">
          <FieldGroup columns={2}>
            <SmartInputField
              id="workflow-name"
              label="Workflow name"
              value={name}
              onValueChange={setName}
              placeholder="Ex: Validation facture fournisseur"
              required
              autosaveLabel="Draft"
            />
            <Field label="Description">
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
            </Field>
            <Field label="Module">
              <select value={module} onChange={(event) => setModule(event.target.value as WorkflowModule)}>
                <option value="finance">finance</option>
                <option value="procurement">procurement</option>
                <option value="maintenance">maintenance</option>
                <option value="hr">hr</option>
                <option value="crm">crm</option>
                <option value="knowledge">knowledge</option>
                <option value="projects">projects</option>
                <option value="documents">documents</option>
                <option value="management-control">management-control</option>
                <option value="conversation-ai">conversation-ai</option>
                <option value="prompt-studio">prompt-studio</option>
                <option value="generate">generate</option>
                <option value="reviews">reviews</option>
                <option value="administration">administration</option>
              </select>
            </Field>
            <Field label="Mode déclenchement">
              <select value={triggerMode} onChange={(event) => setTriggerMode(event.target.value as WorkflowTriggerMode)}>
                <option value="manual">manual</option>
                <option value="conditional">conditional</option>
                <option value="scheduled">scheduled</option>
                <option value="recurring">recurring</option>
              </select>
            </Field>
            <Field label="Schedule">
              <input value={schedule} onChange={(event) => setSchedule(event.target.value)} placeholder="daily 08:00" />
            </Field>
            <Field label="Condition expression">
              <input value={conditionExpression} onChange={(event) => setConditionExpression(event.target.value)} placeholder="amount > 10000" />
            </Field>
            <Field label="Tags CSV">
              <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="approval, finance" />
            </Field>
          </FieldGroup>
          <FormToolbar autosaveLabel="Service storage">
            <Button onClick={createWorkflow}>Créer workflow</Button>
            <Button variant="secondary" onClick={() => WorkflowWorkspaceService.exportWorkflows()}>Exporter workflows</Button>
          </FormToolbar>
        </CollapsibleFormSection>

        {filteredWorkflows.length === 0 ? (
          <EmptyState
            eyebrow="Workflow"
            illustration={<span aria-hidden>◇</span>}
            title="Aucun workflow"
            description="Aucun workflow ne correspond aux filtres actifs."
          />
        ) : (
          <DataTable
            tableId="workflow-catalog"
            title="Workflows"
            rows={filteredWorkflows}
            columns={workflowsColumns}
            searchable={false}
            pageSize={10}
            exportFileName="srg-workflows.csv"
            multiSelect
            bulkActions={[
              {
                label: 'Activer sélection',
                onClick: (rows) => {
                  rows.forEach((row) => WorkflowWorkspaceService.activateWorkflow(row.id))
                  refresh()
                },
              },
              {
                label: 'Désactiver sélection',
                onClick: (rows) => {
                  rows.forEach((row) => WorkflowWorkspaceService.deactivateWorkflow(row.id))
                  refresh()
                },
              },
              {
                label: 'Supprimer sélection',
                onClick: (rows) => {
                  rows.forEach((row) => WorkflowWorkspaceService.deleteWorkflow(row.id))
                  refresh()
                },
              },
            ]}
          />
        )}
      </Section>

      <Section title="Workflow Designer" description="Start, condition, validation, approval, branch, wait, notification, task, end. Steps are draggable, copyable, removable, reorderable and persisted.">
        {!selectedWorkflow ? (
          <EmptyState
            eyebrow="Designer"
            illustration={<span aria-hidden>◌</span>}
            title="Sélectionnez un workflow"
            description="Choisissez un workflow dans le catalogue pour éditer ses étapes."
          />
        ) : (
          <div className="space-y-4">
            <FormProgress completed={progressCompleted} total={progressTotal} label="Workflow quality progress" />
            <FormSection title={selectedWorkflow.name} description={`Module ${selectedWorkflow.module} • Trigger ${selectedWorkflow.triggerMode} • v${selectedWorkflow.version}`}>
              <div className="mb-3 flex flex-wrap gap-2">
                <select value={stepTypeToAdd} onChange={(event) => setStepTypeToAdd(event.target.value as WorkflowStepType)} aria-label="Step type">
                  <option value="start">start</option>
                  <option value="condition">condition</option>
                  <option value="validation">validation</option>
                  <option value="approval">approval</option>
                  <option value="branch">branch</option>
                  <option value="wait">wait</option>
                  <option value="notification">notification</option>
                  <option value="task">task</option>
                  <option value="end">end</option>
                </select>
                <Button size="sm" variant="secondary" onClick={() => { WorkflowWorkspaceService.addStep(selectedWorkflow.id, stepTypeToAdd); refresh() }}>Ajouter étape</Button>
                <SwitchField label="Workflow actif" checked={selectedWorkflow.active} onChange={(next) => { next ? WorkflowWorkspaceService.activateWorkflow(selectedWorkflow.id) : WorkflowWorkspaceService.deactivateWorkflow(selectedWorkflow.id); refresh() }} />
              </div>

              <div className="grid gap-3 lg:grid-cols-2" role="list" aria-label="Workflow steps designer">
                {selectedWorkflow.steps.map((step, index) => (
                  <article
                    key={step.id}
                    className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3"
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      const from = Number(event.dataTransfer.getData('text/plain'))
                      WorkflowWorkspaceService.reorderStep(selectedWorkflow.id, from, index)
                      refresh()
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[var(--srg-text-title)]">{step.name}</p>
                        <p className="text-xs text-[var(--srg-text-muted)]">{step.type} • position {step.x},{step.y}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="secondary" onClick={() => { WorkflowWorkspaceService.copyStep(selectedWorkflow.id, step.id); refresh() }}>Copier</Button>
                        <Button size="sm" variant="secondary" onClick={() => { WorkflowWorkspaceService.removeStep(selectedWorkflow.id, step.id); refresh() }}>Supprimer</Button>
                        <button type="button" className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-xs" onClick={() => { WorkflowWorkspaceService.reorderStep(selectedWorkflow.id, index, Math.max(0, index - 1)); refresh() }}>↑</button>
                        <button type="button" className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-xs" onClick={() => { WorkflowWorkspaceService.reorderStep(selectedWorkflow.id, index, Math.min(selectedWorkflow.steps.length - 1, index + 1)); refresh() }}>↓</button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <input
                        value={step.name}
                        onChange={(event) => {
                          const next = selectedWorkflow.steps.map((item) => item.id === step.id ? { ...item, name: event.target.value } : item)
                          WorkflowWorkspaceService.updateWorkflow(selectedWorkflow.id, { steps: next })
                          refresh()
                        }}
                        aria-label="Step name"
                      />
                      <input
                        value={step.config}
                        onChange={(event) => {
                          const next = selectedWorkflow.steps.map((item) => item.id === step.id ? { ...item, config: event.target.value } : item)
                          WorkflowWorkspaceService.updateWorkflow(selectedWorkflow.id, { steps: next })
                          refresh()
                        }}
                        aria-label="Step config"
                      />
                      <input
                        type="number"
                        value={step.x}
                        onChange={(event) => { WorkflowWorkspaceService.moveStep(selectedWorkflow.id, step.id, Number(event.target.value), step.y); refresh() }}
                        aria-label="Step X"
                      />
                      <input
                        type="number"
                        value={step.y}
                        onChange={(event) => { WorkflowWorkspaceService.moveStep(selectedWorkflow.id, step.id, step.x, Number(event.target.value)); refresh() }}
                        aria-label="Step Y"
                      />
                    </div>
                  </article>
                ))}
              </div>
            </FormSection>
          </div>
        )}
      </Section>

      <Section title="Import / Export / Simulation" description="Import JSON, export, simulation and execution log.">
        <FormSection title="Workflow exchange" description="Copiez/collez un JSON de workflows pour import.">
          <Field label="JSON payload" hint="Format attendu: array de workflows ou objet { workflows: [] }.">
            <textarea
              rows={6}
              value={importPayload}
              onChange={(event) => setImportPayload(event.target.value)}
              placeholder='[{ "name": "Workflow A", "module": "finance", "steps": [] }]'
            />
          </Field>
          <FormToolbar>
            <Button variant="secondary" onClick={() => WorkflowWorkspaceService.exportWorkflows()}>Exporter workflows</Button>
            <Button variant="secondary" onClick={() => WorkflowWorkspaceService.exportLogs()}>Exporter logs</Button>
            <Button onClick={() => {
              const report = WorkflowWorkspaceService.importWorkflows(importPayload)
              setLastImportReport(`${report.imported} imported • ${report.errors} errors`)
              refresh()
            }}>Importer</Button>
            <Button variant="secondary" onClick={() => {
              if (selectedWorkflow) {
                WorkflowWorkspaceService.simulateWorkflow(selectedWorkflow.id)
                refresh()
              }
            }}>Simuler sélection</Button>
          </FormToolbar>
          {lastImportReport ? <ValidationMessage variant="hint">{lastImportReport}</ValidationMessage> : null}
        </FormSection>
      </Section>

      <Section title="Execution Log" description="Workflow history, filters, search and export.">
        <DataTable
          tableId="workflow-execution-log"
          title="Execution history"
          rows={logs}
          columns={logsColumns}
          searchable
          pageSize={10}
          exportFileName="srg-workflow-execution.csv"
          multiSelect
          bulkActions={[
            {
              label: 'Exporter sélection',
              onClick: (rows) => {
                WorkspaceExchangeService.downloadJson('srg-workflow-execution-selected.json', rows)
              },
            },
          ]}
        />
        <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-xs text-[var(--srg-text-muted)]">
          <p>Observability metrics: events {observability.metrics.events} • latency avg {observability.metrics.latencyAvg} ms • p95 {observability.metrics.latencyP95} ms • success {observability.metrics.success} • failures {observability.metrics.failures}</p>
        </div>
      </Section>
    </div>
  )
}
