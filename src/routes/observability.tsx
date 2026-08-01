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
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Generations</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{metrics.generations}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Taux de succes</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{metrics.successRate}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Latence moyenne</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{metrics.averageGenerationTime}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Providers actifs</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{metrics.providers}</p></div>
        </div>
      </Section>

      <Section title="Recent runs" description="Dernières exécutions avec durée, coût et statut.">
        <div className="space-y-3 text-sm">
          {history.map((entry) => (
            <article key={entry.id} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-[var(--sea-ink)]">{entry.promptName}</p>
                <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs text-[var(--sea-ink-soft)]">{entry.status}</span>
              </div>
              <p className="mt-2 text-[var(--sea-ink-soft)]">{entry.provider} / {entry.model} • {entry.durationMs} ms • ${(entry.costEstimate).toFixed(6)}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Providers" description="Disponibilité et quotats de la couche visible providers.">
        <div className="grid gap-4 xl:grid-cols-2">
          {providers.map((provider) => (
            <div key={provider.id} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[var(--sea-ink)]">{provider.label}</p>
                <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs text-[var(--sea-ink-soft)]">{provider.health}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">{provider.status} • {provider.quota} • {provider.availability}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Project Execution Observability" description="Timeline, events, diagnostics, metrics and execution history.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Projects</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{projectExecution.projects}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Timeline</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{projectExecution.timeline}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Diagnostics</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{projectExecution.diagnostics}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Delays</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{projectExecution.delays}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Risks</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{projectExecution.risks}</p></div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-3 text-sm">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Recent timeline events</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {projectStore.timeline.slice(0, 10).map((item) => <p key={item.id}>{item.eventType} | {item.title} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Recent diagnostics</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {projectStore.diagnostics.slice(0, 10).map((item) => <p key={item.id}>{item.level} | {item.category} | {item.message}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Metric points</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {projectStore.metrics.slice(0, 12).map((item) => <p key={item.id}>{item.label} | {item.value}</p>)}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Procurement & Inventory Observability" description="Timeline, diagnostics, metrics and risks for achats/stocks/logistique.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Requests</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{procurement.requests}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Orders</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{procurement.orders}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Stock</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{procurement.stockItems}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Shipments</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{procurement.logistics}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Diagnostics</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{procurement.diagnostics}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Low stock</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{procurement.lowStock}</p></div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-3 text-sm">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Recent timeline events</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {procurementStore.timeline.slice(0, 12).map((item) => <p key={item.id}>{item.eventType} | {item.title} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Recent diagnostics</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {procurementStore.diagnostics.slice(0, 12).map((item) => <p key={item.id}>{item.level} | {item.category} | {item.message}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Metric points</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {procurementStore.metrics.slice(0, 16).map((item) => <p key={item.id}>{item.label} | {item.value}</p>)}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Maintenance CMMS Observability" description="Disponibilité, MTBF/MTTR, OEE, timeline, diagnostics et métriques maintenance.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Equipements</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{maintenance.equipments}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Interventions</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{maintenance.workOrders}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Disponibilité</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{maintenance.availability}%</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">MTBF</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{maintenance.mtbf} h</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">MTTR</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{maintenance.mttr} h</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">OEE</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{maintenance.oee}%</p></div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-3 text-sm">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Recent timeline events</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {maintenanceStore.timeline.slice(0, 12).map((item) => <p key={item.id}>{item.type} | {item.title} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Recent diagnostics</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {maintenanceStore.diagnostics.slice(0, 12).map((item) => <p key={item.id}>{item.level} | {item.category} | {item.message}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Metric points</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {maintenanceStore.metrics.slice(0, 16).map((item) => <p key={item.id}>{item.label} | {item.value}</p>)}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Finance Observability" description="Comptabilite, tresorerie, budgets, controle de gestion, timeline, diagnostics et audit.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Comptes</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{finance.accounts}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Ecritures</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{finance.entries}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Factures clients</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{finance.customerInvoices}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Factures fournisseurs</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{finance.supplierInvoices}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Cash flow</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{finance.cashFlow.toFixed(2)}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Diagnostics</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{finance.diagnostics}</p></div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-4 text-sm">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Recent timeline events</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {financeStore.timeline.slice(0, 12).map((item) => <p key={item.id}>{item.type} | {item.title} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Recent diagnostics</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {financeStore.diagnostics.slice(0, 12).map((item) => <p key={item.id}>{item.level} | {item.category} | {item.message}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Metric points</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {financeStore.metrics.slice(0, 14).map((item) => <p key={item.id}>{item.label} | {item.value}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Audit trail</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {financeStore.auditLogs.slice(0, 12).map((item) => <p key={item.id}>{item.action} | {item.entity} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Human Resources Observability" description="Employes, paie, presences, conges, competences, recrutement, timeline, diagnostics et audit.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Employes</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{humanResources.employees}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Contrats</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{humanResources.contracts}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Paies</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{humanResources.payrollRecords}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Presences</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{humanResources.attendanceRecords}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Conges</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{humanResources.leaveRequests}</p></div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Diagnostics</p><p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{humanResources.diagnostics}</p></div>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-4 text-sm">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Recent timeline events</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {humanResourcesStore.timeline.slice(0, 12).map((item) => <p key={item.id}>{item.type} | {item.title} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Recent diagnostics</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {humanResourcesStore.diagnostics.slice(0, 12).map((item) => <p key={item.id}>{item.level} | {item.category} | {item.message}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Metric points</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {humanResourcesStore.metrics.slice(0, 14).map((item) => <p key={item.id}>{item.label} | {item.value}</p>)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="font-semibold text-[var(--sea-ink)]">Audit trail</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
              {humanResourcesStore.auditLogs.slice(0, 12).map((item) => <p key={item.id}>{item.action} | {item.entity} | {new Date(item.createdAt).toLocaleString()}</p>)}
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
