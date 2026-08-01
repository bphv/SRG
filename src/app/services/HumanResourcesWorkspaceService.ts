import { BusinessPolicyWorkspaceService } from '#/app/services/BusinessPolicyWorkspaceService'
import { FinanceWorkspaceService } from '#/app/services/FinanceWorkspaceService'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'
import { MaintenanceWorkspaceService } from '#/app/services/MaintenanceWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { ProcurementInventoryWorkspaceService } from '#/app/services/ProcurementInventoryWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export type EmployeeStatus = 'active' | 'on-leave' | 'inactive'
export type ContractType = 'cdi' | 'cdd' | 'interim' | 'consultant' | 'intern'
export type ContractStatus = 'draft' | 'active' | 'closed'
export type PayrollStatus = 'draft' | 'validated' | 'paid'
export type LeaveStatus = 'requested' | 'approved' | 'rejected' | 'cancelled'

export type EmployeeRecord = {
  id: string
  employeeCode: string
  fullName: string
  department: string
  role: string
  projectId: string
  status: EmployeeStatus
  hiredAt: string
  salaryBase: number
  skills: string[]
  certifications: string[]
  createdAt: string
  updatedAt: string
}

export type OrganizationUnit = {
  id: string
  code: string
  name: string
  parentId: string | null
  manager: string
  targetHeadcount: number
  createdAt: string
  updatedAt: string
}

export type WorkforceContract = {
  id: string
  employeeId: string
  contractCode: string
  type: ContractType
  status: ContractStatus
  startDate: string
  endDate: string
  workloadPercent: number
  createdAt: string
  updatedAt: string
}

export type PayrollRecord = {
  id: string
  employeeId: string
  period: string
  gross: number
  allowances: number
  deductions: number
  net: number
  status: PayrollStatus
  costCenter: string
  createdAt: string
  updatedAt: string
}

export type WorkforceAttendance = {
  id: string
  employeeId: string
  date: string
  regularHours: number
  overtimeHours: number
  absenceHours: number
  projectId: string
  createdAt: string
}

export type LeaveRequest = {
  id: string
  employeeId: string
  leaveType: 'annual' | 'sick' | 'family' | 'training' | 'unpaid'
  startDate: string
  endDate: string
  days: number
  status: LeaveStatus
  reason: string
  createdAt: string
  updatedAt: string
}

export type SkillMatrixRecord = {
  id: string
  employeeId: string
  skill: string
  level: 1 | 2 | 3 | 4 | 5
  validated: boolean
  source: 'self' | 'manager' | 'training' | 'maintenance'
  createdAt: string
  updatedAt: string
}

export type TrainingRecord = {
  id: string
  title: string
  provider: string
  startDate: string
  endDate: string
  participants: string[]
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
  cost: number
  createdAt: string
  updatedAt: string
}

export type RecruitmentRecord = {
  id: string
  position: string
  department: string
  status: 'open' | 'screening' | 'offer' | 'hired' | 'closed'
  candidates: number
  hiredEmployeeId: string
  createdAt: string
  updatedAt: string
}

export type EvaluationRecord = {
  id: string
  employeeId: string
  period: string
  score: number
  potential: number
  recommendation: string
  createdAt: string
}

export type HrAiInsight = {
  id: string
  projectId: string
  question: string
  answer: string
  confidence: number
  references: string[]
  createdAt: string
}

export type HrTimelineEvent = {
  id: string
  projectId: string
  type: 'employee' | 'organization' | 'contract' | 'payroll' | 'attendance' | 'leave' | 'skill' | 'training' | 'recruitment' | 'evaluation' | 'ai' | 'audit'
  title: string
  details: string
  createdAt: string
}

export type HrDiagnostic = {
  id: string
  projectId: string
  level: 'info' | 'warning' | 'error'
  category: 'compliance' | 'workload' | 'absence' | 'payroll' | 'skill' | 'recruitment'
  message: string
  createdAt: string
}

export type HrMetricPoint = {
  id: string
  projectId: string
  label: string
  value: number
  createdAt: string
}

export type HrAuditLog = {
  id: string
  action: string
  entity: string
  reference: string
  actor: string
  createdAt: string
}

