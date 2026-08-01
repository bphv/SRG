import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Section from '#/app/components/Section'
import { useHumanResourcesWorkspace } from '#/app/hooks/useHumanResourcesWorkspace'
import { HumanResourcesWorkspaceService } from '#/app/services/HumanResourcesWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'

type HrView =
  | 'overview'
  | 'employees'
  | 'organization'
  | 'contracts'
  | 'payroll'
  | 'attendance'
  | 'leaves'
  | 'skills'
  | 'trainings'
  | 'recruitment'
  | 'evaluations'

export default function HumanResourcesWorkspace(props: { initialView?: HrView }) {
  const workspace = useHumanResourcesWorkspace()
  const projects = ProjectExecutionWorkspaceService.getStore().projects
  const [activeView, setActiveView] = useState<HrView>(props.initialView ?? 'overview')

  const [employeeCode, setEmployeeCode] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [employeeDepartment, setEmployeeDepartment] = useState('Operations')
  const [employeeRole, setEmployeeRole] = useState('Technician')
  const [employeeSalary, setEmployeeSalary] = useState(0)

  const [orgCode, setOrgCode] = useState('')
  const [orgName, setOrgName] = useState('')
  const [orgManager, setOrgManager] = useState('')
  const [orgHeadcount, setOrgHeadcount] = useState(0)

  const [contractEmployeeId, setContractEmployeeId] = useState(workspace.store.employees[0]?.id ?? '')
  const [contractCode, setContractCode] = useState('')
  const [contractType, setContractType] = useState<(typeof workspace.contractTypes)[number]>('cdi')
  const [contractStartDate, setContractStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [contractEndDate, setContractEndDate] = useState('')
  const [contractWorkload, setContractWorkload] = useState(100)

  const [payrollEmployeeId, setPayrollEmployeeId] = useState(workspace.store.employees[0]?.id ?? '')
  const [payrollPeriod, setPayrollPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [payrollGross, setPayrollGross] = useState(0)
  const [payrollAllowances, setPayrollAllowances] = useState(0)
  const [payrollDeductions, setPayrollDeductions] = useState(0)

  const [attendanceEmployeeId, setAttendanceEmployeeId] = useState(workspace.store.employees[0]?.id ?? '')
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10))
  const [attendanceRegular, setAttendanceRegular] = useState(8)
  const [attendanceOvertime, setAttendanceOvertime] = useState(0)
  const [attendanceAbsence, setAttendanceAbsence] = useState(0)

  const [leaveEmployeeId, setLeaveEmployeeId] = useState(workspace.store.employees[0]?.id ?? '')
  const [leaveType, setLeaveType] = useState<'annual' | 'sick' | 'family' | 'training' | 'unpaid'>('annual')
  const [leaveStart, setLeaveStart] = useState(new Date().toISOString().slice(0, 10))
  const [leaveEnd, setLeaveEnd] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
  const [leaveReason, setLeaveReason] = useState('planned leave')

  const [skillEmployeeId, setSkillEmployeeId] = useState(workspace.store.employees[0]?.id ?? '')
  const [skillName, setSkillName] = useState('safety')
  const [skillLevel, setSkillLevel] = useState<1 | 2 | 3 | 4 | 5>(3)

  const [trainingTitle, setTrainingTitle] = useState('')
  const [trainingProvider, setTrainingProvider] = useState('SRG Academy')
  const [trainingStart, setTrainingStart] = useState(new Date().toISOString().slice(0, 10))
  const [trainingEnd, setTrainingEnd] = useState(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
  const [trainingCost, setTrainingCost] = useState(0)
  const [trainingParticipants, setTrainingParticipants] = useState('')

  const [recruitmentPosition, setRecruitmentPosition] = useState('')
  const [recruitmentDepartment, setRecruitmentDepartment] = useState('Operations')
  const [recruitmentCandidates, setRecruitmentCandidates] = useState(0)

  const [evaluationEmployeeId, setEvaluationEmployeeId] = useState(workspace.store.employees[0]?.id ?? '')
  const [evaluationPeriod, setEvaluationPeriod] = useState('2025-Q2')
  const [evaluationScore, setEvaluationScore] = useState(3.5)
  const [evaluationPotential, setEvaluationPotential] = useState(3.8)
  const [evaluationRecommendation, setEvaluationRecommendation] = useState('Continue development plan')

  const [docQuery, setDocQuery] = useState('contrat paie presence conge competences ocr zip')
  const [aiProjectId, setAiProjectId] = useState(workspace.selectedProjectId === 'all' ? projects[0]?.id ?? '' : workspace.selectedProjectId)
  const [aiQuestion, setAiQuestion] = useState('Quel est le principal risque RH sur le chantier actif ?')
  const [aiAnswer, setAiAnswer] = useState('')

  const currentProjectId = useMemo(() => {
    if (workspace.selectedProjectId !== 'all') return workspace.selectedProjectId
    return projects[0]?.id ?? ''
  }, [workspace.selectedProjectId, projects])

  const employeeById = (id: string) => workspace.store.employees.find((employee) => employee.id === id)

  const createEmployee = () => {
    HumanResourcesWorkspaceService.upsertEmployee({
      employeeCode,
      fullName: employeeName,
      department: employeeDepartment,
      role: employeeRole,
      projectId: currentProjectId,
      status: 'active',
      hiredAt: new Date().toISOString().slice(0, 10),
      salaryBase: employeeSalary,
      skills: [],
      certifications: [],
    })
    setEmployeeCode('')
    setEmployeeName('')
    workspace.refresh()
  }

  const createOrgUnit = () => {
    HumanResourcesWorkspaceService.upsertOrganizationUnit({
      code: orgCode,
      name: orgName,
      parentId: null,
      manager: orgManager,
      targetHeadcount: orgHeadcount,
    })
    setOrgCode('')
    setOrgName('')
    workspace.refresh()
  }

  const createContract = () => {
    HumanResourcesWorkspaceService.upsertContract({
      employeeId: contractEmployeeId,
      contractCode,
      type: contractType,
      status: 'active',
      startDate: contractStartDate,
      endDate: contractEndDate,
      workloadPercent: contractWorkload,
    })
    workspace.refresh()
  }

  const createPayroll = () => {
    HumanResourcesWorkspaceService.createPayrollRecord({
      employeeId: payrollEmployeeId,
      period: payrollPeriod,
      gross: payrollGross,
      allowances: payrollAllowances,
      deductions: payrollDeductions,
      status: 'validated',
      costCenter: 'RH',
    })
    workspace.refresh()
  }

  const createAttendance = () => {
    HumanResourcesWorkspaceService.markAttendance({
      employeeId: attendanceEmployeeId,
      date: attendanceDate,
      regularHours: attendanceRegular,
      overtimeHours: attendanceOvertime,
      absenceHours: attendanceAbsence,
      projectId: currentProjectId,
    })
    workspace.refresh()
  }

  const createLeave = () => {
    HumanResourcesWorkspaceService.requestLeave({
      employeeId: leaveEmployeeId,
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      status: 'requested',
      reason: leaveReason,
    })
    workspace.refresh()
  }

  const createSkill = () => {
    HumanResourcesWorkspaceService.upsertSkill({
      employeeId: skillEmployeeId,
      skill: skillName,
      level: skillLevel,
      validated: true,
      source: 'manager',
    })
    workspace.refresh()
  }

  const createTraining = () => {
    const participants = trainingParticipants
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((employeeCodeValue) => workspace.store.employees.find((employee) => employee.employeeCode === employeeCodeValue)?.id)
      .filter((item): item is string => Boolean(item))

    HumanResourcesWorkspaceService.scheduleTraining({
      title: trainingTitle,
      provider: trainingProvider,
      startDate: trainingStart,
      endDate: trainingEnd,
      participants,
      status: 'planned',
      cost: trainingCost,
    })
    workspace.refresh()
  }

  const createRecruitment = () => {
    HumanResourcesWorkspaceService.createRecruitment({
      position: recruitmentPosition,
      department: recruitmentDepartment,
      status: 'open',
      candidates: recruitmentCandidates,
    })
    workspace.refresh()
  }

  const createEvaluation = () => {
    HumanResourcesWorkspaceService.addEvaluation({
      employeeId: evaluationEmployeeId,
      period: evaluationPeriod,
      score: evaluationScore,
      potential: evaluationPotential,
      recommendation: evaluationRecommendation,
    })
    workspace.refresh()
  }

  const ingestDocuments = () => {
    HumanResourcesWorkspaceService.ingestHrDocuments(docQuery)
    workspace.refresh()
  }

  const askAi = () => {
    const insight = HumanResourcesWorkspaceService.askHrAi(aiProjectId || currentProjectId, aiQuestion)
    setAiAnswer(`${insight.answer}\n\nConfidence: ${insight.confidence}`)
    workspace.refresh()
  }

  return (
    <div className="space-y-6">
      <Section title="Enterprise Human Resources, Payroll & Workforce Management" description="Ressources humaines: employes, organisation, contrats, paie, presences, conges, competences, formations, recrutement et evaluations.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Metric label="Employes" value={workspace.summary.employees} />
          <Metric label="Actifs" value={workspace.summary.activeEmployees} />
          <Metric label="Contrats" value={workspace.summary.contracts} />
          <Metric label="Paies" value={workspace.summary.payrollRecords} />
          <Metric label="Conges" value={workspace.summary.leaveRequests} />
          <Metric label="Evaluations" value={workspace.summary.evaluations} />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-6 text-sm">
          <Info label="Payroll total" value={workspace.summary.payrollTotal.toFixed(2)} />
          <Info label="Payroll moyen" value={workspace.summary.avgNetPayroll.toFixed(2)} />
          <Info label="Presence heures" value={workspace.summary.attendanceHours.toFixed(2)} />
          <Info label="Overtime" value={workspace.summary.overtimeHours.toFixed(2)} />
          <Info label="Absence" value={workspace.summary.absenceHours.toFixed(2)} />
          <Info label="Diagnostics" value={`${workspace.summary.diagnostics}`} />
        </div>
      </Section>

      <Section title="Navigation RH" description="Vues metier RH et acces directs par route.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-11 text-sm">
          {[
            ['overview', 'RH'],
            ['employees', 'Employes'],
            ['organization', 'Organisation'],
            ['contracts', 'Contrats'],
            ['payroll', 'Paie'],
            ['attendance', 'Presences'],
            ['leaves', 'Conges'],
            ['skills', 'Competences'],
            ['trainings', 'Formations'],
            ['recruitment', 'Recrutement'],
            ['evaluations', 'Evaluations'],
          ].map((item) => (
            <button
              key={item[0]}
              type="button"
              onClick={() => setActiveView(item[0] as HrView)}
              className={`rounded-3xl border px-4 py-3 ${activeView === item[0] ? 'border-[var(--srg-color-primary-400)] bg-[var(--srg-surface)] font-semibold text-[var(--srg-text-title)]' : 'border-[var(--srg-border)] bg-[var(--srg-surface-strong)] text-[var(--srg-text-muted)]'}`}
            >
              {item[1]}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-6 text-sm">
          <select value={workspace.selectedProjectId} onChange={(event) => workspace.setSelectedProjectId(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
            <option value="all">all projects</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <input value={workspace.search} onChange={(event) => workspace.setSearch(event.target.value)} placeholder="Recherche RH" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
          <select value={workspace.employeeStatusFilter} onChange={(event) => workspace.setEmployeeStatusFilter(event.target.value as typeof workspace.employeeStatusFilter)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
            <option value="all">all employee status</option>
            {workspace.employeeStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select value={workspace.contractStatusFilter} onChange={(event) => workspace.setContractStatusFilter(event.target.value as typeof workspace.contractStatusFilter)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
            <option value="all">all contract status</option>
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="closed">closed</option>
          </select>
          <select value={workspace.payrollStatusFilter} onChange={(event) => workspace.setPayrollStatusFilter(event.target.value as typeof workspace.payrollStatusFilter)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
            <option value="all">all payroll status</option>
            {workspace.payrollStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select value={workspace.leaveStatusFilter} onChange={(event) => workspace.setLeaveStatusFilter(event.target.value as typeof workspace.leaveStatusFilter)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
            <option value="all">all leave status</option>
            {workspace.leaveStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </Section>

      {activeView === 'overview' || activeView === 'employees' ? (
        <Section title="Employes" description="Dossiers employes, roles, departements et affectations chantiers.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6 text-sm">
            <input value={employeeCode} onChange={(event) => setEmployeeCode(event.target.value)} placeholder="Code employe" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input value={employeeName} onChange={(event) => setEmployeeName(event.target.value)} placeholder="Nom complet" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input value={employeeDepartment} onChange={(event) => setEmployeeDepartment(event.target.value)} placeholder="Departement" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input value={employeeRole} onChange={(event) => setEmployeeRole(event.target.value)} placeholder="Role" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="number" value={employeeSalary} onChange={(event) => setEmployeeSalary(Number(event.target.value) || 0)} placeholder="Salaire base" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <button type="button" onClick={createEmployee} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 font-semibold text-white">Creer employe</button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
            {workspace.filteredEmployees.slice(0, 12).map((employee) => (
              <div key={employee.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
                {employee.employeeCode} | {employee.fullName} | {employee.department} | {employee.status} | {employee.role}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeView === 'overview' || activeView === 'organization' ? (
        <Section title="Organisation" description="Unites, lignes manageriales et capacite cible.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
            <input value={orgCode} onChange={(event) => setOrgCode(event.target.value)} placeholder="Code unite" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input value={orgName} onChange={(event) => setOrgName(event.target.value)} placeholder="Nom unite" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input value={orgManager} onChange={(event) => setOrgManager(event.target.value)} placeholder="Manager" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="number" value={orgHeadcount} onChange={(event) => setOrgHeadcount(Number(event.target.value) || 0)} placeholder="Capacite" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <button type="button" onClick={createOrgUnit} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 font-semibold text-white">Creer unite</button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
            {workspace.store.organizationUnits.slice(0, 12).map((unit) => (
              <div key={unit.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
                {unit.code} | {unit.name} | manager {unit.manager} | target {unit.targetHeadcount}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeView === 'overview' || activeView === 'contracts' ? (
        <Section title="Contrats" description="Contrats de travail, statut, charge et echeances.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7 text-sm">
            <select value={contractEmployeeId} onChange={(event) => setContractEmployeeId(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
              {workspace.store.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.employeeCode}</option>)}
            </select>
            <input value={contractCode} onChange={(event) => setContractCode(event.target.value)} placeholder="Code contrat" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <select value={contractType} onChange={(event) => setContractType(event.target.value as (typeof workspace.contractTypes)[number])} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
              {workspace.contractTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <input type="date" value={contractStartDate} onChange={(event) => setContractStartDate(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="date" value={contractEndDate} onChange={(event) => setContractEndDate(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="number" value={contractWorkload} onChange={(event) => setContractWorkload(Number(event.target.value) || 0)} placeholder="Charge %" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <button type="button" onClick={createContract} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 font-semibold text-white">Creer contrat</button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
            {workspace.filteredContracts.slice(0, 12).map((contract) => (
              <div key={contract.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
                {contract.contractCode} | {employeeById(contract.employeeId)?.employeeCode ?? contract.employeeId} | {contract.type} | {contract.status}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeView === 'overview' || activeView === 'payroll' ? (
        <Section title="Paie" description="Preparation paie, validation, paiement et suivi budgetaire.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7 text-sm">
            <select value={payrollEmployeeId} onChange={(event) => setPayrollEmployeeId(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
              {workspace.store.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.employeeCode}</option>)}
            </select>
            <input value={payrollPeriod} onChange={(event) => setPayrollPeriod(event.target.value)} placeholder="Periode YYYY-MM" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="number" value={payrollGross} onChange={(event) => setPayrollGross(Number(event.target.value) || 0)} placeholder="Brut" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="number" value={payrollAllowances} onChange={(event) => setPayrollAllowances(Number(event.target.value) || 0)} placeholder="Primes" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="number" value={payrollDeductions} onChange={(event) => setPayrollDeductions(Number(event.target.value) || 0)} placeholder="Retenues" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <button type="button" onClick={createPayroll} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 font-semibold text-white">Generer paie</button>
            <button type="button" onClick={() => HumanResourcesWorkspaceService.exportPayrollCsv()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 font-semibold text-[var(--srg-text-title)]">Export paie CSV</button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
            {workspace.filteredPayroll.slice(0, 12).map((payroll) => (
              <div key={payroll.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
                {payroll.period} | {employeeById(payroll.employeeId)?.employeeCode ?? payroll.employeeId} | net {payroll.net.toFixed(2)} | {payroll.status}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeView === 'overview' || activeView === 'attendance' ? (
        <Section title="Presences" description="Pointages journaliers, heures supplementaires et absences.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7 text-sm">
            <select value={attendanceEmployeeId} onChange={(event) => setAttendanceEmployeeId(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
              {workspace.store.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.employeeCode}</option>)}
            </select>
            <input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="number" value={attendanceRegular} onChange={(event) => setAttendanceRegular(Number(event.target.value) || 0)} placeholder="Heures normales" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="number" value={attendanceOvertime} onChange={(event) => setAttendanceOvertime(Number(event.target.value) || 0)} placeholder="Heures sup" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="number" value={attendanceAbsence} onChange={(event) => setAttendanceAbsence(Number(event.target.value) || 0)} placeholder="Absence" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <button type="button" onClick={createAttendance} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 font-semibold text-white">Ajouter presence</button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
            {workspace.store.attendance.slice(0, 12).map((record) => (
              <div key={record.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
                {record.date} | {employeeById(record.employeeId)?.employeeCode ?? record.employeeId} | {record.regularHours}h + {record.overtimeHours}h | absence {record.absenceHours}h
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeView === 'overview' || activeView === 'leaves' ? (
        <Section title="Conges" description="Demandes, validations, rejets et suivi des soldes.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7 text-sm">
            <select value={leaveEmployeeId} onChange={(event) => setLeaveEmployeeId(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
              {workspace.store.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.employeeCode}</option>)}
            </select>
            <select value={leaveType} onChange={(event) => setLeaveType(event.target.value as 'annual' | 'sick' | 'family' | 'training' | 'unpaid')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
              <option value="annual">annual</option>
              <option value="sick">sick</option>
              <option value="family">family</option>
              <option value="training">training</option>
              <option value="unpaid">unpaid</option>
            </select>
            <input type="date" value={leaveStart} onChange={(event) => setLeaveStart(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="date" value={leaveEnd} onChange={(event) => setLeaveEnd(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input value={leaveReason} onChange={(event) => setLeaveReason(event.target.value)} placeholder="Motif" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <button type="button" onClick={createLeave} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 font-semibold text-white">Demander conge</button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
            {workspace.filteredLeaves.slice(0, 12).map((leave) => (
              <div key={leave.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
                {employeeById(leave.employeeId)?.employeeCode ?? leave.employeeId} | {leave.leaveType} | {leave.startDate} {'->'} {leave.endDate} | {leave.status}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeView === 'overview' || activeView === 'skills' ? (
        <Section title="Competences" description="Matrice de competences, validation et plans de progression.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6 text-sm">
            <select value={skillEmployeeId} onChange={(event) => setSkillEmployeeId(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
              {workspace.store.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.employeeCode}</option>)}
            </select>
            <input value={skillName} onChange={(event) => setSkillName(event.target.value)} placeholder="Competence" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <select value={skillLevel} onChange={(event) => setSkillLevel(Number(event.target.value) as 1 | 2 | 3 | 4 | 5)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
            <button type="button" onClick={createSkill} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 font-semibold text-white">Ajouter competence</button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
            {workspace.store.skills.slice(0, 14).map((record) => (
              <div key={record.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
                {employeeById(record.employeeId)?.employeeCode ?? record.employeeId} | {record.skill} | level {record.level} | {record.source}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeView === 'overview' || activeView === 'trainings' ? (
        <Section title="Formations" description="Planification, participants, couts et avancement des formations.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7 text-sm">
            <input value={trainingTitle} onChange={(event) => setTrainingTitle(event.target.value)} placeholder="Titre formation" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input value={trainingProvider} onChange={(event) => setTrainingProvider(event.target.value)} placeholder="Organisme" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="date" value={trainingStart} onChange={(event) => setTrainingStart(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="date" value={trainingEnd} onChange={(event) => setTrainingEnd(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="number" value={trainingCost} onChange={(event) => setTrainingCost(Number(event.target.value) || 0)} placeholder="Cout" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input value={trainingParticipants} onChange={(event) => setTrainingParticipants(event.target.value)} placeholder="Codes employes (EMP-001,EMP-002)" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <button type="button" onClick={createTraining} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 font-semibold text-white">Programmer formation</button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
            {workspace.store.trainings.slice(0, 12).map((training) => (
              <div key={training.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
                {training.title} | {training.status} | participants {training.participants.length} | cost {training.cost.toFixed(2)}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeView === 'overview' || activeView === 'recruitment' ? (
        <Section title="Recrutement" description="Demandes de postes, pipeline candidats et decisions.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
            <input value={recruitmentPosition} onChange={(event) => setRecruitmentPosition(event.target.value)} placeholder="Poste" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input value={recruitmentDepartment} onChange={(event) => setRecruitmentDepartment(event.target.value)} placeholder="Departement" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="number" value={recruitmentCandidates} onChange={(event) => setRecruitmentCandidates(Number(event.target.value) || 0)} placeholder="Candidats" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <button type="button" onClick={createRecruitment} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 font-semibold text-white">Creer recrutement</button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
            {workspace.store.recruitments.slice(0, 12).map((recruitment) => (
              <div key={recruitment.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
                {recruitment.position} | {recruitment.department} | {recruitment.status} | candidats {recruitment.candidates}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeView === 'overview' || activeView === 'evaluations' ? (
        <Section title="Evaluations" description="Campagnes annuelles, score, potentiel et recommandations manageriales.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6 text-sm">
            <select value={evaluationEmployeeId} onChange={(event) => setEvaluationEmployeeId(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
              {workspace.store.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.employeeCode}</option>)}
            </select>
            <input value={evaluationPeriod} onChange={(event) => setEvaluationPeriod(event.target.value)} placeholder="Periode" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="number" step="0.1" value={evaluationScore} onChange={(event) => setEvaluationScore(Number(event.target.value) || 0)} placeholder="Score" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input type="number" step="0.1" value={evaluationPotential} onChange={(event) => setEvaluationPotential(Number(event.target.value) || 0)} placeholder="Potentiel" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <input value={evaluationRecommendation} onChange={(event) => setEvaluationRecommendation(event.target.value)} placeholder="Recommendation" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
            <button type="button" onClick={createEvaluation} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 font-semibold text-white">Ajouter evaluation</button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
            {workspace.store.evaluations.slice(0, 12).map((evaluation) => (
              <div key={evaluation.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
                {employeeById(evaluation.employeeId)?.employeeCode ?? evaluation.employeeId} | {evaluation.period} | score {evaluation.score.toFixed(1)} | potential {evaluation.potential.toFixed(1)}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Integrations 030-035" description="Reutilisation des composants existants: OCR/ZIP/search, policies, execution, procurement, maintenance et finance pour analyses RH.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6 text-sm">
          <input value={docQuery} onChange={(event) => setDocQuery(event.target.value)} placeholder="Query docs RH" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
          <button type="button" onClick={ingestDocuments} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 font-semibold text-[var(--srg-text-title)]">Indexer documents RH</button>
          <select value={aiProjectId} onChange={(event) => setAiProjectId(event.target.value)} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3">
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <input value={aiQuestion} onChange={(event) => setAiQuestion(event.target.value)} placeholder="Question IA RH" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3" />
          <button type="button" onClick={askAi} className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 font-semibold text-white">Analyser</button>
          <button type="button" onClick={() => HumanResourcesWorkspaceService.exportStore()} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 font-semibold text-[var(--srg-text-title)]">Export RH JSON</button>
        </div>
        {aiAnswer ? (
          <pre className="mt-3 whitespace-pre-wrap break-words rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 text-xs text-[var(--srg-text-muted)]">{aiAnswer}</pre>
        ) : null}
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">Timeline events: {workspace.summary.timeline}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">Diagnostics: {workspace.summary.diagnostics}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">Audit logs: {workspace.summary.auditLogs}</div>
          <div className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">Finance budget signal: {workspace.summary.budgetSignal.toFixed(2)}</div>
        </div>
      </Section>

      <Section title="Acces direct" description="Navigation rapide vers les autres workspaces lies a la chaine RH/Operations.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6 text-sm">
          <Link to="/knowledge-center" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-center font-semibold text-[var(--srg-text-title)]">Knowledge</Link>
          <Link to="/business-policy" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-center font-semibold text-[var(--srg-text-title)]">Business Policy</Link>
          <Link to="/project-execution" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-center font-semibold text-[var(--srg-text-title)]">Project Execution</Link>
          <Link to="/procurement-inventory" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-center font-semibold text-[var(--srg-text-title)]">Procurement</Link>
          <Link to="/maintenance" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-center font-semibold text-[var(--srg-text-title)]">Maintenance</Link>
          <Link to="/finance" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-center font-semibold text-[var(--srg-text-title)]">Finance</Link>
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
      <strong className="text-[var(--srg-text-title)]">{props.label}:</strong> {props.value}
    </div>
  )
}
