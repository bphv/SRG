import { BusinessPolicyWorkspaceService } from '#/app/services/BusinessPolicyWorkspaceService'
import { ConversationWorkspaceService } from '#/app/services/ConversationWorkspaceService'
import { GenerateWorkspaceService } from '#/app/services/GenerateWorkspaceService'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export type ProcurementPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ProcurementApprovalStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'archived'
export type TenderStatus = 'draft' | 'open' | 'analysis' | 'decision' | 'awarded' | 'archived'
export type OrderStatus = 'draft' | 'validated' | 'ordered' | 'partially-delivered' | 'received' | 'returned' | 'cancelled' | 'modified'
export type SupplierCategory = 'electrical' | 'mechanical' | 'automation' | 'logistics' | 'consumables' | 'services' | 'construction' | 'other'
export type LogisticsStatus = 'prepared' | 'in-transit' | 'incident' | 'delivered' | 'site-received'
export type StockMovementType = 'entry' | 'exit' | 'reservation' | 'inventory' | 'transfer'
export type ReceptionResult = 'accepted' | 'accepted-with-reserves' | 'rejected'
export type IndustrialMaterialCategory =
  | 'motor'
  | 'transformer'
  | 'pump'
  | 'drive'
  | 'compressor'
  | 'gearbox'
  | 'plc'
  | 'sensor'
  | 'breaker'
  | 'cable'
  | 'accessory'
  | 'tooling'
  | 'consumable'
  | 'spare-part'

export type WorkflowStep = {
  id: string
  actor: string
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'commented' | 'modified' | 'archived'
  comment: string
  createdAt: string
}

export type PurchaseRequest = {
  id: string
  requestCode: string
  title: string
  justification: string
  priority: ProcurementPriority
  urgency: boolean
  budget: number
  costCenter: string
  projectId: string
  projectName: string
  status: ProcurementApprovalStatus
  approvalWorkflow: Array<{ level: number; label: string; status: 'pending' | 'approved' | 'rejected'; actor: string }>
  history: WorkflowStep[]
  createdAt: string
  updatedAt: string
}

export type TenderBid = {
  id: string
  supplierId: string
  supplierName: string
  amount: number
  leadTimeDays: number
  qualityScore: number
  complianceScore: number
  riskScore: number
  technicalScore: number
  notes: string
}

export type TenderRecord = {
  id: string
  tenderCode: string
  requestId: string
  title: string
  category: SupplierCategory
  status: TenderStatus
  bids: TenderBid[]
  autoAnalysis: string
  selectedBidId: string | null
  decisionComment: string
  archiveReason: string
  history: WorkflowStep[]
  createdAt: string
  updatedAt: string
}

export type SupplierContract = {
  id: string
  title: string
  startDate: string
  endDate: string
  documents: string[]
}

export type SupplierRecord = {
  id: string
  name: string
  categories: SupplierCategory[]
  contacts: string[]
  averageLeadTimeDays: number
  qualityScore: number
  nonConformities: number
  onTimeRate: number
  automaticRating: number
  performanceHistory: string[]
  contracts: SupplierContract[]
  documents: string[]
  createdAt: string
  updatedAt: string
}

export type PurchaseOrderRecord = {
  id: string
  orderCode: string
  requestId: string
  tenderId: string | null
  supplierId: string
  supplierName: string
  status: OrderStatus
  lines: Array<{ label: string; quantity: number; unitPrice: number; total: number }>
  total: number
  partialDeliveries: Array<{ id: string; deliveredQuantity: number; date: string; note: string }>
  receptions: string[]
  returns: Array<{ id: string; quantity: number; reason: string; createdAt: string }>
  changes: WorkflowStep[]
  createdAt: string
  updatedAt: string
}

export type StockItem = {
  id: string
  materialRef: string
  label: string
  category: IndustrialMaterialCategory
  quantity: number
  minThreshold: number
  maxThreshold: number
  location: string
  store: string
  warehouse: string
  chantierDepot: string
  traceabilityTag: string
  updatedAt: string
}

export type StockMovement = {
  id: string
  itemId: string
  type: StockMovementType
  quantity: number
  fromLocation: string
  toLocation: string
  reason: string
  orderId: string
  createdAt: string
}

export type IndustrialMaterial = {
  id: string
  category: IndustrialMaterialCategory
  reference: string
  manufacturer: string
  brand: string
  serialNumber: string
  purchaseDate: string
  receptionDate: string
  warrantyEndDate: string
  documentation: string[]
  photos: string[]
  qrCode: string
  barCode: string
  linkedDocuments: string[]
  projectId: string
  projectName: string
  supplierName: string
  updatedAt: string
}

export type ReceptionRecord = {
  id: string
  orderId: string
  projectId: string
  qualityControl: string
  result: ReceptionResult
  pvNumber: string
  photos: string[]
  observations: string
  reserves: string[]
  signature: string
  documents: string[]
  createdAt: string
}

export type LogisticsRecord = {
  id: string
  orderId: string
  shipmentCode: string
  transporter: string
  status: LogisticsStatus
  origin: string
  destination: string
  currentLocation: string
  incidents: string[]
  deliveryDate: string
  siteReceptionDate: string
  history: WorkflowStep[]
  createdAt: string
  updatedAt: string
}

export type ProcurementAiInsight = {
  id: string
  question: string
  projectId: string
  answer: string
  confidence: number
  references: string[]
  createdAt: string
}

export type ProcurementTimelineEvent = {
  id: string
  projectId: string
  eventType: 'request' | 'tender' | 'supplier' | 'order' | 'stock' | 'reception' | 'logistics' | 'ai'
  title: string
  details: string
  createdAt: string
}

export type ProcurementDiagnostic = {
  id: string
  projectId: string
  level: 'info' | 'warning' | 'error'
  category: 'budget' | 'supplier' | 'stock' | 'logistics' | 'quality'
  message: string
  createdAt: string
}

export type ProcurementMetricPoint = {
  id: string
  projectId: string
  label: string
  value: number
  createdAt: string
}

export type ProcurementInventoryStore = {
  requests: PurchaseRequest[]
  tenders: TenderRecord[]
  suppliers: SupplierRecord[]
  orders: PurchaseOrderRecord[]
  stockItems: StockItem[]
  stockMovements: StockMovement[]
  materials: IndustrialMaterial[]
  receptions: ReceptionRecord[]
  logistics: LogisticsRecord[]
  aiInsights: ProcurementAiInsight[]
  timeline: ProcurementTimelineEvent[]
  diagnostics: ProcurementDiagnostic[]
  metrics: ProcurementMetricPoint[]
}

const STORAGE_KEY = 'srg.procurement.inventory.workspace.v1'

function nowIso(): string {
  return new Date().toISOString()
}

function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function formatAmount(value: number): number {
  return Number((Number.isFinite(value) ? value : 0).toFixed(2))
}

