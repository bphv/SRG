import { BusinessPolicyWorkspaceService } from '#/app/services/BusinessPolicyWorkspaceService'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { ProcurementInventoryWorkspaceService } from '#/app/services/ProcurementInventoryWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export type AssetStatus = 'running' | 'stopped' | 'failure' | 'maintenance' | 'standby'
export type MaintenanceType = 'preventive' | 'corrective' | 'conditional' | 'predictive' | 'regulatory' | 'exceptional'
export type WorkOrderStatus = 'request' | 'validated' | 'assigned' | 'planned' | 'in-progress' | 'reported' | 'report-validated' | 'closed' | 'cancelled'
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical'
export type PlanningView = 'calendar' | 'weekly' | 'monthly' | 'yearly'
export type ChecklistKind = 'maintenance' | 'safety' | 'quality' | 'inspection' | 'reception' | 'intervention'

export type EquipmentAsset = {
  id: string
  name: string
  code: string
  reference: string
  manufacturer: string
  brand: string
  model: string
  serialNumber: string
  purchaseDate: string
  commissioningDate: string
  warrantyStart: string
  warrantyEnd: string
  cost: number
  projectId: string
  projectName: string
  client: string
  supplier: string
  site: string
  building: string
  zone: string
  parentMachine: string
  photo: string
  qrCode: string
  barCode: string
  documentation: string[]
  plans: string[]
  manuals: string[]
  indexedDocuments: string[]
  status: AssetStatus
  healthScore: number
  performanceScore: number
  availabilityScore: number
  historicalEvents: string[]
  updatedAt: string
}

export type MaintenancePolicy = {
  id: string
  title: string
  periodicity: string
  procedure: string
  authorizations: string[]
  validations: string[]
  costModel: string
  coefficients: {
    labor: number
    parts: number
    downtime: number
    risk: number
  }
  updatedAt: string
}

export type MaintenancePlan = {
  id: string
  equipmentId: string
  equipmentCode: string
  maintenanceType: MaintenanceType
  periodicity: string
  nextDueDate: string
  lastExecutionDate: string
  checklistTemplateId: string
  estimatedHours: number
  estimatedCost: number
  regulatoryReference: string
  status: 'active' | 'paused' | 'completed'
  updatedAt: string
}

export type WorkOrderLabor = {
  id: string
  technician: string
  hours: number
  cost: number
  createdAt: string
}

export type WorkOrderPart = {
  id: string
  partRef: string
  quantity: number
  unitCost: number
  totalCost: number
  createdAt: string
}

export type WorkOrder = {
  id: string
  code: string
  title: string
  equipmentId: string
  equipmentCode: string
  maintenanceType: MaintenanceType
  projectId: string
  projectName: string
  client: string
  site: string
  priority: WorkOrderPriority
  requestBy: string
  requestedAt: string
  status: WorkOrderStatus
  assignedTechnician: string
  assignedTeam: string
  plannedStart: string
  plannedEnd: string
  actualStart: string
  actualEnd: string
  estimatedHours: number
  actualHours: number
  partsConsumed: WorkOrderPart[]
  laborConsumed: WorkOrderLabor[]
  report: string
  rootCause: string
  actionsTaken: string[]
  validationBy: string
  closedBy: string
  closureComment: string
  totalCost: number
  downtimeMinutes: number
  createdAt: string
  updatedAt: string
}

export type PlanningEntry = {
  id: string
  view: PlanningView
  projectId: string
  title: string
  startDate: string
  endDate: string
  workshopLoad: number
  teamLoad: number
  availabilities: string[]
  leaves: string[]
  simultaneousInterventions: number
  updatedAt: string
}

export type Technician = {
  id: string
  name: string
  team: string
  skills: string[]
  qualifications: string[]
  certifications: string[]
  availabilities: string[]
  history: string[]
  totalHours: number
  productivityScore: number
  updatedAt: string
}

export type SparePart = {
  id: string
  reference: string
  name: string
  compatibleEquipmentRefs: string[]
  stock: number
  minThreshold: number
  automaticOrder: boolean
  supplier: string
  unitCost: number
  consumptionHistory: Array<{ id: string; quantity: number; reason: string; createdAt: string }>
  updatedAt: string
}

export type ChecklistTemplate = {
  id: string
  kind: ChecklistKind
  title: string
  items: string[]
  updatedAt: string
}

export type ChecklistRun = {
  id: string
  templateId: string
  workOrderId: string
  kind: ChecklistKind
  checks: Array<{ item: string; ok: boolean; note: string }>
  createdAt: string
}

export type MaintenanceAiInsight = {
  id: string
  projectId: string
  question: string
  answer: string
  confidence: number
  references: string[]
  createdAt: string
}

export type ArchiveIntelligenceResult = {
  id: string
  question: string
  documents: string[]
  interventions: string[]
  parts: string[]
  quotes: string[]
  orders: string[]
  technicians: string[]
  suppliers: string[]
  audioScript: string
  createdAt: string
}

export type MaintenanceTimelineEvent = {
  id: string
  projectId: string
  type: 'equipment' | 'maintenance' | 'work-order' | 'planning' | 'technician' | 'stock' | 'checklist' | 'ai' | 'archive'
  title: string
  details: string
  createdAt: string
}

export type MaintenanceDiagnostic = {
  id: string
  projectId: string
  level: 'info' | 'warning' | 'error'
  category: 'availability' | 'cost' | 'stock' | 'planning' | 'quality'
  message: string
  createdAt: string
}

export type MaintenanceMetric = {
  id: string
  projectId: string
  label: string
  value: number
  createdAt: string
}

export type MaintenanceWorkspaceStore = {
  equipments: EquipmentAsset[]
  maintenancePolicies: MaintenancePolicy[]
  maintenancePlans: MaintenancePlan[]
  workOrders: WorkOrder[]
  planning: PlanningEntry[]
  technicians: Technician[]
  spareParts: SparePart[]
  checklistTemplates: ChecklistTemplate[]
  checklistRuns: ChecklistRun[]
  aiInsights: MaintenanceAiInsight[]
  archiveQueries: ArchiveIntelligenceResult[]
  timeline: MaintenanceTimelineEvent[]
  diagnostics: MaintenanceDiagnostic[]
  metrics: MaintenanceMetric[]
}

const STORAGE_KEY = 'srg.maintenance.workspace.v1'

