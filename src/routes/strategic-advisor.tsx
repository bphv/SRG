import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import NotificationCenter from '#/app/components/NotificationCenter'
import PageHeader from '#/app/components/PageHeader'
import SearchBar from '#/app/components/SearchBar'
import Section from '#/app/components/Section'
import DataTable from '#/app/components/ui/DataTable'
import type { DataTableColumn } from '#/app/components/ui/DataTable'
import Button from '#/app/components/ui/Button'
import { Tabs } from '#/app/components/ui/Tabs'
import {
  CollapsibleFormSection,
  Field,
  FieldGroup,
  FormSection,
  FormToolbar,
  SmartInputField,
  ValidationMessage,
} from '#/app/components/ui/FormPrimitives'
import { useNotifications } from '#/app/hooks/useNotifications'
import { StrategicAdvisorWorkspaceService } from '#/app/services/StrategicAdvisorWorkspaceService'
import type {
  StrategicAction,
  StrategicActionBucket,
  StrategicActionPlan,
  StrategicAdvisorView,
  StrategicScenario,
  StrategicSimulationInput,
} from '#/app/services/StrategicAdvisorWorkspaceService'

export const Route = createFileRoute('/strategic-advisor')({
  component: StrategicAdvisorPage,
})

const VIEW_ITEMS: Array<{ key: StrategicAdvisorView; label: string }> = [
  { key: 'executive', label: 'Direction Generale' },
  { key: 'finance', label: 'Finance' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'hr', label: 'RH' },
  { key: 'procurement', label: 'Achats' },
  { key: 'crm', label: 'CRM' },
  { key: 'projects', label: 'Projets' },
  { key: 'knowledge', label: 'Knowledge' },
  { key: 'workflow', label: 'Workflow' },
]

