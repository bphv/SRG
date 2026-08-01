import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import { DashboardService } from '#/app/services/DashboardService'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { MaintenanceWorkspaceService } from '#/app/services/MaintenanceWorkspaceService'
import { ProcurementInventoryWorkspaceService } from '#/app/services/ProcurementInventoryWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'
import { FinanceWorkspaceService } from '#/app/services/FinanceWorkspaceService'
import { HumanResourcesWorkspaceService } from '#/app/services/HumanResourcesWorkspaceService'
import { ProviderWorkspaceService } from '#/app/services/ProviderWorkspaceService'

export const Route = createFileRoute('/observability')({
  component: ObservabilityPage,
})

function ObservabilityPage() {
  const metrics = DashboardService.getMetrics()
  const history = HistoryWorkspaceService.getRecords().slice(0, 6)
  const providers = ProviderWorkspaceService.list()
  const projectExecution = ProjectExecutionWorkspaceService.getSummary()
  const projectStore = ProjectExecutionWorkspaceService.getStore()
  const procurement = ProcurementInventoryWorkspaceService.getSummary()
  const procurementStore = ProcurementInventoryWorkspaceService.getStore()
  const maintenance = MaintenanceWorkspaceService.getSummary()
  const maintenanceStore = MaintenanceWorkspaceService.getStore()
  const finance = FinanceWorkspaceService.getSummary()
  const financeStore = FinanceWorkspaceService.getStore()
  const humanResources = HumanResourcesWorkspaceService.getSummary()
  const humanResourcesStore = HumanResourcesWorkspaceService.getStore()

  return (
    <div className="space-y-6">
      <PageHeader title="Observability" description="Track metrics, logs, quotas and runtime diagnostics across visible SRG workspaces." />
      <Section title="KPIs" description="Vue consolidée des exécutions visibles et de la santé applicative.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Generations</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{metrics.generations}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Taux de succes</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{metrics.successRate}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Latence moyenne</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{metrics.averageGenerationTime}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Providers actifs</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{metrics.providers}</p></div>
        </div>
      </Section>

      <Section title="Recent runs" description="Dernières exécutions avec durée, coût et statut.">
        <div className="space-y-3 text-sm">
          {history.map((entry) => (
            <article key={entry.id} className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-[var(--srg-text-title)]">{entry.promptName}</p>
                <span className="rounded-full bg-[var(--srg-surface-strong)] px-3 py-1 text-xs text-[var(--srg-text-muted)]">{entry.status}</span>
              </div>
              <p className="mt-2 text-[var(--srg-text-muted)]">{entry.provider} / {entry.model} • {entry.durationMs} ms • ${(entry.costEstimate).toFixed(6)}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Providers" description="Disponibilité et quotats de la couche visible providers.">
        <div className="grid gap-4 xl:grid-cols-2">
          {providers.map((provider) => (
            <div key={provider.id} className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[var(--srg-text-title)]">{provider.label}</p>
                <span className="rounded-full bg-[var(--srg-surface-strong)] px-3 py-1 text-xs text-[var(--srg-text-muted)]">{provider.health}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--srg-text-muted)]">{provider.status} • {provider.quota} • {provider.availability}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Project Execution Observability" description="Timeline, events, diagnostics, metrics and execution history.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Projects</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{projectExecution.projects}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Timeline</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{projectExecution.timeline}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Diagnostics</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{projectExecution.diagnostics}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Delays</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{projectExecution.delays}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Risks</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{projectExecution.risks}</p></div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-3 text-sm">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Recent timeline events</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {projectStore.timeline.slice(0, 10).map((item) => <p key={item.id}>{item.eventType} | {item.title} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Recent diagnostics</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {projectStore.diagnostics.slice(0, 10).map((item) => <p key={item.id}>{item.level} | {item.category} | {item.message}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Metric points</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {projectStore.metrics.slice(0, 12).map((item) => <p key={item.id}>{item.label} | {item.value}</p>)}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Procurement & Inventory Observability" description="Timeline, diagnostics, metrics and risks for achats/stocks/logistique.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Requests</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{procurement.requests}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Orders</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{procurement.orders}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Stock</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{procurement.stockItems}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Shipments</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{procurement.logistics}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Diagnostics</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{procurement.diagnostics}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Low stock</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{procurement.lowStock}</p></div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-3 text-sm">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Recent timeline events</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {procurementStore.timeline.slice(0, 12).map((item) => <p key={item.id}>{item.eventType} | {item.title} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Recent diagnostics</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {procurementStore.diagnostics.slice(0, 12).map((item) => <p key={item.id}>{item.level} | {item.category} | {item.message}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Metric points</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {procurementStore.metrics.slice(0, 16).map((item) => <p key={item.id}>{item.label} | {item.value}</p>)}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Maintenance CMMS Observability" description="Disponibilité, MTBF/MTTR, OEE, timeline, diagnostics et métriques maintenance.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Equipements</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{maintenance.equipments}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Interventions</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{maintenance.workOrders}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Disponibilité</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{maintenance.availability}%</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">MTBF</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{maintenance.mtbf} h</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">MTTR</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{maintenance.mttr} h</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">OEE</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{maintenance.oee}%</p></div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-3 text-sm">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Recent timeline events</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {maintenanceStore.timeline.slice(0, 12).map((item) => <p key={item.id}>{item.type} | {item.title} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Recent diagnostics</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {maintenanceStore.diagnostics.slice(0, 12).map((item) => <p key={item.id}>{item.level} | {item.category} | {item.message}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Metric points</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {maintenanceStore.metrics.slice(0, 16).map((item) => <p key={item.id}>{item.label} | {item.value}</p>)}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Finance Observability" description="Comptabilite, tresorerie, budgets, controle de gestion, timeline, diagnostics et audit.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Comptes</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{finance.accounts}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Ecritures</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{finance.entries}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Factures clients</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{finance.customerInvoices}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Factures fournisseurs</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{finance.supplierInvoices}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Cash flow</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{finance.cashFlow.toFixed(2)}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Diagnostics</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{finance.diagnostics}</p></div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-4 text-sm">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Recent timeline events</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {financeStore.timeline.slice(0, 12).map((item) => <p key={item.id}>{item.type} | {item.title} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Recent diagnostics</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {financeStore.diagnostics.slice(0, 12).map((item) => <p key={item.id}>{item.level} | {item.category} | {item.message}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Metric points</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {financeStore.metrics.slice(0, 14).map((item) => <p key={item.id}>{item.label} | {item.value}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Audit trail</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {financeStore.auditLogs.slice(0, 12).map((item) => <p key={item.id}>{item.action} | {item.entity} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Human Resources Observability" description="Employes, paie, presences, conges, competences, recrutement, timeline, diagnostics et audit.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Employes</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{humanResources.employees}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Contrats</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{humanResources.contracts}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Paies</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{humanResources.payrollRecords}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Presences</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{humanResources.attendanceRecords}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Conges</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{humanResources.leaveRequests}</p></div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Diagnostics</p><p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{humanResources.diagnostics}</p></div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-4 text-sm">
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Recent timeline events</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {humanResourcesStore.timeline.slice(0, 12).map((item) => <p key={item.id}>{item.type} | {item.title} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Recent diagnostics</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {humanResourcesStore.diagnostics.slice(0, 12).map((item) => <p key={item.id}>{item.level} | {item.category} | {item.message}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Metric points</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {humanResourcesStore.metrics.slice(0, 14).map((item) => <p key={item.id}>{item.label} | {item.value}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5">
            <p className="font-semibold text-[var(--srg-text-title)]">Audit trail</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
              {humanResourcesStore.auditLogs.slice(0, 12).map((item) => <p key={item.id}>{item.action} | {item.entity} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