function nowIso(): string {
  return new Date().toISOString()
}

function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function asAmount(value: number): number {
  return Number((Number.isFinite(value) ? value : 0).toFixed(2))
}

function seedStore(): MaintenanceWorkspaceStore {
  const project = ProjectExecutionWorkspaceService.getStore().projects[0]
  const part: SparePart = {
    id: id('part'),
    reference: 'ABB-BRG-6208',
    name: 'Bearing 6208',
    compatibleEquipmentRefs: ['ABB-MTR-12345'],
    stock: 8,
    minThreshold: 3,
    automaticOrder: true,
    supplier: 'ABB Group',
    unitCost: 120,
    consumptionHistory: [],
    updatedAt: nowIso(),
  }

  const equipment: EquipmentAsset = {
    id: id('eqp'),
    name: 'Main Conveyor Motor',
    code: 'EQP-MTR-001',
    reference: 'ABB-MTR-12345',
    manufacturer: 'ABB',
    brand: 'ABB',
    model: 'MTR-12345',
    serialNumber: 'SN-ABB-88001',
    purchaseDate: '2026-07-10',
    commissioningDate: '2026-08-05',
    warrantyStart: '2026-08-05',
    warrantyEnd: '2028-08-05',
    cost: 41200,
    projectId: project.id,
    projectName: project.name,
    client: project.client,
    supplier: 'ABB Group',
    site: 'Razel Site A',
    building: 'E',
    zone: 'North line',
    parentMachine: '',
    photo: 'mtr-001.jpg',
    qrCode: 'QR-EQP-MTR-001',
    barCode: 'BC-EQP-MTR-001',
    documentation: ['datasheet.pdf'],
    plans: ['electrical-plan-a1.pdf'],
    manuals: ['manual-mtr-001.pdf'],
    indexedDocuments: [],
    status: 'running',
    healthScore: 86,
    performanceScore: 82,
    availabilityScore: 91,
    historicalEvents: ['Installed in 2026-08 on Razel Site A.'],
    updatedAt: nowIso(),
  }

  const policyCoefficients = BusinessPolicyWorkspaceService.getStore().ruleProfiles[0].coefficients
  const policy: MaintenancePolicy = {
    id: id('pol'),
    title: 'Default enterprise maintenance policy',
    periodicity: 'Monthly + condition thresholds',
    procedure: 'LOTO + checklist + validation by maintenance manager',
    authorizations: ['maintenance-manager', 'project-manager'],
    validations: ['safety', 'quality', 'finance'],
    costModel: 'labor + parts + downtime',
    coefficients: {
      labor: policyCoefficients.local,
      parts: policyCoefficients.import,
      downtime: policyCoefficients.contingency,
      risk: policyCoefficients.margin,
    },
    updatedAt: nowIso(),
  }

  const plan: MaintenancePlan = {
    id: id('pln'),
    equipmentId: equipment.id,
    equipmentCode: equipment.code,
    maintenanceType: 'preventive',
    periodicity: 'Every 30 days',
    nextDueDate: '2026-09-10',
    lastExecutionDate: '2026-08-10',
    checklistTemplateId: '',
    estimatedHours: 6,
    estimatedCost: 950,
    regulatoryReference: 'REG-ELEC-01',
    status: 'active',
    updatedAt: nowIso(),
  }

  const workOrder: WorkOrder = {
    id: id('wo'),
    code: 'WO-2026-0001',
    title: 'Monthly preventive inspection',
    equipmentId: equipment.id,
    equipmentCode: equipment.code,
    maintenanceType: 'preventive',
    projectId: project.id,
    projectName: project.name,
    client: project.client,
    site: equipment.site,
    priority: 'medium',
    requestBy: 'Maintenance Planner',
    requestedAt: nowIso(),
    status: 'planned',
    assignedTechnician: 'Jean M.',
    assignedTeam: 'Electrical Team A',
    plannedStart: '2026-09-10T08:00:00.000Z',
    plannedEnd: '2026-09-10T14:00:00.000Z',
    actualStart: '',
    actualEnd: '',
    estimatedHours: 6,
    actualHours: 0,
    partsConsumed: [],
    laborConsumed: [],
    report: '',
    rootCause: '',
    actionsTaken: [],
    validationBy: '',
    closedBy: '',
    closureComment: '',
    totalCost: 0,
    downtimeMinutes: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  const technician: Technician = {
    id: id('tech'),
    name: 'Jean M.',
    team: 'Electrical Team A',
    skills: ['motors', 'drives', 'safety lockout'],
    qualifications: ['Electrical Level 2'],
    certifications: ['LOTO-2026', 'ATEX Awareness'],
    availabilities: ['Mon-Fri 08:00-17:00'],
    history: ['Assigned to Razel Site A since 2026-07.'],
    totalHours: 164,
    productivityScore: 84,
    updatedAt: nowIso(),
  }

  const checklistTemplate: ChecklistTemplate = {
    id: id('chk'),
    kind: 'maintenance',
    title: 'Motor preventive checklist',
    items: ['Visual inspection', 'Vibration level', 'Terminal tightening', 'Insulation test', 'Cleanliness'],
    updatedAt: nowIso(),
  }

  return {
    equipments: [equipment],
    maintenancePolicies: [policy],
    maintenancePlans: [plan],
    workOrders: [workOrder],
    planning: [
      {
        id: id('cal'),
        view: 'monthly',
        projectId: project.id,
        title: 'September maintenance window',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        workshopLoad: 68,
        teamLoad: 72,
        availabilities: ['Electrical Team A'],
        leaves: ['Tech leave 2026-09-18'],
        simultaneousInterventions: 2,
        updatedAt: nowIso(),
      },
    ],
    technicians: [technician],
    spareParts: [part],
    checklistTemplates: [checklistTemplate],
    checklistRuns: [],
    aiInsights: [],
    archiveQueries: [],
    timeline: [
      {
        id: id('evt'),
        projectId: project.id,
        type: 'equipment',
        title: 'Equipment registered',
        details: equipment.code,
        createdAt: nowIso(),
      },
    ],
    diagnostics: [],
    metrics: [
      { id: id('met'), projectId: project.id, label: 'availability', value: 91, createdAt: nowIso() },
      { id: id('met'), projectId: project.id, label: 'oee', value: 79, createdAt: nowIso() },
    ],
  }
}

export class MaintenanceWorkspaceService {
  private static memoryStore: MaintenanceWorkspaceStore = seedStore()

  static getStore(): MaintenanceWorkspaceStore {
    return this.readStorage()
  }

  static listMaintenanceTypes(): MaintenanceType[] {
    return ['preventive', 'corrective', 'conditional', 'predictive', 'regulatory', 'exceptional']
  }

  static listWorkOrderStatuses(): WorkOrderStatus[] {
    return ['request', 'validated', 'assigned', 'planned', 'in-progress', 'reported', 'report-validated', 'closed', 'cancelled']
  }

  static listPriorities(): WorkOrderPriority[] {
    return ['low', 'medium', 'high', 'critical']
  }

  static listChecklistKinds(): ChecklistKind[] {
    return ['maintenance', 'safety', 'quality', 'inspection', 'reception', 'intervention']
  }

  static listPlanningViews(): PlanningView[] {
    return ['calendar', 'weekly', 'monthly', 'yearly']
  }

  static getSummary() {
    const store = this.getStore()
    const total = Math.max(1, store.equipments.length)
    const running = store.equipments.filter((item) => item.status === 'running').length
    const failures = store.equipments.filter((item) => item.status === 'failure').length
    const availability = Number(((running / total) * 100).toFixed(2))

    const totalMaintenanceCost = store.workOrders.reduce((sum, item) => sum + item.totalCost, 0)
    const totalDowntimeMinutes = store.workOrders.reduce((sum, item) => sum + item.downtimeMinutes, 0)
    const closedOrders = store.workOrders.filter((item) => item.status === 'closed')
    const totalHours = closedOrders.reduce((sum, item) => sum + item.actualHours, 0)

    const mttr = closedOrders.length === 0 ? 0 : Number((totalHours / closedOrders.length).toFixed(2))
    const mtbf = failures === 0 ? Number((720).toFixed(2)) : Number((Math.max(24, (running * 720) / failures)).toFixed(2))
    const oee = Number(Math.max(0, Math.min(100, availability * 0.4 + this.averageScore(store.equipments, 'performanceScore') * 0.3 + this.averageScore(store.equipments, 'healthScore') * 0.3)).toFixed(2))

    return {
      equipments: store.equipments.length,
      workOrders: store.workOrders.length,
      preventivePlans: store.maintenancePlans.filter((item) => item.maintenanceType === 'preventive').length,
      technicians: store.technicians.length,
      spareParts: store.spareParts.length,
      checklists: store.checklistTemplates.length,
      availability,
      failures,
      totalMaintenanceCost: asAmount(totalMaintenanceCost),
      totalDowntimeMinutes,
      mtbf,
      mttr,
      oee,
      diagnostics: store.diagnostics.length,
      timeline: store.timeline.length,
      aiInsights: store.aiInsights.length,
      topEquipments: store.equipments
        .map((item) => ({ code: item.code, score: Number(((item.healthScore + item.performanceScore + item.availabilityScore) / 3).toFixed(2)) }))
        .sort((left, right) => right.score - left.score)
        .slice(0, 8),
      byMaintenanceType: this.listMaintenanceTypes().map((type) => ({
        type,
        count: store.workOrders.filter((item) => item.maintenanceType === type).length,
      })),
      byTechnician: Array.from(
        store.workOrders.reduce((acc, item) => {
          const key = item.assignedTechnician || 'unassigned'
          acc.set(key, (acc.get(key) ?? 0) + 1)
          return acc
        }, new Map<string, number>()).entries(),
      )
        .map(([name, count]) => ({ name, count }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 8),
    }
  }

  static upsertEquipment(input: Omit<EquipmentAsset, 'id' | 'historicalEvents' | 'updatedAt' | 'indexedDocuments'> & { id?: string; historicalEvent?: string; linkToKnowledge?: boolean }): EquipmentAsset {
    const store = this.getStore()
    const existing = input.id ? store.equipments.find((item) => item.id === input.id) : undefined
    const indexedDocuments = input.linkToKnowledge
      ? this.searchKnowledge(`${input.reference} ${input.serialNumber} ${input.projectName} ${input.site}`)
      : (existing?.indexedDocuments ?? [])

    const next: EquipmentAsset = {
      id: existing?.id ?? id('eqp'),
      name: input.name.trim(),
      code: input.code.trim(),
      reference: input.reference.trim(),
      manufacturer: input.manufacturer.trim(),
      brand: input.brand.trim(),
      model: input.model.trim(),
      serialNumber: input.serialNumber.trim(),
      purchaseDate: input.purchaseDate,
      commissioningDate: input.commissioningDate,
      warrantyStart: input.warrantyStart,
      warrantyEnd: input.warrantyEnd,
      cost: asAmount(input.cost),
      projectId: input.projectId,
      projectName: input.projectName,
      client: input.client.trim(),
      supplier: input.supplier.trim(),
      site: input.site.trim(),
      building: input.building.trim(),
      zone: input.zone.trim(),
      parentMachine: input.parentMachine.trim(),
      photo: input.photo.trim(),
      qrCode: input.qrCode.trim() || `QR-${input.code}`,
      barCode: input.barCode.trim() || `BC-${input.code}`,
      documentation: input.documentation,
      plans: input.plans,
      manuals: input.manuals,
      indexedDocuments,
      status: input.status,
      healthScore: Math.max(0, Math.min(100, input.healthScore)),
      performanceScore: Math.max(0, Math.min(100, input.performanceScore)),
      availabilityScore: Math.max(0, Math.min(100, input.availabilityScore)),
      historicalEvents: [input.historicalEvent?.trim() || 'Equipment updated', ...(existing?.historicalEvents ?? [])].slice(0, 200),
      updatedAt: nowIso(),
    }

    const equipments = existing
      ? store.equipments.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.equipments]

    this.writeStorage({ ...store, equipments })
    this.addTimeline(next.projectId, 'equipment', existing ? 'Equipment updated' : 'Equipment created', `${next.code} / ${next.name}`)
    this.logHistory('Maintenance equipment', `${next.code} ${existing ? 'updated' : 'created'}`, existing ? 'modification' : 'creation')
    return next
  }

  static configureMaintenancePolicy(input: Omit<MaintenancePolicy, 'id' | 'updatedAt'> & { id?: string }): MaintenancePolicy {
    const store = this.getStore()
    const existing = input.id ? store.maintenancePolicies.find((item) => item.id === input.id) : undefined

    const next: MaintenancePolicy = {
      id: existing?.id ?? id('pol'),
      title: input.title.trim(),
      periodicity: input.periodicity.trim(),
      procedure: input.procedure.trim(),
      authorizations: input.authorizations,
      validations: input.validations,
      costModel: input.costModel.trim(),
      coefficients: {
        labor: input.coefficients.labor,
        parts: input.coefficients.parts,
        downtime: input.coefficients.downtime,
        risk: input.coefficients.risk,
      },
      updatedAt: nowIso(),
    }

    const maintenancePolicies = existing
      ? store.maintenancePolicies.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.maintenancePolicies]

    this.writeStorage({ ...store, maintenancePolicies })
    this.logHistory('Maintenance policy', next.title, existing ? 'modification' : 'creation')
    return next
  }

  static createMaintenancePlan(input: Omit<MaintenancePlan, 'id' | 'updatedAt'>): MaintenancePlan {
    const store = this.getStore()
    const next: MaintenancePlan = {
      ...input,
      id: id('pln'),
      estimatedCost: asAmount(input.estimatedCost),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, maintenancePlans: [next, ...store.maintenancePlans] })
    const equipment = store.equipments.find((item) => item.id === next.equipmentId)
    this.addTimeline(equipment?.projectId ?? 'n/a', 'maintenance', 'Maintenance plan created', `${next.maintenanceType} ${next.equipmentCode}`)
    return next
  }

  static createWorkOrder(input: {
    title: string
    equipmentId: string
    maintenanceType: MaintenanceType
    projectId: string
    projectName: string
    client: string
    site: string
    priority: WorkOrderPriority
    requestBy: string
    estimatedHours: number
  }): WorkOrder | undefined {
    const store = this.getStore()
    const equipment = store.equipments.find((item) => item.id === input.equipmentId)
    if (!equipment) return undefined

    const next: WorkOrder = {
      id: id('wo'),
      code: `WO-${new Date().getFullYear()}-${String(store.workOrders.length + 1).padStart(4, '0')}`,
      title: input.title.trim(),
      equipmentId: equipment.id,
      equipmentCode: equipment.code,
      maintenanceType: input.maintenanceType,
      projectId: input.projectId,
      projectName: input.projectName,
      client: input.client,
      site: input.site,
      priority: input.priority,
      requestBy: input.requestBy,
      requestedAt: nowIso(),
      status: 'request',
      assignedTechnician: '',
      assignedTeam: '',
      plannedStart: '',
      plannedEnd: '',
      actualStart: '',
      actualEnd: '',
      estimatedHours: input.estimatedHours,
      actualHours: 0,
      partsConsumed: [],
      laborConsumed: [],
      report: '',
      rootCause: '',
      actionsTaken: [],
      validationBy: '',
      closedBy: '',
      closureComment: '',
      totalCost: 0,
      downtimeMinutes: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, workOrders: [next, ...store.workOrders] })
    this.addTimeline(next.projectId, 'work-order', 'Work order requested', `${next.code} ${next.title}`)
    this.publish('Maintenance', `Work order ${next.code} created.`)
    return next
  }

  static transitionWorkOrder(workOrderId: string, status: WorkOrderStatus, actor: string, note: string): WorkOrder | undefined {
    const store = this.getStore()
    const current = store.workOrders.find((item) => item.id === workOrderId)
    if (!current) return undefined

    const next: WorkOrder = {
      ...current,
      status,
      validationBy: status === 'report-validated' ? actor : current.validationBy,
      updatedAt: nowIso(),
      actionsTaken: [note.trim() || `${status} by ${actor}`, ...current.actionsTaken].slice(0, 120),
    }

    this.writeStorage({ ...store, workOrders: store.workOrders.map((item) => (item.id === workOrderId ? next : item)) })
    this.addTimeline(next.projectId, 'work-order', `Work order ${status}`, `${next.code} by ${actor}`)
    return next
  }

  static assignWorkOrder(input: {
    workOrderId: string
    technician: string
    team: string
    plannedStart: string
    plannedEnd: string
    actor: string
  }): WorkOrder | undefined {
    const store = this.getStore()
    const current = store.workOrders.find((item) => item.id === input.workOrderId)
    if (!current) return undefined

    const next: WorkOrder = {
      ...current,
      status: 'assigned',
      assignedTechnician: input.technician.trim(),
      assignedTeam: input.team.trim(),
      plannedStart: input.plannedStart,
      plannedEnd: input.plannedEnd,
      updatedAt: nowIso(),
      actionsTaken: [`Assigned by ${input.actor}`, ...current.actionsTaken].slice(0, 120),
    }

    this.writeStorage({ ...store, workOrders: store.workOrders.map((item) => (item.id === next.id ? next : item)) })
    this.addTimeline(next.projectId, 'technician', 'Work order assigned', `${next.code} -> ${next.assignedTechnician}`)
    return next
  }

  static logWorkTime(input: { workOrderId: string; technician: string; hours: number; hourlyCost: number }): WorkOrder | undefined {
    const store = this.getStore()
    const current = store.workOrders.find((item) => item.id === input.workOrderId)
    if (!current) return undefined

    const labor: WorkOrderLabor = {
      id: id('lab'),
      technician: input.technician.trim(),
      hours: Math.max(0, Number(input.hours)),
      cost: asAmount(Math.max(0, Number(input.hours)) * Math.max(0, Number(input.hourlyCost))),
      createdAt: nowIso(),
    }

    const laborCost = asAmount(current.laborConsumed.reduce((sum, item) => sum + item.cost, 0) + labor.cost)
    const partsCost = asAmount(current.partsConsumed.reduce((sum, item) => sum + item.totalCost, 0))

    const next: WorkOrder = {
      ...current,
      status: current.status === 'request' ? 'in-progress' : current.status,
      actualHours: Number((current.actualHours + labor.hours).toFixed(2)),
      laborConsumed: [labor, ...current.laborConsumed],
      totalCost: asAmount(laborCost + partsCost),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, workOrders: store.workOrders.map((item) => (item.id === next.id ? next : item)) })
    this.addTimeline(next.projectId, 'work-order', 'Labor consumed', `${next.code} ${labor.hours}h`)
    this.upsertTechnicianHours(labor.technician, labor.hours)
    return next
  }

  static consumeSparePart(input: { workOrderId: string; partRef: string; quantity: number; actor: string }): WorkOrder | undefined {
    const store = this.getStore()
    const current = store.workOrders.find((item) => item.id === input.workOrderId)
    if (!current) return undefined

    const part = store.spareParts.find((item) => item.reference === input.partRef)
    if (!part) return undefined

    const quantity = Math.max(0, Number(input.quantity))
    const consumed: WorkOrderPart = {
      id: id('cns'),
      partRef: part.reference,
      quantity,
      unitCost: part.unitCost,
      totalCost: asAmount(quantity * part.unitCost),
      createdAt: nowIso(),
    }

    const nextPartStock = Math.max(0, part.stock - quantity)
    const nextPart: SparePart = {
      ...part,
      stock: nextPartStock,
      consumptionHistory: [
        { id: id('pth'), quantity, reason: `WO ${current.code}`, createdAt: nowIso() },
        ...part.consumptionHistory,
      ].slice(0, 240),
      updatedAt: nowIso(),
    }

    const nextLaborCost = current.laborConsumed.reduce((sum, item) => sum + item.cost, 0)
    const nextPartsCost = current.partsConsumed.reduce((sum, item) => sum + item.totalCost, 0) + consumed.totalCost

    const nextOrder: WorkOrder = {
      ...current,
      partsConsumed: [consumed, ...current.partsConsumed],
      totalCost: asAmount(nextLaborCost + nextPartsCost),
      updatedAt: nowIso(),
    }

    this.writeStorage({
      ...store,
      workOrders: store.workOrders.map((item) => (item.id === nextOrder.id ? nextOrder : item)),
      spareParts: store.spareParts.map((item) => (item.id === nextPart.id ? nextPart : item)),
    })

    this.addTimeline(nextOrder.projectId, 'stock', 'Spare part consumed', `${nextOrder.code} / ${part.reference} / ${quantity}`)

    if (nextPartStock <= nextPart.minThreshold) {
      this.pushDiagnostic(nextOrder.projectId, 'warning', 'stock', `Part ${nextPart.reference} reached threshold.`)
      this.publish('Maintenance', `Threshold alert on spare part ${nextPart.reference}.`)
    }

    this.syncProcurementOnConsumption(nextOrder, nextPart, quantity, input.actor)
    return nextOrder
  }

  static addWorkReport(input: {
    workOrderId: string
    report: string
    rootCause: string
    actionsTaken: string[]
    downtimeMinutes: number
    actor: string
  }): WorkOrder | undefined {
    const store = this.getStore()
    const current = store.workOrders.find((item) => item.id === input.workOrderId)
    if (!current) return undefined

    const next: WorkOrder = {
      ...current,
      status: 'reported',
      report: input.report.trim(),
      rootCause: input.rootCause.trim(),
      actionsTaken: [...input.actionsTaken, ...current.actionsTaken].slice(0, 140),
      downtimeMinutes: Math.max(0, Math.round(input.downtimeMinutes)),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, workOrders: store.workOrders.map((item) => (item.id === next.id ? next : item)) })
    this.addTimeline(next.projectId, 'work-order', 'Work report submitted', `${next.code}`)
    return next
  }

  static closeWorkOrder(workOrderId: string, actor: string, closureComment: string): WorkOrder | undefined {
    const store = this.getStore()
    const current = store.workOrders.find((item) => item.id === workOrderId)
    if (!current) return undefined

    const next: WorkOrder = {
      ...current,
      status: 'closed',
      closedBy: actor,
      closureComment: closureComment.trim(),
      actualEnd: current.actualEnd || nowIso(),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, workOrders: store.workOrders.map((item) => (item.id === next.id ? next : item)) })
    this.addTimeline(next.projectId, 'work-order', 'Work order closed', `${next.code} by ${actor}`)
    this.logHistory('Maintenance work-order', `${next.code} closed`, 'archiving')
    return next
  }

  static upsertPlanning(input: Omit<PlanningEntry, 'id' | 'updatedAt'> & { id?: string }): PlanningEntry {
    const store = this.getStore()
    const existing = input.id ? store.planning.find((item) => item.id === input.id) : undefined

    const next: PlanningEntry = {
      id: existing?.id ?? id('plg'),
      view: input.view,
      projectId: input.projectId,
      title: input.title.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      workshopLoad: Math.max(0, Math.min(100, Number(input.workshopLoad))),
      teamLoad: Math.max(0, Math.min(100, Number(input.teamLoad))),
      availabilities: input.availabilities,
      leaves: input.leaves,
      simultaneousInterventions: Math.max(0, Math.round(input.simultaneousInterventions)),
      updatedAt: nowIso(),
    }

    const planning = existing
      ? store.planning.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.planning]

    this.writeStorage({ ...store, planning })
    this.addTimeline(next.projectId, 'planning', 'Planning updated', `${next.view} / ${next.title}`)

    if (next.simultaneousInterventions > 4) {
      this.pushDiagnostic(next.projectId, 'warning', 'planning', `High simultaneous interventions on ${next.title}.`)
    }

    return next
  }

  static upsertTechnician(input: Omit<Technician, 'id' | 'history' | 'updatedAt' | 'totalHours' | 'productivityScore'> & { id?: string; historyEvent?: string; totalHours?: number; productivityScore?: number }): Technician {
    const store = this.getStore()
    const existing = input.id ? store.technicians.find((item) => item.id === input.id) : undefined

    const next: Technician = {
      id: existing?.id ?? id('tech'),
      name: input.name.trim(),
      team: input.team.trim(),
      skills: input.skills,
      qualifications: input.qualifications,
      certifications: input.certifications,
      availabilities: input.availabilities,
      history: [input.historyEvent?.trim() || 'Technician profile updated', ...(existing?.history ?? [])].slice(0, 120),
      totalHours: input.totalHours ?? existing?.totalHours ?? 0,
      productivityScore: input.productivityScore ?? existing?.productivityScore ?? 80,
      updatedAt: nowIso(),
    }

    const technicians = existing
      ? store.technicians.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.technicians]

    this.writeStorage({ ...store, technicians })
    this.addTimeline('n/a', 'technician', existing ? 'Technician updated' : 'Technician created', next.name)
    return next
  }

  static upsertSparePart(input: Omit<SparePart, 'id' | 'consumptionHistory' | 'updatedAt'> & { id?: string; historyReason?: string }): SparePart {
    const store = this.getStore()
    const existing = input.id ? store.spareParts.find((item) => item.id === input.id) : undefined

    const next: SparePart = {
      id: existing?.id ?? id('part'),
      reference: input.reference.trim(),
      name: input.name.trim(),
      compatibleEquipmentRefs: input.compatibleEquipmentRefs,
      stock: Math.max(0, Math.round(input.stock)),
      minThreshold: Math.max(0, Math.round(input.minThreshold)),
      automaticOrder: input.automaticOrder,
      supplier: input.supplier.trim(),
      unitCost: asAmount(input.unitCost),
      consumptionHistory: [
        ...(existing?.consumptionHistory ?? []),
        {
          id: id('pth'),
          quantity: 0,
          reason: input.historyReason?.trim() || (existing ? 'Part updated' : 'Part created'),
          createdAt: nowIso(),
        },
      ].slice(-240),
      updatedAt: nowIso(),
    }

    const spareParts = existing
      ? store.spareParts.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.spareParts]

    this.writeStorage({ ...store, spareParts })
    this.addTimeline('n/a', 'stock', existing ? 'Spare part updated' : 'Spare part created', `${next.reference}`)
    return next
  }

  static upsertChecklistTemplate(input: Omit<ChecklistTemplate, 'id' | 'updatedAt'> & { id?: string }): ChecklistTemplate {
    const store = this.getStore()
    const existing = input.id ? store.checklistTemplates.find((item) => item.id === input.id) : undefined

    const next: ChecklistTemplate = {
      id: existing?.id ?? id('chk'),
      kind: input.kind,
      title: input.title.trim(),
      items: input.items.map((item) => item.trim()).filter((item) => item.length > 0),
      updatedAt: nowIso(),
    }

    const checklistTemplates = existing
      ? store.checklistTemplates.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.checklistTemplates]

    this.writeStorage({ ...store, checklistTemplates })
    this.addTimeline('n/a', 'checklist', existing ? 'Checklist updated' : 'Checklist created', `${next.kind} / ${next.title}`)
    return next
  }

  static runChecklist(input: { templateId: string; workOrderId: string; checks: Array<{ item: string; ok: boolean; note: string }> }): ChecklistRun | undefined {
    const store = this.getStore()
    const template = store.checklistTemplates.find((item) => item.id === input.templateId)
    const workOrder = store.workOrders.find((item) => item.id === input.workOrderId)
    if (!template || !workOrder) return undefined

    const run: ChecklistRun = {
      id: id('rck'),
      templateId: template.id,
      workOrderId: workOrder.id,
      kind: template.kind,
      checks: input.checks,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, checklistRuns: [run, ...store.checklistRuns] })
    this.addTimeline(workOrder.projectId, 'checklist', 'Checklist executed', `${template.title} on ${workOrder.code}`)

    const hasIssue = run.checks.some((item) => !item.ok)
    if (hasIssue) {
      this.pushDiagnostic(workOrder.projectId, 'warning', 'quality', `Checklist ${template.title} contains non-compliant checks.`)
    }

    return run
  }

  static askMaintenanceAi(projectId: string, question: string): MaintenanceAiInsight {
    const store = this.getStore()
    const normalized = question.toLowerCase()
    const orders = store.workOrders.filter((item) => item.projectId === projectId)
    const parts = store.spareParts
    const equipments = store.equipments.filter((item) => item.projectId === projectId)

    const totalDowntime = orders.reduce((sum, item) => sum + item.downtimeMinutes, 0)
    const avgAvailability = equipments.length === 0
      ? 0
      : equipments.reduce((sum, item) => sum + item.availabilityScore, 0) / equipments.length

    let answer = `Project has ${equipments.length} equipment(s), ${orders.length} work order(s), and average availability ${avgAvailability.toFixed(1)}%.`
    let confidence = 0.72
    const references: string[] = ['equipments', 'workOrders']

    if (normalized.includes('panne') || normalized.includes('root') || normalized.includes('cause')) {
      const topCause = orders
        .map((item) => item.rootCause)
        .filter((item) => item.trim().length > 0)
        .slice(0, 3)
      answer = topCause.length === 0
        ? 'No root-cause report available yet. Focus on vibration, temperature, and electrical quality checks.'
        : `Most reported root causes: ${topCause.join(' | ')}.`
      confidence = 0.84
      references.push('reports')
    } else if (normalized.includes('repair') || normalized.includes('reparation')) {
      answer = 'Recommended repair flow: isolate, secure (LOTO), replace critical parts, run checklist, validate quality, then close work order with report.'
      confidence = 0.8
    } else if (normalized.includes('planning') || normalized.includes('team')) {
      const load = store.planning.filter((item) => item.projectId === projectId).slice(0, 2)
      answer = load.length === 0
        ? 'No planning entry found. Create weekly/monthly plans before optimization.'
        : `Current planning load: ${load.map((item) => `${item.title} workshop ${item.workshopLoad}% team ${item.teamLoad}%`).join(' | ')}`
      confidence = 0.79
      references.push('planning')
    } else if (normalized.includes('piece') || normalized.includes('stock')) {
      const critical = parts.filter((item) => item.stock <= item.minThreshold)
      answer = critical.length === 0
        ? 'No critical spare-part stock detected.'
        : `Critical parts: ${critical.map((item) => `${item.reference} (${item.stock}/${item.minThreshold})`).join(', ')}.`
      confidence = 0.9
      references.push('spareParts')
    } else if (normalized.includes('cost')) {
      const totalCost = orders.reduce((sum, item) => sum + item.totalCost, 0)
      answer = `Total maintenance cost is ${asAmount(totalCost)} and downtime is ${totalDowntime} minutes.`
      confidence = 0.88
      references.push('costs')
    } else if (normalized.includes('availability')) {
      answer = `Average availability is ${avgAvailability.toFixed(1)}% with ${totalDowntime} downtime minutes.`
      confidence = 0.86
      references.push('availability')
    } else if (normalized.includes('mtbf')) {
      const summary = this.getSummary()
      answer = `MTBF estimate is ${summary.mtbf} h.`
      confidence = 0.84
      references.push('mtbf')
    } else if (normalized.includes('mttr')) {
      const summary = this.getSummary()
      answer = `MTTR estimate is ${summary.mttr} h.`
      confidence = 0.84
      references.push('mttr')
    } else if (normalized.includes('oee') || normalized.includes('rendement')) {
      const summary = this.getSummary()
      answer = `OEE estimate is ${summary.oee}%, based on availability, performance, and health.`
      confidence = 0.82
      references.push('oee')
    } else if (normalized.includes('anomal')) {
      const anomalies = store.diagnostics.filter((item) => item.projectId === projectId && item.level !== 'info').slice(0, 4)
      answer = anomalies.length === 0
        ? 'No anomaly diagnostic currently active.'
        : `Active anomalies: ${anomalies.map((item) => item.message).join(' | ')}`
      confidence = 0.8
      references.push('diagnostics')
    }

    const insight: MaintenanceAiInsight = {
      id: id('mai'),
      projectId,
      question,
      answer,
      confidence,
      references,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, aiInsights: [insight, ...store.aiInsights].slice(0, 320) })
    this.addTimeline(projectId, 'ai', 'Maintenance AI insight', question)
    return insight
  }

  static async runArchiveIntelligence(question: string): Promise<ArchiveIntelligenceResult> {
    const store = this.getStore()
    const normalized = question.toLowerCase()
    const tokens = normalized.split(/\s+/).filter((item) => item.length > 2)

    const docs = KnowledgeWorkspaceService.getStore().documents
      .filter((item) => tokens.some((token) => `${item.title} ${item.content} ${item.description} ${item.source}`.toLowerCase().includes(token)))
      .slice(0, 24)

    const interventions = store.workOrders
      .filter((item) => tokens.some((token) => `${item.title} ${item.equipmentCode} ${item.report} ${item.rootCause}`.toLowerCase().includes(token)))
      .map((item) => item.code)

    const parts = store.spareParts
      .filter((item) => tokens.some((token) => `${item.reference} ${item.name}`.toLowerCase().includes(token)))
      .map((item) => item.reference)

    const procurementStore = ProcurementInventoryWorkspaceService.getStore()
    const orders = procurementStore.orders
      .filter((item) => tokens.some((token) => `${item.orderCode} ${item.supplierName} ${item.lines.map((line) => line.label).join(' ')}`.toLowerCase().includes(token)))
      .map((item) => item.orderCode)

    const suppliers = Array.from(new Set([
      ...procurementStore.suppliers.map((item) => item.name),
      ...store.spareParts.map((item) => item.supplier),
    ].filter((name) => tokens.some((token) => name.toLowerCase().includes(token)))))

    const quotes = BusinessPolicyWorkspaceService.getStore().quotes
      .filter((item) => tokens.some((token) => `${item.code} ${item.title} ${item.customer}`.toLowerCase().includes(token)))
      .map((item) => item.code)

    const technicians = Array.from(new Set(
      store.workOrders
        .filter((item) => interventions.includes(item.code))
        .map((item) => item.assignedTechnician)
        .filter((item) => item.trim().length > 0),
    ))

    const audioScript = [
      'SRG Audio Response',
      `Question: ${question}`,
      `Documents found: ${docs.length}`,
      `Interventions: ${interventions.join(', ') || 'none'}`,
      `Parts: ${parts.join(', ') || 'none'}`,
      `Quotes: ${quotes.join(', ') || 'none'}`,
      `Orders: ${orders.join(', ') || 'none'}`,
      `Technicians: ${technicians.join(', ') || 'none'}`,
      `Suppliers: ${suppliers.join(', ') || 'none'}`,
    ].join('\n')

    const result: ArchiveIntelligenceResult = {
      id: id('arc'),
      question,
      documents: docs.map((item) => item.id),
      interventions,
      parts,
      quotes,
      orders,
      technicians,
      suppliers,
      audioScript,
      createdAt: nowIso(),
    }

    WorkspaceExchangeService.downloadText('srg-maintenance-audio-response.txt', audioScript)
    WorkspaceExchangeService.downloadJson('srg-maintenance-archive-result.json', result)

    const printable = `<!doctype html><html><head><meta charset="utf-8"><title>SRG Maintenance Archive Result</title></head><body><h1>SRG Maintenance Archive Result</h1><p>${question}</p><h2>Interventions</h2><ul>${interventions.map((item) => `<li>${item}</li>`).join('')}</ul><h2>Parts</h2><ul>${parts.map((item) => `<li>${item}</li>`).join('')}</ul><h2>Quotes</h2><ul>${quotes.map((item) => `<li>${item}</li>`).join('')}</ul><h2>Orders</h2><ul>${orders.map((item) => `<li>${item}</li>`).join('')}</ul><h2>Technicians</h2><ul>${technicians.map((item) => `<li>${item}</li>`).join('')}</ul><h2>Suppliers</h2><ul>${suppliers.map((item) => `<li>${item}</li>`).join('')}</ul></body></html>`
    WorkspaceExchangeService.downloadText('srg-maintenance-archive-printable.html', printable, 'text/html;charset=utf-8')

    if (docs.length > 0) {
      await KnowledgeWorkspaceService.exportEnterpriseReport('pdf', 'srg-maintenance-archive-report', docs.map((item) => item.id))
    }

    this.writeStorage({ ...store, archiveQueries: [result, ...store.archiveQueries].slice(0, 120) })
    this.addTimeline('n/a', 'archive', 'Archive intelligence query', question)
    return result
  }

  static exportStore(): void {
    WorkspaceExchangeService.downloadJson('srg-maintenance-workspace.json', this.getStore())
  }

  static exportWorkOrdersCsv(): void {
    const rows = [
      ['code', 'title', 'equipment', 'type', 'status', 'priority', 'technician', 'hours', 'cost', 'downtimeMin'],
      ...this.getStore().workOrders.map((item) => [
        item.code,
        item.title,
        item.equipmentCode,
        item.maintenanceType,
        item.status,
        item.priority,
        item.assignedTechnician,
        item.actualHours.toString(),
        item.totalCost.toString(),
        item.downtimeMinutes.toString(),
      ]),
    ]
    WorkspaceExchangeService.downloadCsv('srg-maintenance-workorders.csv', rows)
  }

  static exportSparePartsCsv(): void {
    const rows = [
      ['reference', 'name', 'stock', 'minThreshold', 'automaticOrder', 'supplier', 'unitCost'],
      ...this.getStore().spareParts.map((item) => [
        item.reference,
        item.name,
        item.stock.toString(),
        item.minThreshold.toString(),
        item.automaticOrder ? 'yes' : 'no',
        item.supplier,
        item.unitCost.toString(),
      ]),
    ]
    WorkspaceExchangeService.downloadCsv('srg-maintenance-spareparts.csv', rows)
  }

  private static averageScore<T extends 'healthScore' | 'performanceScore' | 'availabilityScore'>(equipments: EquipmentAsset[], key: T): number {
    if (equipments.length === 0) return 0
    return equipments.reduce((sum, item) => sum + item[key], 0) / equipments.length
  }

  private static searchKnowledge(query: string): string[] {
    const normalized = query.toLowerCase().trim()
    if (!normalized) return []
    return KnowledgeWorkspaceService.getStore().documents
      .filter((item) => `${item.title} ${item.description} ${item.content} ${item.source}`.toLowerCase().includes(normalized))
      .map((item) => item.id)
      .slice(0, 20)
  }

  private static upsertTechnicianHours(name: string, hours: number): void {
    const store = this.getStore()
    const target = store.technicians.find((item) => item.name.toLowerCase() === name.toLowerCase())
    if (!target) return

    const totalHours = Number((target.totalHours + hours).toFixed(2))
    const productivityScore = Number(Math.min(100, Math.max(0, target.productivityScore + hours * 0.08)).toFixed(2))
    const next: Technician = {
      ...target,
      totalHours,
      productivityScore,
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, technicians: store.technicians.map((item) => (item.id === next.id ? next : item)) })
  }

  private static syncProcurementOnConsumption(workOrder: WorkOrder, part: SparePart, quantity: number, actor: string): void {
    const procurement = ProcurementInventoryWorkspaceService.getStore()
    const stockMatch = procurement.stockItems.find((item) => item.materialRef === part.reference || item.label.toLowerCase().includes(part.reference.toLowerCase()))

    if (stockMatch) {
      ProcurementInventoryWorkspaceService.recordStockMovement({
        itemId: stockMatch.id,
        type: 'exit',
        quantity,
        fromLocation: stockMatch.location,
        toLocation: workOrder.site,
        reason: `Maintenance ${workOrder.code} by ${actor}`,
        orderId: '',
      })
    }

    if (part.stock - quantity <= part.minThreshold) {
      this.addTimeline(workOrder.projectId, 'stock', 'Procurement trigger prepared', `Replenish ${part.reference}`)
      this.pushDiagnostic(workOrder.projectId, 'warning', 'stock', `Auto reorder preparation required for ${part.reference}.`)
    }
  }

  private static addTimeline(projectId: string, type: MaintenanceTimelineEvent['type'], title: string, details: string): void {
    const store = this.getStore()
    const event: MaintenanceTimelineEvent = {
      id: id('evt'),
      projectId,
      type,
      title,
      details,
      createdAt: nowIso(),
    }

    const metric: MaintenanceMetric = {
      id: id('met'),
      projectId,
      label: type,
      value: store.timeline.filter((item) => item.projectId === projectId && item.type === type).length + 1,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, timeline: [event, ...store.timeline].slice(0, 2200), metrics: [metric, ...store.metrics].slice(0, 3600) })
  }

  private static pushDiagnostic(projectId: string, level: MaintenanceDiagnostic['level'], category: MaintenanceDiagnostic['category'], message: string): void {
    const store = this.getStore()
    const diagnostic: MaintenanceDiagnostic = {
      id: id('diag'),
      projectId,
      level,
      category,
      message,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, diagnostics: [diagnostic, ...store.diagnostics].slice(0, 1800) })
  }

  private static publish(title: string, message: string): void {
    notificationService.publish({
      title,
      message,
      level: 'info',
      priority: 'medium',
      category: 'system',
      read: false,
    })
  }

  private static logHistory(promptName: string, payload: string, eventType: 'creation' | 'modification' | 'validation' | 'publication' | 'archiving'): void {
    HistoryWorkspaceService.addRecord({
      id: id('hmt'),
      promptName,
      promptText: payload,
      output: payload,
      provider: 'workspace',
      model: 'maintenance',
      status: 'completed',
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      actorName: 'Maintenance Workspace',
      eventType,
    })
  }

  private static readStorage(): MaintenanceWorkspaceStore {
    if (typeof window === 'undefined') {
      return this.memoryStore
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const seed = seedStore()
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
        return seed
      }

      const parsed = JSON.parse(raw) as Partial<MaintenanceWorkspaceStore>
      const seed = seedStore()
      return {
        ...seed,
        ...parsed,
        equipments: Array.isArray(parsed.equipments) ? parsed.equipments : seed.equipments,
        maintenancePolicies: Array.isArray(parsed.maintenancePolicies) ? parsed.maintenancePolicies : seed.maintenancePolicies,
        maintenancePlans: Array.isArray(parsed.maintenancePlans) ? parsed.maintenancePlans : seed.maintenancePlans,
        workOrders: Array.isArray(parsed.workOrders) ? parsed.workOrders : seed.workOrders,
        planning: Array.isArray(parsed.planning) ? parsed.planning : seed.planning,
        technicians: Array.isArray(parsed.technicians) ? parsed.technicians : seed.technicians,
        spareParts: Array.isArray(parsed.spareParts) ? parsed.spareParts : seed.spareParts,
        checklistTemplates: Array.isArray(parsed.checklistTemplates) ? parsed.checklistTemplates : seed.checklistTemplates,
        checklistRuns: Array.isArray(parsed.checklistRuns) ? parsed.checklistRuns : seed.checklistRuns,
        aiInsights: Array.isArray(parsed.aiInsights) ? parsed.aiInsights : seed.aiInsights,
        archiveQueries: Array.isArray(parsed.archiveQueries) ? parsed.archiveQueries : seed.archiveQueries,
        timeline: Array.isArray(parsed.timeline) ? parsed.timeline : seed.timeline,
        diagnostics: Array.isArray(parsed.diagnostics) ? parsed.diagnostics : seed.diagnostics,
        metrics: Array.isArray(parsed.metrics) ? parsed.metrics : seed.metrics,
      }
    } catch {
      return seedStore()
    }
  }

  private static writeStorage(store: MaintenanceWorkspaceStore): void {
    this.memoryStore = store
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }
}
