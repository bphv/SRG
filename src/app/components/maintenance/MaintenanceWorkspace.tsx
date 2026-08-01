import { useMemo, useState } from 'react'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import { useMaintenanceWorkspace } from '#/app/hooks/useMaintenanceWorkspace'
import { MaintenanceWorkspaceService } from '#/app/services/MaintenanceWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'

export default function MaintenanceWorkspace() {
  const workspace = useMaintenanceWorkspace()
  const projects = ProjectExecutionWorkspaceService.getStore().projects

  const [equipmentName, setEquipmentName] = useState('Cooling Pump A')
  const [equipmentCode, setEquipmentCode] = useState('EQP-PMP-010')
  const [equipmentReference, setEquipmentReference] = useState('GRF-PUMP-7781')
  const [equipmentSite, setEquipmentSite] = useState('Razel Site A')

  const [workTitle, setWorkTitle] = useState('Corrective intervention - pressure instability')
  const [workEquipmentId, setWorkEquipmentId] = useState(workspace.store.equipments[0]?.id ?? '')
  const [workPriority, setWorkPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high')

  const [partRef, setPartRef] = useState(workspace.store.spareParts[0]?.reference ?? '')
  const [partQty, setPartQty] = useState(1)

  const [aiQuestion, setAiQuestion] = useState('Donne les pannes fréquentes et actions préventives sur ce projet.')
  const [archiveQuestion, setArchiveQuestion] = useState('Historique panne moteur, pièces changées, devis et commandes associés')

  const [refreshTick, setRefreshTick] = useState(0)

  const selectedProject = useMemo(
    () => projects.find((item) => item.id === workspace.selectedProjectId) ?? projects[0],
    [projects, workspace.selectedProjectId],
  )

  const onCreateEquipment = () => {
    MaintenanceWorkspaceService.upsertEquipment({
      name: equipmentName,
      code: equipmentCode,
      reference: equipmentReference,
      manufacturer: 'Generic Industrial',
      brand: 'Generic Industrial',
      model: 'MODEL-A',
      serialNumber: `SN-${Date.now().toString(36)}`,
      purchaseDate: '2026-01-10',
      commissioningDate: '2026-02-05',
      warrantyStart: '2026-02-05',
      warrantyEnd: '2028-02-05',
      cost: 13500,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      client: selectedProject.client,
      supplier: 'Industrial Supplier Co',
      site: equipmentSite,
      building: 'A',
      zone: 'Line 1',
      parentMachine: '',
      photo: '',
      qrCode: '',
      barCode: '',
      documentation: ['datasheet.pdf'],
      plans: ['layout-a1.pdf'],
      manuals: ['manual.pdf'],
      status: 'running',
      healthScore: 82,
      performanceScore: 80,
      availabilityScore: 86,
      historicalEvent: 'Created from maintenance workspace',
      linkToKnowledge: true,
    })
    setRefreshTick((value) => value + 1)
  }

  const onCreateWorkOrder = () => {
    if (!workEquipmentId) return
    MaintenanceWorkspaceService.createWorkOrder({
      title: workTitle,
      equipmentId: workEquipmentId,
      maintenanceType: 'corrective',
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      client: selectedProject.client,
      site: 'Razel Site A',
      priority: workPriority,
      requestBy: 'Planner',
      estimatedHours: 5,
    })
    setRefreshTick((value) => value + 1)
  }

  const onAssignFirstRequest = () => {
    const request = workspace.store.workOrders.find((item) => item.status === 'request')
    if (!request) return
    MaintenanceWorkspaceService.assignWorkOrder({
      workOrderId: request.id,
      technician: workspace.store.technicians[0]?.name ?? 'Technician A',
      team: workspace.store.technicians[0]?.team ?? 'Team A',
      plannedStart: new Date().toISOString(),
      plannedEnd: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      actor: 'Planner',
    })
    setRefreshTick((value) => value + 1)
  }

  const onConsumePart = () => {
    const target = workspace.store.workOrders.find((item) => item.status === 'assigned' || item.status === 'in-progress')
    if (!target || !partRef) return
    MaintenanceWorkspaceService.consumeSparePart({
      workOrderId: target.id,
      partRef,
      quantity: partQty,
      actor: 'Technician',
    })
    MaintenanceWorkspaceService.logWorkTime({
      workOrderId: target.id,
      technician: target.assignedTechnician || workspace.store.technicians[0]?.name || 'Technician A',
      hours: 1.5,
      hourlyCost: 65,
    })
    setRefreshTick((value) => value + 1)
  }

  const onCloseFirstAssigned = () => {
    const target = workspace.store.workOrders.find((item) => item.status === 'assigned' || item.status === 'in-progress' || item.status === 'reported')
    if (!target) return
    MaintenanceWorkspaceService.addWorkReport({
      workOrderId: target.id,
      report: 'Intervention completed with pressure stabilization and leak control.',
      rootCause: 'Seal wear and alignment offset',
      actionsTaken: ['Seal replaced', 'Alignment corrected', 'Pressure test passed'],
      downtimeMinutes: 42,
      actor: 'Technician',
    })
    MaintenanceWorkspaceService.transitionWorkOrder(target.id, 'report-validated', 'Maintenance Manager', 'Report validated')
    MaintenanceWorkspaceService.closeWorkOrder(target.id, 'Maintenance Manager', 'Closed after validation and QA checklist')
    setRefreshTick((value) => value + 1)
  }

  const onRunChecklist = () => {
    const template = workspace.store.checklistTemplates[0]
    const order = workspace.store.workOrders[0]
    MaintenanceWorkspaceService.runChecklist({
      templateId: template.id,
      workOrderId: order.id,
      checks: template.items.map((item) => ({ item, ok: true, note: 'OK' })),
    })
    setRefreshTick((value) => value + 1)
  }

  const onAskAi = () => {
    MaintenanceWorkspaceService.askMaintenanceAi(selectedProject.id, aiQuestion)
    setRefreshTick((value) => value + 1)
  }

  const onArchiveIntelligence = async () => {
    await MaintenanceWorkspaceService.runArchiveIntelligence(archiveQuestion)
    setRefreshTick((value) => value + 1)
  }

  return (
    <div className="space-y-6" key={refreshTick}>
      <PageHeader
        title="Maintenance Workspace"
        description="Enterprise Asset Management & Intelligent CMMS: équipements, interventions, planning, techniciens, pièces, checklists et IA."
      />

      <Section title="KPIs" description="Disponibilité, MTBF, MTTR, OEE, coûts de maintenance et downtime.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Metric label="Equipements" value={workspace.summary.equipments} />
          <Metric label="Interventions" value={workspace.summary.workOrders} />
          <Metric label="Disponibilité" value={`${workspace.summary.availability}%`} />
          <Metric label="MTBF" value={`${workspace.summary.mtbf} h`} />
          <Metric label="MTTR" value={`${workspace.summary.mttr} h`} />
          <Metric label="OEE" value={`${workspace.summary.oee}%`} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
          <Info label="Coût maintenance" value={`${workspace.summary.totalMaintenanceCost.toFixed(2)}`} />
          <Info label="Downtime" value={`${workspace.summary.totalDowntimeMinutes} min`} />
          <Info label="Diagnostics" value={`${workspace.summary.diagnostics}`} />
        </div>
      </Section>

      <Section title="Filtres" description="Projet, équipements et interventions avec préférences persistées.">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <select
            value={workspace.selectedProjectId}
            onChange={(event) => workspace.setSelectedProjectId(event.target.value)}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm"
          >
            <option value="all">all projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <input
            value={workspace.equipmentSearch}
            onChange={(event) => workspace.setEquipmentSearch(event.target.value)}
            placeholder="Recherche équipement"
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm"
          />
          <input
            value={workspace.workOrderSearch}
            onChange={(event) => workspace.setWorkOrderSearch(event.target.value)}
            placeholder="Recherche intervention"
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm"
          />
          <select
            value={workspace.statusFilter}
            onChange={(event) => workspace.setStatusFilter(event.target.value as 'all' | typeof workspace.workOrderStatuses[number])}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm"
          >
            <option value="all">all statuses</option>
            {workspace.workOrderStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select
            value={workspace.priorityFilter}
            onChange={(event) => workspace.setPriorityFilter(event.target.value as 'all' | typeof workspace.workOrderPriorities[number])}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm"
          >
            <option value="all">all priorities</option>
            {workspace.workOrderPriorities.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select
            value={workspace.maintenanceTypeFilter}
            onChange={(event) => workspace.setMaintenanceTypeFilter(event.target.value as 'all' | typeof workspace.maintenanceTypes[number])}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm"
          >
            <option value="all">all maintenance types</option>
            {workspace.maintenanceTypes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </Section>

      <Section title="Equipements" description="Création/MAJ des actifs et suivi technique détaillé.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input value={equipmentName} onChange={(event) => setEquipmentName(event.target.value)} placeholder="Nom équipement" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm" />
          <input value={equipmentCode} onChange={(event) => setEquipmentCode(event.target.value)} placeholder="Code" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm" />
          <input value={equipmentReference} onChange={(event) => setEquipmentReference(event.target.value)} placeholder="Référence" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm" />
          <input value={equipmentSite} onChange={(event) => setEquipmentSite(event.target.value)} placeholder="Site" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm" />
          <button type="button" onClick={onCreateEquipment} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white">Ajouter équipement</button>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3 text-sm">
          {workspace.filteredEquipments.slice(0, 12).map((item) => (
            <article key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
              <p className="font-semibold text-[var(--srg-text-title)]">{item.code} - {item.name}</p>
              <p className="mt-1 text-[var(--srg-text-muted)]">{item.site} • {item.projectName}</p>
              <p className="text-[var(--srg-text-muted)]">status {item.status} • health {item.healthScore}% • availability {item.availabilityScore}%</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Interventions" description="Cycle complet: demande, assignation, exécution, rapport, validation, clôture.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input value={workTitle} onChange={(event) => setWorkTitle(event.target.value)} placeholder="Titre intervention" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm" />
          <select value={workEquipmentId} onChange={(event) => setWorkEquipmentId(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm">
            {workspace.store.equipments.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}
          </select>
          <select value={workPriority} onChange={(event) => setWorkPriority(event.target.value as 'low' | 'medium' | 'high' | 'critical')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm">
            {workspace.workOrderPriorities.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" onClick={onCreateWorkOrder} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white">Créer intervention</button>
          <button type="button" onClick={onAssignFirstRequest} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)]">Assigner première demande</button>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input value={partRef} onChange={(event) => setPartRef(event.target.value)} placeholder="Ref pièce" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm" />
          <input type="number" min={1} value={partQty} onChange={(event) => setPartQty(Number(event.target.value))} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm" />
          <button type="button" onClick={onConsumePart} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)]">Consommer pièce + pointage</button>
          <button type="button" onClick={onCloseFirstAssigned} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)]">Rapport + clôture</button>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          {workspace.filteredWorkOrders.slice(0, 16).map((item) => (
            <article key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
              <p className="font-semibold text-[var(--srg-text-title)]">{item.code} - {item.title}</p>
              <p className="text-[var(--srg-text-muted)]">{item.maintenanceType} • {item.priority} • {item.status}</p>
              <p className="text-[var(--srg-text-muted)]">tech {item.assignedTechnician || 'unassigned'} • cost {item.totalCost.toFixed(2)} • downtime {item.downtimeMinutes} min</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Planning" description="Calendrier, charge atelier, indisponibilités et interventions simultanées.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          {workspace.store.planning.slice(0, 12).map((item) => (
            <article key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
              <p className="font-semibold text-[var(--srg-text-title)]">{item.title}</p>
              <p className="text-[var(--srg-text-muted)]">{item.view} • {item.startDate} {'->'} {item.endDate}</p>
              <p className="text-[var(--srg-text-muted)]">atelier {item.workshopLoad}% • équipe {item.teamLoad}% • simultanées {item.simultaneousInterventions}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Techniciens" description="Compétences, habilitations, historiques et productivité.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          {workspace.store.technicians.slice(0, 16).map((item) => (
            <article key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
              <p className="font-semibold text-[var(--srg-text-title)]">{item.name}</p>
              <p className="text-[var(--srg-text-muted)]">{item.team}</p>
              <p className="text-[var(--srg-text-muted)]">skills: {item.skills.join(', ')}</p>
              <p className="text-[var(--srg-text-muted)]">hours {item.totalHours} • productivity {item.productivityScore}%</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Stocks maintenance & Pièces" description="Stock critique, seuils, consommation et déclenchement de réappro.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          {workspace.store.spareParts.slice(0, 20).map((item) => (
            <article key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
              <p className="font-semibold text-[var(--srg-text-title)]">{item.reference} - {item.name}</p>
              <p className="text-[var(--srg-text-muted)]">stock {item.stock} / seuil {item.minThreshold}</p>
              <p className="text-[var(--srg-text-muted)]">fournisseur {item.supplier} • auto-order {item.automaticOrder ? 'yes' : 'no'}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Checklists" description="Modèles et exécutions checklists maintenance/qualité/sécurité.">
        <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" onClick={onRunChecklist} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exécuter checklist par défaut</button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          {workspace.store.checklistTemplates.slice(0, 12).map((item) => (
            <article key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
              <p className="font-semibold text-[var(--srg-text-title)]">{item.title}</p>
              <p className="text-[var(--srg-text-muted)]">{item.kind} • {item.items.length} points</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="AI Maintenance" description="Questions pannes, réparations, planning, coûts, stock, disponibilité, MTBF/MTTR/OEE.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input value={aiQuestion} onChange={(event) => setAiQuestion(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm xl:col-span-3" />
          <button type="button" onClick={onAskAi} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white">Interroger IA</button>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {workspace.store.aiInsights.slice(0, 8).map((item) => (
            <article key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
              <p className="font-semibold text-[var(--srg-text-title)]">Q: {item.question}</p>
              <p className="mt-1 text-[var(--srg-text-muted)]">{item.answer}</p>
              <p className="text-xs text-[var(--srg-text-muted)]">confidence {item.confidence}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Archive Intelligence" description="Recherche globale docs/interventions/pièces/devis/commandes + export JSON, printable et script audio.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input value={archiveQuestion} onChange={(event) => setArchiveQuestion(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-sm xl:col-span-3" />
          <button type="button" onClick={onArchiveIntelligence} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)]">Lancer intelligence</button>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          {workspace.store.archiveQueries.slice(0, 6).map((item) => (
            <article key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
              <p className="font-semibold text-[var(--srg-text-title)]">{item.question}</p>
              <p className="text-[var(--srg-text-muted)]">docs {item.documents.length} • interventions {item.interventions.length} • pièces {item.parts.length} • devis {item.quotes.length} • commandes {item.orders.length}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Exports" description="Exports JSON/CSV du workspace maintenance.">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => MaintenanceWorkspaceService.exportStore()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter JSON</button>
          <button type="button" onClick={() => MaintenanceWorkspaceService.exportWorkOrdersCsv()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter interventions CSV</button>
          <button type="button" onClick={() => MaintenanceWorkspaceService.exportSparePartsCsv()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)]">Exporter pièces CSV</button>
        </div>
      </Section>
    </div>
  )
}

function Metric(props: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{props.label}</p>
      <p className="mt-2 text-3xl font-semibold text-[var(--srg-text-title)]">{props.value}</p>
    </div>
  )
}

function Info(props: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-[var(--srg-text-muted)]">
      <strong className="text-[var(--srg-text-title)]">{props.label}: </strong>
      {props.value}
    </div>
  )
}
