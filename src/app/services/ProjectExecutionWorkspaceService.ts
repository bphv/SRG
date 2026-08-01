import { BusinessPolicyWorkspaceService } from '#/app/services/BusinessPolicyWorkspaceService'
import { ConversationWorkspaceService } from '#/app/services/ConversationWorkspaceService'
import { GenerateWorkspaceService } from '#/app/services/GenerateWorkspaceService'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export type ProjectExecutionStatus = 'draft' | 'signed' | 'in-progress' | 'on-hold' | 'completed' | 'closed'
export type ProjectExecutionPriority = 'low' | 'medium' | 'high' | 'critical'

export type ProjectExecutionRecord = {
  id: string
  identifier: string
  name: string
  description: string
  client: string
  supplier: string
  contract: string
  projectManager: string
  siteManager: string
  owner: string
  startDate: string
  endDate: string
  budget: number
  currency: string
  status: ProjectExecutionStatus
  priority: ProjectExecutionPriority
  documents: string[]
  history: string[]
  createdAt: string
  updatedAt: string
}

export type WorkItemType = 'lot' | 'sub-lot' | 'phase' | 'sub-phase' | 'milestone' | 'deliverable'

export type WorkItem = {
  id: string
  projectId: string
  type: WorkItemType
  parentId: string | null
  title: string
  budget: number
  progress: number
  owner: string
  date: string
  comments: string
  createdAt: string
  updatedAt: string
}

export type PlanningEntryKind = 'calendar' | 'gantt' | 'weekly' | 'daily'

export type PlanningEntry = {
  id: string
  projectId: string
  kind: PlanningEntryKind
  label: string
  startDate: string
  endDate: string
  progress: number
  delayedDays: number
  dependencies: string[]
  criticalPathPlaceholder: boolean
  createdAt: string
}

export type SiteRecord = {
  id: string
  projectId: string
  site: string
  chantier: string
  zone: string
  station: string
  sector: string
  building: string
  level: string
  address: string
  gps: string
  photos: string[]
  documents: string[]
  observations: string
  history: string[]
  createdAt: string
}

export type TeamRecord = {
  id: string
  projectId: string
  name: string
  lead: string
  technicians: string[]
  skills: string[]
  availability: string
  createdAt: string
}

export type AssignmentRecord = {
  id: string
  projectId: string
  technician: string
  teamId: string
  siteId: string
  workItemId: string
  fromDate: string
  toDate: string
  createdAt: string
}

export type AttendanceRecord = {
  id: string
  projectId: string
  technician: string
  date: string
  normalHours: number
  overtimeHours: number
  nightHours: number
  weekendHours: number
  holidayHours: number
  travelHours: number
  absenceHours: number
  leaveHours: number
  createdAt: string
}

export type MaterialCategory =
  | 'motor'
  | 'transformer'
  | 'pump'
  | 'drive'
  | 'cabinet'
  | 'cable'
  | 'sensor'
  | 'compressor'
  | 'part'
  | 'tool'

export type MaterialRecord = {
  id: string
  projectId: string
  category: MaterialCategory
  reference: string
  serialNumber: string
  manufacturer: string
  powerKw: number
  rpm: number
  voltage: number
  current: number
  installationDate: string
  stock: number
  history: string[]
  createdAt: string
}

export type PurchaseRecord = {
  id: string
  projectId: string
  requestCode: string
  item: string
  quantity: number
  status: 'requested' | 'validated' | 'ordered' | 'received' | 'returned'
  supplier: string
  createdAt: string
}

export type SupplierRecord = {
  id: string
  name: string
  contacts: string[]
  leadTimeDays: number
  orderCount: number
  onTimeRate: number
  performanceScore: number
  history: string[]
  createdAt: string
}

export type ContractRecord = {
  id: string
  projectId: string
  code: string
  title: string
  subcontracting: string[]
  amendments: string[]
  warranties: string[]
  penalties: string[]
  clauses: string[]
  documents: string[]
  renewals: string[]
  deadlines: string[]
  createdAt: string
}

export type FinancialRecord = {
  id: string
  projectId: string
  plannedBudget: number
  consumedBudget: number
  actualCost: number
  forecastCost: number
  margin: number
  remainingCommitment: number
  invoiced: number
  paid: number
  collected: number
  updatedAt: string
}

export type RiskRecord = {
  id: string
  projectId: string
  type: 'risk' | 'incident' | 'non-conformity' | 'delay'
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  correctiveAction: string
  status: 'open' | 'in-progress' | 'closed'
  createdAt: string
}

export type ReportRecord = {
  id: string
  projectId: string
  type: 'daily' | 'weekly' | 'monthly' | 'minutes' | 'meeting-pv'
  title: string
  summary: string
  photos: string[]
  documents: string[]
  createdAt: string
}

export type ProjectTimelineEvent = {
  id: string
  projectId: string
  eventType: 'creation' | 'modification' | 'validation' | 'assignment' | 'time-tracking' | 'order' | 'reception' | 'report' | 'incident' | 'closure'
  title: string
  details: string
  createdAt: string
}

export type ProjectDiagnostic = {
  id: string
  projectId: string
  level: 'info' | 'warning' | 'error'
  category: 'timeline' | 'budget' | 'planning' | 'stock' | 'supplier' | 'risk'
  message: string
  createdAt: string
}

export type ProjectMetricPoint = {
  id: string
  projectId: string
  label: string
  value: number
  createdAt: string
}

