import { BusinessPolicyWorkspaceService } from '#/app/services/BusinessPolicyWorkspaceService'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'
import { MaintenanceWorkspaceService } from '#/app/services/MaintenanceWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { ProcurementInventoryWorkspaceService } from '#/app/services/ProcurementInventoryWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
export type AccountNature = 'debit' | 'credit'
export type JournalType = 'general' | 'sales' | 'purchase' | 'cash' | 'bank' | 'payroll'
export type EntryStatus = 'draft' | 'posted' | 'cancelled'
export type InvoiceStatus = 'draft' | 'issued' | 'partially-paid' | 'paid' | 'overdue' | 'cancelled'
export type SupplierInvoiceStatus = 'draft' | 'approved' | 'partially-paid' | 'paid' | 'overdue' | 'cancelled'
export type TreasuryChannel = 'bank' | 'cash' | 'mobile-money' | 'card'
export type BudgetStatus = 'draft' | 'validated' | 'closed'
export type PeriodStatus = 'open' | 'closed'

export type ChartOfAccount = {
  id: string
  code: string
  label: string
  type: AccountType
  nature: AccountNature
  costCenterCode: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type AccountingJournal = {
  id: string
  code: string
  label: string
  type: JournalType
  active: boolean
  createdAt: string
  updatedAt: string
}

export type AccountingEntryLine = {
  accountCode: string
  description: string
  debit: number
  credit: number
  costCenterCode: string
  projectId: string
}

export type AccountingEntry = {
  id: string
  entryNumber: string
  journalCode: string
  periodId: string
  date: string
  description: string
  status: EntryStatus
  lines: AccountingEntryLine[]
  attachmentIds: string[]
  debitTotal: number
  creditTotal: number
  createdAt: string
  updatedAt: string
}

export type FiscalYear = {
  id: string
  label: string
  startDate: string
  endDate: string
  status: 'open' | 'closed'
}

export type FiscalPeriod = {
  id: string
  yearId: string
  label: string
  startDate: string
  endDate: string
  status: PeriodStatus
  closedAt: string
  reopenedAt: string
}

export type ClosureRecord = {
  id: string
  periodId: string
  type: 'closure' | 'reopen'
  reason: string
  actor: string
  createdAt: string
}

export type AccountingAttachment = {
  id: string
  title: string
  documentType: 'invoice' | 'receipt' | 'bank-statement' | 'voucher' | 'zip-history' | 'other'
  knowledgeDocumentId: string
  linkedEntryId: string
  createdAt: string
}

export type Customer = {
  id: string
  code: string
  name: string
  projectId: string
  contact: string
  paymentTermsDays: number
  createdAt: string
  updatedAt: string
}

export type CustomerInvoice = {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  projectId: string
  amountExclTax: number
  taxAmount: number
  totalAmount: number
  dueDate: string
  issueDate: string
  status: InvoiceStatus
  balanceDue: number
  history: string[]
  createdAt: string
  updatedAt: string
}

export type CustomerCreditNote = {
  id: string
  creditNumber: string
  customerId: string
  amount: number
  reason: string
  createdAt: string
}

export type CustomerReceipt = {
  id: string
  invoiceId: string
  customerId: string
  amount: number
  channel: TreasuryChannel
  date: string
  reference: string
}

export type CustomerReminder = {
  id: string
  invoiceId: string
  customerId: string
  level: 1 | 2 | 3
  message: string
  createdAt: string
}

export type SupplierInvoice = {
  id: string
  invoiceNumber: string
  supplierName: string
  projectId: string
  procurementOrderCode: string
  amountExclTax: number
  taxAmount: number
  retentionAmount: number
  totalAmount: number
  dueDate: string
  issueDate: string
  status: SupplierInvoiceStatus
  balanceDue: number
  createdAt: string
  updatedAt: string
}

export type SupplierPayment = {
  id: string
  supplierInvoiceId: string
  amount: number
  channel: TreasuryChannel
  date: string
  reference: string
}

export type TreasuryAccount = {
  id: string
  code: string
  label: string
  channel: TreasuryChannel
  currency: string
  openingBalance: number
  currentBalance: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type TreasuryTransfer = {
  id: string
  fromAccountId: string
  toAccountId: string
  amount: number
  date: string
  reference: string
}

export type TreasuryFlow = {
  id: string
  accountId: string
  direction: 'in' | 'out'
  amount: number
  category: string
  date: string
  source: string
}

export type TreasuryForecast = {
  id: string
  periodLabel: string
  expectedIn: number
  expectedOut: number
  net: number
  createdAt: string
}

export type ReconciliationRecord = {
  id: string
  accountId: string
  statementBalance: number
  bookBalance: number
  difference: number
  date: string
  note: string
}

export type BudgetVersion = {
  id: string
  code: string
  label: string
  revision: number
  status: BudgetStatus
  createdAt: string
}

export type BudgetLine = {
  costCenterCode: string
  projectId: string
  planned: number
  forecast: number
  actual: number
}

export type BudgetRecord = {
  id: string
  versionId: string
  label: string
  lines: BudgetLine[]
  createdAt: string
  updatedAt: string
}

export type CostCenterSnapshot = {
  id: string
  code: string
  label: string
  dimension: 'direction' | 'service' | 'workshop' | 'site' | 'project' | 'client' | 'equipment'
  planned: number
  actual: number
  variance: number
  updatedAt: string
}

export type FinancialStatement = {
  id: string
  generatedAt: string
  profitAndLoss: {
    revenue: number
    expense: number
    margin: number
    ebitda: number
  }
  balanceSheet: {
    assets: number
    liabilities: number
    equity: number
  }
  cashFlow: {
    operating: number
    investing: number
    financing: number
    net: number
  }
  ratios: {
    profitability: number
    liquidity: number
    debtRatio: number
    roi: number
  }
}

export type FinanceAiInsight = {
  id: string
  projectId: string
  question: string
  answer: string
  confidence: number
  references: string[]
  createdAt: string
}

export type FinanceTimelineEvent = {
  id: string
  projectId: string
  type: 'accounting' | 'customer' | 'supplier' | 'treasury' | 'budget' | 'analysis' | 'ai' | 'audit'
  title: string
  details: string
  createdAt: string
}

export type FinanceDiagnostic = {
  id: string
  projectId: string
  level: 'info' | 'warning' | 'error'
  category: 'anomaly' | 'duplicate' | 'delay' | 'cash' | 'budget' | 'tax'
  message: string
  createdAt: string
}

export type FinanceMetricPoint = {
  id: string
  projectId: string
  label: string
  value: number
  createdAt: string
}

export type FinanceAuditLog = {
  id: string
  action: string
  entity: string
  reference: string
  actor: string
  createdAt: string
}

export type FinanceWorkspaceStore = {
  chartOfAccounts: ChartOfAccount[]
  journals: AccountingJournal[]
  entries: AccountingEntry[]
  fiscalYears: FiscalYear[]
  fiscalPeriods: FiscalPeriod[]
  closures: ClosureRecord[]
  attachments: AccountingAttachment[]
  customers: Customer[]
  customerInvoices: CustomerInvoice[]
  customerCreditNotes: CustomerCreditNote[]
  customerReceipts: CustomerReceipt[]
  customerReminders: CustomerReminder[]
  supplierInvoices: SupplierInvoice[]
  supplierPayments: SupplierPayment[]
  treasuryAccounts: TreasuryAccount[]
  treasuryTransfers: TreasuryTransfer[]
  treasuryFlows: TreasuryFlow[]
  treasuryForecasts: TreasuryForecast[]
  reconciliations: ReconciliationRecord[]
  budgetVersions: BudgetVersion[]
  budgets: BudgetRecord[]
  costCenters: CostCenterSnapshot[]
  statements: FinancialStatement[]
  aiInsights: FinanceAiInsight[]
  timeline: FinanceTimelineEvent[]
  diagnostics: FinanceDiagnostic[]
  metrics: FinanceMetricPoint[]
  auditLogs: FinanceAuditLog[]
}

const STORAGE_KEY = 'srg.finance.workspace.v1'

function nowIso(): string {
  return new Date().toISOString()
}

function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function amount(value: number): number {
  return Number((Number.isFinite(value) ? value : 0).toFixed(2))
}

function seedStore(): FinanceWorkspaceStore {
  const project = ProjectExecutionWorkspaceService.getStore().projects[0]
  const policyCoefficients = BusinessPolicyWorkspaceService.getStore().ruleProfiles[0].coefficients

  const chartOfAccounts: ChartOfAccount[] = [
    {
      id: id('acc'),
      code: '411000',
      label: 'Clients',
      type: 'asset',
      nature: 'debit',
      costCenterCode: 'CLI-GEN',
      active: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: id('acc'),
      code: '401000',
      label: 'Fournisseurs',
      type: 'liability',
      nature: 'credit',
      costCenterCode: 'SUP-GEN',
      active: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: id('acc'),
      code: '706000',
      label: 'Prestations',
      type: 'revenue',
      nature: 'credit',
      costCenterCode: 'REV-SRV',
      active: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: id('acc'),
      code: '607000',
      label: 'Achats',
      type: 'expense',
      nature: 'debit',
      costCenterCode: 'EXP-PUR',
      active: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]

  const journals: AccountingJournal[] = [
    { id: id('jr'), code: 'GEN', label: 'Journal general', type: 'general', active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { id: id('jr'), code: 'VEN', label: 'Journal ventes', type: 'sales', active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { id: id('jr'), code: 'ACH', label: 'Journal achats', type: 'purchase', active: true, createdAt: nowIso(), updatedAt: nowIso() },
    { id: id('jr'), code: 'BNQ', label: 'Journal banque', type: 'bank', active: true, createdAt: nowIso(), updatedAt: nowIso() },
  ]

  const fiscalYear: FiscalYear = {
    id: id('fy'),
    label: 'FY-2026',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'open',
  }

  const fiscalPeriods: FiscalPeriod[] = [
    {
      id: id('fp'),
      yearId: fiscalYear.id,
      label: '2026-08',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      status: 'open',
      closedAt: '',
      reopenedAt: '',
    },
  ]

  const customer: Customer = {
    id: id('cus'),
    code: 'CLI-RAZEL',
    name: project.client,
    projectId: project.id,
    contact: 'finance@razel.example',
    paymentTermsDays: 30,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  const taxRate = policyCoefficients.vat * 100
  const retentionRate = policyCoefficients.retention * 100
  const customerInvoice: CustomerInvoice = {
    id: id('cinv'),
    invoiceNumber: 'FAC-2026-0001',
    customerId: customer.id,
    customerName: customer.name,
    projectId: project.id,
    amountExclTax: 180000,
    taxAmount: amount(180000 * taxRate / 100),
    totalAmount: amount(180000 + (180000 * taxRate / 100)),
    dueDate: '2026-09-15',
    issueDate: '2026-08-15',
    status: 'issued',
    balanceDue: amount(180000 + (180000 * taxRate / 100)),
    history: ['Invoice issued'],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  const supplierInvoice: SupplierInvoice = {
    id: id('sinv'),
    invoiceNumber: 'FF-2026-0091',
    supplierName: 'ABB Group',
    projectId: project.id,
    procurementOrderCode: 'BC-2026-001',
    amountExclTax: 94000,
    taxAmount: amount(94000 * taxRate / 100),
    retentionAmount: amount(94000 * retentionRate / 100),
    totalAmount: amount(94000 + (94000 * taxRate / 100)),
    dueDate: '2026-09-10',
    issueDate: '2026-08-10',
    status: 'approved',
    balanceDue: amount((94000 + (94000 * taxRate / 100)) - (94000 * retentionRate / 100)),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  const treasuryAccounts: TreasuryAccount[] = [
    {
      id: id('tr'),
      code: 'BNQ-XAF-01',
      label: 'Banque principale XAF',
      channel: 'bank',
      currency: 'XAF',
      openingBalance: 120000000,
      currentBalance: 120000000,
      active: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: id('tr'),
      code: 'CSH-XAF-01',
      label: 'Caisse chantier',
      channel: 'cash',
      currency: 'XAF',
      openingBalance: 800000,
      currentBalance: 800000,
      active: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]

  const budgetVersion: BudgetVersion = {
    id: id('bv'),
    code: 'BUD-2026-V1',
    label: 'Version initiale 2026',
    revision: 1,
    status: 'validated',
    createdAt: nowIso(),
  }

  const budgets: BudgetRecord[] = [
    {
      id: id('bud'),
      versionId: budgetVersion.id,
      label: 'Budget projet Razel',
      lines: [
        { costCenterCode: 'SITE-RAZEL', projectId: project.id, planned: 420000, forecast: 455000, actual: 438000 },
        { costCenterCode: 'MAINT-PLANT', projectId: project.id, planned: 95000, forecast: 112000, actual: 104000 },
      ],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]

  const costCenters: CostCenterSnapshot[] = [
    {
      id: id('cc'),
      code: 'SITE-RAZEL',
      label: 'Chantier Razel',
      dimension: 'site',
      planned: 420000,
      actual: 438000,
      variance: 18000,
      updatedAt: nowIso(),
    },
    {
      id: id('cc'),
      code: 'EQP-MTR',
      label: 'Equipements moteurs',
      dimension: 'equipment',
      planned: 175000,
      actual: 169800,
      variance: -5200,
      updatedAt: nowIso(),
    },
  ]

  const entries: AccountingEntry[] = [
    {
      id: id('ent'),
      entryNumber: 'ECR-2026-0001',
      journalCode: 'VEN',
      periodId: fiscalPeriods[0].id,
      date: '2026-08-15',
      description: 'Facture client FAC-2026-0001',
      status: 'posted',
      lines: [
        { accountCode: '411000', description: 'Client', debit: customerInvoice.totalAmount, credit: 0, costCenterCode: 'SITE-RAZEL', projectId: project.id },
        { accountCode: '706000', description: 'Prestation', debit: 0, credit: customerInvoice.amountExclTax, costCenterCode: 'SITE-RAZEL', projectId: project.id },
      ],
      attachmentIds: [],
      debitTotal: customerInvoice.totalAmount,
      creditTotal: customerInvoice.amountExclTax,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]

  const timeline: FinanceTimelineEvent[] = [
    {
      id: id('evt'),
      projectId: project.id,
      type: 'accounting',
      title: 'Finance workspace initialized',
      details: 'Base chart, journals and budget snapshots loaded.',
      createdAt: nowIso(),
    },
  ]

  const metrics: FinanceMetricPoint[] = [
    { id: id('met'), projectId: project.id, label: 'invoices', value: 1, createdAt: nowIso() },
    { id: id('met'), projectId: project.id, label: 'supplier-invoices', value: 1, createdAt: nowIso() },
    { id: id('met'), projectId: project.id, label: 'budgets', value: 1, createdAt: nowIso() },
  ]

  const store: FinanceWorkspaceStore = {
    chartOfAccounts,
    journals,
    entries,
    fiscalYears: [fiscalYear],
    fiscalPeriods,
    closures: [],
    attachments: [],
    customers: [customer],
    customerInvoices: [customerInvoice],
    customerCreditNotes: [],
    customerReceipts: [],
    customerReminders: [],
    supplierInvoices: [supplierInvoice],
    supplierPayments: [],
    treasuryAccounts,
    treasuryTransfers: [],
    treasuryFlows: [],
    treasuryForecasts: [],
    reconciliations: [],
    budgetVersions: [budgetVersion],
    budgets,
    costCenters,
    statements: [],
    aiInsights: [],
    timeline,
    diagnostics: [],
    metrics,
    auditLogs: [],
  }

  const statement = buildFinancialStatement(store)
  store.statements = [statement]
  return store
}

function buildFinancialStatement(store: FinanceWorkspaceStore): FinancialStatement {
  const revenue = store.customerInvoices.reduce((sum, item) => sum + item.amountExclTax, 0)
  const procurementCost = ProcurementInventoryWorkspaceService.getSummary().orderValue
  const maintenanceCost = MaintenanceWorkspaceService.getSummary().totalMaintenanceCost
  const supplierCost = store.supplierInvoices.reduce((sum, item) => sum + item.amountExclTax, 0)
  const expense = amount(procurementCost + maintenanceCost + supplierCost)
  const margin = amount(revenue - expense)
  const ebitda = amount(margin * 0.92)

  const customerReceivables = store.customerInvoices.reduce((sum, item) => sum + item.balanceDue, 0)
  const treasury = store.treasuryAccounts.reduce((sum, item) => sum + item.currentBalance, 0)
  const assets = amount(customerReceivables + treasury)

  const supplierPayables = store.supplierInvoices.reduce((sum, item) => sum + item.balanceDue, 0)
  const liabilities = amount(supplierPayables)
  const equity = amount(assets - liabilities)

  const flowsIn = store.treasuryFlows.filter((item) => item.direction === 'in').reduce((sum, item) => sum + item.amount, 0)
  const flowsOut = store.treasuryFlows.filter((item) => item.direction === 'out').reduce((sum, item) => sum + item.amount, 0)
  const operating = amount(flowsIn - flowsOut)
  const investing = amount(-maintenanceCost)
  const financing = amount(-supplierPayables * 0.15)
  const net = amount(operating + investing + financing)

  const profitability = revenue === 0 ? 0 : Number(((margin / revenue) * 100).toFixed(2))
  const liquidity = liabilities === 0 ? 0 : Number((assets / liabilities).toFixed(2))
  const debtRatio = assets === 0 ? 0 : Number(((liabilities / assets) * 100).toFixed(2))
  const projectBudget = ProjectExecutionWorkspaceService.getSummary().totalBudget
  const roi = projectBudget === 0 ? 0 : Number(((margin / projectBudget) * 100).toFixed(2))

  return {
    id: id('stt'),
    generatedAt: nowIso(),
    profitAndLoss: { revenue: amount(revenue), expense, margin, ebitda },
    balanceSheet: { assets, liabilities, equity },
    cashFlow: { operating, investing, financing, net },
    ratios: { profitability, liquidity, debtRatio, roi },
  }
}

export class FinanceWorkspaceService {
  private static memoryStore: FinanceWorkspaceStore = seedStore()

  static getStore(): FinanceWorkspaceStore {
    return this.readStorage()
  }

  static getSummary() {
    const store = this.getStore()
    const latestStatement = store.statements[0] ?? buildFinancialStatement(store)

    const customerOverdue = store.customerInvoices.filter((item) => item.status === 'overdue').length
    const supplierOverdue = store.supplierInvoices.filter((item) => item.status === 'overdue').length
    const treasuryBalance = store.treasuryAccounts.reduce((sum, item) => sum + item.currentBalance, 0)
    const budgetPlanned = store.budgets.flatMap((item) => item.lines).reduce((sum, line) => sum + line.planned, 0)
    const budgetActual = store.budgets.flatMap((item) => item.lines).reduce((sum, line) => sum + line.actual, 0)
    const budgetVariance = amount(budgetActual - budgetPlanned)

    return {
      accounts: store.chartOfAccounts.length,
      journals: store.journals.length,
      entries: store.entries.length,
      customers: store.customers.length,
      customerInvoices: store.customerInvoices.length,
      customerOverdue,
      suppliers: Array.from(new Set(store.supplierInvoices.map((item) => item.supplierName))).length,
      supplierInvoices: store.supplierInvoices.length,
      supplierOverdue,
      treasuryAccounts: store.treasuryAccounts.length,
      treasuryBalance: amount(treasuryBalance),
      budgets: store.budgets.length,
      costCenters: store.costCenters.length,
      auditLogs: store.auditLogs.length,
      timeline: store.timeline.length,
      diagnostics: store.diagnostics.length,
      revenue: latestStatement.profitAndLoss.revenue,
      expense: latestStatement.profitAndLoss.expense,
      margin: latestStatement.profitAndLoss.margin,
      ebitda: latestStatement.profitAndLoss.ebitda,
      cashFlow: latestStatement.cashFlow.net,
      liquidityRatio: latestStatement.ratios.liquidity,
      roi: latestStatement.ratios.roi,
      budgetPlanned: amount(budgetPlanned),
      budgetActual: amount(budgetActual),
      budgetVariance,
    }
  }

  static listEntryStatuses(): EntryStatus[] {
    return ['draft', 'posted', 'cancelled']
  }

  static listInvoiceStatuses(): InvoiceStatus[] {
    return ['draft', 'issued', 'partially-paid', 'paid', 'overdue', 'cancelled']
  }

  static listTreasuryChannels(): TreasuryChannel[] {
    return ['bank', 'cash', 'mobile-money', 'card']
  }

  static upsertAccount(input: Omit<ChartOfAccount, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ChartOfAccount {
    const store = this.getStore()
    const current = input.id ? store.chartOfAccounts.find((item) => item.id === input.id) : undefined
    const next: ChartOfAccount = {
      id: current?.id ?? id('acc'),
      code: input.code.trim(),
      label: input.label.trim(),
      type: input.type,
      nature: input.nature,
      costCenterCode: input.costCenterCode.trim(),
      active: input.active,
      createdAt: current?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    }

    const chartOfAccounts = current
      ? store.chartOfAccounts.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.chartOfAccounts]

    this.writeStorage({ ...store, chartOfAccounts })
    this.appendAudit('upsert', 'account', next.code, 'Finance Workspace')
    this.appendTimeline('n/a', 'accounting', current ? 'Account updated' : 'Account created', next.code)
    return next
  }

  static postAccountingEntry(input: {
    journalCode: string
    periodId: string
    date: string
    description: string
    lines: AccountingEntryLine[]
    attachmentIds?: string[]
  }): AccountingEntry {
    const store = this.getStore()
    const debitTotal = amount(input.lines.reduce((sum, line) => sum + line.debit, 0))
    const creditTotal = amount(input.lines.reduce((sum, line) => sum + line.credit, 0))

    const entry: AccountingEntry = {
      id: id('ent'),
      entryNumber: `ECR-${new Date().getFullYear()}-${String(store.entries.length + 1).padStart(4, '0')}`,
      journalCode: input.journalCode,
      periodId: input.periodId,
      date: input.date,
      description: input.description.trim(),
      status: debitTotal === creditTotal ? 'posted' : 'draft',
      lines: input.lines,
      attachmentIds: input.attachmentIds ?? [],
      debitTotal,
      creditTotal,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    const diagnostics = [...store.diagnostics]
    if (debitTotal !== creditTotal) {
      diagnostics.unshift({
        id: id('diag'),
        projectId: 'n/a',
        level: 'warning',
        category: 'anomaly',
        message: `Unbalanced entry ${entry.entryNumber}: debit ${debitTotal} vs credit ${creditTotal}`,
        createdAt: nowIso(),
      })
    }

    this.writeStorage({ ...store, entries: [entry, ...store.entries], diagnostics })
    this.appendTimeline('n/a', 'accounting', 'Entry posted', `${entry.entryNumber} ${entry.status}`)
    this.appendMetric('n/a', 'entries', store.entries.length + 1)
    this.appendAudit('create', 'entry', entry.entryNumber, 'Finance Workspace')
    this.logHistory('Finance accounting', `${entry.entryNumber} posted`, 'validation')
    return entry
  }

  static closePeriod(periodId: string, reason: string, actor: string): FiscalPeriod | undefined {
    const store = this.getStore()
    const period = store.fiscalPeriods.find((item) => item.id === periodId)
    if (!period) return undefined

    const updated: FiscalPeriod = { ...period, status: 'closed', closedAt: nowIso() }
    const closures: ClosureRecord[] = [
      { id: id('cls'), periodId, type: 'closure', reason: reason.trim(), actor, createdAt: nowIso() },
      ...store.closures,
    ]

    this.writeStorage({
      ...store,
      fiscalPeriods: store.fiscalPeriods.map((item) => (item.id === periodId ? updated : item)),
      closures,
    })

    this.appendTimeline('n/a', 'audit', 'Period closed', `${updated.label} by ${actor}`)
    this.appendAudit('close', 'period', updated.label, actor)
    this.publish('Finance', `Period ${updated.label} closed.`)
    return updated
  }

  static reopenPeriod(periodId: string, reason: string, actor: string): FiscalPeriod | undefined {
    const store = this.getStore()
    const period = store.fiscalPeriods.find((item) => item.id === periodId)
    if (!period) return undefined

    const updated: FiscalPeriod = { ...period, status: 'open', reopenedAt: nowIso() }
    const closures: ClosureRecord[] = [
      { id: id('cls'), periodId, type: 'reopen', reason: reason.trim(), actor, createdAt: nowIso() },
      ...store.closures,
    ]

    this.writeStorage({
      ...store,
      fiscalPeriods: store.fiscalPeriods.map((item) => (item.id === periodId ? updated : item)),
      closures,
    })

    this.appendTimeline('n/a', 'audit', 'Period reopened', `${updated.label} by ${actor}`)
    this.appendAudit('reopen', 'period', updated.label, actor)
    this.publish('Finance', `Period ${updated.label} reopened.`)
    return updated
  }

  static upsertCustomer(input: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Customer {
    const store = this.getStore()
    const current = input.id ? store.customers.find((item) => item.id === input.id) : undefined
    const next: Customer = {
      id: current?.id ?? id('cus'),
      code: input.code.trim(),
      name: input.name.trim(),
      projectId: input.projectId,
      contact: input.contact.trim(),
      paymentTermsDays: Math.max(0, Math.round(input.paymentTermsDays)),
      createdAt: current?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    }

    const customers = current
      ? store.customers.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.customers]

    this.writeStorage({ ...store, customers })
    this.appendTimeline(next.projectId, 'customer', current ? 'Customer updated' : 'Customer created', `${next.code} ${next.name}`)
    this.appendAudit('upsert', 'customer', next.code, 'Finance Workspace')
    return next
  }

  static createCustomerInvoice(input: {
    customerId: string
    projectId: string
    amountExclTax: number
    dueDate: string
    issueDate: string
    description: string
  }): CustomerInvoice | undefined {
    const store = this.getStore()
    const customer = store.customers.find((item) => item.id === input.customerId)
    if (!customer) return undefined

    const vatCoefficient = BusinessPolicyWorkspaceService.getStore().ruleProfiles[0]?.coefficients.vat ?? 0.18
    const taxAmount = amount(input.amountExclTax * vatCoefficient)
    const totalAmount = amount(input.amountExclTax + taxAmount)

    const invoice: CustomerInvoice = {
      id: id('cinv'),
      invoiceNumber: `FAC-${new Date().getFullYear()}-${String(store.customerInvoices.length + 1).padStart(4, '0')}`,
      customerId: customer.id,
      customerName: customer.name,
      projectId: input.projectId,
      amountExclTax: amount(input.amountExclTax),
      taxAmount,
      totalAmount,
      dueDate: input.dueDate,
      issueDate: input.issueDate,
      status: 'issued',
      balanceDue: totalAmount,
      history: [input.description.trim() || 'Invoice issued'],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, customerInvoices: [invoice, ...store.customerInvoices] })
    this.appendTimeline(invoice.projectId, 'customer', 'Customer invoice issued', invoice.invoiceNumber)
    this.appendMetric(invoice.projectId, 'customer-invoices', store.customerInvoices.length + 1)
    this.appendAudit('create', 'customer-invoice', invoice.invoiceNumber, 'Finance Workspace')
    this.recomputeStatements()
    return invoice
  }

  static registerCustomerReceipt(input: {
    invoiceId: string
    amount: number
    channel: TreasuryChannel
    accountId: string
    date: string
    reference: string
  }): CustomerInvoice | undefined {
    const store = this.getStore()
    const invoice = store.customerInvoices.find((item) => item.id === input.invoiceId)
    if (!invoice) return undefined

    const receiptAmount = amount(input.amount)
    const nextBalance = amount(Math.max(0, invoice.balanceDue - receiptAmount))
    const status: InvoiceStatus = nextBalance === 0 ? 'paid' : 'partially-paid'

    const receipt: CustomerReceipt = {
      id: id('rcp'),
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      amount: receiptAmount,
      channel: input.channel,
      date: input.date,
      reference: input.reference.trim(),
    }

    const updatedInvoice: CustomerInvoice = {
      ...invoice,
      balanceDue: nextBalance,
      status,
      updatedAt: nowIso(),
      history: [`Receipt ${receipt.reference} amount ${receiptAmount}`, ...invoice.history].slice(0, 80),
    }

    const treasuryAccount = store.treasuryAccounts.find((item) => item.id === input.accountId)
    const treasuryAccounts = treasuryAccount
      ? store.treasuryAccounts.map((item) => (
        item.id === treasuryAccount.id
          ? { ...item, currentBalance: amount(item.currentBalance + receiptAmount), updatedAt: nowIso() }
          : item
      ))
      : store.treasuryAccounts

    const treasuryFlows: TreasuryFlow[] = [
      {
        id: id('flw'),
        accountId: input.accountId,
        direction: 'in',
        amount: receiptAmount,
        category: 'customer-receipt',
        date: input.date,
        source: updatedInvoice.invoiceNumber,
      },
      ...store.treasuryFlows,
    ]

    this.writeStorage({
      ...store,
      customerInvoices: store.customerInvoices.map((item) => (item.id === invoice.id ? updatedInvoice : item)),
      customerReceipts: [receipt, ...store.customerReceipts],
      treasuryAccounts,
      treasuryFlows,
    })

    this.appendTimeline(updatedInvoice.projectId, 'customer', 'Customer payment registered', `${updatedInvoice.invoiceNumber} ${receiptAmount}`)
    this.appendAudit('payment', 'customer-invoice', updatedInvoice.invoiceNumber, 'Finance Workspace')
    this.recomputeStatements()
    return updatedInvoice
  }

  static createReminder(invoiceId: string, level: 1 | 2 | 3, message: string): CustomerReminder | undefined {
    const store = this.getStore()
    const invoice = store.customerInvoices.find((item) => item.id === invoiceId)
    if (!invoice) return undefined

    const reminder: CustomerReminder = {
      id: id('rem'),
      invoiceId,
      customerId: invoice.customerId,
      level,
      message: message.trim(),
      createdAt: nowIso(),
    }

    const updatedInvoice: CustomerInvoice = {
      ...invoice,
      status: invoice.balanceDue > 0 ? 'overdue' : invoice.status,
      updatedAt: nowIso(),
      history: [`Reminder level ${level}`, ...invoice.history].slice(0, 80),
    }

    const diagnostics: FinanceDiagnostic[] = [
      {
        id: id('diag'),
        projectId: invoice.projectId,
        level: 'warning',
        category: 'delay',
        message: `Overdue reminder L${level} for ${invoice.invoiceNumber}`,
        createdAt: nowIso(),
      },
      ...store.diagnostics,
    ]

    this.writeStorage({
      ...store,
      customerReminders: [reminder, ...store.customerReminders],
      customerInvoices: store.customerInvoices.map((item) => (item.id === invoice.id ? updatedInvoice : item)),
      diagnostics,
    })

    this.appendTimeline(invoice.projectId, 'customer', 'Reminder emitted', `${invoice.invoiceNumber} L${level}`)
    return reminder
  }

  static createSupplierInvoice(input: {
    supplierName: string
    projectId: string
    procurementOrderCode: string
    amountExclTax: number
    dueDate: string
    issueDate: string
  }): SupplierInvoice {
    const store = this.getStore()
    const coeff = BusinessPolicyWorkspaceService.getStore().ruleProfiles[0].coefficients
    const vat = coeff.vat
    const retention = coeff.retention

    const taxAmount = amount(input.amountExclTax * vat)
    const retentionAmount = amount(input.amountExclTax * retention)
    const totalAmount = amount(input.amountExclTax + taxAmount)

    const invoice: SupplierInvoice = {
      id: id('sinv'),
      invoiceNumber: `FF-${new Date().getFullYear()}-${String(store.supplierInvoices.length + 1).padStart(4, '0')}`,
      supplierName: input.supplierName.trim(),
      projectId: input.projectId,
      procurementOrderCode: input.procurementOrderCode.trim(),
      amountExclTax: amount(input.amountExclTax),
      taxAmount,
      retentionAmount,
      totalAmount,
      dueDate: input.dueDate,
      issueDate: input.issueDate,
      status: 'approved',
      balanceDue: amount(totalAmount - retentionAmount),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, supplierInvoices: [invoice, ...store.supplierInvoices] })
    this.appendTimeline(invoice.projectId, 'supplier', 'Supplier invoice registered', invoice.invoiceNumber)
    this.appendAudit('create', 'supplier-invoice', invoice.invoiceNumber, 'Finance Workspace')
    this.recomputeStatements()
    return invoice
  }

  static registerSupplierPayment(input: {
    supplierInvoiceId: string
    amount: number
    channel: TreasuryChannel
    accountId: string
    date: string
    reference: string
  }): SupplierInvoice | undefined {
    const store = this.getStore()
    const invoice = store.supplierInvoices.find((item) => item.id === input.supplierInvoiceId)
    if (!invoice) return undefined

    const paymentAmount = amount(input.amount)
    const nextBalance = amount(Math.max(0, invoice.balanceDue - paymentAmount))
    const nextStatus: SupplierInvoiceStatus = nextBalance === 0 ? 'paid' : 'partially-paid'

    const payment: SupplierPayment = {
      id: id('spay'),
      supplierInvoiceId: invoice.id,
      amount: paymentAmount,
      channel: input.channel,
      date: input.date,
      reference: input.reference.trim(),
    }

    const updatedInvoice: SupplierInvoice = {
      ...invoice,
      balanceDue: nextBalance,
      status: nextStatus,
      updatedAt: nowIso(),
    }

    const treasuryAccount = store.treasuryAccounts.find((item) => item.id === input.accountId)
    const treasuryAccounts = treasuryAccount
      ? store.treasuryAccounts.map((item) => (
        item.id === treasuryAccount.id
          ? { ...item, currentBalance: amount(item.currentBalance - paymentAmount), updatedAt: nowIso() }
          : item
      ))
      : store.treasuryAccounts

    const treasuryFlows: TreasuryFlow[] = [
      {
        id: id('flw'),
        accountId: input.accountId,
        direction: 'out',
        amount: paymentAmount,
        category: 'supplier-payment',
        date: input.date,
        source: updatedInvoice.invoiceNumber,
      },
      ...store.treasuryFlows,
    ]

    this.writeStorage({
      ...store,
      supplierInvoices: store.supplierInvoices.map((item) => (item.id === invoice.id ? updatedInvoice : item)),
      supplierPayments: [payment, ...store.supplierPayments],
      treasuryAccounts,
      treasuryFlows,
    })

    this.appendTimeline(updatedInvoice.projectId, 'supplier', 'Supplier payment registered', `${updatedInvoice.invoiceNumber} ${paymentAmount}`)
    this.appendAudit('payment', 'supplier-invoice', updatedInvoice.invoiceNumber, 'Finance Workspace')
    this.recomputeStatements()
    return updatedInvoice
  }

  static upsertTreasuryAccount(input: Omit<TreasuryAccount, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): TreasuryAccount {
    const store = this.getStore()
    const current = input.id ? store.treasuryAccounts.find((item) => item.id === input.id) : undefined

    const next: TreasuryAccount = {
      id: current?.id ?? id('tr'),
      code: input.code.trim(),
      label: input.label.trim(),
      channel: input.channel,
      currency: input.currency.trim(),
      openingBalance: amount(input.openingBalance),
      currentBalance: amount(input.currentBalance),
      active: input.active,
      createdAt: current?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    }

    const treasuryAccounts = current
      ? store.treasuryAccounts.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.treasuryAccounts]

    this.writeStorage({ ...store, treasuryAccounts })
    this.appendTimeline('n/a', 'treasury', current ? 'Treasury account updated' : 'Treasury account created', next.code)
    this.appendAudit('upsert', 'treasury-account', next.code, 'Finance Workspace')
    return next
  }

  static transferFunds(input: { fromAccountId: string; toAccountId: string; amount: number; date: string; reference: string }): TreasuryTransfer | undefined {
    const store = this.getStore()
    const from = store.treasuryAccounts.find((item) => item.id === input.fromAccountId)
    const to = store.treasuryAccounts.find((item) => item.id === input.toAccountId)
    if (!from || !to || from.id === to.id) return undefined

    const transferAmount = amount(input.amount)
    if (transferAmount <= 0) return undefined

    const transfer: TreasuryTransfer = {
      id: id('trf'),
      fromAccountId: from.id,
      toAccountId: to.id,
      amount: transferAmount,
      date: input.date,
      reference: input.reference.trim(),
    }

    const treasuryAccounts = store.treasuryAccounts.map((item) => {
      if (item.id === from.id) {
        return { ...item, currentBalance: amount(item.currentBalance - transferAmount), updatedAt: nowIso() }
      }
      if (item.id === to.id) {
        return { ...item, currentBalance: amount(item.currentBalance + transferAmount), updatedAt: nowIso() }
      }
      return item
    })

    const flows: TreasuryFlow[] = [
      { id: id('flw'), accountId: from.id, direction: 'out', amount: transferAmount, category: 'transfer-out', date: input.date, source: transfer.reference },
      { id: id('flw'), accountId: to.id, direction: 'in', amount: transferAmount, category: 'transfer-in', date: input.date, source: transfer.reference },
      ...store.treasuryFlows,
    ]

    this.writeStorage({ ...store, treasuryAccounts, treasuryTransfers: [transfer, ...store.treasuryTransfers], treasuryFlows: flows })
    this.appendTimeline('n/a', 'treasury', 'Transfer executed', `${from.code} -> ${to.code} (${transferAmount})`)
    this.appendAudit('transfer', 'treasury', transfer.reference, 'Finance Workspace')
    this.recomputeStatements()
    return transfer
  }

  static reconcileAccount(input: {
    accountId: string
    statementBalance: number
    date: string
    note: string
  }): ReconciliationRecord | undefined {
    const store = this.getStore()
    const account = store.treasuryAccounts.find((item) => item.id === input.accountId)
    if (!account) return undefined

    const statementBalance = amount(input.statementBalance)
    const difference = amount(statementBalance - account.currentBalance)
    const record: ReconciliationRecord = {
      id: id('rec'),
      accountId: account.id,
      statementBalance,
      bookBalance: account.currentBalance,
      difference,
      date: input.date,
      note: input.note.trim(),
    }

    const diagnostics: FinanceDiagnostic[] = difference === 0
      ? store.diagnostics
      : [
          {
            id: id('diag'),
            projectId: 'n/a',
            level: 'warning',
            category: 'cash',
            message: `Reconciliation gap on ${account.code}: ${difference}`,
            createdAt: nowIso(),
          },
          ...store.diagnostics,
        ]

    this.writeStorage({
      ...store,
      reconciliations: [record, ...store.reconciliations],
      diagnostics,
    })

    this.appendTimeline('n/a', 'treasury', 'Account reconciled', `${account.code} diff ${difference}`)
    this.appendAudit('reconcile', 'treasury-account', account.code, 'Finance Workspace')
    return record
  }

  static upsertBudgetVersion(input: Omit<BudgetVersion, 'id' | 'createdAt'> & { id?: string }): BudgetVersion {
    const store = this.getStore()
    const current = input.id ? store.budgetVersions.find((item) => item.id === input.id) : undefined
    const next: BudgetVersion = {
      id: current?.id ?? id('bv'),
      code: input.code.trim(),
      label: input.label.trim(),
      revision: Math.max(1, Math.round(input.revision)),
      status: input.status,
      createdAt: current?.createdAt ?? nowIso(),
    }

    const budgetVersions = current
      ? store.budgetVersions.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.budgetVersions]

    this.writeStorage({ ...store, budgetVersions })
    this.appendTimeline('n/a', 'budget', current ? 'Budget version updated' : 'Budget version created', next.code)
    this.appendAudit('upsert', 'budget-version', next.code, 'Finance Workspace')
    return next
  }

  static upsertBudgetRecord(input: Omit<BudgetRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): BudgetRecord {
    const store = this.getStore()
    const current = input.id ? store.budgets.find((item) => item.id === input.id) : undefined
    const lines = input.lines.map((line) => ({
      costCenterCode: line.costCenterCode,
      projectId: line.projectId,
      planned: amount(line.planned),
      forecast: amount(line.forecast),
      actual: amount(line.actual),
    }))

    const next: BudgetRecord = {
      id: current?.id ?? id('bud'),
      versionId: input.versionId,
      label: input.label.trim(),
      lines,
      createdAt: current?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    }

    const budgets = current
      ? store.budgets.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.budgets]

    this.writeStorage({ ...store, budgets })
    this.appendTimeline('n/a', 'budget', current ? 'Budget updated' : 'Budget created', next.label)
    this.appendAudit('upsert', 'budget', next.label, 'Finance Workspace')
    this.recomputeStatements()
    return next
  }

  static upsertCostCenterSnapshot(input: Omit<CostCenterSnapshot, 'id' | 'updatedAt' | 'variance'> & { id?: string }): CostCenterSnapshot {
    const store = this.getStore()
    const current = input.id ? store.costCenters.find((item) => item.id === input.id) : undefined
    const planned = amount(input.planned)
    const actual = amount(input.actual)
    const variance = amount(actual - planned)

    const next: CostCenterSnapshot = {
      id: current?.id ?? id('cc'),
      code: input.code.trim(),
      label: input.label.trim(),
      dimension: input.dimension,
      planned,
      actual,
      variance,
      updatedAt: nowIso(),
    }

    const costCenters = current
      ? store.costCenters.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.costCenters]

    this.writeStorage({ ...store, costCenters })
    this.appendTimeline('n/a', 'budget', current ? 'Cost center snapshot updated' : 'Cost center snapshot created', next.code)
    if (variance > 0) {
      this.pushDiagnostic('n/a', 'warning', 'budget', `Cost center ${next.code} exceeds planned by ${variance}.`)
    }
    this.appendAudit('upsert', 'cost-center', next.code, 'Finance Workspace')
    return next
  }

  static ingestFinancialDocuments(query: string): AccountingAttachment[] {
    const store = this.getStore()
    const normalized = query.toLowerCase().trim()
    const docs = KnowledgeWorkspaceService.getStore().documents.filter((doc) => {
      const text = `${doc.title} ${doc.content} ${doc.documentType} ${doc.source}`.toLowerCase()
      return text.includes(normalized)
        || text.includes('invoice')
        || text.includes('facture')
        || text.includes('receipt')
        || text.includes('recu')
        || text.includes('bank')
        || text.includes('releve')
        || text.includes('ocr')
        || text.includes('zip')
    }).slice(0, 30)

    const attachments: AccountingAttachment[] = docs.map((doc) => ({
      id: id('att'),
      title: doc.title,
      documentType: doc.documentType === 'pdf' ? 'invoice' : doc.documentType === 'csv' ? 'bank-statement' : 'other',
      knowledgeDocumentId: doc.id,
      linkedEntryId: '',
      createdAt: nowIso(),
    }))

    this.writeStorage({ ...store, attachments: [...attachments, ...store.attachments].slice(0, 600) })
    this.appendTimeline('n/a', 'audit', 'Financial documents ingested', `${attachments.length} documents linked`)
    this.appendAudit('ingest', 'knowledge-doc', query, 'Finance Workspace')
    return attachments
  }

  static askFinanceAi(projectId: string, question: string): FinanceAiInsight {
    const store = this.getStore()
    const normalized = question.toLowerCase()

    const projectSummary = ProjectExecutionWorkspaceService.getSummary()
    const procurementSummary = ProcurementInventoryWorkspaceService.getSummary()
    const maintenanceSummary = MaintenanceWorkspaceService.getSummary()
    const latestStatement = store.statements[0] ?? buildFinancialStatement(store)

    let answer = 'No enough accounting signals yet.'
    let confidence = 0.42
    const references: string[] = ['finance-store']

    if (normalized.includes('depasse') || normalized.includes('budget')) {
      const maxVariance = [...store.costCenters].sort((a, b) => b.variance - a.variance)[0]
      answer = `Le depassement principal vient du centre ${maxVariance.code} (${maxVariance.label}) avec un ecart de ${maxVariance.variance.toFixed(2)}.`
      confidence = 0.86
      references.push('cost-centers', 'budgets')
    } else if (normalized.includes('fournisseur') || normalized.includes('cher')) {
      const bySupplier = Array.from(
        store.supplierInvoices.reduce((acc, item) => acc.set(item.supplierName, (acc.get(item.supplierName) ?? 0) + item.totalAmount), new Map<string, number>()).entries(),
      )
        .map(([supplier, total]) => ({ supplier, total }))
        .sort((a, b) => b.total - a.total)
      const top = bySupplier[0]
      answer = `Le fournisseur le plus couteux est ${top.supplier} avec ${top.total.toFixed(2)}.`
      confidence = 0.87
      references.push('supplier-invoices')
    } else if (normalized.includes('marge')) {
      answer = `La marge actuelle est ${latestStatement.profitAndLoss.margin.toFixed(2)} avec un EBITDA de ${latestStatement.profitAndLoss.ebitda.toFixed(2)}.`
      confidence = 0.89
      references.push('statements')
    } else if (normalized.includes('doublon') || normalized.includes('duplicate')) {
      const duplicates = findDuplicateInvoiceNumbers(store)
      answer = duplicates.length === 0
        ? 'Aucun doublon de numero facture detecte.'
        : `Doublons detectes: ${duplicates.join(', ')}.`
      confidence = 0.82
      references.push('duplicate-check')
      if (duplicates.length > 0) {
        this.pushDiagnostic(projectId, 'warning', 'duplicate', `Duplicate invoice numbers: ${duplicates.join(', ')}`)
      }
    } else if (normalized.includes('tresorerie') || normalized.includes('cash')) {
      answer = `Tresorerie nette ${this.getSummary().treasuryBalance.toFixed(2)}; cash flow net ${latestStatement.cashFlow.net.toFixed(2)}; liquidite ${latestStatement.ratios.liquidity}.`
      confidence = 0.85
      references.push('treasury')
    } else if (normalized.includes('risque') || normalized.includes('retard')) {
      const overdue = store.customerInvoices.filter((item) => item.status === 'overdue').length + store.supplierInvoices.filter((item) => item.status === 'overdue').length
      answer = `Retards identifies: ${overdue}. Impact potentiel: procurement ${procurementSummary.lowStock} seuils critiques, maintenance ${maintenanceSummary.failures} pannes, avancement projet ${projectSummary.progress.toFixed(1)}%.`
      confidence = 0.8
      references.push('customer', 'supplier', 'procurement', 'maintenance', 'projects')
    } else {
      answer = `Resultat: CA ${latestStatement.profitAndLoss.revenue.toFixed(2)}, charges ${latestStatement.profitAndLoss.expense.toFixed(2)}, marge ${latestStatement.profitAndLoss.margin.toFixed(2)}, ROI ${latestStatement.ratios.roi.toFixed(2)}%.`
      confidence = 0.75
      references.push('summary')
    }

    const insight: FinanceAiInsight = {
      id: id('ai'),
      projectId,
      question,
      answer,
      confidence,
      references,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, aiInsights: [insight, ...store.aiInsights].slice(0, 360) })
    this.appendTimeline(projectId, 'ai', 'Finance AI insight', question)
    return insight
  }

  static exportStore(): void {
    WorkspaceExchangeService.downloadJson('srg-finance-workspace.json', this.getStore())
  }

  static exportGeneralLedgerCsv(): void {
    const rows = [
      ['entryNumber', 'date', 'journal', 'description', 'debitTotal', 'creditTotal', 'status'],
      ...this.getStore().entries.map((entry) => [
        entry.entryNumber,
        entry.date,
        entry.journalCode,
        entry.description,
        entry.debitTotal.toString(),
        entry.creditTotal.toString(),
        entry.status,
      ]),
    ]
    WorkspaceExchangeService.downloadCsv('srg-finance-general-ledger.csv', rows)
  }

  static exportCustomerAgingCsv(): void {
    const rows = [
      ['invoiceNumber', 'customer', 'dueDate', 'status', 'balanceDue'],
      ...this.getStore().customerInvoices.map((invoice) => [
        invoice.invoiceNumber,
        invoice.customerName,
        invoice.dueDate,
        invoice.status,
        invoice.balanceDue.toString(),
      ]),
    ]
    WorkspaceExchangeService.downloadCsv('srg-finance-customer-aging.csv', rows)
  }

  static exportSupplierAgingCsv(): void {
    const rows = [
      ['invoiceNumber', 'supplier', 'dueDate', 'status', 'balanceDue'],
      ...this.getStore().supplierInvoices.map((invoice) => [
        invoice.invoiceNumber,
        invoice.supplierName,
        invoice.dueDate,
        invoice.status,
        invoice.balanceDue.toString(),
      ]),
    ]
    WorkspaceExchangeService.downloadCsv('srg-finance-supplier-aging.csv', rows)
  }

  private static recomputeStatements(): void {
    const store = this.getStore()
    const statement = buildFinancialStatement(store)
    this.writeStorage({ ...store, statements: [statement, ...store.statements].slice(0, 60) })
    this.appendTimeline('n/a', 'analysis', 'Financial statements generated', `P&L margin ${statement.profitAndLoss.margin.toFixed(2)}`)
  }

  private static appendTimeline(projectId: string, type: FinanceTimelineEvent['type'], title: string, details: string): void {
    const store = this.getStore()
    const event: FinanceTimelineEvent = {
      id: id('evt'),
      projectId,
      type,
      title,
      details,
      createdAt: nowIso(),
    }
    this.writeStorage({ ...store, timeline: [event, ...store.timeline].slice(0, 2600) })
  }

  private static appendMetric(projectId: string, label: string, value: number): void {
    const store = this.getStore()
    const point: FinanceMetricPoint = {
      id: id('met'),
      projectId,
      label,
      value,
      createdAt: nowIso(),
    }
    this.writeStorage({ ...store, metrics: [point, ...store.metrics].slice(0, 3200) })
  }

  private static pushDiagnostic(projectId: string, level: FinanceDiagnostic['level'], category: FinanceDiagnostic['category'], message: string): void {
    const store = this.getStore()
    const diag: FinanceDiagnostic = {
      id: id('diag'),
      projectId,
      level,
      category,
      message,
      createdAt: nowIso(),
    }
    this.writeStorage({ ...store, diagnostics: [diag, ...store.diagnostics].slice(0, 1800) })
  }

  private static appendAudit(action: string, entity: string, reference: string, actor: string): void {
    const store = this.getStore()
    const log: FinanceAuditLog = {
      id: id('aud'),
      action,
      entity,
      reference,
      actor,
      createdAt: nowIso(),
    }
    this.writeStorage({ ...store, auditLogs: [log, ...store.auditLogs].slice(0, 2000) })
  }

  private static logHistory(promptName: string, payload: string, eventType: 'creation' | 'modification' | 'validation' | 'publication' | 'archiving'): void {
    HistoryWorkspaceService.addRecord({
      id: id('hist-fin'),
      promptName,
      promptText: payload,
      output: payload,
      provider: 'workspace',
      model: 'finance',
      status: 'completed',
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      actorName: 'Finance Workspace',
      eventType,
    })
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

  private static readStorage(): FinanceWorkspaceStore {
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

      const parsed = JSON.parse(raw) as Partial<FinanceWorkspaceStore>
      const seed = seedStore()
      return {
        ...seed,
        ...parsed,
        chartOfAccounts: Array.isArray(parsed.chartOfAccounts) ? parsed.chartOfAccounts : seed.chartOfAccounts,
        journals: Array.isArray(parsed.journals) ? parsed.journals : seed.journals,
        entries: Array.isArray(parsed.entries) ? parsed.entries : seed.entries,
        fiscalYears: Array.isArray(parsed.fiscalYears) ? parsed.fiscalYears : seed.fiscalYears,
        fiscalPeriods: Array.isArray(parsed.fiscalPeriods) ? parsed.fiscalPeriods : seed.fiscalPeriods,
        closures: Array.isArray(parsed.closures) ? parsed.closures : seed.closures,
        attachments: Array.isArray(parsed.attachments) ? parsed.attachments : seed.attachments,
        customers: Array.isArray(parsed.customers) ? parsed.customers : seed.customers,
        customerInvoices: Array.isArray(parsed.customerInvoices) ? parsed.customerInvoices : seed.customerInvoices,
        customerCreditNotes: Array.isArray(parsed.customerCreditNotes) ? parsed.customerCreditNotes : seed.customerCreditNotes,
        customerReceipts: Array.isArray(parsed.customerReceipts) ? parsed.customerReceipts : seed.customerReceipts,
        customerReminders: Array.isArray(parsed.customerReminders) ? parsed.customerReminders : seed.customerReminders,
        supplierInvoices: Array.isArray(parsed.supplierInvoices) ? parsed.supplierInvoices : seed.supplierInvoices,
        supplierPayments: Array.isArray(parsed.supplierPayments) ? parsed.supplierPayments : seed.supplierPayments,
        treasuryAccounts: Array.isArray(parsed.treasuryAccounts) ? parsed.treasuryAccounts : seed.treasuryAccounts,
        treasuryTransfers: Array.isArray(parsed.treasuryTransfers) ? parsed.treasuryTransfers : seed.treasuryTransfers,
        treasuryFlows: Array.isArray(parsed.treasuryFlows) ? parsed.treasuryFlows : seed.treasuryFlows,
        treasuryForecasts: Array.isArray(parsed.treasuryForecasts) ? parsed.treasuryForecasts : seed.treasuryForecasts,
        reconciliations: Array.isArray(parsed.reconciliations) ? parsed.reconciliations : seed.reconciliations,
        budgetVersions: Array.isArray(parsed.budgetVersions) ? parsed.budgetVersions : seed.budgetVersions,
        budgets: Array.isArray(parsed.budgets) ? parsed.budgets : seed.budgets,
        costCenters: Array.isArray(parsed.costCenters) ? parsed.costCenters : seed.costCenters,
        statements: Array.isArray(parsed.statements) ? parsed.statements : seed.statements,
        aiInsights: Array.isArray(parsed.aiInsights) ? parsed.aiInsights : seed.aiInsights,
        timeline: Array.isArray(parsed.timeline) ? parsed.timeline : seed.timeline,
        diagnostics: Array.isArray(parsed.diagnostics) ? parsed.diagnostics : seed.diagnostics,
        metrics: Array.isArray(parsed.metrics) ? parsed.metrics : seed.metrics,
        auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : seed.auditLogs,
      }
    } catch {
      return seedStore()
    }
  }

  private static writeStorage(store: FinanceWorkspaceStore): void {
    this.memoryStore = store
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }
}

function findDuplicateInvoiceNumbers(store: FinanceWorkspaceStore): string[] {
  const customerNumbers = store.customerInvoices.map((item) => item.invoiceNumber)
  const supplierNumbers = store.supplierInvoices.map((item) => item.invoiceNumber)
  const all = [...customerNumbers, ...supplierNumbers]
  const seen = new Set<string>()
  const duplicate = new Set<string>()
  for (const number of all) {
    if (seen.has(number)) {
      duplicate.add(number)
    } else {
      seen.add(number)
    }
  }
  return Array.from(duplicate)
}
