import { useEffect, useMemo, useState } from 'react'
import { FinanceWorkspaceService } from '#/app/services/FinanceWorkspaceService'
import type { InvoiceStatus, SupplierInvoiceStatus } from '#/app/services/FinanceWorkspaceService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export function useFinanceWorkspace() {
  const [tick, setTick] = useState(0)
  const preferences = WorkspacePreferencesService.getPreferences()
  const persisted = (preferences.filters.finance as Record<string, string | undefined> | undefined) || {}

  const [selectedProjectId, setSelectedProjectId] = useState(persisted.selectedProjectId ?? 'all')
  const [search, setSearch] = useState(persisted.search ?? '')
  const [customerStatusFilter, setCustomerStatusFilter] = useState<'all' | InvoiceStatus>(
    persisted.customerStatusFilter && persisted.customerStatusFilter !== 'all'
      ? (persisted.customerStatusFilter as InvoiceStatus)
      : 'all',
  )
  const [supplierStatusFilter, setSupplierStatusFilter] = useState<'all' | SupplierInvoiceStatus>(
    persisted.supplierStatusFilter && persisted.supplierStatusFilter !== 'all'
      ? (persisted.supplierStatusFilter as SupplierInvoiceStatus)
      : 'all',
  )

  const refresh = () => setTick((value) => value + 1)

  useEffect(() => {
    WorkspacePreferencesService.setFilters('finance', {
      selectedProjectId,
      search,
      customerStatusFilter,
      supplierStatusFilter,
    })
  }, [selectedProjectId, search, customerStatusFilter, supplierStatusFilter])

  const store = useMemo(() => FinanceWorkspaceService.getStore(), [tick])
  const summary = useMemo(() => FinanceWorkspaceService.getSummary(), [tick])

  const filteredCustomerInvoices = useMemo(() => {
    const query = search.trim().toLowerCase()
    return store.customerInvoices.filter((invoice) => {
      if (selectedProjectId !== 'all' && invoice.projectId !== selectedProjectId) return false
      if (customerStatusFilter !== 'all' && invoice.status !== customerStatusFilter) return false
      if (!query) return true
      return `${invoice.invoiceNumber} ${invoice.customerName}`.toLowerCase().includes(query)
    })
  }, [store.customerInvoices, selectedProjectId, customerStatusFilter, search])

  const filteredSupplierInvoices = useMemo(() => {
    const query = search.trim().toLowerCase()
    return store.supplierInvoices.filter((invoice) => {
      if (selectedProjectId !== 'all' && invoice.projectId !== selectedProjectId) return false
      if (supplierStatusFilter !== 'all' && invoice.status !== supplierStatusFilter) return false
      if (!query) return true
      return `${invoice.invoiceNumber} ${invoice.supplierName} ${invoice.procurementOrderCode}`.toLowerCase().includes(query)
    })
  }, [store.supplierInvoices, selectedProjectId, supplierStatusFilter, search])

  return {
    store,
    summary,
    refresh,
    selectedProjectId,
    setSelectedProjectId,
    search,
    setSearch,
    customerStatusFilter,
    setCustomerStatusFilter,
    supplierStatusFilter,
    setSupplierStatusFilter,
    filteredCustomerInvoices,
    filteredSupplierInvoices,
    customerStatuses: FinanceWorkspaceService.listInvoiceStatuses(),
    supplierStatuses: ['draft', 'approved', 'partially-paid', 'paid', 'overdue', 'cancelled'] as const,
    entryStatuses: FinanceWorkspaceService.listEntryStatuses(),
    treasuryChannels: FinanceWorkspaceService.listTreasuryChannels(),
  }
}