export type HumanResourcesWorkspaceStore = {
  employees: EmployeeRecord[]
  organizationUnits: OrganizationUnit[]
  contracts: WorkforceContract[]
  payroll: PayrollRecord[]
  attendance: WorkforceAttendance[]
  leaves: LeaveRequest[]
  skills: SkillMatrixRecord[]
  trainings: TrainingRecord[]
  recruitments: RecruitmentRecord[]
  evaluations: EvaluationRecord[]
  aiInsights: HrAiInsight[]
  timeline: HrTimelineEvent[]
  diagnostics: HrDiagnostic[]
  metrics: HrMetricPoint[]
  auditLogs: HrAuditLog[]
}

const STORAGE_KEY = 'srg.hr.workspace.v1'

function nowIso(): string {
  return new Date().toISOString()
}

function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function amount(value: number): number {
  return Number((Number.isFinite(value) ? value : 0).toFixed(2))
}

function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const delta = end.getTime() - start.getTime()
  if (!Number.isFinite(delta) || delta < 0) {
    return 0
  }
  return Math.max(1, Math.ceil(delta / (24 * 60 * 60 * 1000)) + 1)
}

function seedStore(): HumanResourcesWorkspaceStore {
  const projects = ProjectExecutionWorkspaceService.getStore().projects
  const project = projects[0]
  const policy = BusinessPolicyWorkspaceService.getStore().ruleProfiles[0]
  const maintenance = MaintenanceWorkspaceService.getStore()
  const procurement = ProcurementInventoryWorkspaceService.getSummary()

  const employees: EmployeeRecord[] = [
    {
      id: id('emp'),
      employeeCode: 'EMP-001',
      fullName: 'Ariane Mvondo',
      department: 'Field Operations',
      role: 'Team Lead',
      projectId: project.id,
      status: 'active',
      hiredAt: new Date(Date.now() - 550 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      salaryBase: amount(925000),
      skills: ['electrical-maintenance', 'site-safety'],
      certifications: ['H0B0', 'First Aid'],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: id('emp'),
      employeeCode: 'EMP-002',
      fullName: 'Yann Tchoua',
      department: 'Finance & Control',
      role: 'Payroll Analyst',
      projectId: project.id,
      status: 'active',
      hiredAt: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      salaryBase: amount(760000),
      skills: ['payroll', 'cost-control'],
      certifications: ['Payroll L2'],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: id('emp'),
      employeeCode: 'EMP-003',
      fullName: 'Nora Bilong',
      department: 'Procurement',
      role: 'Sourcing Specialist',
      projectId: project.id,
      status: 'on-leave',
      hiredAt: new Date(Date.now() - 220 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      salaryBase: amount(640000),
      skills: ['vendor-management', 'erp'],
      certifications: ['Negotiation'],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]

  const organizationUnits: OrganizationUnit[] = [
    {
      id: id('org'),
      code: 'RH',
      name: 'Human Resources',
      parentId: null,
      manager: 'DRH',
      targetHeadcount: 8,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: id('org'),
      code: 'OPS',
      name: 'Operations',
      parentId: null,
      manager: 'COO',
      targetHeadcount: 42,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]

  const contracts: WorkforceContract[] = employees.map((employee, index) => ({
    id: id('ctr'),
    employeeId: employee.id,
    contractCode: `CTR-${String(index + 1).padStart(3, '0')}`,
    type: index === 2 ? 'cdd' : 'cdi',
    status: 'active',
    startDate: employee.hiredAt,
    endDate: index === 2 ? new Date(Date.now() + 140 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : '',
    workloadPercent: 100,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }))

  const payroll: PayrollRecord[] = employees.map((employee, index) => {
    const allowances = amount(employee.salaryBase * 0.12)
    const deductions = amount(employee.salaryBase * policy.coefficients.retention)
    const gross = amount(employee.salaryBase + allowances)
    const net = amount(gross - deductions)
    return {
      id: id('pay'),
      employeeId: employee.id,
      period: '2025-02',
      gross,
      allowances,
      deductions,
      net,
      status: index === 0 ? 'paid' : 'validated',
      costCenter: index === 1 ? 'FIN' : 'OPS',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
  })

  const attendance: WorkforceAttendance[] = employees.map((employee, index) => ({
    id: id('att'),
    employeeId: employee.id,
    date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    regularHours: 8,
    overtimeHours: index === 0 ? 2 : 0,
    absenceHours: index === 2 ? 8 : 0,
    projectId: employee.projectId,
    createdAt: nowIso(),
  }))

  const leaves: LeaveRequest[] = [
    {
      id: id('lev'),
      employeeId: employees[2].id,
      leaveType: 'annual',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      days: 6,
      status: 'approved',
      reason: 'planned leave',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]

  const inferredSkills = maintenance.technicians.flatMap((technician) => technician.skills).slice(0, 4)
  const skills: SkillMatrixRecord[] = employees.flatMap((employee, index) => {
    const baseSkills = employee.skills.slice(0, 2)
    const crossSkills = inferredSkills[index] ? [inferredSkills[index]] : []
    return [...baseSkills, ...crossSkills].map((skill, skillIndex) => ({
      id: id('skl'),
      employeeId: employee.id,
      skill,
      level: ((skillIndex + 2) as 2 | 3 | 4),
      validated: true,
      source: skill.includes('maintenance') ? 'maintenance' : 'manager',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }))
  })

  const trainings: TrainingRecord[] = [
    {
      id: id('trn'),
      title: 'Electrical Safety Refresh',
      provider: 'SRG Academy',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      participants: [employees[0].id, employees[2].id],
      status: 'planned',
      cost: amount(220000),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]

  const recruitments: RecruitmentRecord[] = [
    {
      id: id('rec'),
      position: 'Automation Technician',
      department: 'Operations',
      status: 'screening',
      candidates: 11,
      hiredEmployeeId: '',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]

  const evaluations: EvaluationRecord[] = [
    {
      id: id('eva'),
      employeeId: employees[0].id,
      period: '2025-Q1',
      score: 4.4,
      potential: 4.7,
      recommendation: 'Promote to site coordinator track.',
      createdAt: nowIso(),
    },
  ]

  const timeline: HrTimelineEvent[] = [
    {
      id: id('evt'),
      projectId: project.id,
      type: 'organization',
      title: 'Workforce baseline loaded',
      details: `${employees.length} employees, ${organizationUnits.length} org units`,
      createdAt: nowIso(),
    },
    {
      id: id('evt'),
      projectId: project.id,
      type: 'payroll',
      title: 'Payroll synchronized',
      details: `Initial payroll imported from finance baseline ${FinanceWorkspaceService.getSummary().treasuryBalance.toFixed(2)}`,
      createdAt: nowIso(),
    },
  ]

  const diagnostics: HrDiagnostic[] = [
    {
      id: id('diag'),
      projectId: project.id,
      level: 'warning',
      category: 'workload',
      message: `High overtime pressure observed on ${procurement.lowStock} low-stock operations.`,
      createdAt: nowIso(),
    },
  ]

  const metrics: HrMetricPoint[] = [
    { id: id('met'), projectId: project.id, label: 'employees', value: employees.length, createdAt: nowIso() },
    { id: id('met'), projectId: project.id, label: 'payroll-net', value: payroll.reduce((sum, item) => sum + item.net, 0), createdAt: nowIso() },
    { id: id('met'), projectId: project.id, label: 'attendance-hours', value: attendance.reduce((sum, item) => sum + item.regularHours + item.overtimeHours, 0), createdAt: nowIso() },
  ]

  const auditLogs: HrAuditLog[] = [
    { id: id('aud'), action: 'seed', entity: 'workforce', reference: 'baseline', actor: 'Human Resources Workspace', createdAt: nowIso() },
  ]

  return {
    employees,
    organizationUnits,
    contracts,
    payroll,
    attendance,
    leaves,
    skills,
    trainings,
    recruitments,
    evaluations,
    aiInsights: [],
    timeline,
    diagnostics,
    metrics,
    auditLogs,
  }
}

export class HumanResourcesWorkspaceService {
  private static memoryStore: HumanResourcesWorkspaceStore = seedStore()

  static getStore(): HumanResourcesWorkspaceStore {
    return this.readStorage()
  }

  static getSummary() {
    const store = this.getStore()
    const activeEmployees = store.employees.filter((employee) => employee.status === 'active').length
    const leavePending = store.leaves.filter((leave) => leave.status === 'requested').length
    const payrollTotal = amount(store.payroll.reduce((sum, payroll) => sum + payroll.net, 0))
    const avgNetPayroll = store.payroll.length === 0 ? 0 : amount(payrollTotal / store.payroll.length)
    const attendanceHours = amount(store.attendance.reduce((sum, item) => sum + item.regularHours + item.overtimeHours, 0))
    const overtimeHours = amount(store.attendance.reduce((sum, item) => sum + item.overtimeHours, 0))
    const absenceHours = amount(store.attendance.reduce((sum, item) => sum + item.absenceHours, 0))
    const budgetSignal = FinanceWorkspaceService.getSummary().budgetPlanned

    return {
      employees: store.employees.length,
      activeEmployees,
      organizationUnits: store.organizationUnits.length,
      contracts: store.contracts.length,
      payrollRecords: store.payroll.length,
      attendanceRecords: store.attendance.length,
      leaveRequests: store.leaves.length,
      leavePending,
      skills: store.skills.length,
      trainings: store.trainings.length,
      recruitments: store.recruitments.length,
      evaluations: store.evaluations.length,
      avgNetPayroll,
      payrollTotal,
      attendanceHours,
      overtimeHours,
      absenceHours,
      timeline: store.timeline.length,
      diagnostics: store.diagnostics.length,
      auditLogs: store.auditLogs.length,
      budgetSignal,
    }
  }

  static listEmployeeStatuses(): EmployeeStatus[] {
    return ['active', 'on-leave', 'inactive']
  }

  static listContractTypes(): ContractType[] {
    return ['cdi', 'cdd', 'interim', 'consultant', 'intern']
  }

  static listPayrollStatuses(): PayrollStatus[] {
    return ['draft', 'validated', 'paid']
  }

  static listLeaveStatuses(): LeaveStatus[] {
    return ['requested', 'approved', 'rejected', 'cancelled']
  }

  static upsertEmployee(input: Omit<EmployeeRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): EmployeeRecord {
    const store = this.getStore()
    const current = input.id ? store.employees.find((employee) => employee.id === input.id) : undefined
    const next: EmployeeRecord = {
      id: current?.id ?? id('emp'),
      employeeCode: input.employeeCode.trim(),
      fullName: input.fullName.trim(),
      department: input.department.trim(),
      role: input.role.trim(),
      projectId: input.projectId,
      status: input.status,
      hiredAt: input.hiredAt,
      salaryBase: amount(input.salaryBase),
      skills: input.skills.map((skill) => skill.trim()).filter(Boolean),
      certifications: input.certifications.map((item) => item.trim()).filter(Boolean),
      createdAt: current?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    }

    const employees = current
      ? store.employees.map((employee) => (employee.id === next.id ? next : employee))
      : [next, ...store.employees]

    this.writeStorage({ ...store, employees })
    this.appendTimeline(next.projectId, 'employee', current ? 'Employee updated' : 'Employee onboarded', `${next.employeeCode} ${next.fullName}`)
    this.appendMetric(next.projectId, 'employees', employees.length)
    this.appendAudit(current ? 'update' : 'create', 'employee', next.employeeCode, 'Human Resources Workspace')
    return next
  }

  static upsertOrganizationUnit(input: Omit<OrganizationUnit, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): OrganizationUnit {
    const store = this.getStore()
    const current = input.id ? store.organizationUnits.find((unit) => unit.id === input.id) : undefined
    const next: OrganizationUnit = {
      id: current?.id ?? id('org'),
      code: input.code.trim(),
      name: input.name.trim(),
      parentId: input.parentId,
      manager: input.manager.trim(),
      targetHeadcount: Math.max(0, Math.round(input.targetHeadcount)),
      createdAt: current?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    }

    const organizationUnits = current
      ? store.organizationUnits.map((unit) => (unit.id === next.id ? next : unit))
      : [next, ...store.organizationUnits]

    this.writeStorage({ ...store, organizationUnits })
    this.appendTimeline('n/a', 'organization', current ? 'Organization unit updated' : 'Organization unit created', `${next.code} ${next.name}`)
    this.appendAudit(current ? 'update' : 'create', 'organization-unit', next.code, 'Human Resources Workspace')
    return next
  }

  static upsertContract(input: {
    employeeId: string
    contractCode: string
    type: ContractType
    status: ContractStatus
    startDate: string
    endDate: string
    workloadPercent: number
    id?: string
  }): WorkforceContract | undefined {
    const store = this.getStore()
    const employee = store.employees.find((item) => item.id === input.employeeId)
    if (!employee) {
      return undefined
    }

    const current = input.id ? store.contracts.find((item) => item.id === input.id) : undefined
    const next: WorkforceContract = {
      id: current?.id ?? id('ctr'),
      employeeId: employee.id,
      contractCode: input.contractCode.trim(),
      type: input.type,
      status: input.status,
      startDate: input.startDate,
      endDate: input.endDate,
      workloadPercent: Math.max(0, Math.min(100, Math.round(input.workloadPercent))),
      createdAt: current?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    }

    const contracts = current
      ? store.contracts.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.contracts]

    const diagnostics = [...store.diagnostics]
    if (next.type === 'cdd' && next.endDate && new Date(next.endDate).getTime() - Date.now() < 45 * 24 * 60 * 60 * 1000) {
      diagnostics.unshift({
        id: id('diag'),
        projectId: employee.projectId,
        level: 'warning',
        category: 'compliance',
        message: `Contract ${next.contractCode} expires soon.`,
        createdAt: nowIso(),
      })
    }

    this.writeStorage({ ...store, contracts, diagnostics })
    this.appendTimeline(employee.projectId, 'contract', current ? 'Contract updated' : 'Contract registered', `${next.contractCode} (${next.type})`)
    this.appendAudit(current ? 'update' : 'create', 'contract', next.contractCode, 'Human Resources Workspace')
    return next
  }

  static createPayrollRecord(input: {
    employeeId: string
    period: string
    gross: number
    allowances: number
    deductions: number
    status: PayrollStatus
    costCenter: string
  }): PayrollRecord | undefined {
    const store = this.getStore()
    const employee = store.employees.find((item) => item.id === input.employeeId)
    if (!employee) {
      return undefined
    }

    const gross = amount(input.gross)
    const allowances = amount(input.allowances)
    const deductions = amount(input.deductions)
    const net = amount(gross + allowances - deductions)

    const payroll: PayrollRecord = {
      id: id('pay'),
      employeeId: employee.id,
      period: input.period,
      gross,
      allowances,
      deductions,
      net,
      status: input.status,
      costCenter: input.costCenter.trim(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    const diagnostics = [...store.diagnostics]
    if (net <= 0) {
      diagnostics.unshift({
        id: id('diag'),
        projectId: employee.projectId,
        level: 'error',
        category: 'payroll',
        message: `Net payroll is non-positive for ${employee.employeeCode}.`,
        createdAt: nowIso(),
      })
    }

    this.writeStorage({ ...store, payroll: [payroll, ...store.payroll], diagnostics })
    this.appendTimeline(employee.projectId, 'payroll', 'Payroll generated', `${employee.employeeCode} ${input.period} net ${net.toFixed(2)}`)
    this.appendMetric(employee.projectId, 'payroll-net', net)
    this.appendAudit('create', 'payroll', `${employee.employeeCode}-${input.period}`, 'Human Resources Workspace')
    this.logHistory('HR payroll', `${employee.employeeCode} ${input.period}`, 'creation')
    return payroll
  }

  static markAttendance(input: {
    employeeId: string
    date: string
    regularHours: number
    overtimeHours: number
    absenceHours: number
    projectId: string
  }): WorkforceAttendance | undefined {
    const store = this.getStore()
    const employee = store.employees.find((item) => item.id === input.employeeId)
    if (!employee) {
      return undefined
    }

    const entry: WorkforceAttendance = {
      id: id('att'),
      employeeId: employee.id,
      date: input.date,
      regularHours: amount(input.regularHours),
      overtimeHours: amount(input.overtimeHours),
      absenceHours: amount(input.absenceHours),
      projectId: input.projectId,
      createdAt: nowIso(),
    }

    const diagnostics = [...store.diagnostics]
    if (entry.absenceHours >= 8) {
      diagnostics.unshift({
        id: id('diag'),
        projectId: entry.projectId,
        level: 'warning',
        category: 'absence',
        message: `Full-day absence detected for ${employee.employeeCode} on ${entry.date}.`,
        createdAt: nowIso(),
      })
    }

    this.writeStorage({ ...store, attendance: [entry, ...store.attendance], diagnostics })
    this.appendTimeline(entry.projectId, 'attendance', 'Attendance captured', `${employee.employeeCode} ${entry.date}`)
    this.appendMetric(entry.projectId, 'attendance-hours', entry.regularHours + entry.overtimeHours)
    return entry
  }

  static requestLeave(input: {
    employeeId: string
    leaveType: LeaveRequest['leaveType']
    startDate: string
    endDate: string
    status: LeaveStatus
    reason: string
  }): LeaveRequest | undefined {
    const store = this.getStore()
    const employee = store.employees.find((item) => item.id === input.employeeId)
    if (!employee) {
      return undefined
    }

    const request: LeaveRequest = {
      id: id('lev'),
      employeeId: employee.id,
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      days: daysBetween(input.startDate, input.endDate),
      status: input.status,
      reason: input.reason.trim(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, leaves: [request, ...store.leaves] })
    this.appendTimeline(employee.projectId, 'leave', 'Leave request updated', `${employee.employeeCode} ${request.leaveType} ${request.status}`)
    this.appendAudit('create', 'leave', `${employee.employeeCode}-${request.startDate}`, 'Human Resources Workspace')
    return request
  }

  static upsertSkill(input: {
    employeeId: string
    skill: string
    level: 1 | 2 | 3 | 4 | 5
    validated: boolean
    source: SkillMatrixRecord['source']
    id?: string
  }): SkillMatrixRecord | undefined {
    const store = this.getStore()
    const employee = store.employees.find((item) => item.id === input.employeeId)
    if (!employee) {
      return undefined
    }

    const current = input.id ? store.skills.find((item) => item.id === input.id) : undefined
    const next: SkillMatrixRecord = {
      id: current?.id ?? id('skl'),
      employeeId: employee.id,
      skill: input.skill.trim(),
      level: input.level,
      validated: input.validated,
      source: input.source,
      createdAt: current?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    }

    const skills = current
      ? store.skills.map((item) => (item.id === next.id ? next : item))
      : [next, ...store.skills]

    const diagnostics = [...store.diagnostics]
    if (next.level <= 2) {
      diagnostics.unshift({
        id: id('diag'),
        projectId: employee.projectId,
        level: 'warning',
        category: 'skill',
        message: `Skill gap identified: ${employee.employeeCode} on ${next.skill}.`,
        createdAt: nowIso(),
      })
    }

    this.writeStorage({ ...store, skills, diagnostics })
    this.appendTimeline(employee.projectId, 'skill', current ? 'Skill updated' : 'Skill added', `${employee.employeeCode} ${next.skill}`)
    this.appendAudit(current ? 'update' : 'create', 'skill', `${employee.employeeCode}-${next.skill}`, 'Human Resources Workspace')
    return next
  }

  static scheduleTraining(input: {
    title: string
    provider: string
    startDate: string
    endDate: string
    participants: string[]
    status: TrainingRecord['status']
    cost: number
  }): TrainingRecord {
    const store = this.getStore()
    const training: TrainingRecord = {
      id: id('trn'),
      title: input.title.trim(),
      provider: input.provider.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      participants: input.participants,
      status: input.status,
      cost: amount(input.cost),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, trainings: [training, ...store.trainings] })
    this.appendTimeline('n/a', 'training', 'Training scheduled', `${training.title} (${training.participants.length} participants)`)
    this.appendAudit('create', 'training', training.title, 'Human Resources Workspace')
    return training
  }

  static createRecruitment(input: {
    position: string
    department: string
    status: RecruitmentRecord['status']
    candidates: number
    hiredEmployeeId?: string
  }): RecruitmentRecord {
    const store = this.getStore()
    const record: RecruitmentRecord = {
      id: id('rec'),
      position: input.position.trim(),
      department: input.department.trim(),
      status: input.status,
      candidates: Math.max(0, Math.round(input.candidates)),
      hiredEmployeeId: input.hiredEmployeeId ?? '',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    const diagnostics = [...store.diagnostics]
    if (record.status !== 'hired' && record.candidates < 2) {
      diagnostics.unshift({
        id: id('diag'),
        projectId: 'n/a',
        level: 'warning',
        category: 'recruitment',
        message: `Pipeline is low for role ${record.position}.`,
        createdAt: nowIso(),
      })
    }

    this.writeStorage({ ...store, recruitments: [record, ...store.recruitments], diagnostics })
    this.appendTimeline('n/a', 'recruitment', 'Recruitment funnel updated', `${record.position} (${record.status})`)
    this.appendAudit('create', 'recruitment', record.position, 'Human Resources Workspace')
    return record
  }

  static addEvaluation(input: { employeeId: string; period: string; score: number; potential: number; recommendation: string }): EvaluationRecord | undefined {
    const store = this.getStore()
    const employee = store.employees.find((item) => item.id === input.employeeId)
    if (!employee) {
      return undefined
    }

    const evaluation: EvaluationRecord = {
      id: id('eva'),
      employeeId: employee.id,
      period: input.period,
      score: amount(input.score),
      potential: amount(input.potential),
      recommendation: input.recommendation.trim(),
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, evaluations: [evaluation, ...store.evaluations] })
    this.appendTimeline(employee.projectId, 'evaluation', 'Performance evaluation recorded', `${employee.employeeCode} ${input.period}`)
    this.appendMetric(employee.projectId, 'evaluation-score', evaluation.score)
    this.appendAudit('create', 'evaluation', `${employee.employeeCode}-${input.period}`, 'Human Resources Workspace')
    return evaluation
  }

  static ingestHrDocuments(query: string): string[] {
    const store = this.getStore()
    const normalized = query.trim().toLowerCase()
    const documents = KnowledgeWorkspaceService.getStore().documents
      .filter((document) => {
        const text = `${document.title} ${document.content} ${document.documentType} ${document.source}`.toLowerCase()
        return text.includes(normalized)
          || text.includes('contrat')
          || text.includes('contract')
          || text.includes('payroll')
          || text.includes('paie')
          || text.includes('presence')
          || text.includes('attendance')
          || text.includes('ocr')
          || text.includes('zip')
      })
      .slice(0, 25)
      .map((document) => document.id)

    this.appendTimeline('n/a', 'audit', 'HR documents indexed', `${documents.length} linked references`)
    this.appendAudit('ingest', 'knowledge-doc', query, 'Human Resources Workspace')
    this.writeStorage({ ...store })
    return documents
  }

  static askHrAi(projectId: string, question: string): HrAiInsight {
    const store = this.getStore()
    const lower = question.toLowerCase()
    const projectSummary = ProjectExecutionWorkspaceService.getSummary()
    const maintenanceSummary = MaintenanceWorkspaceService.getSummary()
    const procurementSummary = ProcurementInventoryWorkspaceService.getSummary()
    const financeSummary = FinanceWorkspaceService.getSummary()

    let answer = 'Not enough HR signal yet to produce a precise recommendation.'
    let confidence = 0.45
    const references: string[] = ['hr-store']

    if (lower.includes('paie') || lower.includes('payroll') || lower.includes('cout')) {
      answer = `Payroll net total is ${this.getSummary().payrollTotal.toFixed(2)} with average ${this.getSummary().avgNetPayroll.toFixed(2)}. Finance budget signal is ${financeSummary.budgetPlanned.toFixed(2)}.`
      confidence = 0.87
      references.push('payroll', 'finance')
    } else if (lower.includes('absence') || lower.includes('presence')) {
      answer = `Attendance hours ${this.getSummary().attendanceHours.toFixed(2)}, absence hours ${this.getSummary().absenceHours.toFixed(2)}, overtime ${this.getSummary().overtimeHours.toFixed(2)}.`
      confidence = 0.81
      references.push('attendance')
    } else if (lower.includes('recrut') || lower.includes('hiring')) {
      const openRecruitments = store.recruitments.filter((item) => item.status !== 'hired' && item.status !== 'closed').length
      answer = `Open recruitment pipelines: ${openRecruitments}. Project progress ${projectSummary.progress.toFixed(1)}% and maintenance workload ${maintenanceSummary.workOrders}.`
      confidence = 0.79
      references.push('recruitment', 'project-execution', 'maintenance')
    } else if (lower.includes('competence') || lower.includes('skill')) {
      const lowSkills = store.skills.filter((item) => item.level <= 2).length
      answer = `Detected ${lowSkills} low-level skill entries. Procurement pressure is ${procurementSummary.lowStock} low-stock items; prioritize upskilling for critical operations.`
      confidence = 0.83
      references.push('skills', 'procurement')
    } else if (lower.includes('conge') || lower.includes('leave')) {
      answer = `Leave requests total ${this.getSummary().leaveRequests} with ${this.getSummary().leavePending} pending approvals.`
      confidence = 0.78
      references.push('leaves')
    }

    const insight: HrAiInsight = {
      id: id('ai'),
      projectId,
      question,
      answer,
      confidence,
      references,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, aiInsights: [insight, ...store.aiInsights].slice(0, 360) })
    this.appendTimeline(projectId, 'ai', 'HR AI insight', question)
    return insight
  }

  static exportStore(): void {
    WorkspaceExchangeService.downloadJson('srg-hr-workspace.json', this.getStore())
  }

  static exportEmployeesCsv(): void {
    const rows = [
      ['employeeCode', 'fullName', 'department', 'role', 'status', 'projectId', 'salaryBase'],
      ...this.getStore().employees.map((employee) => [
        employee.employeeCode,
        employee.fullName,
        employee.department,
        employee.role,
        employee.status,
        employee.projectId,
        employee.salaryBase.toString(),
      ]),
    ]
    WorkspaceExchangeService.downloadCsv('srg-hr-employees.csv', rows)
  }

  static exportPayrollCsv(): void {
    const rows = [
      ['period', 'employeeId', 'gross', 'allowances', 'deductions', 'net', 'status', 'costCenter'],
      ...this.getStore().payroll.map((payroll) => [
        payroll.period,
        payroll.employeeId,
        payroll.gross.toString(),
        payroll.allowances.toString(),
        payroll.deductions.toString(),
        payroll.net.toString(),
        payroll.status,
        payroll.costCenter,
      ]),
    ]
    WorkspaceExchangeService.downloadCsv('srg-hr-payroll.csv', rows)
  }

  private static appendTimeline(projectId: string, type: HrTimelineEvent['type'], title: string, details: string): void {
    const store = this.getStore()
    const event: HrTimelineEvent = {
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
    const metric: HrMetricPoint = {
      id: id('met'),
      projectId,
      label,
      value: amount(value),
      createdAt: nowIso(),
    }
    this.writeStorage({ ...store, metrics: [metric, ...store.metrics].slice(0, 3200) })
  }

  private static appendAudit(action: string, entity: string, reference: string, actor: string): void {
    const store = this.getStore()
    const log: HrAuditLog = {
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
      id: id('hist-hr'),
      promptName,
      promptText: payload,
      output: payload,
      provider: 'workspace',
      model: 'human-resources',
      status: 'completed',
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      actorName: 'Human Resources Workspace',
      eventType,
    })
  }

  private static readStorage(): HumanResourcesWorkspaceStore {
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

      const parsed = JSON.parse(raw) as Partial<HumanResourcesWorkspaceStore>
      const seed = seedStore()
      return {
        ...seed,
        ...parsed,
        employees: Array.isArray(parsed.employees) ? parsed.employees : seed.employees,
        organizationUnits: Array.isArray(parsed.organizationUnits) ? parsed.organizationUnits : seed.organizationUnits,
        contracts: Array.isArray(parsed.contracts) ? parsed.contracts : seed.contracts,
        payroll: Array.isArray(parsed.payroll) ? parsed.payroll : seed.payroll,
        attendance: Array.isArray(parsed.attendance) ? parsed.attendance : seed.attendance,
        leaves: Array.isArray(parsed.leaves) ? parsed.leaves : seed.leaves,
        skills: Array.isArray(parsed.skills) ? parsed.skills : seed.skills,
        trainings: Array.isArray(parsed.trainings) ? parsed.trainings : seed.trainings,
        recruitments: Array.isArray(parsed.recruitments) ? parsed.recruitments : seed.recruitments,
        evaluations: Array.isArray(parsed.evaluations) ? parsed.evaluations : seed.evaluations,
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

  private static writeStorage(store: HumanResourcesWorkspaceStore): void {
    this.memoryStore = store
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }

  static notify(title: string, message: string): void {
    notificationService.publish({
      title,
      message,
      level: 'info',
      priority: 'medium',
      category: 'system',
      read: false,
    })
  }
}