function StrategicAdvisorPage() {
  const notifications = useNotifications()
  const searchHostRef = useRef<HTMLDivElement | null>(null)

  const [tick, setTick] = useState(0)
  const [activeView, setActiveView] = useState<StrategicAdvisorView>('executive')
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [bucketFilter, setBucketFilter] = useState<'all' | StrategicActionBucket>('all')
  const [selectedActionId, setSelectedActionId] = useState('')
  const [assignee, setAssignee] = useState('')
  const [comment, setComment] = useState('')
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)

  const [simulationInput, setSimulationInput] = useState<StrategicSimulationInput>({
    budgetIncreasePercent: 8,
    workforceReductionPercent: 0,
    supplierDelayDays: 3,
    maintenanceLoadIncreasePercent: 5,
    projectDelayDays: 4,
    newContractValue: 12000,
  })

  const [simulationPreview, setSimulationPreview] = useState('')

  const dashboard = useMemo(() => StrategicAdvisorWorkspaceService.getExecutiveDashboard(), [tick])
  const strategicViews = useMemo(() => StrategicAdvisorWorkspaceService.getStrategicViews(), [tick])
  const plans = useMemo(() => StrategicAdvisorWorkspaceService.buildActionPlans(), [tick])
  const scenarios = useMemo(() => StrategicAdvisorWorkspaceService.buildScenarios(), [tick])
  const actions = useMemo(() => StrategicAdvisorWorkspaceService.listActions(), [tick])
  const store = useMemo(() => StrategicAdvisorWorkspaceService.getStore(), [tick])
  const observability = useMemo(() => StrategicAdvisorWorkspaceService.getObservability(), [tick])
  const searchFavorites = useMemo(() => StrategicAdvisorWorkspaceService.getSearchFavorites(), [tick])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        const input = searchHostRef.current?.querySelector('input')
        input?.focus()
      }

      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'r') {
        event.preventDefault()
        refreshAdvisor()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    refreshAdvisor()
  }, [])

  const refreshAdvisor = () => {
    const result = StrategicAdvisorWorkspaceService.refreshAndPersistAdvisor()
    notifications.publish({
      title: 'Strategic advisor refreshed',
      message: `${result.plans.length} plans, ${result.recommendations.length} recommendations, ${result.actions.length} actions synchronized.`,
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

    const current = StrategicAdvisorWorkspaceService.getSearchFavorites()
    const next = current.includes(normalized)
      ? current.filter((item) => item !== normalized)
      : [normalized, ...current].slice(0, 16)
    StrategicAdvisorWorkspaceService.setSearchFavorites(next)
    setTick((currentTick) => currentTick + 1)
  }

  const filteredPlans = useMemo(() => {
    const query = search.trim().toLowerCase()
    return plans.filter((item) => {
      if (item.view !== activeView && activeView !== 'executive') {
        return false
      }
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false
      if (!query) return true
      return `${item.objective} ${item.justification} ${item.impactedServices.join(' ')} ${item.referenceDocuments.join(' ')}`.toLowerCase().includes(query)
    })
  }, [plans, search, priorityFilter, activeView])

  const filteredActions = useMemo(() => {
    const query = search.trim().toLowerCase()
    return actions.filter((item) => {
      if (item.view !== activeView && activeView !== 'executive') return false
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false
      if (bucketFilter !== 'all' && item.bucket !== bucketFilter) return false
      if (!query) return true
      return `${item.title} ${item.description} ${item.owner} ${item.source}`.toLowerCase().includes(query)
    })
  }, [actions, search, priorityFilter, bucketFilter, activeView])

  const selectedAction = filteredActions.find((item) => item.id === selectedActionId)

  const assignSelectedAction = () => {
    if (!selectedActionId || !assignee.trim()) return
    const updated = StrategicAdvisorWorkspaceService.assignAction(selectedActionId, assignee)
    if (!updated) return
    notifications.publish({
      title: 'Action assigned',
      message: `${updated.title} assigned to ${updated.owner}.`,
      level: 'info',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })
    setAssignee('')
    setTick((current) => current + 1)
  }

  const commentSelectedAction = () => {
    if (!selectedActionId || !comment.trim()) return
    const updated = StrategicAdvisorWorkspaceService.commentAction(selectedActionId, 'Advisor user', comment)
    if (!updated) return
    setComment('')
    setTick((current) => current + 1)
  }

  const moveSelectedAction = (bucket: StrategicActionBucket) => {
    if (!selectedActionId) return
    const updated = StrategicAdvisorWorkspaceService.moveActionBucket(selectedActionId, bucket)
    if (!updated) return
    setTick((current) => current + 1)
  }

  const runSimulation = () => {
    const result = StrategicAdvisorWorkspaceService.runWhatIfSimulation(simulationInput)
    setSimulationPreview(result.conclusions.join('\n'))
    setTick((current) => current + 1)
  }

  const planColumns: Array<DataTableColumn<StrategicActionPlan>> = [
    {
      key: 'objective',
      label: 'Objectif',
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <p className="font-semibold text-[var(--srg-text-title)]">{row.objective}</p>
          <p className="text-xs text-[var(--srg-text-muted)]">{row.type} | {row.view}</p>
        </div>
      ),
    },
    { key: 'priority', label: 'Priorite', sortable: true },
    { key: 'impactExpected', label: 'Impact', sortable: true, render: (row) => `${row.impactExpected}%` },
    { key: 'urgency', label: 'Urgence', sortable: true, render: (row) => `${row.urgency}%` },
    { key: 'difficulty', label: 'Difficulte', sortable: true },
    { key: 'estimatedCost', label: 'Cout', sortable: true, render: (row) => row.estimatedCost.toFixed(2) },
    { key: 'estimatedDurationDays', label: 'Duree', sortable: true, render: (row) => `${row.estimatedDurationDays} j` },
    { key: 'impactedServices', label: 'Services', render: (row) => row.impactedServices.join(' | ') },
    { key: 'referenceDocuments', label: 'References', render: (row) => row.referenceDocuments.join(' | ') },
    { key: 'justification', label: 'Justification' },
  ]

  const actionColumns: Array<DataTableColumn<StrategicAction>> = [
    {
      key: 'title',
      label: 'Action',
      sortable: true,
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedActionId(row.id)}
          className="text-left font-semibold text-[var(--srg-text-title)] underline-offset-2 hover:underline"
        >
          {row.title}
        </button>
      ),
    },
    { key: 'bucket', label: 'Bucket', sortable: true },
    { key: 'priority', label: 'Priorite', sortable: true },
    { key: 'impact', label: 'Impact', sortable: true, render: (row) => `${row.impact}%` },
    { key: 'urgency', label: 'Urgence', sortable: true, render: (row) => `${row.urgency}%` },
    { key: 'owner', label: 'Assignee', sortable: true },
    { key: 'status', label: 'Statut', sortable: true },
    { key: 'progress', label: 'Progress', sortable: true, render: (row) => `${row.progress}%` },
    { key: 'dueDate', label: 'Due', sortable: true, render: (row) => new Date(row.dueDate).toLocaleDateString() },
  ]

  const scenarioColumns: Array<DataTableColumn<StrategicScenario>> = [
    { key: 'type', label: 'Scenario', sortable: true },
    { key: 'advantages', label: 'Advantages', render: (row) => row.advantages.join(' | ') },
    { key: 'risks', label: 'Risks', render: (row) => row.risks.join(' | ') },
    { key: 'assumptions', label: 'Assumptions', render: (row) => row.assumptions.join(' | ') },
    { key: 'consequences', label: 'Consequences', render: (row) => row.consequences.join(' | ') },
    { key: 'confidence', label: 'Confidence', sortable: true, render: (row) => `${row.confidence}%` },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Strategic Advisor" description="Enterprise strategic advisor for prioritization, recommendation, planning, simulation and action orchestration." />

      <Section title="Quick Actions" description="Create, modify, export, share, history, favorites and search shortcuts.">
        <div className="flex flex-wrap gap-2">
          <Link to="/generate" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white">Créer</Link>
          <Link to="/projects" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Modifier</Link>
          <Button variant="secondary" onClick={() => StrategicAdvisorWorkspaceService.exportActionPlans()}>Exporter</Button>
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(window.location.href)}>Partager</Button>
          <Link to="/history" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Historique</Link>
          <Button variant="secondary" onClick={toggleFavoriteSearch}>Favoris</Button>
          <Button variant="secondary" onClick={() => searchHostRef.current?.querySelector('input')?.focus()}>Recherche</Button>
          <Button variant="secondary" onClick={() => setShowNotificationCenter((value) => !value)}>Notifications</Button>
          <Link to="/observability" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Observability</Link>
        </div>
      </Section>

      <Section title="Executive Dashboard" description="Top priorities, decisions, timeline, risks, opportunities and strategic actions.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top priorities</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{dashboard.topPriorities.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Top decisions</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{dashboard.topDecisions.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Strategic risks</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{dashboard.strategicRisks.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Opportunities</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{dashboard.strategicOpportunities.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Actions</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{dashboard.strategicActions.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Confidence</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{dashboard.confidence}%</p></div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3 text-sm">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Top Priorities</p>
            {dashboard.topPriorities.map((item) => <p key={item} className="text-[var(--srg-text-muted)]">{item}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Strategic Timeline</p>
            {dashboard.strategicTimeline.map((item) => <p key={item} className="text-[var(--srg-text-muted)]">{item}</p>)}
          </div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Strategic Risks</p>
            {dashboard.strategicRisks.map((item) => <p key={item} className="text-[var(--srg-text-muted)]">{item}</p>)}
          </div>
        </div>
      </Section>

      <Section title="Strategic Views" description="Direction Generale, Finance, Maintenance, RH, Achats, CRM, Projets, Knowledge and Workflow.">
        <Tabs items={VIEW_ITEMS} active={activeView} onChange={(key) => setActiveView(key as StrategicAdvisorView)} />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm text-[var(--srg-text-muted)]">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">Revenue: {strategicViews.finance.revenue.toFixed(2)}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">Project delays: {strategicViews.projects.delays}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">Maintenance failures: {strategicViews.maintenance.failures}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">Workflow failures: {strategicViews.workflow.failed}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">Low stock: {strategicViews.procurement.lowStock}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">Pending leaves: {strategicViews.hr.leavePending}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">CRM active conv: {strategicViews.crm.active}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">Knowledge critical docs: {strategicViews.knowledge.criticalDocuments}</div>
        </div>
      </Section>

      <Section title="Strategic Search" description="SearchBar Enterprise with WorkspacePreferencesService persistence.">
        <FormSection title="Filters" description="Ctrl+K focus search, Ctrl+Shift+R refresh advisor.">
          <FieldGroup columns={3}>
            <Field label="Search">
              <div ref={searchHostRef}>
                <SearchBar
                  value={search}
                  onSearch={setSearch}
                  onValueChange={setSearch}
                  placeholder="Search plans, risks, opportunities, actions"
                  persistKey="strategic-advisor-search"
                  instant
                />
              </div>
            </Field>
            <Field label="Priority">
              <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as 'all' | 'high' | 'medium' | 'low')}>
                <option value="all">all</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </Field>
            <Field label="Action bucket">
              <select value={bucketFilter} onChange={(event) => setBucketFilter(event.target.value as 'all' | StrategicActionBucket)}>
                <option value="all">all</option>
                <option value="immediate">immediate</option>
                <option value="monitor">monitor</option>
                <option value="plan">plan</option>
                <option value="postpone">postpone</option>
                <option value="close">close</option>
              </select>
            </Field>
          </FieldGroup>
          <FormToolbar autosaveLabel="WorkspacePreferencesService">
            <Button variant="secondary" size="sm" onClick={toggleFavoriteSearch}>Toggle Favorite Query</Button>
            <Button variant="secondary" size="sm" onClick={refreshAdvisor}>Refresh Advisor</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowNotificationCenter((value) => !value)}>Notifications</Button>
            {searchFavorites.map((item) => (
              <button key={item} type="button" className="srg-badge srg-badge-neutral" onClick={() => setSearch(item)}>{item}</button>
            ))}
          </FormToolbar>
        </FormSection>
      </Section>

      {showNotificationCenter ? (
        <Section title="Notification Center" description="Centralized notifications for strategic recommendations, plans, simulations and risks.">
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

      <Section title="Action Plans" description="Automatic action plans with objective, priority, impact, urgency, difficulty, cost, duration, services, documents and justification.">
        {filteredPlans.length === 0 ? (
          <EmptyState
            eyebrow="Strategic plans"
            illustration={<span aria-hidden>◌</span>}
            title="No action plan for current filters"
            description="Refresh strategic advisor or adjust filters."
          />
        ) : (
          <DataTable
            tableId="strategic-advisor-plans"
            title="Strategic Action Plans"
            rows={filteredPlans}
            columns={planColumns}
            searchable={false}
            pageSize={8}
            exportFileName="srg-strategic-advisor-plans.csv"
            multiSelect
            bulkActions={[
              { label: 'Export selected JSON', onClick: () => StrategicAdvisorWorkspaceService.exportActionPlans() },
            ]}
          />
        )}
      </Section>

      <Section title="Scenarios" description="Optimistic, realistic, prudent and critical scenarios with advantages, risks, assumptions, consequences and confidence.">
        <DataTable
          tableId="strategic-advisor-scenarios"
          title="Strategic Scenarios"
          rows={scenarios}
          columns={scenarioColumns}
          searchable
          pageSize={8}
          exportFileName="srg-strategic-advisor-scenarios.csv"
        />
      </Section>

      <Section title="Recommended Actions" description="Immediate, monitor, plan, postpone and close buckets with assignment, comments, tracking and export.">
        <DataTable
          tableId="strategic-advisor-actions"
          title="Strategic Actions"
          rows={filteredActions}
          columns={actionColumns}
          searchable={false}
          pageSize={8}
          exportFileName="srg-strategic-advisor-actions.csv"
          multiSelect
          bulkActions={[
            { label: 'Export selected JSON', onClick: () => StrategicAdvisorWorkspaceService.exportActions() },
          ]}
        />

        <CollapsibleFormSection id="strategic-action-management" title="Action management" description="Assign, comment and track selected action.">
          <FieldGroup columns={2}>
            <Field label="Selected action">
              <select value={selectedActionId} onChange={(event) => setSelectedActionId(event.target.value)}>
                <option value="">Select action</option>
                {filteredActions.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </Field>
            <SmartInputField
              id="strategic-action-assignee"
              label="Assignee"
              value={assignee}
              onValueChange={setAssignee}
              placeholder="Action owner"
              autosaveLabel="Action assignee"
            />
            <Field label="Comment">
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} />
            </Field>
            <Field label="Action bucket">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => moveSelectedAction('immediate')}>Immediate</Button>
                <Button size="sm" variant="secondary" onClick={() => moveSelectedAction('monitor')}>Monitor</Button>
                <Button size="sm" variant="secondary" onClick={() => moveSelectedAction('plan')}>Plan</Button>
                <Button size="sm" variant="secondary" onClick={() => moveSelectedAction('postpone')}>Postpone</Button>
                <Button size="sm" variant="secondary" onClick={() => moveSelectedAction('close')}>Close</Button>
              </div>
            </Field>
          </FieldGroup>
          <FormToolbar autosaveLabel="Strategic action state">
            <Button size="sm" onClick={assignSelectedAction}>Assign</Button>
            <Button size="sm" variant="secondary" onClick={commentSelectedAction}>Comment</Button>
            <Button size="sm" variant="secondary" onClick={() => StrategicAdvisorWorkspaceService.exportActions()}>Export Actions</Button>
          </FormToolbar>
          {selectedAction ? (
            <div className="mt-3 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-sm">
              <p className="font-semibold text-[var(--srg-text-title)]">{selectedAction.title}</p>
              <p className="mt-1 text-[var(--srg-text-muted)]">Owner: {selectedAction.owner} | Status: {selectedAction.status} | Progress: {selectedAction.progress}%</p>
              <ValidationMessage variant="hint">Tracking entries: {selectedAction.tracking.length} | Comments: {selectedAction.comments.length}</ValidationMessage>
            </div>
          ) : null}
        </CollapsibleFormSection>
      </Section>

      <Section title="What-if Simulation" description="Simulate budget increase, workforce reduction, supplier delay, maintenance load increase, project delay and new contract.">
        <FormSection title="What-if panel" description="Simulation uses existing app-layer data only and does not alter business engines.">
          <FieldGroup columns={3}>
            <SmartInputField
              id="sim-budget"
              label="Budget increase %"
              value={String(simulationInput.budgetIncreasePercent)}
              onValueChange={(value) => setSimulationInput((current) => ({ ...current, budgetIncreasePercent: Number(value) || 0 }))}
              placeholder="8"
            />
            <SmartInputField
              id="sim-workforce"
              label="Workforce reduction %"
              value={String(simulationInput.workforceReductionPercent)}
              onValueChange={(value) => setSimulationInput((current) => ({ ...current, workforceReductionPercent: Number(value) || 0 }))}
              placeholder="0"
            />
            <SmartInputField
              id="sim-supplier-delay"
              label="Supplier delay (days)"
              value={String(simulationInput.supplierDelayDays)}
              onValueChange={(value) => setSimulationInput((current) => ({ ...current, supplierDelayDays: Number(value) || 0 }))}
              placeholder="3"
            />
            <SmartInputField
              id="sim-maintenance-load"
              label="Maintenance load increase %"
              value={String(simulationInput.maintenanceLoadIncreasePercent)}
              onValueChange={(value) => setSimulationInput((current) => ({ ...current, maintenanceLoadIncreasePercent: Number(value) || 0 }))}
              placeholder="5"
            />
            <SmartInputField
              id="sim-project-delay"
              label="Project delay (days)"
              value={String(simulationInput.projectDelayDays)}
              onValueChange={(value) => setSimulationInput((current) => ({ ...current, projectDelayDays: Number(value) || 0 }))}
              placeholder="4"
            />
            <SmartInputField
              id="sim-contract"
              label="New contract value"
              value={String(simulationInput.newContractValue)}
              onValueChange={(value) => setSimulationInput((current) => ({ ...current, newContractValue: Number(value) || 0 }))}
              placeholder="12000"
            />
          </FieldGroup>
          <FormToolbar autosaveLabel="Simulation history">
            <Button onClick={runSimulation}>Run Simulation</Button>
            <Button variant="secondary" onClick={() => StrategicAdvisorWorkspaceService.exportSimulationHistory()}>Export Simulation History</Button>
          </FormToolbar>
          <pre className="mt-3 whitespace-pre-wrap rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-xs text-[var(--srg-text-muted)]">{simulationPreview || 'Run simulation to see strategic impact projections.'}</pre>
        </FormSection>
      </Section>

      <Section title="History" description="Strategic Decisions, Action Plans, Simulation History and Recommendations History.">
        <DataTable
          tableId="strategic-advisor-history-decisions"
          title="Strategic Decisions"
          rows={store.decisions}
          columns={[
            { key: 'title', label: 'Title', sortable: true },
            { key: 'detail', label: 'Detail' },
            { key: 'source', label: 'Source' },
            { key: 'createdAt', label: 'Created', sortable: true, render: (row) => new Date(row.createdAt).toLocaleString() },
          ]}
          searchable
          pageSize={8}
          exportFileName="srg-strategic-advisor-decisions.csv"
        />

        <DataTable
          tableId="strategic-advisor-history-plans"
          title="Action Plans"
          rows={store.actionPlans}
          columns={planColumns}
          searchable
          pageSize={8}
          exportFileName="srg-strategic-advisor-action-plans-history.csv"
        />

        <DataTable
          tableId="strategic-advisor-history-simulations"
          title="Simulation History"
          rows={store.simulationHistory}
          columns={[
            { key: 'createdAt', label: 'Created', sortable: true, render: (row) => new Date(row.createdAt).toLocaleString() },
            { key: 'financialImpact', label: 'Financial', sortable: true },
            { key: 'riskImpact', label: 'Risk', sortable: true },
            { key: 'deliveryImpact', label: 'Delivery', sortable: true },
            { key: 'workforceImpact', label: 'Workforce', sortable: true },
            { key: 'maintenanceImpact', label: 'Maintenance', sortable: true },
            { key: 'confidence', label: 'Confidence', sortable: true, render: (row) => `${row.confidence}%` },
          ]}
          searchable
          pageSize={8}
          exportFileName="srg-strategic-advisor-simulation-history.csv"
        />

        <DataTable
          tableId="strategic-advisor-history-recommendations"
          title="Recommendations History"
          rows={store.recommendationHistory}
          columns={[
            { key: 'title', label: 'Title', sortable: true },
            { key: 'view', label: 'View', sortable: true },
            { key: 'priority', label: 'Priority', sortable: true },
            { key: 'impact', label: 'Impact', sortable: true, render: (row) => `${row.impact}%` },
            { key: 'urgency', label: 'Urgency', sortable: true, render: (row) => `${row.urgency}%` },
            { key: 'confidence', label: 'Confidence', sortable: true, render: (row) => `${row.confidence}%` },
            { key: 'createdAt', label: 'Created', sortable: true, render: (row) => new Date(row.createdAt).toLocaleString() },
          ]}
          searchable
          pageSize={8}
          exportFileName="srg-strategic-advisor-recommendations-history.csv"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => StrategicAdvisorWorkspaceService.exportStrategicDecisions()}>Export Strategic Decisions</Button>
          <Button variant="secondary" onClick={() => StrategicAdvisorWorkspaceService.exportActionPlans()}>Export Action Plans</Button>
          <Button variant="secondary" onClick={() => StrategicAdvisorWorkspaceService.exportSimulationHistory()}>Export Simulation History</Button>
          <Button variant="secondary" onClick={() => StrategicAdvisorWorkspaceService.exportRecommendationsHistory()}>Export Recommendations History</Button>
        </div>
      </Section>

      <Section title="Observability" description="Strategic Events, Simulation Metrics, Decision Metrics and Advisor Timeline.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Strategic events</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{observability.strategicEvents.length}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Simulation metrics</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{observability.simulationMetrics.total}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Decision metrics</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{observability.decisionMetrics.decisions}</p></div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Advisor timeline</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{observability.advisorTimeline.length}</p></div>
        </div>

        <DataTable
          tableId="strategic-advisor-observability-events"
          title="Strategic Events"
          rows={observability.strategicEvents}
          columns={[
            { key: 'type', label: 'Type', sortable: true },
            { key: 'severity', label: 'Severity', sortable: true },
            { key: 'title', label: 'Title', sortable: true },
            { key: 'detail', label: 'Detail' },
            { key: 'createdAt', label: 'Created', sortable: true, render: (row) => new Date(row.createdAt).toLocaleString() },
          ]}
          searchable
          pageSize={8}
          exportFileName="srg-strategic-advisor-events.csv"
        />

        <DataTable
          tableId="strategic-advisor-observability-timeline"
          title="Advisor Timeline"
          rows={observability.advisorTimeline}
          columns={[
            { key: 'date', label: 'Date', sortable: true },
            { key: 'recommendations', label: 'Recommendations', sortable: true },
            { key: 'plans', label: 'Plans', sortable: true },
            { key: 'simulations', label: 'Simulations', sortable: true },
            { key: 'highRisks', label: 'High risks', sortable: true },
            { key: 'immediateActions', label: 'Immediate actions', sortable: true },
            { key: 'avgConfidence', label: 'Avg confidence', sortable: true, render: (row) => `${row.avgConfidence}%` },
          ]}
          searchable
          pageSize={8}
          exportFileName="srg-strategic-advisor-timeline.csv"
        />
      </Section>
    </div>
  )
}
