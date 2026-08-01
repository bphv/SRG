import { useMemo, useState } from 'react'
import { ProcurementInventoryWorkspaceService } from '#/app/services/ProcurementInventoryWorkspaceService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

type ProcurementWorkspaceFilters = {
  search: string
  requestStatus: string
  orderStatus: string
  supplierCategory: string
}

export function useProcurementInventoryWorkspace() {
  const [tick, setTick] = useState(0)
  const preferences = WorkspacePreferencesService.getPreferences()
  const persisted = preferences.filters['procurement-inventory-workspace'] as Record<string, string | boolean | number> | undefined

  const [selectedProjectId, setSelectedProjectIdState] = useState(
    typeof persisted?.selectedProjectId === 'string' ? persisted.selectedProjectId : '',
  )
  const [filters, setFiltersState] = useState<ProcurementWorkspaceFilters>({
    search: typeof persisted?.search === 'string' ? persisted.search : '',
    requestStatus: typeof persisted?.requestStatus === 'string' ? persisted.requestStatus : 'all',
    orderStatus: typeof persisted?.orderStatus === 'string' ? persisted.orderStatus : 'all',
    supplierCategory: typeof persisted?.supplierCategory === 'string' ? persisted.supplierCategory : 'all',
  })

  const refresh = () => setTick((value) => value + 1)

  const persist = (projectId: string, nextFilters: ProcurementWorkspaceFilters) => {
    WorkspacePreferencesService.setFilters('procurement-inventory-workspace', {
      ...nextFilters,
      selectedProjectId: projectId,
    })
  }

  const setSelectedProjectId = (projectId: string) => {
    setSelectedProjectIdState(projectId)
    persist(projectId, filters)
  }

  const setFilters = (next: ProcurementWorkspaceFilters) => {
    setFiltersState(next)
    persist(selectedProjectId, next)
  }

  const store = useMemo(() => ProcurementInventoryWorkspaceService.getStore(), [tick])
  const summary = useMemo(() => ProcurementInventoryWorkspaceService.getSummary(), [tick])
  const projects = useMemo(() => {
    const values = store.requests.map((item) => ({ id: item.projectId, name: item.projectName }))
    const map = new Map(values.map((item) => [item.id, item.name]))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [store.requests])

  const activeProjectId = selectedProjectId || projects[0]?.id || 'n/a'

  const filteredRequests = useMemo(() => {
    const query = filters.search.toLowerCase().trim()
    return store.requests.filter((item) => {
      if (activeProjectId !== 'n/a' && item.projectId !== activeProjectId) return false
      if (filters.requestStatus !== 'all' && item.status !== filters.requestStatus) return false
      if (query && !`${item.requestCode} ${item.title} ${item.justification} ${item.costCenter}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [store.requests, filters, activeProjectId])

  const requestIds = new Set(filteredRequests.map((item) => item.id))

  const filteredOrders = useMemo(() => {
    const query = filters.search.toLowerCase().trim()
    return store.orders.filter((item) => {
      if (filters.orderStatus !== 'all' && item.status !== filters.orderStatus) return false
      if (requestIds.size > 0 && !requestIds.has(item.requestId)) return false
      if (query && !`${item.orderCode} ${item.supplierName}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [store.orders, filters, requestIds])

  const filteredSuppliers = useMemo(() => {
    const query = filters.search.toLowerCase().trim()
    return store.suppliers.filter((item) => {
      if (filters.supplierCategory !== 'all' && !item.categories.includes(filters.supplierCategory as typeof item.categories[number])) return false
      if (query && !`${item.name} ${item.contacts.join(' ')} ${item.categories.join(' ')}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [store.suppliers, filters])

  return {
    store,
    summary,
    projects,
    selectedProjectId: activeProjectId,
    setSelectedProjectId,
    filters,
    setFilters,
    filteredRequests,
    filteredOrders,
    filteredSuppliers,
    refresh,
    priorities: ProcurementInventoryWorkspaceService.listPriorities(),
    requestStatuses: ProcurementInventoryWorkspaceService.listRequestStatuses(),
    tenderStatuses: ProcurementInventoryWorkspaceService.listTenderStatuses(),
    orderStatuses: ProcurementInventoryWorkspaceService.listOrderStatuses(),
    supplierCategories: ProcurementInventoryWorkspaceService.listSupplierCategories(),
    stockMovementTypes: ProcurementInventoryWorkspaceService.listStockMovementTypes(),
    materialCategories: ProcurementInventoryWorkspaceService.listMaterialCategories(),
    logisticsStatuses: ProcurementInventoryWorkspaceService.listLogisticsStatuses(),
  }
}