export type ProjectAiInsight = {
  id: string
  projectId: string
  question: string
  answer: string
  confidence: number
  references: string[]
  createdAt: string
}

export type ProjectExecutionStore = {
  projects: ProjectExecutionRecord[]
  workItems: WorkItem[]
  planning: PlanningEntry[]
  sites: SiteRecord[]
  teams: TeamRecord[]
  assignments: AssignmentRecord[]
  attendance: AttendanceRecord[]
  materials: MaterialRecord[]
  purchases: PurchaseRecord[]
  suppliers: SupplierRecord[]
  contracts: ContractRecord[]
  financial: FinancialRecord[]
  risks: RiskRecord[]
  reports: ReportRecord[]
  timeline: ProjectTimelineEvent[]
  diagnostics: ProjectDiagnostic[]
  metrics: ProjectMetricPoint[]
  aiInsights: ProjectAiInsight[]
}

const STORAGE_KEY = 'srg.project.execution.workspace.v1'

const MATERIAL_CATEGORIES: MaterialCategory[] = [
  'motor',
  'transformer',
  'pump',
  'drive',
  'cabinet',
  'cable',
  'sensor',
  'compressor',
  'part',
  'tool',
]

const WORK_ITEM_TYPES: WorkItemType[] = ['lot', 'sub-lot', 'phase', 'sub-phase', 'milestone', 'deliverable']
const PLANNING_KINDS: PlanningEntryKind[] = ['calendar', 'gantt', 'weekly', 'daily']
const PROJECT_STATUSES: ProjectExecutionStatus[] = ['draft', 'signed', 'in-progress', 'on-hold', 'completed', 'closed']
const PROJECT_PRIORITIES: ProjectExecutionPriority[] = ['low', 'medium', 'high', 'critical']

function nowIso(): string {
  return new Date().toISOString()
}

function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function toNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback
}

function formatAmount(value: number): number {
  return Number(value.toFixed(2))
}

function normalizeProject(input: Omit<ProjectExecutionRecord, 'id' | 'documents' | 'history' | 'createdAt' | 'updatedAt'>): ProjectExecutionRecord {
  const createdAt = nowIso()
  return {
    id: id('pex'),
    identifier: input.identifier.trim() || `PRJ-${Date.now().toString().slice(-6)}`,
    name: input.name.trim() || 'Untitled project',
    description: input.description.trim(),
    client: input.client.trim(),
    supplier: input.supplier.trim(),
    contract: input.contract.trim(),
    projectManager: input.projectManager.trim(),
    siteManager: input.siteManager.trim(),
    owner: input.owner.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    budget: formatAmount(toNumber(input.budget)),
    currency: input.currency.trim() || 'EUR',
    status: input.status,
    priority: input.priority,
    documents: [],
    history: [],
    createdAt,
    updatedAt: createdAt,
  }
}

