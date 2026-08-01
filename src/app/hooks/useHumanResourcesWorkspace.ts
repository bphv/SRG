import { useEffect, useMemo, useState } from 'react'
import { HumanResourcesWorkspaceService } from '#/app/services/HumanResourcesWorkspaceService'
import type { ContractStatus, EmployeeStatus, LeaveStatus, PayrollStatus } from '#/app/services/HumanResourcesWorkspaceService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export function useHumanResourcesWorkspace() {
  const [tick, setTick] = useState(0)
  const preferences = WorkspacePreferencesService.getPreferences()
  const persisted = (preferences.filters.humanResources as Record<string, string | undefined> | undefined) || {}

  const [selectedProjectId, setSelectedProjectId] = useState(persisted.selectedProjectId ?? 'all')
  const [search, setSearch] = useState(persisted.search ?? '')
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState<'all' | EmployeeStatus>(
    persisted.employeeStatusFilter && persisted.employeeStatusFilter !== 'all'
      ? (persisted.employeeStatusFilter as EmployeeStatus)
      : 'all',
  )
  const [contractStatusFilter, setContractStatusFilter] = useState<'all' | ContractStatus>(
    persisted.contractStatusFilter && persisted.contractStatusFilter !== 'all'
      ? (persisted.contractStatusFilter as ContractStatus)
      : 'all',
  )
  const [payrollStatusFilter, setPayrollStatusFilter] = useState<'all' | PayrollStatus>(
    persisted.payrollStatusFilter && persisted.payrollStatusFilter !== 'all'
      ? (persisted.payrollStatusFilter as PayrollStatus)
      : 'all',
  )
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<'all' | LeaveStatus>(
    persisted.leaveStatusFilter && persisted.leaveStatusFilter !== 'all'
      ? (persisted.leaveStatusFilter as LeaveStatus)
      : 'all',
  )

  const refresh = () => setTick((value) => value + 1)

  useEffect(() => {
    WorkspacePreferencesService.setFilters('humanResources', {
      selectedProjectId,
      search,
      employeeStatusFilter,
      contractStatusFilter,
      payrollStatusFilter,
      leaveStatusFilter,
    })
  }, [selectedProjectId, search, employeeStatusFilter, contractStatusFilter, payrollStatusFilter, leaveStatusFilter])

  const store = useMemo(() => HumanResourcesWorkspaceService.getStore(), [tick])
  const summary = useMemo(() => HumanResourcesWorkspaceService.getSummary(), [tick])

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase()
    return store.employees.filter((employee) => {
      if (selectedProjectId !== 'all' && employee.projectId !== selectedProjectId) return false
      if (employeeStatusFilter !== 'all' && employee.status !== employeeStatusFilter) return false
      if (!query) return true
      return `${employee.employeeCode} ${employee.fullName} ${employee.department} ${employee.role}`.toLowerCase().includes(query)
    })
  }, [store.employees, selectedProjectId, employeeStatusFilter, search])

  const filteredContracts = useMemo(() => {
    return store.contracts.filter((contract) => {
      if (contractStatusFilter !== 'all' && contract.status !== contractStatusFilter) return false
      if (selectedProjectId === 'all') return true
      const employee = store.employees.find((item) => item.id === contract.employeeId)
      return employee?.projectId === selectedProjectId
    })
  }, [store.contracts, store.employees, selectedProjectId, contractStatusFilter])

  const filteredPayroll = useMemo(() => {
    return store.payroll.filter((record) => {
      if (payrollStatusFilter !== 'all' && record.status !== payrollStatusFilter) return false
      if (selectedProjectId === 'all') return true
      const employee = store.employees.find((item) => item.id === record.employeeId)
      return employee?.projectId === selectedProjectId
    })
  }, [store.payroll, store.employees, selectedProjectId, payrollStatusFilter])

  const filteredLeaves = useMemo(() => {
    return store.leaves.filter((record) => {
      if (leaveStatusFilter !== 'all' && record.status !== leaveStatusFilter) return false
      if (selectedProjectId === 'all') return true
      const employee = store.employees.find((item) => item.id === record.employeeId)
      return employee?.projectId === selectedProjectId
    })
  }, [store.leaves, store.employees, selectedProjectId, leaveStatusFilter])

  return {
    store,
    summary,
    refresh,
    selectedProjectId,
    setSelectedProjectId,
    search,
    setSearch,
    employeeStatusFilter,
    setEmployeeStatusFilter,
    contractStatusFilter,
    setContractStatusFilter,
    payrollStatusFilter,
    setPayrollStatusFilter,
    leaveStatusFilter,
    setLeaveStatusFilter,
    filteredEmployees,
    filteredContracts,
    filteredPayroll,
    filteredLeaves,
    employeeStatuses: HumanResourcesWorkspaceService.listEmployeeStatuses(),
    contractTypes: HumanResourcesWorkspaceService.listContractTypes(),
    payrollStatuses: HumanResourcesWorkspaceService.listPayrollStatuses(),
    leaveStatuses: HumanResourcesWorkspaceService.listLeaveStatuses(),
  }
}
