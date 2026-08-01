import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import Section from '#/app/components/Section'
import { useProjectExecutionWorkspace } from '#/app/hooks/useProjectExecutionWorkspace'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

export default function ProjectExecutionWorkspace() {
  const {
    store,
    summary,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    refresh,
    statuses,
    priorities,
    workItemTypes,
    planningKinds,
    materialCategories,
  } = useProjectExecutionWorkspace()

  const currentProject = selectedProject

  const [identifier, setIdentifier] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [client, setClient] = useState('')
  const [supplier, setSupplier] = useState('')
  const [contract, setContract] = useState('')
  const [projectManager, setProjectManager] = useState('')
  const [siteManager, setSiteManager] = useState('')
  const [owner, setOwner] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState(0)
  const [currency, setCurrency] = useState('EUR')
  const [status, setStatus] = useState<typeof statuses[number]>('draft')
  const [priority, setPriority] = useState<typeof priorities[number]>('medium')

  const [workType, setWorkType] = useState<typeof workItemTypes[number]>('lot')
  const [workTitle, setWorkTitle] = useState('')
  const [workBudget, setWorkBudget] = useState(0)
  const [workProgress, setWorkProgress] = useState(0)
  const [workOwner, setWorkOwner] = useState('')
  const [workDate, setWorkDate] = useState('')
  const [workComments, setWorkComments] = useState('')
  const [workParentId, setWorkParentId] = useState<string>('')

  const [planningKind, setPlanningKind] = useState<typeof planningKinds[number]>('gantt')
  const [planningLabel, setPlanningLabel] = useState('')
  const [planningStartDate, setPlanningStartDate] = useState('')
  const [planningEndDate, setPlanningEndDate] = useState('')
  const [planningProgress, setPlanningProgress] = useState(0)
  const [planningDelayedDays, setPlanningDelayedDays] = useState(0)
  const [planningDependencies, setPlanningDependencies] = useState('')

  const [siteName, setSiteName] = useState('')
  const [chantier, setChantier] = useState('')
  const [zone, setZone] = useState('')
  const [station, setStation] = useState('')
  const [sector, setSector] = useState('')
  const [building, setBuilding] = useState('')
  const [level, setLevel] = useState('')
  const [address, setAddress] = useState('')
  const [gps, setGps] = useState('')
  const [siteObservations, setSiteObservations] = useState('')

  const [teamName, setTeamName] = useState('')
  const [teamLead, setTeamLead] = useState('')
  const [teamTechnicians, setTeamTechnicians] = useState('')
  const [teamSkills, setTeamSkills] = useState('')
  const [teamAvailability, setTeamAvailability] = useState('weekdays')

  const [assignmentTechnician, setAssignmentTechnician] = useState('')
  const [assignmentTeamId, setAssignmentTeamId] = useState('')
  const [assignmentSiteId, setAssignmentSiteId] = useState('')
  const [assignmentWorkItemId, setAssignmentWorkItemId] = useState('')
  const [assignmentFromDate, setAssignmentFromDate] = useState('')
  const [assignmentToDate, setAssignmentToDate] = useState('')

  const [attendanceTechnician, setAttendanceTechnician] = useState('')
  const [attendanceDate, setAttendanceDate] = useState('')
  const [normalHours, setNormalHours] = useState(8)
  const [overtimeHours, setOvertimeHours] = useState(0)
  const [nightHours, setNightHours] = useState(0)
  const [weekendHours, setWeekendHours] = useState(0)
  const [holidayHours, setHolidayHours] = useState(0)
  const [travelHours, setTravelHours] = useState(0)
  const [absenceHours, setAbsenceHours] = useState(0)
  const [leaveHours, setLeaveHours] = useState(0)

  const [materialCategory, setMaterialCategory] = useState<typeof materialCategories[number]>('motor')
  const [materialReference, setMaterialReference] = useState('')
  const [materialSerialNumber, setMaterialSerialNumber] = useState('')
  const [materialManufacturer, setMaterialManufacturer] = useState('')
  const [materialPowerKw, setMaterialPowerKw] = useState(0)
  const [materialRpm, setMaterialRpm] = useState(0)
  const [materialVoltage, setMaterialVoltage] = useState(0)
  const [materialCurrent, setMaterialCurrent] = useState(0)
  const [materialInstallationDate, setMaterialInstallationDate] = useState('')
  const [materialStock, setMaterialStock] = useState(0)

  const [purchaseCode, setPurchaseCode] = useState('')
  const [purchaseItem, setPurchaseItem] = useState('')
  const [purchaseQuantity, setPurchaseQuantity] = useState(1)
  const [purchaseStatus, setPurchaseStatus] = useState<'requested' | 'validated' | 'ordered' | 'received' | 'returned'>('requested')
  const [purchaseSupplier, setPurchaseSupplier] = useState('')

  const [supplierName, setSupplierName] = useState('')
  const [supplierContacts, setSupplierContacts] = useState('')
  const [supplierLeadTimeDays, setSupplierLeadTimeDays] = useState(0)
  const [supplierOrderCount, setSupplierOrderCount] = useState(0)
  const [supplierOnTimeRate, setSupplierOnTimeRate] = useState(0)
  const [supplierPerformanceScore, setSupplierPerformanceScore] = useState(0)
  const [supplierHistory, setSupplierHistory] = useState('')

  const [contractCode, setContractCode] = useState('')
  const [contractTitle, setContractTitle] = useState('')
  const [contractSubcontracting, setContractSubcontracting] = useState('')
  const [contractAmendments, setContractAmendments] = useState('')
  const [contractWarranties, setContractWarranties] = useState('')
  const [contractPenalties, setContractPenalties] = useState('')
  const [contractClauses, setContractClauses] = useState('')
  const [contractDocuments, setContractDocuments] = useState('')
  const [contractRenewals, setContractRenewals] = useState('')
  const [contractDeadlines, setContractDeadlines] = useState('')

  const [plannedBudget, setPlannedBudget] = useState(0)
  const [consumedBudget, setConsumedBudget] = useState(0)
  const [actualCost, setActualCost] = useState(0)
  const [forecastCost, setForecastCost] = useState(0)
  const [margin, setMargin] = useState(0)
  const [remainingCommitment, setRemainingCommitment] = useState(0)
  const [invoiced, setInvoiced] = useState(0)
  const [paid, setPaid] = useState(0)
  const [collected, setCollected] = useState(0)

  const [riskType, setRiskType] = useState<'risk' | 'incident' | 'non-conformity' | 'delay'>('risk')
  const [riskTitle, setRiskTitle] = useState('')
  const [riskSeverity, setRiskSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [riskCorrectiveAction, setRiskCorrectiveAction] = useState('')
  const [riskStatus, setRiskStatus] = useState<'open' | 'in-progress' | 'closed'>('open')

  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'minutes' | 'meeting-pv'>('daily')
  const [reportTitle, setReportTitle] = useState('')
  const [reportSummary, setReportSummary] = useState('')
  const [reportPhotos, setReportPhotos] = useState('')
  const [reportDocuments, setReportDocuments] = useState('')

  const [aiQuestion, setAiQuestion] = useState('Pourquoi le chantier est-il en retard ?')
  const [aiAnswer, setAiAnswer] = useState('')

  const [selectedTimelineProjectId, setSelectedTimelineProjectId] = useState(selectedProjectId)

  const workItemsForProject = useMemo(
    () => store.workItems.filter((item) => item.projectId === selectedProjectId),
    [store.workItems, selectedProjectId],
  )
  const planningForProject = useMemo(
    () => store.planning.filter((item) => item.projectId === selectedProjectId),
    [store.planning, selectedProjectId],
  )
  const sitesForProject = useMemo(
    () => store.sites.filter((item) => item.projectId === selectedProjectId),
    [store.sites, selectedProjectId],
  )
  const teamsForProject = useMemo(
    () => store.teams.filter((item) => item.projectId === selectedProjectId),
    [store.teams, selectedProjectId],
  )
  const assignmentsForProject = useMemo(
    () => store.assignments.filter((item) => item.projectId === selectedProjectId),
    [store.assignments, selectedProjectId],
  )
  const attendanceForProject = useMemo(
    () => store.attendance.filter((item) => item.projectId === selectedProjectId),
    [store.attendance, selectedProjectId],
  )
  const materialsForProject = useMemo(
    () => store.materials.filter((item) => item.projectId === selectedProjectId),
    [store.materials, selectedProjectId],
  )
  const purchasesForProject = useMemo(
    () => store.purchases.filter((item) => item.projectId === selectedProjectId),
    [store.purchases, selectedProjectId],
  )
  const contractsForProject = useMemo(
    () => store.contracts.filter((item) => item.projectId === selectedProjectId),
    [store.contracts, selectedProjectId],
  )
  const financialForProject = useMemo(
    () => store.financial.find((item) => item.projectId === selectedProjectId) ?? null,
    [store.financial, selectedProjectId],
  )
  const risksForProject = useMemo(
    () => store.risks.filter((item) => item.projectId === selectedProjectId),
    [store.risks, selectedProjectId],
  )
  const reportsForProject = useMemo(
    () => store.reports.filter((item) => item.projectId === selectedProjectId),
    [store.reports, selectedProjectId],
  )

  const timelineForProject = useMemo(
    () => store.timeline.filter((item) => item.projectId === selectedTimelineProjectId).slice(0, 24),
    [store.timeline, selectedTimelineProjectId],
  )
  const diagnosticsForProject = useMemo(
    () => store.diagnostics.filter((item) => item.projectId === selectedTimelineProjectId).slice(0, 20),
    [store.diagnostics, selectedTimelineProjectId],
  )
  const metricsForProject = useMemo(
    () => store.metrics.filter((item) => item.projectId === selectedTimelineProjectId).slice(0, 30),
    [store.metrics, selectedTimelineProjectId],
  )

  const createProject = () => {
    const created = ProjectExecutionWorkspaceService.createProject({
      identifier,
      name,
      description,
      client,
      supplier,
      contract,
      projectManager,
      siteManager,
      owner,
      startDate,
      endDate,
      budget,
      currency,
      status,
      priority,
    })
    setSelectedProjectId(created.id)
    setSelectedTimelineProjectId(created.id)
    setIdentifier('')
    setName('')
    setDescription('')
    setClient('')
    setSupplier('')
    setContract('')
    setProjectManager('')
    setSiteManager('')
    setOwner('')
    setStartDate('')
    setEndDate('')
    setBudget(0)
    setCurrency('EUR')
    setStatus('draft')
    setPriority('medium')
    refresh()
  }

  const addWorkItem = () => {
    if (!selectedProjectId) return
    ProjectExecutionWorkspaceService.addWorkItem({
      projectId: selectedProjectId,
      type: workType,
      parentId: workParentId || null,
      title: workTitle,
      budget: workBudget,
      progress: workProgress,
      owner: workOwner,
      date: workDate,
      comments: workComments,
    })
    setWorkTitle('')
    setWorkBudget(0)
    setWorkProgress(0)
    setWorkOwner('')
    setWorkDate('')
    setWorkComments('')
    setWorkParentId('')
    refresh()
  }

  const addPlanning = () => {
    if (!selectedProjectId) return
    ProjectExecutionWorkspaceService.addPlanningEntry({
      projectId: selectedProjectId,
      kind: planningKind,
      label: planningLabel,
      startDate: planningStartDate,
      endDate: planningEndDate,
      progress: planningProgress,
      delayedDays: planningDelayedDays,
      dependencies: splitCsv(planningDependencies),
    })
    setPlanningLabel('')
    setPlanningStartDate('')
    setPlanningEndDate('')
    setPlanningProgress(0)
    setPlanningDelayedDays(0)
    setPlanningDependencies('')
    refresh()
  }

  const addSite = () => {
    if (!selectedProjectId) return
    ProjectExecutionWorkspaceService.addSite({
      projectId: selectedProjectId,
      site: siteName,
      chantier,
      zone,
      station,
      sector,
      building,
      level,
      address,
      gps,
      observations: siteObservations,
    })
    setSiteName('')
    setChantier('')
    setZone('')
    setStation('')
    setSector('')
    setBuilding('')
    setLevel('')
    setAddress('')
    setGps('')
    setSiteObservations('')
    refresh()
  }

  const addTeam = () => {
    if (!selectedProjectId) return
    ProjectExecutionWorkspaceService.addTeam({
      projectId: selectedProjectId,
      name: teamName,
      lead: teamLead,
      technicians: splitCsv(teamTechnicians),
      skills: splitCsv(teamSkills),
      availability: teamAvailability,
    })
    setTeamName('')
    setTeamLead('')
    setTeamTechnicians('')
    setTeamSkills('')
    setTeamAvailability('weekdays')
    refresh()
  }

  const addAssignment = () => {
    if (!selectedProjectId) return
    ProjectExecutionWorkspaceService.addAssignment({
      projectId: selectedProjectId,
      technician: assignmentTechnician,
      teamId: assignmentTeamId,
      siteId: assignmentSiteId,
      workItemId: assignmentWorkItemId,
      fromDate: assignmentFromDate,
      toDate: assignmentToDate,
    })
    setAssignmentTechnician('')
    setAssignmentTeamId('')
    setAssignmentSiteId('')
    setAssignmentWorkItemId('')
    setAssignmentFromDate('')
    setAssignmentToDate('')
    refresh()
  }

  const addAttendance = () => {
    if (!selectedProjectId) return
    ProjectExecutionWorkspaceService.addAttendance({
      projectId: selectedProjectId,
      technician: attendanceTechnician,
      date: attendanceDate,
      normalHours,
      overtimeHours,
      nightHours,
      weekendHours,
      holidayHours,
      travelHours,
      absenceHours,
      leaveHours,
    })
    setAttendanceTechnician('')
    setAttendanceDate('')
    setNormalHours(8)
    setOvertimeHours(0)
    setNightHours(0)
    setWeekendHours(0)
    setHolidayHours(0)
    setTravelHours(0)
    setAbsenceHours(0)
    setLeaveHours(0)
    refresh()
  }

  const addMaterial = () => {
    if (!selectedProjectId) return
    ProjectExecutionWorkspaceService.addMaterial({
      projectId: selectedProjectId,
      category: materialCategory,
      reference: materialReference,
      serialNumber: materialSerialNumber,
      manufacturer: materialManufacturer,
      powerKw: materialPowerKw,
      rpm: materialRpm,
      voltage: materialVoltage,
      current: materialCurrent,
      installationDate: materialInstallationDate,
      stock: materialStock,
    })
    setMaterialReference('')
    setMaterialSerialNumber('')
    setMaterialManufacturer('')
    setMaterialPowerKw(0)
    setMaterialRpm(0)
    setMaterialVoltage(0)
    setMaterialCurrent(0)
    setMaterialInstallationDate('')
    setMaterialStock(0)
    refresh()
  }

  const addPurchase = () => {
    if (!selectedProjectId) return
    ProjectExecutionWorkspaceService.addPurchase({
      projectId: selectedProjectId,
      requestCode: purchaseCode,
      item: purchaseItem,
      quantity: purchaseQuantity,
      status: purchaseStatus,
      supplier: purchaseSupplier,
    })
    setPurchaseCode('')
    setPurchaseItem('')
    setPurchaseQuantity(1)
    setPurchaseStatus('requested')
    setPurchaseSupplier('')
    refresh()
  }

  const addSupplier = () => {
    ProjectExecutionWorkspaceService.addSupplier({
      name: supplierName,
      contacts: splitCsv(supplierContacts),
      leadTimeDays: supplierLeadTimeDays,
      orderCount: supplierOrderCount,
      onTimeRate: supplierOnTimeRate,
      performanceScore: supplierPerformanceScore,
      history: splitCsv(supplierHistory),
    })
    setSupplierName('')
    setSupplierContacts('')
    setSupplierLeadTimeDays(0)
    setSupplierOrderCount(0)
    setSupplierOnTimeRate(0)
    setSupplierPerformanceScore(0)
    setSupplierHistory('')
    refresh()
  }

  const addContract = () => {
    if (!selectedProjectId) return
    ProjectExecutionWorkspaceService.addContract({
      projectId: selectedProjectId,
      code: contractCode,
      title: contractTitle,
      subcontracting: splitCsv(contractSubcontracting),
      amendments: splitCsv(contractAmendments),
      warranties: splitCsv(contractWarranties),
      penalties: splitCsv(contractPenalties),
      clauses: splitCsv(contractClauses),
      documents: splitCsv(contractDocuments),
      renewals: splitCsv(contractRenewals),
      deadlines: splitCsv(contractDeadlines),
    })
    setContractCode('')
    setContractTitle('')
    setContractSubcontracting('')
    setContractAmendments('')
    setContractWarranties('')
    setContractPenalties('')
    setContractClauses('')
    setContractDocuments('')
    setContractRenewals('')
    setContractDeadlines('')
    refresh()
  }

  const saveFinancial = () => {
    if (!selectedProjectId) return
    ProjectExecutionWorkspaceService.upsertFinancial({
      projectId: selectedProjectId,
      plannedBudget,
      consumedBudget,
      actualCost,
      forecastCost,
      margin,
      remainingCommitment,
      invoiced,
      paid,
      collected,
    })
    refresh()
  }

  const addRisk = () => {
    if (!selectedProjectId) return
    ProjectExecutionWorkspaceService.addRisk({
      projectId: selectedProjectId,
      type: riskType,
      title: riskTitle,
      severity: riskSeverity,
      correctiveAction: riskCorrectiveAction,
      status: riskStatus,
    })
    setRiskTitle('')
    setRiskCorrectiveAction('')
    setRiskStatus('open')
    refresh()
  }

  const addReport = () => {
    if (!selectedProjectId) return
    ProjectExecutionWorkspaceService.addReport({
      projectId: selectedProjectId,
      type: reportType,
      title: reportTitle,
      summary: reportSummary,
      photos: splitCsv(reportPhotos),
      documents: splitCsv(reportDocuments),
    })
    setReportTitle('')
    setReportSummary('')
    setReportPhotos('')
    setReportDocuments('')
    refresh()
  }

  const runAi = () => {
    if (!selectedProjectId) return
    const insight = ProjectExecutionWorkspaceService.askProjectAi(selectedProjectId, aiQuestion)
    setAiAnswer(`${insight.answer}\n\nConfidence: ${insight.confidence.toFixed(2)}\nReferences: ${insight.references.join(', ')}`)
    refresh()
  }

  const syncDocuments = () => {
    if (!selectedProjectId) return
    const linked = ProjectExecutionWorkspaceService.syncProjectDocuments(selectedProjectId)
    setAiAnswer(`Linked ${linked.length} project documents from Prompt 030 knowledge store.`)
    refresh()
  }

  const closeProject = () => {
    if (!selectedProjectId) return
    ProjectExecutionWorkspaceService.closeProject(selectedProjectId)
    refresh()
  }

  const docView = selectedProjectId ? ProjectExecutionWorkspaceService.getProjectDocumentView(selectedProjectId) : { linkedIds: [], linkedDocuments: [] }
  const policyContext = ProjectExecutionWorkspaceService.getBusinessPolicyContext()

  return (
    <div className="space-y-6">
      <Section title="Project Execution Dashboard" description="KPI global for projects, budget, progress, delays, incidents, risks and top actors.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Projects</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.projects}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Total budget</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.totalBudget.toFixed(2)}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Consumed</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.consumedBudget.toFixed(2)}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Progress</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.progress.toFixed(1)}%</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Delays</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.delays}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Open risks</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.risks}</p></div>
        </div>
      </Section>

      <Section title="Project Workspace" description="Project signature-to-closure records with contract, ownership, schedule, budget and status.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <label className="grid gap-1">Project selector
            <select aria-label="Select project" value={selectedProjectId} onChange={(event) => { setSelectedProjectId(event.target.value); setSelectedTimelineProjectId(event.target.value) }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
              {store.projects.map((item) => <option key={item.id} value={item.id}>{item.identifier} - {item.name}</option>)}
            </select>
          </label>
          <input aria-label="Project identifier" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Identifier" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input aria-label="Project name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input aria-label="Project description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input aria-label="Client" value={client} onChange={(event) => setClient(event.target.value)} placeholder="Client" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input aria-label="Supplier" value={supplier} onChange={(event) => setSupplier(event.target.value)} placeholder="Supplier" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input aria-label="Contract" value={contract} onChange={(event) => setContract(event.target.value)} placeholder="Contract" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input aria-label="Project manager" value={projectManager} onChange={(event) => setProjectManager(event.target.value)} placeholder="Project manager" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input aria-label="Site manager" value={siteManager} onChange={(event) => setSiteManager(event.target.value)} placeholder="Site manager" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input aria-label="Owner" value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Owner" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input aria-label="Start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input aria-label="End date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input aria-label="Budget" type="number" value={budget} onChange={(event) => setBudget(Number(event.target.value) || 0)} placeholder="Budget" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input aria-label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value)} placeholder="Currency" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <select aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value as typeof statuses[number])} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select aria-label="Priority" value={priority} onChange={(event) => setPriority(event.target.value as typeof priorities[number])} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">{priorities.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <button type="button" onClick={createProject} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Create project</button>
          <button type="button" onClick={closeProject} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-semibold text-[var(--sea-ink)]">Close project</button>
        </div>
        <p className="mt-3 text-xs text-[var(--sea-ink-soft)]">Current project: {currentProject.identifier} | {currentProject.status} | {currentProject.priority}</p>
      </Section>

      <Section title="Lots and Planning" description="Lots, sub-lots, phases, milestones, deliverables, calendar, Gantt, weekly/daily planning, delays and dependencies.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 text-sm">
          <select value={workType} onChange={(event) => setWorkType(event.target.value as typeof workItemTypes[number])} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">{workItemTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={workParentId} onChange={(event) => setWorkParentId(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2"><option value="">No parent</option>{workItemsForProject.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
          <input value={workTitle} onChange={(event) => setWorkTitle(event.target.value)} placeholder="Title" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={workBudget} onChange={(event) => setWorkBudget(Number(event.target.value) || 0)} placeholder="Budget" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={workProgress} onChange={(event) => setWorkProgress(Number(event.target.value) || 0)} placeholder="Progress" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={workOwner} onChange={(event) => setWorkOwner(event.target.value)} placeholder="Owner" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={workComments} onChange={(event) => setWorkComments(event.target.value)} placeholder="Comments" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <button type="button" onClick={addWorkItem} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Add work item</button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <select value={planningKind} onChange={(event) => setPlanningKind(event.target.value as typeof planningKinds[number])} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">{planningKinds.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <input value={planningLabel} onChange={(event) => setPlanningLabel(event.target.value)} placeholder="Planning label" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="date" value={planningStartDate} onChange={(event) => setPlanningStartDate(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="date" value={planningEndDate} onChange={(event) => setPlanningEndDate(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={planningProgress} onChange={(event) => setPlanningProgress(Number(event.target.value) || 0)} placeholder="Progress" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={planningDelayedDays} onChange={(event) => setPlanningDelayedDays(Number(event.target.value) || 0)} placeholder="Delay days" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={planningDependencies} onChange={(event) => setPlanningDependencies(event.target.value)} placeholder="Dependencies (comma ids)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 sm:col-span-2 xl:col-span-3" />
          <button type="button" onClick={addPlanning} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Add planning</button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2 text-xs text-[var(--sea-ink-soft)]">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Work breakdown</p>{workItemsForProject.slice(0, 12).map((item) => <p key={item.id}>{item.type} | {item.title} | {item.progress}% | {item.owner}</p>)}</div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Gantt/Planning</p>{planningForProject.slice(0, 12).map((item) => <p key={item.id}>{item.kind} | {item.label} | {item.startDate} {'->'} {item.endDate} | delay {item.delayedDays}d | critical path placeholder {item.criticalPathPlaceholder ? 'yes' : 'no'}</p>)}</div>
        </div>
      </Section>

      <Section title="Sites, Teams and Time Tracking" description="Sites, chantiers, zones, teams, assignments, attendance and pointage details.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 text-sm">
          <input value={siteName} onChange={(event) => setSiteName(event.target.value)} placeholder="Site" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={chantier} onChange={(event) => setChantier(event.target.value)} placeholder="Chantier" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={zone} onChange={(event) => setZone(event.target.value)} placeholder="Zone" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={station} onChange={(event) => setStation(event.target.value)} placeholder="Station/Poste" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={sector} onChange={(event) => setSector(event.target.value)} placeholder="Sector" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={building} onChange={(event) => setBuilding(event.target.value)} placeholder="Building" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={level} onChange={(event) => setLevel(event.target.value)} placeholder="Level" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Address" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={gps} onChange={(event) => setGps(event.target.value)} placeholder="GPS" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={siteObservations} onChange={(event) => setSiteObservations(event.target.value)} placeholder="Observations" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <button type="button" onClick={addSite} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Add site</button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5 text-sm">
          <input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Team name" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={teamLead} onChange={(event) => setTeamLead(event.target.value)} placeholder="Team lead" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={teamTechnicians} onChange={(event) => setTeamTechnicians(event.target.value)} placeholder="Technicians (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={teamSkills} onChange={(event) => setTeamSkills(event.target.value)} placeholder="Skills (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={teamAvailability} onChange={(event) => setTeamAvailability(event.target.value)} placeholder="Availability" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <button type="button" onClick={addTeam} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Add team</button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <input value={assignmentTechnician} onChange={(event) => setAssignmentTechnician(event.target.value)} placeholder="Technician" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <select value={assignmentTeamId} onChange={(event) => setAssignmentTeamId(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2"><option value="">Team</option>{teamsForProject.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <select value={assignmentSiteId} onChange={(event) => setAssignmentSiteId(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2"><option value="">Site</option>{sitesForProject.map((item) => <option key={item.id} value={item.id}>{item.site}</option>)}</select>
          <select value={assignmentWorkItemId} onChange={(event) => setAssignmentWorkItemId(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2"><option value="">Work item</option>{workItemsForProject.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
          <input type="date" value={assignmentFromDate} onChange={(event) => setAssignmentFromDate(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="date" value={assignmentToDate} onChange={(event) => setAssignmentToDate(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <button type="button" onClick={addAssignment} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Assign technician</button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5 text-sm">
          <input value={attendanceTechnician} onChange={(event) => setAttendanceTechnician(event.target.value)} placeholder="Technician" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={normalHours} onChange={(event) => setNormalHours(Number(event.target.value) || 0)} placeholder="Normal" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={overtimeHours} onChange={(event) => setOvertimeHours(Number(event.target.value) || 0)} placeholder="Overtime" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={nightHours} onChange={(event) => setNightHours(Number(event.target.value) || 0)} placeholder="Night" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={weekendHours} onChange={(event) => setWeekendHours(Number(event.target.value) || 0)} placeholder="Weekend" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={holidayHours} onChange={(event) => setHolidayHours(Number(event.target.value) || 0)} placeholder="Holiday" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={travelHours} onChange={(event) => setTravelHours(Number(event.target.value) || 0)} placeholder="Travel" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={absenceHours} onChange={(event) => setAbsenceHours(Number(event.target.value) || 0)} placeholder="Absence" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={leaveHours} onChange={(event) => setLeaveHours(Number(event.target.value) || 0)} placeholder="Leave" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <button type="button" onClick={addAttendance} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Add pointage</button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2 text-xs text-[var(--sea-ink-soft)]">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Sites and teams</p>{sitesForProject.slice(0, 8).map((item) => <p key={item.id}>{item.site} | {item.chantier} | {item.address}</p>)}{teamsForProject.slice(0, 8).map((item) => <p key={item.id}>{item.name} | lead {item.lead} | skills {item.skills.join(' / ')}</p>)}</div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Assignments and attendance</p>{assignmentsForProject.slice(0, 8).map((item) => <p key={item.id}>{item.technician} | {item.fromDate} {'->'} {item.toDate}</p>)}{attendanceForProject.slice(0, 10).map((item) => <p key={item.id}>{item.technician} | N {item.normalHours} | OT {item.overtimeHours} | night {item.nightHours} | wk {item.weekendHours}</p>)}</div>
        </div>
      </Section>

      <Section title="Materials, Purchases, Suppliers and Contracts" description="Industrial equipment library, procurement flow, supplier performance and contract management.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <select value={materialCategory} onChange={(event) => setMaterialCategory(event.target.value as typeof materialCategories[number])} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">{materialCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <input value={materialReference} onChange={(event) => setMaterialReference(event.target.value)} placeholder="Reference" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={materialSerialNumber} onChange={(event) => setMaterialSerialNumber(event.target.value)} placeholder="Serial" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={materialManufacturer} onChange={(event) => setMaterialManufacturer(event.target.value)} placeholder="Manufacturer" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={materialPowerKw} onChange={(event) => setMaterialPowerKw(Number(event.target.value) || 0)} placeholder="kW" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={materialRpm} onChange={(event) => setMaterialRpm(Number(event.target.value) || 0)} placeholder="RPM" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={materialVoltage} onChange={(event) => setMaterialVoltage(Number(event.target.value) || 0)} placeholder="Voltage" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={materialCurrent} onChange={(event) => setMaterialCurrent(Number(event.target.value) || 0)} placeholder="Current" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="date" value={materialInstallationDate} onChange={(event) => setMaterialInstallationDate(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={materialStock} onChange={(event) => setMaterialStock(Number(event.target.value) || 0)} placeholder="Stock" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <button type="button" onClick={addMaterial} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Add material</button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <input value={purchaseCode} onChange={(event) => setPurchaseCode(event.target.value)} placeholder="Purchase request code" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={purchaseItem} onChange={(event) => setPurchaseItem(event.target.value)} placeholder="Item" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={purchaseQuantity} onChange={(event) => setPurchaseQuantity(Number(event.target.value) || 0)} placeholder="Qty" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <select value={purchaseStatus} onChange={(event) => setPurchaseStatus(event.target.value as 'requested' | 'validated' | 'ordered' | 'received' | 'returned')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
            {['requested', 'validated', 'ordered', 'received', 'returned'].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input value={purchaseSupplier} onChange={(event) => setPurchaseSupplier(event.target.value)} placeholder="Supplier" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <button type="button" onClick={addPurchase} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Add purchase</button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <input value={supplierName} onChange={(event) => setSupplierName(event.target.value)} placeholder="Supplier name" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={supplierContacts} onChange={(event) => setSupplierContacts(event.target.value)} placeholder="Contacts (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={supplierLeadTimeDays} onChange={(event) => setSupplierLeadTimeDays(Number(event.target.value) || 0)} placeholder="Lead time days" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={supplierOrderCount} onChange={(event) => setSupplierOrderCount(Number(event.target.value) || 0)} placeholder="Orders" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={supplierOnTimeRate} onChange={(event) => setSupplierOnTimeRate(Number(event.target.value) || 0)} placeholder="On-time %" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={supplierPerformanceScore} onChange={(event) => setSupplierPerformanceScore(Number(event.target.value) || 0)} placeholder="Performance" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={supplierHistory} onChange={(event) => setSupplierHistory(event.target.value)} placeholder="History (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 sm:col-span-2 xl:col-span-4" />
          <button type="button" onClick={addSupplier} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Add supplier</button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <input value={contractCode} onChange={(event) => setContractCode(event.target.value)} placeholder="Contract code" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={contractTitle} onChange={(event) => setContractTitle(event.target.value)} placeholder="Contract title" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={contractSubcontracting} onChange={(event) => setContractSubcontracting(event.target.value)} placeholder="Subcontracting (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={contractAmendments} onChange={(event) => setContractAmendments(event.target.value)} placeholder="Amendments (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={contractWarranties} onChange={(event) => setContractWarranties(event.target.value)} placeholder="Warranties (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={contractPenalties} onChange={(event) => setContractPenalties(event.target.value)} placeholder="Penalties (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={contractClauses} onChange={(event) => setContractClauses(event.target.value)} placeholder="Clauses (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={contractDocuments} onChange={(event) => setContractDocuments(event.target.value)} placeholder="Documents (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={contractRenewals} onChange={(event) => setContractRenewals(event.target.value)} placeholder="Renewals (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={contractDeadlines} onChange={(event) => setContractDeadlines(event.target.value)} placeholder="Deadlines (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <button type="button" onClick={addContract} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Add contract</button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2 text-xs text-[var(--sea-ink-soft)]">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Materials and purchases</p>{materialsForProject.slice(0, 8).map((item) => <p key={item.id}>{item.category} | {item.reference} | stock {item.stock} | {item.powerKw}kW | {item.rpm}rpm</p>)}{purchasesForProject.slice(0, 8).map((item) => <p key={item.id}>{item.requestCode} | {item.item} | {item.status} | {item.supplier}</p>)}</div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Suppliers and contracts</p>{store.suppliers.slice(0, 8).map((item) => <p key={item.id}>{item.name} | score {item.performanceScore} | on-time {item.onTimeRate}%</p>)}{contractsForProject.slice(0, 8).map((item) => <p key={item.id}>{item.code} | {item.title} | clauses {item.clauses.length}</p>)}</div>
        </div>
      </Section>

      <Section title="Financial Tracking, Risks and Reports" description="Budget plan/consumption, forecast/margin, incidents and reports.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 text-sm">
          <input type="number" value={plannedBudget} onChange={(event) => setPlannedBudget(Number(event.target.value) || 0)} placeholder="Planned budget" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={consumedBudget} onChange={(event) => setConsumedBudget(Number(event.target.value) || 0)} placeholder="Consumed budget" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={actualCost} onChange={(event) => setActualCost(Number(event.target.value) || 0)} placeholder="Actual cost" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={forecastCost} onChange={(event) => setForecastCost(Number(event.target.value) || 0)} placeholder="Forecast cost" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={margin} onChange={(event) => setMargin(Number(event.target.value) || 0)} placeholder="Margin %" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={remainingCommitment} onChange={(event) => setRemainingCommitment(Number(event.target.value) || 0)} placeholder="Remaining commitment" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={invoiced} onChange={(event) => setInvoiced(Number(event.target.value) || 0)} placeholder="Invoiced" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={paid} onChange={(event) => setPaid(Number(event.target.value) || 0)} placeholder="Paid" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={collected} onChange={(event) => setCollected(Number(event.target.value) || 0)} placeholder="Collected" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <button type="button" onClick={saveFinancial} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Save financial</button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <select value={riskType} onChange={(event) => setRiskType(event.target.value as 'risk' | 'incident' | 'non-conformity' | 'delay')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">{['risk', 'incident', 'non-conformity', 'delay'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <input value={riskTitle} onChange={(event) => setRiskTitle(event.target.value)} placeholder="Risk title" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <select value={riskSeverity} onChange={(event) => setRiskSeverity(event.target.value as 'low' | 'medium' | 'high' | 'critical')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">{['low', 'medium', 'high', 'critical'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <input value={riskCorrectiveAction} onChange={(event) => setRiskCorrectiveAction(event.target.value)} placeholder="Corrective action" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <select value={riskStatus} onChange={(event) => setRiskStatus(event.target.value as 'open' | 'in-progress' | 'closed')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">{['open', 'in-progress', 'closed'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <button type="button" onClick={addRisk} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Add risk/incident</button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <select value={reportType} onChange={(event) => setReportType(event.target.value as 'daily' | 'weekly' | 'monthly' | 'minutes' | 'meeting-pv')} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">{['daily', 'weekly', 'monthly', 'minutes', 'meeting-pv'].map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <input value={reportTitle} onChange={(event) => setReportTitle(event.target.value)} placeholder="Report title" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={reportSummary} onChange={(event) => setReportSummary(event.target.value)} placeholder="Summary" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={reportPhotos} onChange={(event) => setReportPhotos(event.target.value)} placeholder="Photos (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={reportDocuments} onChange={(event) => setReportDocuments(event.target.value)} placeholder="Documents (comma)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <button type="button" onClick={addReport} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Add report</button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3 text-xs text-[var(--sea-ink-soft)]">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Financial</p>{financialForProject ? <><p>Planned: {financialForProject.plannedBudget.toFixed(2)}</p><p>Consumed: {financialForProject.consumedBudget.toFixed(2)}</p><p>Actual: {financialForProject.actualCost.toFixed(2)}</p><p>Forecast: {financialForProject.forecastCost.toFixed(2)}</p><p>Margin: {financialForProject.margin.toFixed(2)}%</p></> : <p>No financial snapshot yet.</p>}</div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Risks</p>{risksForProject.slice(0, 8).map((item) => <p key={item.id}>{item.type} | {item.severity} | {item.status} | {item.title}</p>)}</div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Reports</p>{reportsForProject.slice(0, 8).map((item) => <p key={item.id}>{item.type} | {item.title}</p>)}</div>
        </div>
      </Section>

      <Section title="Project AI, Documents and Business Policy Integration" description="Answers project questions, links Prompt 030 documents and reuses Prompt 031 business policy coefficients.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <input value={aiQuestion} onChange={(event) => setAiQuestion(event.target.value)} placeholder="Ask project AI" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 sm:col-span-2 xl:col-span-3" />
          <button type="button" onClick={runAi} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Run AI project analysis</button>
          <button type="button" onClick={syncDocuments} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-semibold text-[var(--sea-ink)]">Sync Prompt 030 documents</button>
          <button type="button" onClick={() => ProjectExecutionWorkspaceService.exportPlanningCsv(selectedProjectId)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-semibold text-[var(--sea-ink)]">Export planning CSV</button>
          <button type="button" onClick={() => ProjectExecutionWorkspaceService.exportStore()} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-semibold text-[var(--sea-ink)]">Export workspace JSON</button>
          <Link to="/knowledge-center" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-semibold text-[var(--sea-ink)]">Open Prompt 030 workspace</Link>
          <Link to="/business-policy" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-semibold text-[var(--sea-ink)]">Open Prompt 031 workspace</Link>
          <Link to="/devis" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-semibold text-[var(--sea-ink)]">Open Devis workspace</Link>
        </div>
        <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-xs text-[var(--sea-ink-soft)]">{aiAnswer || 'No AI answer yet.'}</pre>
        <div className="mt-3 grid gap-3 lg:grid-cols-2 text-xs text-[var(--sea-ink-soft)]">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Linked project documents</p><p>Linked IDs: {docView.linkedIds.length}</p>{docView.linkedDocuments.slice(0, 8).map((item) => <p key={item.id}>{item.title} | {item.documentType} | {item.source}</p>)}</div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Prompt 031 policy context</p><p>Policies: {policyContext.summary.policies}</p><p>Coefficients: {policyContext.summary.coefficients}</p><p>Labor roles: {policyContext.summary.laborRoles}</p><p>Quotes: {policyContext.summary.quotes}</p><p>Billing docs: {policyContext.summary.billingDocuments}</p></div>
        </div>
      </Section>

      <Section title="Observability" description="Timeline, events, diagnostics, metrics, history and simple charts for project execution.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <select value={selectedTimelineProjectId} onChange={(event) => setSelectedTimelineProjectId(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">{store.projects.map((item) => <option key={item.id} value={item.id}>{item.identifier}</option>)}</select>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">Timeline events: {timelineForProject.length}</div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">Diagnostics: {diagnosticsForProject.length}</div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">Metrics: {metricsForProject.length}</div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3 text-xs text-[var(--sea-ink-soft)]">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Timeline</p>{timelineForProject.map((item) => <p key={item.id}>{item.eventType} | {item.title} | {new Date(item.createdAt).toLocaleString()}</p>)}</div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Diagnostics</p>{diagnosticsForProject.map((item) => <p key={item.id}>{item.level} | {item.category} | {item.message}</p>)}</div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"><p className="font-semibold text-[var(--sea-ink)]">Metrics</p>{metricsForProject.map((item) => <p key={item.id}>{item.label} | {item.value}</p>)}</div>
        </div>
      </Section>
    </div>
  )
}