function defaultStore(): ProjectExecutionStore {
  const seedProject = normalizeProject({
    identifier: 'PRJ-2026-001',
    name: 'Razel Industrial Revamp',
    description: 'Execution from contract signature to closure for multi-site electromechanical deployment.',
    client: 'Razel Cameroun',
    supplier: 'ABB Group',
    contract: 'CTR-RZL-2026-01',
    projectManager: 'Paul N.',
    siteManager: 'Aime B.',
    owner: 'SRG Operations',
    startDate: '2026-04-01',
    endDate: '2026-12-20',
    budget: 1250000,
    currency: 'EUR',
    status: 'in-progress',
    priority: 'high',
  })

  const workItems: WorkItem[] = [
    {
      id: id('wbs'),
      projectId: seedProject.id,
      type: 'lot',
      parentId: null,
      title: 'Electrical upgrade',
      budget: 540000,
      progress: 58,
      owner: 'Paul N.',
      date: '2026-08-01',
      comments: 'Includes motors, drives and cabinets.',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: id('wbs'),
      projectId: seedProject.id,
      type: 'milestone',
      parentId: null,
      title: 'Factory acceptance tests',
      budget: 0,
      progress: 30,
      owner: 'Aime B.',
      date: '2026-09-10',
      comments: 'Pending supplier confirmations.',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]

  const planning: PlanningEntry[] = [
    {
      id: id('plan'),
      projectId: seedProject.id,
      kind: 'gantt',
      label: 'Lot A execution',
      startDate: '2026-07-01',
      endDate: '2026-09-20',
      progress: 52,
      delayedDays: 7,
      dependencies: [],
      criticalPathPlaceholder: true,
      createdAt: nowIso(),
    },
  ]

  const sites: SiteRecord[] = [
    {
      id: id('site'),
      projectId: seedProject.id,
      site: 'Razel Site A',
      chantier: 'Razel-Yaounde',
      zone: 'Zone 1',
      station: 'Poste HTA',
      sector: 'North',
      building: 'Building E',
      level: 'L2',
      address: 'Yaounde, Cameroon',
      gps: '3.848,11.502',
      photos: [],
      documents: [],
      observations: 'Restricted access windows on weekends.',
      history: [],
      createdAt: nowIso(),
    },
  ]

  const teams: TeamRecord[] = [
    {
      id: id('team'),
      projectId: seedProject.id,
      name: 'Electrical Team A',
      lead: 'Jean M.',
      technicians: ['Jean M.', 'Nadine K.'],
      skills: ['commissioning', 'wiring', 'testing'],
      availability: 'weekdays',
      createdAt: nowIso(),
    },
  ]

  const assignments: AssignmentRecord[] = [
    {
      id: id('asg'),
      projectId: seedProject.id,
      technician: 'Jean M.',
      teamId: teams[0].id,
      siteId: sites[0].id,
      workItemId: workItems[0].id,
      fromDate: '2026-07-01',
      toDate: '2026-09-20',
      createdAt: nowIso(),
    },
  ]

  const attendance: AttendanceRecord[] = [
    {
      id: id('att'),
      projectId: seedProject.id,
      technician: 'Jean M.',
      date: '2026-08-01',
      normalHours: 8,
      overtimeHours: 2,
      nightHours: 0,
      weekendHours: 0,
      holidayHours: 0,
      travelHours: 1,
      absenceHours: 0,
      leaveHours: 0,
      createdAt: nowIso(),
    },
  ]

  const materials: MaterialRecord[] = [
    {
      id: id('mat'),
      projectId: seedProject.id,
      category: 'motor',
      reference: 'ABB-MTR-12345',
      serialNumber: 'SN-ABB-98765',
      manufacturer: 'ABB',
      powerKw: 250,
      rpm: 1500,
      voltage: 690,
      current: 260,
      installationDate: '2026-08-15',
      stock: 1,
      history: ['Allocated to Razel Site A.'],
      createdAt: nowIso(),
    },
  ]

  const suppliers: SupplierRecord[] = [
    {
      id: id('sup'),
      name: 'ABB Group',
      contacts: ['contact@abb.example'],
      leadTimeDays: 21,
      orderCount: 6,
      onTimeRate: 83,
      performanceScore: 78,
      history: ['One delayed delivery in July.'],
      createdAt: nowIso(),
    },
  ]

  const purchases: PurchaseRecord[] = [
    {
      id: id('po'),
      projectId: seedProject.id,
      requestCode: 'DA-2026-0045',
      item: 'Motor ABB-MTR-12345',
      quantity: 1,
      status: 'ordered',
      supplier: 'ABB Group',
      createdAt: nowIso(),
    },
  ]

  const contracts: ContractRecord[] = [
    {
      id: id('ctr'),
      projectId: seedProject.id,
      code: 'CTR-RZL-2026-01',
      title: 'Razel Industrial Revamp Main Contract',
      subcontracting: ['Cable pulling'],
      amendments: ['Avenant 01: timeline adjustment'],
      warranties: ['12 months commissioning warranty'],
      penalties: ['Delay penalty 0.3% / week'],
      clauses: ['Safety permit mandatory', 'Site access with badge only'],
      documents: [],
      renewals: [],
      deadlines: ['2026-12-20'],
      createdAt: nowIso(),
    },
  ]

  const financial: FinancialRecord[] = [
    {
      id: id('fin'),
      projectId: seedProject.id,
      plannedBudget: 1250000,
      consumedBudget: 620000,
      actualCost: 598000,
      forecastCost: 1215000,
      margin: 4.5,
      remainingCommitment: 315000,
      invoiced: 730000,
      paid: 520000,
      collected: 510000,
      updatedAt: nowIso(),
    },
  ]

  const risks: RiskRecord[] = [
    {
      id: id('risk'),
      projectId: seedProject.id,
      type: 'delay',
      title: 'Supplier shipping delay for drive cabinets',
      severity: 'high',
      correctiveAction: 'Switch part of supply to local stock and split delivery.',
      status: 'in-progress',
      createdAt: nowIso(),
    },
  ]

  const reports: ReportRecord[] = [
    {
      id: id('rep'),
      projectId: seedProject.id,
      type: 'weekly',
      title: 'Week 31 progress',
      summary: 'Progress steady on wiring and tests, delay remains on cabinets.',
      photos: [],
      documents: [],
      createdAt: nowIso(),
    },
  ]

  const timeline: ProjectTimelineEvent[] = [
    {
      id: id('evt'),
      projectId: seedProject.id,
      eventType: 'creation',
      title: 'Project initialized',
      details: 'Project workspace initialized with baseline data.',
      createdAt: nowIso(),
    },
  ]

  const diagnostics: ProjectDiagnostic[] = [
    {
      id: id('diag'),
      projectId: seedProject.id,
      level: 'warning',
      category: 'planning',
      message: 'Critical path placeholder active: exact CPM not connected yet.',
      createdAt: nowIso(),
    },
  ]

  const metrics: ProjectMetricPoint[] = [
    { id: id('met'), projectId: seedProject.id, label: 'progress', value: 56, createdAt: nowIso() },
    { id: id('met'), projectId: seedProject.id, label: 'budget-consumed', value: 620000, createdAt: nowIso() },
    { id: id('met'), projectId: seedProject.id, label: 'delayed-days', value: 7, createdAt: nowIso() },
  ]

  return {
    projects: [seedProject],
    workItems,
    planning,
    sites,
    teams,
    assignments,
    attendance,
    materials,
    purchases,
    suppliers,
    contracts,
    financial,
    risks,
    reports,
    timeline,
    diagnostics,
    metrics,
    aiInsights: [],
  }
}

export class ProjectExecutionWorkspaceService {
  private static memoryStore: ProjectExecutionStore = defaultStore()

  static getStore(): ProjectExecutionStore {
    return this.readStorage()
  }

  static listStatuses(): ProjectExecutionStatus[] {
    return [...PROJECT_STATUSES]
  }

  static listPriorities(): ProjectExecutionPriority[] {
    return [...PROJECT_PRIORITIES]
  }

  static listWorkItemTypes(): WorkItemType[] {
    return [...WORK_ITEM_TYPES]
  }

  static listPlanningKinds(): PlanningEntryKind[] {
    return [...PLANNING_KINDS]
  }

  static listMaterialCategories(): MaterialCategory[] {
    return [...MATERIAL_CATEGORIES]
  }

  static getSummary() {
    const store = this.getStore()
    const projectCount = store.projects.length
    const totalBudget = store.projects.reduce((sum, item) => sum + item.budget, 0)
    const consumedBudget = store.financial.reduce((sum, item) => sum + item.consumedBudget, 0)
    const avgProgress = store.workItems.length === 0
      ? 0
      : store.workItems.reduce((sum, item) => sum + item.progress, 0) / store.workItems.length
    const delays = store.planning.filter((item) => item.delayedDays > 0).length
    const incidents = store.risks.filter((item) => item.type === 'incident').length
    const openRisks = store.risks.filter((item) => item.status !== 'closed').length

    const topClients = Array.from(
      store.projects.reduce((acc, item) => acc.set(item.client, (acc.get(item.client) ?? 0) + 1), new Map<string, number>()).entries(),
    )
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6)

    const topSuppliers = Array.from(
      store.purchases.reduce((acc, item) => acc.set(item.supplier, (acc.get(item.supplier) ?? 0) + 1), new Map<string, number>()).entries(),
    )
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6)

    const topMaterials = Array.from(
      store.materials.reduce((acc, item) => acc.set(item.category, (acc.get(item.category) ?? 0) + 1), new Map<string, number>()).entries(),
    )
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6)

    const topTechnicians = Array.from(
      store.assignments.reduce((acc, item) => acc.set(item.technician, (acc.get(item.technician) ?? 0) + 1), new Map<string, number>()).entries(),
    )
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6)

    return {
      projects: projectCount,
      totalBudget: formatAmount(totalBudget),
      consumedBudget: formatAmount(consumedBudget),
      progress: formatAmount(avgProgress),
      delays,
      incidents,
      risks: openRisks,
      workItems: store.workItems.length,
      sites: store.sites.length,
      teams: store.teams.length,
      attendance: store.attendance.length,
      materials: store.materials.length,
      purchases: store.purchases.length,
      contracts: store.contracts.length,
      reports: store.reports.length,
      diagnostics: store.diagnostics.length,
      timeline: store.timeline.length,
      topClients,
      topSuppliers,
      topMaterials,
      topTechnicians,
    }
  }

  static createProject(input: Omit<ProjectExecutionRecord, 'id' | 'documents' | 'history' | 'createdAt' | 'updatedAt'>): ProjectExecutionRecord {
    const store = this.getStore()
    const next = normalizeProject(input)
    this.writeStorage({ ...store, projects: [next, ...store.projects] })
    this.appendEvent(next.id, 'creation', 'Project created', `${next.identifier} - ${next.name}`)
    this.syncProjectDocuments(next.id)
    this.publish('Project execution', `Project ${next.identifier} created.`)
    return next
  }

  static updateProject(projectId: string, updates: Partial<Omit<ProjectExecutionRecord, 'id' | 'createdAt'>>): ProjectExecutionRecord | undefined {
    const store = this.getStore()
    const target = store.projects.find((item) => item.id === projectId)
    if (!target) return undefined

    const next: ProjectExecutionRecord = {
      ...target,
      ...updates,
      updatedAt: nowIso(),
      budget: typeof updates.budget === 'number' ? formatAmount(updates.budget) : target.budget,
      history: [...target.history, `Updated at ${nowIso()}`].slice(-120),
    }

    this.writeStorage({
      ...store,
      projects: store.projects.map((item) => (item.id === projectId ? next : item)),
    })

    this.appendEvent(projectId, 'modification', 'Project updated', `Project ${next.identifier} updated.`)
    this.publish('Project execution', `Project ${next.identifier} updated.`)
    return next
  }

  static addWorkItem(input: {
    projectId: string
    type: WorkItemType
    parentId: string | null
    title: string
    budget: number
    progress: number
    owner: string
    date: string
    comments: string
  }): WorkItem {
    const store = this.getStore()
    const next: WorkItem = {
      id: id('wbs'),
      projectId: input.projectId,
      type: input.type,
      parentId: input.parentId,
      title: input.title.trim(),
      budget: formatAmount(toNumber(input.budget)),
      progress: Math.max(0, Math.min(100, toNumber(input.progress))),
      owner: input.owner.trim(),
      date: input.date,
      comments: input.comments.trim(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, workItems: [next, ...store.workItems] })
    this.appendEvent(input.projectId, 'modification', 'Work item added', `${input.type}: ${next.title}`)
    this.logHistory('Project work breakdown', next.title, 'modification')
    this.refreshFinancialSnapshot(input.projectId)
    return next
  }

  static addPlanningEntry(input: {
    projectId: string
    kind: PlanningEntryKind
    label: string
    startDate: string
    endDate: string
    progress: number
    delayedDays: number
    dependencies: string[]
  }): PlanningEntry {
    const store = this.getStore()
    const next: PlanningEntry = {
      id: id('plan'),
      projectId: input.projectId,
      kind: input.kind,
      label: input.label.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      progress: Math.max(0, Math.min(100, toNumber(input.progress))),
      delayedDays: Math.max(0, toNumber(input.delayedDays)),
      dependencies: input.dependencies,
      criticalPathPlaceholder: true,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, planning: [next, ...store.planning] })
    this.appendEvent(input.projectId, 'modification', 'Planning updated', `${next.kind}: ${next.label}`)
    if (next.delayedDays > 0) {
      this.pushDiagnostic(input.projectId, 'warning', 'planning', `${next.label} is delayed by ${next.delayedDays} day(s).`)
    }
    this.logHistory('Project planning', next.label, 'modification')
    return next
  }

  static addSite(input: Omit<SiteRecord, 'id' | 'photos' | 'documents' | 'history' | 'createdAt'>): SiteRecord {
    const store = this.getStore()
    const next: SiteRecord = {
      ...input,
      id: id('site'),
      photos: [],
      documents: [],
      observations: input.observations.trim(),
      history: [`Created at ${nowIso()}`],
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, sites: [next, ...store.sites] })
    this.appendEvent(input.projectId, 'modification', 'Site created', `${next.site} - ${next.chantier}`)
    this.logHistory('Project chantier', next.site, 'modification')
    return next
  }

  static addTeam(input: Omit<TeamRecord, 'id' | 'createdAt'>): TeamRecord {
    const store = this.getStore()
    const next: TeamRecord = {
      ...input,
      id: id('team'),
      name: input.name.trim(),
      lead: input.lead.trim(),
      technicians: input.technicians,
      skills: input.skills,
      availability: input.availability.trim(),
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, teams: [next, ...store.teams] })
    this.appendEvent(input.projectId, 'assignment', 'Team created', `${next.name} lead: ${next.lead}`)
    this.logHistory('Project team', next.name, 'modification')
    return next
  }

  static addAssignment(input: Omit<AssignmentRecord, 'id' | 'createdAt'>): AssignmentRecord {
    const store = this.getStore()
    const next: AssignmentRecord = {
      ...input,
      id: id('asg'),
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, assignments: [next, ...store.assignments] })
    this.appendEvent(input.projectId, 'assignment', 'Technician assigned', `${next.technician} -> ${next.workItemId}`)
    this.logHistory('Project assignment', next.technician, 'modification')
    return next
  }

  static addAttendance(input: Omit<AttendanceRecord, 'id' | 'createdAt'>): AttendanceRecord {
    const store = this.getStore()
    const next: AttendanceRecord = {
      ...input,
      id: id('att'),
      normalHours: toNumber(input.normalHours),
      overtimeHours: toNumber(input.overtimeHours),
      nightHours: toNumber(input.nightHours),
      weekendHours: toNumber(input.weekendHours),
      holidayHours: toNumber(input.holidayHours),
      travelHours: toNumber(input.travelHours),
      absenceHours: toNumber(input.absenceHours),
      leaveHours: toNumber(input.leaveHours),
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, attendance: [next, ...store.attendance] })
    this.appendEvent(input.projectId, 'time-tracking', 'Time tracked', `${next.technician} on ${next.date}`)
    this.logHistory('Project time tracking', `${next.technician} ${next.date}`, 'modification')
    return next
  }

  static addMaterial(input: Omit<MaterialRecord, 'id' | 'history' | 'createdAt'>): MaterialRecord {
    const store = this.getStore()
    const next: MaterialRecord = {
      ...input,
      id: id('mat'),
      history: [`Material created at ${nowIso()}`],
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, materials: [next, ...store.materials] })
    this.appendEvent(input.projectId, 'modification', 'Material added', `${next.category} ${next.reference}`)
    if (next.stock <= 0) {
      this.pushDiagnostic(input.projectId, 'warning', 'stock', `Material ${next.reference} is out of stock.`)
    }
    this.logHistory('Project material', next.reference, 'modification')
    return next
  }

  static addPurchase(input: Omit<PurchaseRecord, 'id' | 'createdAt'>): PurchaseRecord {
    const store = this.getStore()
    const next: PurchaseRecord = {
      ...input,
      id: id('po'),
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, purchases: [next, ...store.purchases] })
    this.appendEvent(input.projectId, 'order', 'Purchase updated', `${next.requestCode} ${next.status}`)
    if (next.status === 'received') {
      this.appendEvent(input.projectId, 'reception', 'Purchase received', `${next.requestCode}`)
    }
    this.logHistory('Project purchase', `${next.requestCode} ${next.status}`, 'modification')
    return next
  }

  static addSupplier(input: Omit<SupplierRecord, 'id' | 'createdAt'>): SupplierRecord {
    const store = this.getStore()
    const next: SupplierRecord = {
      ...input,
      id: id('sup'),
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, suppliers: [next, ...store.suppliers] })
    this.logHistory('Project supplier', next.name, 'modification')
    return next
  }

  static addContract(input: Omit<ContractRecord, 'id' | 'createdAt'>): ContractRecord {
    const store = this.getStore()
    const next: ContractRecord = {
      ...input,
      id: id('ctr'),
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, contracts: [next, ...store.contracts] })
    this.appendEvent(input.projectId, 'validation', 'Contract registered', `${next.code}`)
    this.logHistory('Project contract', next.code, 'validation')
    return next
  }

  static upsertFinancial(input: Omit<FinancialRecord, 'id' | 'updatedAt'>): FinancialRecord {
    const store = this.getStore()
    const current = store.financial.find((item) => item.projectId === input.projectId)
    const next: FinancialRecord = {
      ...(current ?? { id: id('fin') }),
      ...input,
      plannedBudget: formatAmount(input.plannedBudget),
      consumedBudget: formatAmount(input.consumedBudget),
      actualCost: formatAmount(input.actualCost),
      forecastCost: formatAmount(input.forecastCost),
      margin: formatAmount(input.margin),
      remainingCommitment: formatAmount(input.remainingCommitment),
      invoiced: formatAmount(input.invoiced),
      paid: formatAmount(input.paid),
      collected: formatAmount(input.collected),
      updatedAt: nowIso(),
    }

    const financial = current
      ? store.financial.map((item) => (item.projectId === input.projectId ? next : item))
      : [next, ...store.financial]

    this.writeStorage({ ...store, financial })
    this.appendEvent(input.projectId, 'modification', 'Financial snapshot updated', `Consumed ${next.consumedBudget}`)
    this.logHistory('Project financial', input.projectId, 'modification')
    return next
  }

  static addRisk(input: Omit<RiskRecord, 'id' | 'createdAt'>): RiskRecord {
    const store = this.getStore()
    const next: RiskRecord = {
      ...input,
      id: id('risk'),
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, risks: [next, ...store.risks] })
    this.appendEvent(input.projectId, 'incident', 'Risk/incident updated', `${next.type} - ${next.title}`)
    if (next.severity === 'critical' || next.severity === 'high') {
      this.pushDiagnostic(input.projectId, 'warning', 'risk', `${next.severity.toUpperCase()} risk: ${next.title}`)
    }
    this.logHistory('Project risk', next.title, 'modification')
    return next
  }

  static addReport(input: Omit<ReportRecord, 'id' | 'createdAt'>): ReportRecord {
    const store = this.getStore()
    const next: ReportRecord = {
      ...input,
      id: id('rep'),
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, reports: [next, ...store.reports] })
    this.appendEvent(input.projectId, 'report', 'Report published', `${next.type} - ${next.title}`)
    this.logHistory('Project report', next.title, 'publication')
    return next
  }

  static closeProject(projectId: string): ProjectExecutionRecord | undefined {
    const updated = this.updateProject(projectId, { status: 'closed' })
    if (!updated) return undefined
    this.appendEvent(projectId, 'closure', 'Project closed', `${updated.identifier}`)
    this.logHistory('Project closure', updated.identifier, 'archiving')
    return updated
  }

  static syncProjectDocuments(projectId: string): string[] {
    const store = this.getStore()
    const project = store.projects.find((item) => item.id === projectId)
    if (!project) return []

    const allDocs = KnowledgeWorkspaceService.getStore().documents
    const searchable = `${project.name} ${project.client} ${project.supplier} ${project.contract}`.toLowerCase()
    const matched = allDocs
      .filter((item) => `${item.title} ${item.description} ${item.content} ${item.source}`.toLowerCase().includes(project.name.toLowerCase())
        || `${item.title} ${item.description} ${item.content} ${item.source}`.toLowerCase().includes(project.client.toLowerCase())
        || `${item.title} ${item.description} ${item.content} ${item.source}`.toLowerCase().includes(project.supplier.toLowerCase())
        || `${item.title} ${item.description} ${item.content} ${item.source}`.toLowerCase().includes(searchable))
      .slice(0, 40)
      .map((item) => item.id)

    this.writeStorage({
      ...store,
      projects: store.projects.map((item) => (
        item.id === projectId
          ? {
              ...item,
              documents: matched,
              updatedAt: nowIso(),
              history: [...item.history, `Document sync at ${nowIso()}: ${matched.length} linked.`].slice(-120),
            }
          : item
      )),
    })

    this.appendEvent(projectId, 'validation', 'Documents synced', `${matched.length} document(s) linked from Prompt 030.`)
    return matched
  }

  static askProjectAi(projectId: string, question: string): ProjectAiInsight {
    const store = this.getStore()
    const project = store.projects.find((item) => item.id === projectId) ?? store.projects[0]
    const normalized = question.toLowerCase()

    const projectPlanning = store.planning.filter((item) => item.projectId === project.id)
    const projectWork = store.workItems.filter((item) => item.projectId === project.id)
    const projectRisks = store.risks.filter((item) => item.projectId === project.id)
    const projectFinance = store.financial.find((item) => item.projectId === project.id)
    const projectMaterials = store.materials.filter((item) => item.projectId === project.id)
    const projectAssignments = store.assignments.filter((item) => item.projectId === project.id)
    const projectPurchases = store.purchases.filter((item) => item.projectId === project.id)

    let answer = 'No project data available for this question.'
    let confidence = 0.42
    const references: string[] = []

    if (normalized.includes('retard')) {
      const delayed = projectPlanning.filter((item) => item.delayedDays > 0)
      const topSupplierDelay = this.findSupplierWithDelays(projectPurchases, store.suppliers)
      answer = delayed.length === 0
        ? 'No delayed planning entries detected.'
        : `Project delay is mainly driven by ${delayed.map((item) => `${item.label} (${item.delayedDays}d)`).join(', ')}. Main supplier impact: ${topSupplierDelay}.`
      confidence = 0.88
      references.push('planning', 'suppliers', 'purchases')
    } else if (normalized.includes('budget')) {
      const overBudgetLots = projectWork.filter((item) => item.budget > 0 && item.progress >= 85)
      answer = overBudgetLots.length === 0
        ? 'No major budget overrun detected at lot level from current progress.'
        : `Potential budget pressure on ${overBudgetLots.map((item) => item.title).join(', ')}.`
      confidence = 0.82
      references.push('workItems', 'financial')
    } else if (normalized.includes('rupture')) {
      const outOfStock = projectMaterials.filter((item) => item.stock <= 0)
      answer = outOfStock.length === 0
        ? 'No material stock rupture detected.'
        : `Stock rupture detected for ${outOfStock.map((item) => item.reference).join(', ')}.`
      confidence = 0.9
      references.push('materials')
    } else if (normalized.includes('fournisseur')) {
      const top = this.findSupplierWithDelays(projectPurchases, store.suppliers)
      answer = `Supplier with highest delay risk is ${top}.`
      confidence = 0.79
      references.push('suppliers', 'purchases')
    } else if (normalized.includes('cout reel') || normalized.includes('coût réel')) {
      answer = `Current actual cost is ${formatAmount(projectFinance?.actualCost ?? 0)} ${project.currency}.`
      confidence = 0.91
      references.push('financial')
    } else if (normalized.includes('marge')) {
      const baseMargin = projectFinance?.margin ?? 0
      const coeff = BusinessPolicyWorkspaceService.getStore().ruleProfiles[0]?.coefficients.margin ?? 0.15
      answer = `Estimated final margin is ${(baseMargin + coeff * 10).toFixed(2)}% using current costs and Prompt 031 policy coefficients.`
      confidence = 0.77
      references.push('financial', 'business-policy')
    } else if (normalized.includes('risque')) {
      const topRisk = projectRisks
        .filter((item) => item.status !== 'closed')
        .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
        .slice(0, 3)
      answer = topRisk.length === 0
        ? 'No major open risk registered.'
        : `Major risks: ${topRisk.map((item) => `${item.title} (${item.severity})`).join(', ')}.`
      confidence = 0.86
      references.push('risks')
    } else if (normalized.includes('technicien')) {
      const topTech = Array.from(
        projectAssignments.reduce((acc, item) => acc.set(item.technician, (acc.get(item.technician) ?? 0) + 1), new Map<string, number>()).entries(),
      )
        .map(([name, count]) => ({ name, count }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 3)
      answer = topTech.length === 0
        ? 'No technician assignments yet.'
        : `Most requested technicians: ${topTech.map((item) => `${item.name} (${item.count})`).join(', ')}.`
      confidence = 0.84
      references.push('assignments')
    } else {
      answer = `Project ${project.identifier} status is ${project.status}, progress ${(this.getSummary().progress).toFixed(1)}%, consumed budget ${formatAmount(projectFinance?.consumedBudget ?? 0)} ${project.currency}.`
      confidence = 0.7
      references.push('projects', 'financial', 'planning')
    }

    const insight: ProjectAiInsight = {
      id: id('ai'),
      projectId: project.id,
      question,
      answer,
      confidence,
      references,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, aiInsights: [insight, ...store.aiInsights].slice(0, 240) })
    this.appendEvent(project.id, 'validation', 'AI analysis generated', question)
    this.logHistory('Project AI', question, 'validation')
    return insight
  }

  static getProjectDocumentView(projectId: string) {
    const store = this.getStore()
    const project = store.projects.find((item) => item.id === projectId)
    if (!project) {
      return {
        linkedIds: [],
        linkedDocuments: [],
      }
    }

    const docs = KnowledgeWorkspaceService.getStore().documents.filter((item) => project.documents.includes(item.id))
    return {
      linkedIds: [...project.documents],
      linkedDocuments: docs,
    }
  }

  static getBusinessPolicyContext() {
    const policyStore = BusinessPolicyWorkspaceService.getStore()
    const summary = BusinessPolicyWorkspaceService.getSummary()
    return {
      coefficients: policyStore.ruleProfiles[0]?.coefficients,
      laborRoles: policyStore.laborRoles,
      policies: policyStore.policies,
      summary,
    }
  }

  static exportStore(): void {
    WorkspaceExchangeService.downloadJson('srg-project-execution.json', this.getStore())
  }

  static exportPlanningCsv(projectId: string): void {
    const planning = this.getStore().planning.filter((item) => item.projectId === projectId)
    const rows = [
      ['kind', 'label', 'startDate', 'endDate', 'progress', 'delayedDays', 'dependencies'],
      ...planning.map((item) => [
        item.kind,
        item.label,
        item.startDate,
        item.endDate,
        item.progress.toString(),
        item.delayedDays.toString(),
        item.dependencies.join('|'),
      ]),
    ]
    WorkspaceExchangeService.downloadCsv('srg-project-planning.csv', rows)
  }

  private static findSupplierWithDelays(purchases: PurchaseRecord[], suppliers: SupplierRecord[]): string {
    const delayedPurchases = purchases.filter((item) => item.status !== 'received')
    if (delayedPurchases.length === 0) return 'no supplier currently delaying deliveries'

    const counts = delayedPurchases.reduce((acc, item) => acc.set(item.supplier, (acc.get(item.supplier) ?? 0) + 1), new Map<string, number>())
    const top = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .at(0)

    if (!top) return 'no supplier currently delaying deliveries'
    const supplier = suppliers.find((item) => item.name === top.name)
    return supplier ? `${supplier.name} (${top.count} pending, score ${supplier.performanceScore})` : `${top.name} (${top.count} pending)`
  }

  private static refreshFinancialSnapshot(projectId: string): void {
    const store = this.getStore()
    const project = store.projects.find((item) => item.id === projectId)
    if (!project) return

    const lotBudget = store.workItems
      .filter((item) => item.projectId === projectId)
      .reduce((sum, item) => sum + item.budget, 0)

    const existing = store.financial.find((item) => item.projectId === projectId)
    const next: FinancialRecord = {
      id: existing?.id ?? id('fin'),
      projectId,
      plannedBudget: project.budget,
      consumedBudget: existing?.consumedBudget ?? Math.min(project.budget, lotBudget * 0.7),
      actualCost: existing?.actualCost ?? lotBudget * 0.65,
      forecastCost: existing?.forecastCost ?? Math.max(project.budget * 0.95, lotBudget * 1.02),
      margin: existing?.margin ?? 5,
      remainingCommitment: existing?.remainingCommitment ?? Math.max(0, project.budget - lotBudget),
      invoiced: existing?.invoiced ?? lotBudget * 0.72,
      paid: existing?.paid ?? lotBudget * 0.55,
      collected: existing?.collected ?? lotBudget * 0.51,
      updatedAt: nowIso(),
    }

    this.writeStorage({
      ...store,
      financial: existing
        ? store.financial.map((item) => (item.projectId === projectId ? next : item))
        : [next, ...store.financial],
    })
  }

  private static appendEvent(projectId: string, eventType: ProjectTimelineEvent['eventType'], title: string, details: string): void {
    const store = this.getStore()
    const event: ProjectTimelineEvent = {
      id: id('evt'),
      projectId,
      eventType,
      title,
      details,
      createdAt: nowIso(),
    }

    const metricsPoint: ProjectMetricPoint = {
      id: id('met'),
      projectId,
      label: eventType,
      value: store.timeline.filter((item) => item.projectId === projectId && item.eventType === eventType).length + 1,
      createdAt: nowIso(),
    }

    this.writeStorage({
      ...store,
      timeline: [event, ...store.timeline].slice(0, 1200),
      metrics: [metricsPoint, ...store.metrics].slice(0, 2400),
    })
  }

  private static pushDiagnostic(projectId: string, level: ProjectDiagnostic['level'], category: ProjectDiagnostic['category'], message: string): void {
    const store = this.getStore()
    const diagnostic: ProjectDiagnostic = {
      id: id('diag'),
      projectId,
      level,
      category,
      message,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, diagnostics: [diagnostic, ...store.diagnostics].slice(0, 1200) })
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
    const prefs = GenerateWorkspaceService.getPreferences()
    const provider = prefs.providerChoice === 'auto' ? 'workspace-auto' : prefs.providerChoice
    const model = prefs.model
    const conversation = ConversationWorkspaceService.getActiveConversation()

    HistoryWorkspaceService.addRecord({
      id: id('hist-pex'),
      promptName,
      promptText: payload,
      output: payload,
      provider,
      model,
      status: 'completed',
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      actorName: 'Project Execution Workspace',
      projectName: conversation?.title,
      eventType,
    })
  }

  private static readStorage(): ProjectExecutionStore {
    if (typeof window === 'undefined') {
      return this.memoryStore
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const seed = defaultStore()
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
        return seed
      }

      const parsed = JSON.parse(raw) as Partial<ProjectExecutionStore>
      const seed = defaultStore()
      return {
        ...seed,
        ...parsed,
        projects: Array.isArray(parsed.projects) ? parsed.projects : seed.projects,
        workItems: Array.isArray(parsed.workItems) ? parsed.workItems : seed.workItems,
        planning: Array.isArray(parsed.planning) ? parsed.planning : seed.planning,
        sites: Array.isArray(parsed.sites) ? parsed.sites : seed.sites,
        teams: Array.isArray(parsed.teams) ? parsed.teams : seed.teams,
        assignments: Array.isArray(parsed.assignments) ? parsed.assignments : seed.assignments,
        attendance: Array.isArray(parsed.attendance) ? parsed.attendance : seed.attendance,
        materials: Array.isArray(parsed.materials) ? parsed.materials : seed.materials,
        purchases: Array.isArray(parsed.purchases) ? parsed.purchases : seed.purchases,
        suppliers: Array.isArray(parsed.suppliers) ? parsed.suppliers : seed.suppliers,
        contracts: Array.isArray(parsed.contracts) ? parsed.contracts : seed.contracts,
        financial: Array.isArray(parsed.financial) ? parsed.financial : seed.financial,
        risks: Array.isArray(parsed.risks) ? parsed.risks : seed.risks,
        reports: Array.isArray(parsed.reports) ? parsed.reports : seed.reports,
        timeline: Array.isArray(parsed.timeline) ? parsed.timeline : seed.timeline,
        diagnostics: Array.isArray(parsed.diagnostics) ? parsed.diagnostics : seed.diagnostics,
        metrics: Array.isArray(parsed.metrics) ? parsed.metrics : seed.metrics,
        aiInsights: Array.isArray(parsed.aiInsights) ? parsed.aiInsights : seed.aiInsights,
      }
    } catch {
      return defaultStore()
    }
  }

  private static writeStorage(store: ProjectExecutionStore): void {
    this.memoryStore = store
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }
}

function severityRank(value: RiskRecord['severity']): number {
  if (value === 'critical') return 4
  if (value === 'high') return 3
  if (value === 'medium') return 2
  return 1
}
