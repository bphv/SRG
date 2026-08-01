import { useEffect, useMemo, useState } from 'react'
import { MaintenanceWorkspaceService } from '#/app/services/MaintenanceWorkspaceService'
import type { MaintenanceType, WorkOrderPriority, WorkOrderStatus } from '#/app/services/MaintenanceWorkspaceService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export function useMaintenanceWorkspace() {
  const preferences = WorkspacePreferencesService.getPreferences()
  const persisted = (preferences.filters.maintenance as Record<string, string | undefined> | undefined) || {}

  const [selectedProjectId, setSelectedProjectId] = useState(persisted.selectedProjectId ?? 'all')
  const [equipmentSearch, setEquipmentSearch] = useState(persisted.equipmentSearch ?? '')
  const [workOrderSearch, setWorkOrderSearch] = useState(persisted.workOrderSearch ?? '')
  const [statusFilter, setStatusFilter] = useState<'all' | WorkOrderStatus>(
    persisted.statusFilter && persisted.statusFilter !== 'all'
      ? (persisted.statusFilter as WorkOrderStatus)
      : 'all',
  )
  const [priorityFilter, setPriorityFilter] = useState<'all' | WorkOrderPriority>(
    persisted.priorityFilter && persisted.priorityFilter !== 'all'
      ? (persisted.priorityFilter as WorkOrderPriority)
      : 'all',
  )
  const [maintenanceTypeFilter, setMaintenanceTypeFilter] = useState<'all' | MaintenanceType>(
    persisted.maintenanceTypeFilter && persisted.maintenanceTypeFilter !== 'all'
      ? (persisted.maintenanceTypeFilter as MaintenanceType)
      : 'all',
  )

  const store = MaintenanceWorkspaceService.getStore()
  const summary = MaintenanceWorkspaceService.getSummary()

  useEffect(() => {
    WorkspacePreferencesService.setFilters('maintenance', {
      selectedProjectId,
      equipmentSearch,
      workOrderSearch,
      statusFilter,
      priorityFilter,
      maintenanceTypeFilter,
    })
  }, [selectedProjectId, equipmentSearch, workOrderSearch, statusFilter, priorityFilter, maintenanceTypeFilter])

  const filteredEquipments = useMemo(() => {
    const query = equipmentSearch.trim().toLowerCase()
    return store.equipments.filter((item) => {
      if (selectedProjectId !== 'all' && item.projectId !== selectedProjectId) return false
      if (!query) return true
      return `${item.code} ${item.name} ${item.reference} ${item.serialNumber} ${item.site}`.toLowerCase().includes(query)
    })
  }, [store.equipments, selectedProjectId, equipmentSearch])

  const filteredWorkOrders = useMemo(() => {
    const query = workOrderSearch.trim().toLowerCase()
    return store.workOrders.filter((item) => {
      if (selectedProjectId !== 'all' && item.projectId !== selectedProjectId) return false
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false
      if (maintenanceTypeFilter !== 'all' && item.maintenanceType !== maintenanceTypeFilter) return false
      if (!query) return true
      return `${item.code} ${item.title} ${item.equipmentCode} ${item.assignedTechnician} ${item.site}`.toLowerCase().includes(query)
    })
  }, [store.workOrders, selectedProjectId, statusFilter, priorityFilter, maintenanceTypeFilter, workOrderSearch])

  return {
    store,
    summary,
    filteredEquipments,
    filteredWorkOrders,
    selectedProjectId,
    equipmentSearch,
    workOrderSearch,
    statusFilter,
    priorityFilter,
    maintenanceTypeFilter,
    setSelectedProjectId,
    setEquipmentSearch,
    setWorkOrderSearch,
    setStatusFilter,
    setPriorityFilter,
    setMaintenanceTypeFilter,
    maintenanceTypes: MaintenanceWorkspaceService.listMaintenanceTypes(),
    workOrderStatuses: MaintenanceWorkspaceService.listWorkOrderStatuses(),
    workOrderPriorities: MaintenanceWorkspaceService.listPriorities(),
    checklistKinds: MaintenanceWorkspaceService.listChecklistKinds(),
    planningViews: MaintenanceWorkspaceService.listPlanningViews(),
    refresh: () => MaintenanceWorkspaceService.getStore(),
  }
}