function scoreBid(bid: TenderBid, marginCoefficient: number): number {
  const costScore = Math.max(0, 100 - bid.amount / 1000)
  const leadScore = Math.max(0, 100 - bid.leadTimeDays)
  const weighted = costScore * 0.28 + leadScore * 0.16 + bid.qualityScore * 0.2 + bid.complianceScore * 0.18 + bid.technicalScore * 0.18
  const penalty = bid.riskScore * 0.12
  const marginAdjustment = marginCoefficient > 0 ? marginCoefficient * 8 : 0
  return Number(Math.max(0, Math.min(100, weighted - penalty + marginAdjustment)).toFixed(2))
}

function sanitizeCategory(value: string): SupplierCategory {
  if (value === 'electrical' || value === 'mechanical' || value === 'automation' || value === 'logistics' || value === 'consumables' || value === 'services' || value === 'construction') {
    return value
  }
  return 'other'
}

function seedStore(): ProcurementInventoryStore {
  const project = ProjectExecutionWorkspaceService.getStore().projects[0]
  const projectId = project.id
  const projectName = project.name

  const request: PurchaseRequest = {
    id: id('prq'),
    requestCode: 'DA-2026-001',
    title: 'Appro moteur ABB et cables puissance',
    justification: 'Phase de mise en service electrique lot A.',
    priority: 'high',
    urgency: false,
    budget: 148000,
    costCenter: 'ELEC-CENTER-A',
    projectId,
    projectName,
    status: 'submitted',
    approvalWorkflow: [
      { level: 1, label: 'Chef de projet', status: 'approved', actor: 'Paul N.' },
      { level: 2, label: 'Direction operations', status: 'pending', actor: '' },
      { level: 3, label: 'Finance', status: 'pending', actor: '' },
    ],
    history: [
      { id: id('wf'), actor: 'Paul N.', action: 'created', comment: 'Creation initiale', createdAt: nowIso() },
      { id: id('wf'), actor: 'Paul N.', action: 'submitted', comment: 'Soumise pour validation', createdAt: nowIso() },
    ],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  const supplier1: SupplierRecord = {
    id: id('sup'),
    name: 'ABB Group',
    categories: ['electrical', 'automation'],
    contacts: ['sales@abb.example'],
    averageLeadTimeDays: 21,
    qualityScore: 86,
    nonConformities: 1,
    onTimeRate: 82,
    automaticRating: 84,
    performanceHistory: ['2026-Q1: 80', '2026-Q2: 84'],
    contracts: [{ id: id('ctr'), title: 'Master Supply 2026', startDate: '2026-01-01', endDate: '2026-12-31', documents: [] }],
    documents: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  const supplier2: SupplierRecord = {
    id: id('sup'),
    name: 'SNEF Industrial Supply',
    categories: ['electrical', 'logistics'],
    contacts: ['contact@snef.example'],
    averageLeadTimeDays: 16,
    qualityScore: 78,
    nonConformities: 2,
    onTimeRate: 88,
    automaticRating: 81,
    performanceHistory: ['2026-Q1: 79', '2026-Q2: 81'],
    contracts: [],
    documents: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  const bidA: TenderBid = {
    id: id('bid'),
    supplierId: supplier1.id,
    supplierName: supplier1.name,
    amount: 133200,
    leadTimeDays: 21,
    qualityScore: 88,
    complianceScore: 91,
    riskScore: 22,
    technicalScore: 90,
    notes: 'OEM package, full documentation included.',
  }

  const bidB: TenderBid = {
    id: id('bid'),
    supplierId: supplier2.id,
    supplierName: supplier2.name,
    amount: 128500,
    leadTimeDays: 17,
    qualityScore: 79,
    complianceScore: 83,
    riskScore: 31,
    technicalScore: 80,
    notes: 'Faster lead time, partial OEM substitution.',
  }

  const tender: TenderRecord = {
    id: id('tdr'),
    tenderCode: 'AO-2026-001',
    requestId: request.id,
    title: 'AO moteurs + cables lot A',
    category: 'electrical',
    status: 'analysis',
    bids: [bidA, bidB],
    autoAnalysis: 'ABB has stronger compliance/quality, SNEF has better lead time and lower cost.',
    selectedBidId: null,
    decisionComment: '',
    archiveReason: '',
    history: [
      { id: id('wf'), actor: 'Acheteur', action: 'created', comment: 'AO cree', createdAt: nowIso() },
      { id: id('wf'), actor: 'Acheteur', action: 'submitted', comment: 'En phase analyse', createdAt: nowIso() },
    ],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  const order: PurchaseOrderRecord = {
    id: id('ord'),
    orderCode: 'BC-2026-001',
    requestId: request.id,
    tenderId: tender.id,
    supplierId: supplier1.id,
    supplierName: supplier1.name,
    status: 'ordered',
    lines: [
      { label: 'ABB Motor MTR-12345', quantity: 2, unitPrice: 41200, total: 82400 },
      { label: 'Cable HTA 95mm2', quantity: 1200, unitPrice: 37.5, total: 45000 },
    ],
    total: 127400,
    partialDeliveries: [],
    receptions: [],
    returns: [],
    changes: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  const stockItem: StockItem = {
    id: id('stk'),
    materialRef: 'ABB-MTR-12345',
    label: 'Moteur ABB 250kW',
    category: 'motor',
    quantity: 3,
    minThreshold: 1,
    maxThreshold: 10,
    location: 'Warehouse A / Row 4',
    store: 'Magasin Principal',
    warehouse: 'Entrepot Yaounde',
    chantierDepot: 'Depot Razel Site A',
    traceabilityTag: 'TAG-MTR-12345',
    updatedAt: nowIso(),
  }

  const movement: StockMovement = {
    id: id('mov'),
    itemId: stockItem.id,
    type: 'entry',
    quantity: 3,
    fromLocation: 'Supplier dock',
    toLocation: stockItem.location,
    reason: 'Initial reception',
    orderId: order.id,
    createdAt: nowIso(),
  }

  const material: IndustrialMaterial = {
    id: id('mat'),
    category: 'motor',
    reference: 'ABB-MTR-12345',
    manufacturer: 'ABB',
    brand: 'ABB',
    serialNumber: 'SN-ABB-88001',
    purchaseDate: '2026-07-10',
    receptionDate: '2026-07-30',
    warrantyEndDate: '2028-07-30',
    documentation: ['datasheet.pdf', 'manual.pdf'],
    photos: ['photo-mtr-1.jpg'],
    qrCode: 'QR-ABB-88001',
    barCode: 'BC-ABB-88001',
    linkedDocuments: [],
    projectId,
    projectName,
    supplierName: supplier1.name,
    updatedAt: nowIso(),
  }

  const reception: ReceptionRecord = {
    id: id('rcp'),
    orderId: order.id,
    projectId,
    qualityControl: 'Dimension and insulation tests completed.',
    result: 'accepted',
    pvNumber: 'PV-RCP-2026-009',
    photos: ['pv-photo-1.jpg'],
    observations: 'No anomaly.',
    reserves: [],
    signature: 'Jean M.',
    documents: ['pv-reception.pdf'],
    createdAt: nowIso(),
  }

  const logistics: LogisticsRecord = {
    id: id('log'),
    orderId: order.id,
    shipmentCode: 'EXP-2026-0031',
    transporter: 'Total Logistics Partner',
    status: 'in-transit',
    origin: 'Port Douala',
    destination: 'Razel Site A',
    currentLocation: 'Yaounde ring road',
    incidents: [],
    deliveryDate: '2026-08-04',
    siteReceptionDate: '',
    history: [
      { id: id('wf'), actor: 'Logistics desk', action: 'created', comment: 'Shipment created', createdAt: nowIso() },
      { id: id('wf'), actor: 'Logistics desk', action: 'modified', comment: 'Status moved to in-transit', createdAt: nowIso() },
    ],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  return {
    requests: [request],
    tenders: [tender],
    suppliers: [supplier1, supplier2],
    orders: [order],
    stockItems: [stockItem],
    stockMovements: [movement],
    materials: [material],
    receptions: [reception],
    logistics: [logistics],
    aiInsights: [],
    timeline: [
      { id: id('evt'), projectId, eventType: 'request', title: 'Demande achat initiale', details: request.requestCode, createdAt: nowIso() },
      { id: id('evt'), projectId, eventType: 'order', title: 'Commande creee', details: order.orderCode, createdAt: nowIso() },
    ],
    diagnostics: [],
    metrics: [
      { id: id('met'), projectId, label: 'requests', value: 1, createdAt: nowIso() },
      { id: id('met'), projectId, label: 'orders', value: 1, createdAt: nowIso() },
    ],
  }
}

export class ProcurementInventoryWorkspaceService {
  private static memoryStore: ProcurementInventoryStore = seedStore()

  static getStore(): ProcurementInventoryStore {
    return this.readStorage()
  }

  static listPriorities(): ProcurementPriority[] {
    return ['low', 'medium', 'high', 'urgent']
  }

  static listRequestStatuses(): ProcurementApprovalStatus[] {
    return ['draft', 'submitted', 'approved', 'rejected', 'archived']
  }

  static listTenderStatuses(): TenderStatus[] {
    return ['draft', 'open', 'analysis', 'decision', 'awarded', 'archived']
  }

  static listOrderStatuses(): OrderStatus[] {
    return ['draft', 'validated', 'ordered', 'partially-delivered', 'received', 'returned', 'cancelled', 'modified']
  }

  static listSupplierCategories(): SupplierCategory[] {
    return ['electrical', 'mechanical', 'automation', 'logistics', 'consumables', 'services', 'construction', 'other']
  }

  static listStockMovementTypes(): StockMovementType[] {
    return ['entry', 'exit', 'reservation', 'inventory', 'transfer']
  }

  static listMaterialCategories(): IndustrialMaterialCategory[] {
    return ['motor', 'transformer', 'pump', 'drive', 'compressor', 'gearbox', 'plc', 'sensor', 'breaker', 'cable', 'accessory', 'tooling', 'consumable', 'spare-part']
  }

  static listLogisticsStatuses(): LogisticsStatus[] {
    return ['prepared', 'in-transit', 'incident', 'delivered', 'site-received']
  }

  static getSummary() {
    const store = this.getStore()
    const requestBudget = store.requests.reduce((sum, item) => sum + item.budget, 0)
    const orderValue = store.orders.reduce((sum, item) => sum + item.total, 0)
    const stockValue = store.stockItems.reduce((sum, item) => {
      const avg = store.orders
        .flatMap((order) => order.lines)
        .filter((line) => line.label.toLowerCase().includes(item.materialRef.toLowerCase().slice(0, 5)))
        .map((line) => line.unitPrice)
      const unit = avg.length > 0 ? avg.reduce((s, v) => s + v, 0) / avg.length : 0
      return sum + unit * item.quantity
    }, 0)

    const lowStock = store.stockItems.filter((item) => item.quantity <= item.minThreshold).length
    const incidents = store.logistics.reduce((sum, item) => sum + item.incidents.length, 0)
    const openNonConformities = store.suppliers.reduce((sum, item) => sum + item.nonConformities, 0)

    const topSuppliers = Array.from(
      store.orders.reduce((acc, item) => acc.set(item.supplierName, (acc.get(item.supplierName) ?? 0) + 1), new Map<string, number>()).entries(),
    )
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 8)

    const byCategory = Array.from(
      store.stockItems.reduce((acc, item) => acc.set(item.category, (acc.get(item.category) ?? 0) + 1), new Map<string, number>()).entries(),
    )
      .map(([category, count]) => ({ category, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 10)

    const byStore = Array.from(
      store.stockItems.reduce((acc, item) => acc.set(item.store, (acc.get(item.store) ?? 0) + 1), new Map<string, number>()).entries(),
    )
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 8)

    return {
      requests: store.requests.length,
      tenders: store.tenders.length,
      suppliers: store.suppliers.length,
      orders: store.orders.length,
      stockItems: store.stockItems.length,
      materials: store.materials.length,
      receptions: store.receptions.length,
      logistics: store.logistics.length,
      aiInsights: store.aiInsights.length,
      timeline: store.timeline.length,
      diagnostics: store.diagnostics.length,
      requestBudget: formatAmount(requestBudget),
      orderValue: formatAmount(orderValue),
      stockValue: formatAmount(stockValue),
      lowStock,
      incidents,
      openNonConformities,
      topSuppliers,
      byCategory,
      byStore,
    }
  }

  static createPurchaseRequest(input: {
    title: string
    justification: string
    priority: ProcurementPriority
    urgency: boolean
    budget: number
    costCenter: string
    projectId: string
    projectName: string
  }): PurchaseRequest {
    const store = this.getStore()
    const request: PurchaseRequest = {
      id: id('prq'),
      requestCode: `DA-${new Date().getFullYear()}-${String(store.requests.length + 1).padStart(4, '0')}`,
      title: input.title.trim() || 'Untitled request',
      justification: input.justification.trim(),
      priority: input.priority,
      urgency: input.urgency,
      budget: formatAmount(input.budget),
      costCenter: input.costCenter.trim(),
      projectId: input.projectId,
      projectName: input.projectName,
      status: 'draft',
      approvalWorkflow: [
        { level: 1, label: 'Project Manager', status: 'pending', actor: '' },
        { level: 2, label: 'Operations', status: 'pending', actor: '' },
        { level: 3, label: 'Finance', status: 'pending', actor: '' },
      ],
      history: [{ id: id('wf'), actor: 'Procurement Workspace', action: 'created', comment: 'Request created', createdAt: nowIso() }],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, requests: [request, ...store.requests] })
    this.appendTimeline(request.projectId, 'request', 'Demande achat creee', request.requestCode)
    this.logHistory('Procurement request', request.requestCode, 'creation')
    this.publish('Procurement', `Purchase request ${request.requestCode} created.`)
    return request
  }

  static submitPurchaseRequest(requestId: string, actor: string, comment: string): PurchaseRequest | undefined {
    return this.updateRequestStatus(requestId, 'submitted', actor, comment || 'Submitted for approval')
  }

  static approvePurchaseRequest(requestId: string, actor: string, comment: string): PurchaseRequest | undefined {
    return this.updateRequestStatus(requestId, 'approved', actor, comment || 'Approved')
  }

  static rejectPurchaseRequest(requestId: string, actor: string, comment: string): PurchaseRequest | undefined {
    return this.updateRequestStatus(requestId, 'rejected', actor, comment || 'Rejected')
  }

  private static updateRequestStatus(requestId: string, status: ProcurementApprovalStatus, actor: string, comment: string): PurchaseRequest | undefined {
    const store = this.getStore()
    const current = store.requests.find((item) => item.id === requestId)
    if (!current) return undefined

    const updatedWorkflow = current.approvalWorkflow.map<PurchaseRequest['approvalWorkflow'][number]>((step, index) => {
      if (status === 'submitted') {
        return index === 0 ? { ...step, status: 'pending' as const, actor: '' } : step
      }
      if (status === 'approved' && step.status === 'pending') {
        return { ...step, status: 'approved' as const, actor }
      }
      if (status === 'rejected' && step.status === 'pending') {
        return { ...step, status: 'rejected' as const, actor }
      }
      return step
    })

    const workflowAction: WorkflowStep['action'] =
      status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'submitted'

    const next: PurchaseRequest = {
      ...current,
      status,
      approvalWorkflow: updatedWorkflow,
      history: [
        { id: id('wf'), actor, action: workflowAction, comment, createdAt: nowIso() },
        ...current.history,
      ].slice(0, 120),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, requests: store.requests.map((item) => (item.id === requestId ? next : item)) })
    this.appendTimeline(next.projectId, 'request', `Demande ${status}`, `${next.requestCode} by ${actor}`)
    if (status === 'rejected') {
      this.pushDiagnostic(next.projectId, 'warning', 'budget', `Request ${next.requestCode} was rejected.`)
    }
    this.logHistory('Procurement request', `${next.requestCode} ${status}`, 'validation')
    return next
  }

  static createTender(input: { requestId: string; title: string; category: SupplierCategory }): TenderRecord | undefined {
    const store = this.getStore()
    const request = store.requests.find((item) => item.id === input.requestId)
    if (!request) return undefined

    const tender: TenderRecord = {
      id: id('tdr'),
      tenderCode: `AO-${new Date().getFullYear()}-${String(store.tenders.length + 1).padStart(4, '0')}`,
      requestId: input.requestId,
      title: input.title.trim() || request.title,
      category: input.category,
      status: 'draft',
      bids: [],
      autoAnalysis: '',
      selectedBidId: null,
      decisionComment: '',
      archiveReason: '',
      history: [{ id: id('wf'), actor: 'Procurement Workspace', action: 'created', comment: 'Tender created', createdAt: nowIso() }],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, tenders: [tender, ...store.tenders] })
    this.appendTimeline(request.projectId, 'tender', 'Appel offre cree', tender.tenderCode)
    this.logHistory('Procurement tender', tender.tenderCode, 'creation')
    return tender
  }

  static addTenderBid(tenderId: string, input: Omit<TenderBid, 'id'>): TenderRecord | undefined {
    const store = this.getStore()
    const tender = store.tenders.find((item) => item.id === tenderId)
    if (!tender) return undefined

    const bid: TenderBid = { ...input, id: id('bid') }
    const next: TenderRecord = {
      ...tender,
      bids: [bid, ...tender.bids],
      status: tender.status === 'draft' ? 'open' : tender.status,
      updatedAt: nowIso(),
      history: [{ id: id('wf'), actor: 'Procurement Workspace', action: 'modified' as const, comment: `Bid added: ${bid.supplierName}`, createdAt: nowIso() }, ...tender.history].slice(0, 120),
    }

    this.writeStorage({ ...store, tenders: store.tenders.map((item) => (item.id === tenderId ? next : item)) })
    const request = store.requests.find((item) => item.id === tender.requestId)
    this.appendTimeline(request?.projectId ?? 'n/a', 'tender', 'Offre fournisseur ajoutee', `${tender.tenderCode} / ${bid.supplierName}`)
    this.logHistory('Procurement tender', `${tender.tenderCode} bid`, 'modification')
    return next
  }

  static analyzeTender(tenderId: string): TenderRecord | undefined {
    const store = this.getStore()
    const tender = store.tenders.find((item) => item.id === tenderId)
    if (!tender) return undefined

    const marginCoeff = BusinessPolicyWorkspaceService.getStore().ruleProfiles[0]?.coefficients.margin ?? 0.15
    const ranked = tender.bids
      .map((bid) => ({ bid, score: scoreBid(bid, marginCoeff) }))
      .sort((left, right) => right.score - left.score)

    const analysis = ranked.length === 0
      ? 'No bids available for analysis.'
      : ranked.map((entry, index) => `${index + 1}. ${entry.bid.supplierName} score ${entry.score} amount ${entry.bid.amount}`).join(' | ')

    const next: TenderRecord = {
      ...tender,
      status: 'analysis',
      autoAnalysis: analysis,
      updatedAt: nowIso(),
      history: [{ id: id('wf'), actor: 'Procurement AI', action: 'commented' as const, comment: 'Automatic analysis completed', createdAt: nowIso() }, ...tender.history].slice(0, 120),
    }

    this.writeStorage({ ...store, tenders: store.tenders.map((item) => (item.id === tenderId ? next : item)) })
    const request = store.requests.find((item) => item.id === tender.requestId)
    this.appendTimeline(request?.projectId ?? 'n/a', 'tender', 'Analyse AO', `${tender.tenderCode} analysed`)
    return next
  }

  static decideTender(tenderId: string, bidId: string, decisionComment: string): TenderRecord | undefined {
    const store = this.getStore()
    const tender = store.tenders.find((item) => item.id === tenderId)
    if (!tender) return undefined

    const selected = tender.bids.find((item) => item.id === bidId)
    if (!selected) return undefined

    const next: TenderRecord = {
      ...tender,
      status: 'awarded',
      selectedBidId: bidId,
      decisionComment: decisionComment.trim(),
      updatedAt: nowIso(),
      history: [{ id: id('wf'), actor: 'Procurement Committee', action: 'approved' as const, comment: `Awarded to ${selected.supplierName}`, createdAt: nowIso() }, ...tender.history].slice(0, 120),
    }

    this.writeStorage({ ...store, tenders: store.tenders.map((item) => (item.id === tenderId ? next : item)) })
    const request = store.requests.find((item) => item.id === tender.requestId)
    this.appendTimeline(request?.projectId ?? 'n/a', 'tender', 'Decision AO', `${tender.tenderCode} -> ${selected.supplierName}`)
    this.logHistory('Procurement tender', `${tender.tenderCode} awarded`, 'validation')
    return next
  }

  static archiveTender(tenderId: string, reason: string): TenderRecord | undefined {
    const store = this.getStore()
    const tender = store.tenders.find((item) => item.id === tenderId)
    if (!tender) return undefined

    const next: TenderRecord = {
      ...tender,
      status: 'archived',
      archiveReason: reason.trim(),
      updatedAt: nowIso(),
      history: [{ id: id('wf'), actor: 'Procurement Workspace', action: 'archived' as const, comment: reason.trim() || 'Archived', createdAt: nowIso() }, ...tender.history].slice(0, 120),
    }

    this.writeStorage({ ...store, tenders: store.tenders.map((item) => (item.id === tenderId ? next : item)) })
    const request = store.requests.find((item) => item.id === tender.requestId)
    this.appendTimeline(request?.projectId ?? 'n/a', 'tender', 'AO archive', `${tender.tenderCode}`)
    this.logHistory('Procurement tender', `${tender.tenderCode} archived`, 'archiving')
    return next
  }

  static upsertSupplier(input: {
    id?: string
    name: string
    categories: SupplierCategory[]
    contacts: string[]
    averageLeadTimeDays: number
    qualityScore: number
    nonConformities: number
    onTimeRate: number
    contracts: SupplierContract[]
    documents: string[]
  }): SupplierRecord {
    const store = this.getStore()
    const existing = input.id ? store.suppliers.find((item) => item.id === input.id) : undefined
    const automaticRating = Number(((input.qualityScore * 0.4) + (input.onTimeRate * 0.4) + (Math.max(0, 100 - input.nonConformities * 12) * 0.2)).toFixed(2))

    const next: SupplierRecord = {
      id: existing?.id ?? id('sup'),
      name: input.name.trim() || 'Unknown supplier',
      categories: input.categories.map((value) => sanitizeCategory(value)),
      contacts: input.contacts.filter((item) => item.trim().length > 0),
      averageLeadTimeDays: Math.max(0, Math.round(input.averageLeadTimeDays)),
      qualityScore: Math.max(0, Math.min(100, input.qualityScore)),
      nonConformities: Math.max(0, Math.round(input.nonConformities)),
      onTimeRate: Math.max(0, Math.min(100, input.onTimeRate)),
      automaticRating,
      performanceHistory: existing ? [`${nowIso()}: ${automaticRating}`, ...existing.performanceHistory].slice(0, 20) : [`${nowIso()}: ${automaticRating}`],
      contracts: input.contracts,
      documents: input.documents,
      createdAt: existing?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    }

    const suppliers = existing
      ? store.suppliers.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.suppliers]

    this.writeStorage({ ...store, suppliers })
    this.appendTimeline('n/a', 'supplier', existing ? 'Fournisseur maj' : 'Fournisseur cree', next.name)
    this.logHistory('Procurement supplier', next.name, existing ? 'modification' : 'creation')
    return next
  }

  static createOrderFromTender(input: { requestId: string; tenderId?: string; supplierId: string; lines: Array<{ label: string; quantity: number; unitPrice: number }> }): PurchaseOrderRecord | undefined {
    const store = this.getStore()
    const request = store.requests.find((item) => item.id === input.requestId)
    const supplier = store.suppliers.find((item) => item.id === input.supplierId)
    if (!request || !supplier) return undefined

    const lines = input.lines
      .filter((line) => line.label.trim().length > 0 && line.quantity > 0)
      .map((line) => {
        const quantity = Number(line.quantity)
        const unitPrice = formatAmount(line.unitPrice)
        return {
          label: line.label.trim(),
          quantity,
          unitPrice,
          total: formatAmount(quantity * unitPrice),
        }
      })

    const total = formatAmount(lines.reduce((sum, line) => sum + line.total, 0))
    const order: PurchaseOrderRecord = {
      id: id('ord'),
      orderCode: `BC-${new Date().getFullYear()}-${String(store.orders.length + 1).padStart(4, '0')}`,
      requestId: request.id,
      tenderId: input.tenderId ?? null,
      supplierId: supplier.id,
      supplierName: supplier.name,
      status: 'validated',
      lines,
      total,
      partialDeliveries: [],
      receptions: [],
      returns: [],
      changes: [{ id: id('wf'), actor: 'Procurement Workspace', action: 'created', comment: 'Order created', createdAt: nowIso() }],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, orders: [order, ...store.orders] })
    this.appendTimeline(request.projectId, 'order', 'Bon commande cree', order.orderCode)
    this.logHistory('Procurement order', order.orderCode, 'creation')
    this.publish('Procurement', `Order ${order.orderCode} created.`)
    return order
  }

  static updateOrderStatus(orderId: string, status: OrderStatus, note: string): PurchaseOrderRecord | undefined {
    const store = this.getStore()
    const order = store.orders.find((item) => item.id === orderId)
    if (!order) return undefined

    const next: PurchaseOrderRecord = {
      ...order,
      status,
      updatedAt: nowIso(),
      changes: [{ id: id('wf'), actor: 'Procurement Workspace', action: 'modified' as const, comment: note || status, createdAt: nowIso() }, ...order.changes].slice(0, 200),
    }

    this.writeStorage({ ...store, orders: store.orders.map((item) => (item.id === orderId ? next : item)) })
    const request = store.requests.find((item) => item.id === order.requestId)
    this.appendTimeline(request?.projectId ?? 'n/a', 'order', 'Statut commande', `${order.orderCode} -> ${status}`)
    if (status === 'cancelled') {
      this.pushDiagnostic(request?.projectId ?? 'n/a', 'warning', 'logistics', `Order ${order.orderCode} cancelled.`)
    }
    this.logHistory('Procurement order', `${order.orderCode} ${status}`, 'modification')
    return next
  }

  static recordPartialDelivery(orderId: string, deliveredQuantity: number, note: string): PurchaseOrderRecord | undefined {
    const store = this.getStore()
    const order = store.orders.find((item) => item.id === orderId)
    if (!order) return undefined

    const entry = {
      id: id('part'),
      deliveredQuantity: Math.max(0, Number(deliveredQuantity)),
      date: nowIso(),
      note: note.trim(),
    }

    const next: PurchaseOrderRecord = {
      ...order,
      status: 'partially-delivered',
      partialDeliveries: [entry, ...order.partialDeliveries],
      updatedAt: nowIso(),
      changes: [{ id: id('wf'), actor: 'Receiving Desk', action: 'modified' as const, comment: `Partial delivery ${entry.deliveredQuantity}`, createdAt: nowIso() }, ...order.changes].slice(0, 200),
    }

    this.writeStorage({ ...store, orders: store.orders.map((item) => (item.id === orderId ? next : item)) })
    const request = store.requests.find((item) => item.id === order.requestId)
    this.appendTimeline(request?.projectId ?? 'n/a', 'order', 'Livraison partielle', `${order.orderCode}`)
    return next
  }

  static recordOrderReturn(orderId: string, quantity: number, reason: string): PurchaseOrderRecord | undefined {
    const store = this.getStore()
    const order = store.orders.find((item) => item.id === orderId)
    if (!order) return undefined

    const ret = { id: id('ret'), quantity: Math.max(0, Number(quantity)), reason: reason.trim(), createdAt: nowIso() }
    const next: PurchaseOrderRecord = {
      ...order,
      status: 'returned',
      returns: [ret, ...order.returns],
      updatedAt: nowIso(),
      changes: [{ id: id('wf'), actor: 'Receiving Desk', action: 'modified' as const, comment: `Return ${ret.quantity}`, createdAt: nowIso() }, ...order.changes].slice(0, 200),
    }

    this.writeStorage({ ...store, orders: store.orders.map((item) => (item.id === orderId ? next : item)) })
    const request = store.requests.find((item) => item.id === order.requestId)
    this.appendTimeline(request?.projectId ?? 'n/a', 'order', 'Retour commande', `${order.orderCode}`)
    this.pushDiagnostic(request?.projectId ?? 'n/a', 'warning', 'quality', `Return registered for ${order.orderCode}: ${ret.reason}`)
    return next
  }

  static upsertStockItem(input: {
    id?: string
    materialRef: string
    label: string
    category: IndustrialMaterialCategory
    quantity: number
    minThreshold: number
    maxThreshold: number
    location: string
    store: string
    warehouse: string
    chantierDepot: string
    traceabilityTag: string
  }): StockItem {
    const store = this.getStore()
    const existing = input.id ? store.stockItems.find((item) => item.id === input.id) : undefined

    const next: StockItem = {
      id: existing?.id ?? id('stk'),
      materialRef: input.materialRef.trim(),
      label: input.label.trim(),
      category: input.category,
      quantity: Math.max(0, Number(input.quantity)),
      minThreshold: Math.max(0, Number(input.minThreshold)),
      maxThreshold: Math.max(0, Number(input.maxThreshold)),
      location: input.location.trim(),
      store: input.store.trim(),
      warehouse: input.warehouse.trim(),
      chantierDepot: input.chantierDepot.trim(),
      traceabilityTag: input.traceabilityTag.trim(),
      updatedAt: nowIso(),
    }

    const stockItems = existing
      ? store.stockItems.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.stockItems]

    this.writeStorage({ ...store, stockItems })
    this.appendTimeline('n/a', 'stock', existing ? 'Stock maj' : 'Stock cree', `${next.materialRef} qte ${next.quantity}`)
    if (next.quantity <= next.minThreshold) {
      this.pushDiagnostic('n/a', 'warning', 'stock', `Low stock for ${next.materialRef}.`)
    }
    return next
  }

  static recordStockMovement(input: {
    itemId: string
    type: StockMovementType
    quantity: number
    fromLocation: string
    toLocation: string
    reason: string
    orderId?: string
  }): StockMovement | undefined {
    const store = this.getStore()
    const item = store.stockItems.find((entry) => entry.id === input.itemId)
    if (!item) return undefined

    const quantity = Math.max(0, Number(input.quantity))
    const movement: StockMovement = {
      id: id('mov'),
      itemId: item.id,
      type: input.type,
      quantity,
      fromLocation: input.fromLocation.trim(),
      toLocation: input.toLocation.trim(),
      reason: input.reason.trim(),
      orderId: input.orderId ?? '',
      createdAt: nowIso(),
    }

    const nextQty = input.type === 'entry'
      ? item.quantity + quantity
      : input.type === 'exit' || input.type === 'reservation'
        ? Math.max(0, item.quantity - quantity)
        : item.quantity

    const nextItem = {
      ...item,
      quantity: nextQty,
      location: input.type === 'transfer' ? movement.toLocation || item.location : item.location,
      updatedAt: nowIso(),
    }

    this.writeStorage({
      ...store,
      stockItems: store.stockItems.map((entry) => (entry.id === item.id ? nextItem : entry)),
      stockMovements: [movement, ...store.stockMovements].slice(0, 1200),
    })

    this.appendTimeline('n/a', 'stock', 'Mouvement stock', `${item.materialRef} ${input.type} ${quantity}`)
    if (nextQty <= nextItem.minThreshold) {
      this.pushDiagnostic('n/a', 'warning', 'stock', `Threshold reached for ${item.materialRef}.`)
    }
    return movement
  }

  static upsertIndustrialMaterial(input: {
    id?: string
    category: IndustrialMaterialCategory
    reference: string
    manufacturer: string
    brand: string
    serialNumber: string
    purchaseDate: string
    receptionDate: string
    warrantyEndDate: string
    documentation: string[]
    photos: string[]
    qrCode: string
    barCode: string
    projectId: string
    projectName: string
    supplierName: string
    linkToKnowledge: boolean
  }): IndustrialMaterial {
    const store = this.getStore()
    const existing = input.id ? store.materials.find((item) => item.id === input.id) : undefined

    const linkedDocuments = input.linkToKnowledge
      ? this.findKnowledgeDocuments(`${input.reference} ${input.serialNumber} ${input.projectName} ${input.supplierName}`).slice(0, 24)
      : (existing?.linkedDocuments ?? [])

    const next: IndustrialMaterial = {
      id: existing?.id ?? id('mat'),
      category: input.category,
      reference: input.reference.trim(),
      manufacturer: input.manufacturer.trim(),
      brand: input.brand.trim(),
      serialNumber: input.serialNumber.trim(),
      purchaseDate: input.purchaseDate,
      receptionDate: input.receptionDate,
      warrantyEndDate: input.warrantyEndDate,
      documentation: input.documentation,
      photos: input.photos,
      qrCode: input.qrCode.trim() || `QR-${input.reference}`,
      barCode: input.barCode.trim() || `BC-${input.reference}`,
      linkedDocuments,
      projectId: input.projectId,
      projectName: input.projectName,
      supplierName: input.supplierName,
      updatedAt: nowIso(),
    }

    const materials = existing
      ? store.materials.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.materials]

    this.writeStorage({ ...store, materials })
    this.appendTimeline(next.projectId, 'stock', existing ? 'Materiel maj' : 'Materiel cree', `${next.reference} / ${next.serialNumber}`)
    return next
  }

  static recordReception(input: {
    orderId: string
    projectId: string
    qualityControl: string
    result: ReceptionResult
    pvNumber: string
    photos: string[]
    observations: string
    reserves: string[]
    signature: string
    documents: string[]
  }): ReceptionRecord {
    const store = this.getStore()
    const reception: ReceptionRecord = {
      id: id('rcp'),
      orderId: input.orderId,
      projectId: input.projectId,
      qualityControl: input.qualityControl.trim(),
      result: input.result,
      pvNumber: input.pvNumber.trim(),
      photos: input.photos,
      observations: input.observations.trim(),
      reserves: input.reserves,
      signature: input.signature.trim(),
      documents: input.documents,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, receptions: [reception, ...store.receptions] })
    this.appendTimeline(input.projectId, 'reception', 'Reception enregistree', `${input.orderId} / ${input.result}`)
    if (input.result !== 'accepted') {
      this.pushDiagnostic(input.projectId, 'warning', 'quality', `Reception issue on order ${input.orderId}.`)
    }

    const order = store.orders.find((item) => item.id === input.orderId)
    if (order) {
      this.updateOrderStatus(order.id, input.result === 'rejected' ? 'returned' : 'received', `Reception ${input.result}`)
    }

    this.logHistory('Procurement reception', input.pvNumber, 'validation')
    return reception
  }

  static createLogisticsRecord(input: {
    orderId: string
    shipmentCode: string
    transporter: string
    origin: string
    destination: string
    projectId: string
  }): LogisticsRecord {
    const store = this.getStore()
    const logistics: LogisticsRecord = {
      id: id('log'),
      orderId: input.orderId,
      shipmentCode: input.shipmentCode.trim() || `EXP-${Date.now()}`,
      transporter: input.transporter.trim(),
      status: 'prepared',
      origin: input.origin.trim(),
      destination: input.destination.trim(),
      currentLocation: input.origin.trim(),
      incidents: [],
      deliveryDate: '',
      siteReceptionDate: '',
      history: [{ id: id('wf'), actor: 'Logistics Workspace', action: 'created', comment: 'Shipment prepared', createdAt: nowIso() }],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, logistics: [logistics, ...store.logistics] })
    this.appendTimeline(input.projectId, 'logistics', 'Expedition creee', logistics.shipmentCode)
    this.logHistory('Procurement logistics', logistics.shipmentCode, 'creation')
    return logistics
  }

  static updateLogisticsStatus(input: {
    logisticsId: string
    status: LogisticsStatus
    currentLocation: string
    incident?: string
    deliveryDate?: string
    siteReceptionDate?: string
    actor: string
  }): LogisticsRecord | undefined {
    const store = this.getStore()
    const current = store.logistics.find((item) => item.id === input.logisticsId)
    if (!current) return undefined

    const incidents = input.incident ? [input.incident.trim(), ...current.incidents] : current.incidents
    const next: LogisticsRecord = {
      ...current,
      status: input.status,
      currentLocation: input.currentLocation.trim(),
      incidents,
      deliveryDate: input.deliveryDate ?? current.deliveryDate,
      siteReceptionDate: input.siteReceptionDate ?? current.siteReceptionDate,
      updatedAt: nowIso(),
      history: [{ id: id('wf'), actor: input.actor, action: 'modified' as const, comment: `Status ${input.status}`, createdAt: nowIso() }, ...current.history].slice(0, 200),
    }

    this.writeStorage({ ...store, logistics: store.logistics.map((item) => (item.id === current.id ? next : item)) })

    const order = store.orders.find((item) => item.id === current.orderId)
    const request = order ? store.requests.find((item) => item.id === order.requestId) : undefined
    this.appendTimeline(request?.projectId ?? 'n/a', 'logistics', 'Logistique update', `${current.shipmentCode} -> ${input.status}`)

    if (input.status === 'incident' && input.incident) {
      this.pushDiagnostic(request?.projectId ?? 'n/a', 'warning', 'logistics', `${current.shipmentCode}: ${input.incident}`)
    }

    if (input.status === 'site-received') {
      this.publish('Procurement', `Shipment ${current.shipmentCode} received on site.`)
    }

    return next
  }

  static askProcurementAi(projectId: string, question: string): ProcurementAiInsight {
    const store = this.getStore()
    const normalized = question.toLowerCase()

    const requests = store.requests.filter((item) => item.projectId === projectId)
    const orders = store.orders.filter((item) => requests.some((request) => request.id === item.requestId))
    const logistics = store.logistics.filter((item) => orders.some((order) => order.id === item.orderId))
    const receptions = store.receptions.filter((item) => item.projectId === projectId)

    let answer = 'No data available for this project yet.'
    let confidence = 0.36
    const references: string[] = []

    if (normalized.includes('retard') || normalized.includes('delay')) {
      const delayedSuppliers = orders
        .map((order) => ({
          supplier: order.supplierName,
          status: order.status,
          logistics: logistics.filter((ship) => ship.orderId === order.id),
        }))
        .filter((row) => row.status !== 'received' && row.status !== 'cancelled')

      answer = delayedSuppliers.length === 0
        ? 'No delay signal detected from current orders.'
        : `Potential delay from ${delayedSuppliers.map((row) => row.supplier).join(', ')} with ${delayedSuppliers.length} open order(s).`
      confidence = 0.84
      references.push('orders', 'logistics')
    } else if (normalized.includes('stock')) {
      const lowStock = store.stockItems.filter((item) => item.quantity <= item.minThreshold)
      answer = lowStock.length === 0
        ? 'No low-stock item detected.'
        : `Low stock detected for ${lowStock.map((item) => `${item.materialRef} (${item.quantity})`).join(', ')}.`
      confidence = 0.9
      references.push('stockItems')
    } else if (normalized.includes('fournisseur') || normalized.includes('supplier')) {
      const best = [...store.suppliers].sort((left, right) => right.automaticRating - left.automaticRating).at(0)
      answer = best ? `Best supplier rating is ${best.name} (${best.automaticRating}/100).` : 'No supplier available.'
      confidence = 0.82
      references.push('suppliers')
    } else if (normalized.includes('qualite') || normalized.includes('quality')) {
      const rejected = receptions.filter((item) => item.result === 'rejected').length
      answer = rejected === 0
        ? 'No rejected reception in current project scope.'
        : `${rejected} reception(s) rejected. Check PV and reserves for corrective actions.`
      confidence = 0.86
      references.push('receptions')
    } else if (normalized.includes('budget')) {
      const reqBudget = requests.reduce((sum, item) => sum + item.budget, 0)
      const ordTotal = orders.reduce((sum, item) => sum + item.total, 0)
      answer = `Request budget is ${formatAmount(reqBudget)} and committed order value is ${formatAmount(ordTotal)}.`
      confidence = 0.88
      references.push('requests', 'orders')
    } else if (normalized.includes('prompt 030') || normalized.includes('knowledge')) {
      const links = this.findKnowledgeDocuments(question).length
      answer = `Knowledge integration found ${links} related document(s) from Prompt 030 index.`
      confidence = 0.76
      references.push('knowledge')
    } else if (normalized.includes('prompt 031') || normalized.includes('policy')) {
      const coeff = BusinessPolicyWorkspaceService.getStore().ruleProfiles[0].coefficients
      answer = `Business policy coefficients loaded: margin ${coeff.margin}, transport ${coeff.transport}, insurance ${coeff.insurance}.`
      confidence = 0.8
      references.push('business-policy')
    } else if (normalized.includes('prompt 032') || normalized.includes('project execution')) {
      const project = ProjectExecutionWorkspaceService.getStore().projects.find((item) => item.id === projectId)
      answer = `Project execution link active for ${project?.name ?? 'unknown project'} with procurement synced by projectId.`
      confidence = 0.77
      references.push('project-execution')
    } else {
      answer = `Project has ${requests.length} request(s), ${orders.length} order(s), ${logistics.length} shipment(s), and ${receptions.length} reception(s).`
      confidence = 0.72
      references.push('requests', 'orders', 'logistics', 'receptions')
    }

    const insight: ProcurementAiInsight = {
      id: id('pai'),
      question,
      projectId,
      answer,
      confidence,
      references,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, aiInsights: [insight, ...store.aiInsights].slice(0, 320) })
    this.appendTimeline(projectId, 'ai', 'AI procurement insight', question.slice(0, 120))
    this.logHistory('Procurement AI', question, 'validation')
    return insight
  }

  static getIntegrationContext(projectId: string) {
    const knowledgeStore = KnowledgeWorkspaceService.getStore()
    const policySummary = BusinessPolicyWorkspaceService.getSummary()
    const projectStore = ProjectExecutionWorkspaceService.getStore()
    const project = projectStore.projects.find((item) => item.id === projectId)

    return {
      project,
      projectSummary: ProjectExecutionWorkspaceService.getSummary(),
      policySummary,
      knowledgeDocuments: this.findKnowledgeDocuments(`${project?.name ?? ''} ${project?.client ?? ''}`).slice(0, 20),
      knownSuppliers: knowledgeStore.documents
        .filter((item) => item.classification.fournisseur)
        .map((item) => item.classification.fournisseur)
        .filter((value, index, arr) => arr.indexOf(value) === index)
        .slice(0, 20),
    }
  }

  static exportStore(): void {
    WorkspaceExchangeService.downloadJson('srg-procurement-inventory.json', this.getStore())
  }

  static exportOrdersCsv(): void {
    const rows = [
      ['orderCode', 'supplier', 'status', 'total', 'lines', 'createdAt'],
      ...this.getStore().orders.map((item) => [item.orderCode, item.supplierName, item.status, item.total.toString(), item.lines.length.toString(), item.createdAt]),
    ]
    WorkspaceExchangeService.downloadCsv('srg-procurement-orders.csv', rows)
  }

  static exportStockCsv(): void {
    const rows = [
      ['materialRef', 'label', 'category', 'quantity', 'min', 'max', 'location', 'store', 'warehouse', 'chantierDepot'],
      ...this.getStore().stockItems.map((item) => [
        item.materialRef,
        item.label,
        item.category,
        item.quantity.toString(),
        item.minThreshold.toString(),
        item.maxThreshold.toString(),
        item.location,
        item.store,
        item.warehouse,
        item.chantierDepot,
      ]),
    ]
    WorkspaceExchangeService.downloadCsv('srg-procurement-stock.csv', rows)
  }

  private static findKnowledgeDocuments(query: string): string[] {
    const normalized = query.toLowerCase().trim()
    if (!normalized) return []
    return KnowledgeWorkspaceService.getStore().documents
      .filter((item) => `${item.title} ${item.description} ${item.content} ${item.source}`.toLowerCase().includes(normalized))
      .map((item) => item.id)
  }

  private static appendTimeline(projectId: string, eventType: ProcurementTimelineEvent['eventType'], title: string, details: string): void {
    const store = this.getStore()
    const event: ProcurementTimelineEvent = {
      id: id('evt'),
      projectId,
      eventType,
      title,
      details,
      createdAt: nowIso(),
    }

    const metric: ProcurementMetricPoint = {
      id: id('met'),
      projectId,
      label: eventType,
      value: store.timeline.filter((item) => item.projectId === projectId && item.eventType === eventType).length + 1,
      createdAt: nowIso(),
    }

    this.writeStorage({
      ...store,
      timeline: [event, ...store.timeline].slice(0, 2000),
      metrics: [metric, ...store.metrics].slice(0, 3200),
    })
  }

  private static pushDiagnostic(projectId: string, level: ProcurementDiagnostic['level'], category: ProcurementDiagnostic['category'], message: string): void {
    const store = this.getStore()
    const diagnostic: ProcurementDiagnostic = {
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
    const prefs = GenerateWorkspaceService.getPreferences()
    const provider = prefs.providerChoice === 'auto' ? 'workspace-auto' : prefs.providerChoice
    const conversation = ConversationWorkspaceService.getActiveConversation()

    HistoryWorkspaceService.addRecord({
      id: id('hist-prc'),
      promptName,
      promptText: payload,
      output: payload,
      provider,
      model: prefs.model,
      status: 'completed',
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      actorName: 'Procurement Inventory Workspace',
      projectName: conversation?.title,
      eventType,
    })
  }

  private static readStorage(): ProcurementInventoryStore {
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

      const parsed = JSON.parse(raw) as Partial<ProcurementInventoryStore>
      const seed = seedStore()
      return {
        ...seed,
        ...parsed,
        requests: Array.isArray(parsed.requests) ? parsed.requests : seed.requests,
        tenders: Array.isArray(parsed.tenders) ? parsed.tenders : seed.tenders,
        suppliers: Array.isArray(parsed.suppliers) ? parsed.suppliers : seed.suppliers,
        orders: Array.isArray(parsed.orders) ? parsed.orders : seed.orders,
        stockItems: Array.isArray(parsed.stockItems) ? parsed.stockItems : seed.stockItems,
        stockMovements: Array.isArray(parsed.stockMovements) ? parsed.stockMovements : seed.stockMovements,
        materials: Array.isArray(parsed.materials) ? parsed.materials : seed.materials,
        receptions: Array.isArray(parsed.receptions) ? parsed.receptions : seed.receptions,
        logistics: Array.isArray(parsed.logistics) ? parsed.logistics : seed.logistics,
        aiInsights: Array.isArray(parsed.aiInsights) ? parsed.aiInsights : seed.aiInsights,
        timeline: Array.isArray(parsed.timeline) ? parsed.timeline : seed.timeline,
        diagnostics: Array.isArray(parsed.diagnostics) ? parsed.diagnostics : seed.diagnostics,
        metrics: Array.isArray(parsed.metrics) ? parsed.metrics : seed.metrics,
      }
    } catch {
      return seedStore()
    }
  }

  private static writeStorage(store: ProcurementInventoryStore): void {
    this.memoryStore = store
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }
}
