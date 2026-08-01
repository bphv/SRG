import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import Section from '#/app/components/Section'
import { useProcurementInventoryWorkspace } from '#/app/hooks/useProcurementInventoryWorkspace'
import { ProcurementInventoryWorkspaceService } from '#/app/services/ProcurementInventoryWorkspaceService'

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

export default function ProcurementInventoryWorkspace() {
  const {
    store,
    summary,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    filters,
    setFilters,
    filteredRequests,
    filteredOrders,
    filteredSuppliers,
    refresh,
    priorities,
    requestStatuses,
    orderStatuses,
    supplierCategories,
    stockMovementTypes,
    materialCategories,
    logisticsStatuses,
  } = useProcurementInventoryWorkspace()

  const selectedProject = useMemo(() => projects.find((item) => item.id === selectedProjectId), [projects, selectedProjectId])
  const integration = useMemo(() => ProcurementInventoryWorkspaceService.getIntegrationContext(selectedProjectId), [selectedProjectId, store.timeline.length])

  const [requestTitle, setRequestTitle] = useState('')
  const [requestJustification, setRequestJustification] = useState('')
  const [requestPriority, setRequestPriority] = useState<typeof priorities[number]>('medium')
  const [requestUrgency, setRequestUrgency] = useState(false)
  const [requestBudget, setRequestBudget] = useState(0)
  const [requestCostCenter, setRequestCostCenter] = useState('')

  const [requestActionId, setRequestActionId] = useState('')
  const [requestActionComment, setRequestActionComment] = useState('')

  const [tenderRequestId, setTenderRequestId] = useState('')
  const [tenderTitle, setTenderTitle] = useState('')
  const [tenderCategory, setTenderCategory] = useState<typeof supplierCategories[number]>('electrical')
  const [tenderIdForBid, setTenderIdForBid] = useState('')
  const [bidSupplierId, setBidSupplierId] = useState('')
  const [bidAmount, setBidAmount] = useState(0)
  const [bidLeadTime, setBidLeadTime] = useState(0)
  const [bidQuality, setBidQuality] = useState(75)
  const [bidCompliance, setBidCompliance] = useState(75)
  const [bidRisk, setBidRisk] = useState(20)
  const [bidTechnical, setBidTechnical] = useState(75)
  const [bidNotes, setBidNotes] = useState('')
  const [decisionTenderId, setDecisionTenderId] = useState('')
  const [decisionBidId, setDecisionBidId] = useState('')
  const [decisionComment, setDecisionComment] = useState('')
  const [archiveTenderReason, setArchiveTenderReason] = useState('')

  const [supplierName, setSupplierName] = useState('')
  const [supplierCategoryList, setSupplierCategoryList] = useState('electrical')
  const [supplierContacts, setSupplierContacts] = useState('')
  const [supplierLeadTime, setSupplierLeadTime] = useState(0)
  const [supplierQuality, setSupplierQuality] = useState(70)
  const [supplierNc, setSupplierNc] = useState(0)
  const [supplierOnTimeRate, setSupplierOnTimeRate] = useState(80)
  const [supplierDocs, setSupplierDocs] = useState('')
  const [supplierContracts, setSupplierContracts] = useState('')

  const [orderRequestId, setOrderRequestId] = useState('')
  const [orderTenderId, setOrderTenderId] = useState('')
  const [orderSupplierId, setOrderSupplierId] = useState('')
  const [orderLineLabel, setOrderLineLabel] = useState('')
  const [orderLineQty, setOrderLineQty] = useState(1)
  const [orderLinePrice, setOrderLinePrice] = useState(0)
  const [orderLines, setOrderLines] = useState<Array<{ label: string; quantity: number; unitPrice: number }>>([])
  const [orderStatusId, setOrderStatusId] = useState('')
  const [orderStatusValue, setOrderStatusValue] = useState<typeof orderStatuses[number]>('validated')
  const [orderStatusComment, setOrderStatusComment] = useState('')
  const [partialQty, setPartialQty] = useState(0)
  const [partialNote, setPartialNote] = useState('')
  const [returnQty, setReturnQty] = useState(0)
  const [returnReason, setReturnReason] = useState('')

  const [stockId, setStockId] = useState('')
  const [stockRef, setStockRef] = useState('')
  const [stockLabel, setStockLabel] = useState('')
  const [stockCategory, setStockCategory] = useState<typeof materialCategories[number]>('motor')
  const [stockQty, setStockQty] = useState(0)
  const [stockMin, setStockMin] = useState(0)
  const [stockMax, setStockMax] = useState(0)
  const [stockLocation, setStockLocation] = useState('')
  const [stockStore, setStockStore] = useState('')
  const [stockWarehouse, setStockWarehouse] = useState('')
  const [stockDepot, setStockDepot] = useState('')
  const [stockTrace, setStockTrace] = useState('')

  const [movementItemId, setMovementItemId] = useState('')
  const [movementType, setMovementType] = useState<typeof stockMovementTypes[number]>('entry')
  const [movementQty, setMovementQty] = useState(0)
  const [movementFrom, setMovementFrom] = useState('')
  const [movementTo, setMovementTo] = useState('')
  const [movementReason, setMovementReason] = useState('')
  const [movementOrderId, setMovementOrderId] = useState('')

  const [materialCategory, setMaterialCategory] = useState<typeof materialCategories[number]>('motor')
  const [materialRef, setMaterialRef] = useState('')
  const [materialManufacturer, setMaterialManufacturer] = useState('')
  const [materialBrand, setMaterialBrand] = useState('')
  const [materialSerial, setMaterialSerial] = useState('')
  const [materialPurchaseDate, setMaterialPurchaseDate] = useState('')
  const [materialReceptionDate, setMaterialReceptionDate] = useState('')
  const [materialWarrantyDate, setMaterialWarrantyDate] = useState('')
  const [materialDocs, setMaterialDocs] = useState('')
  const [materialPhotos, setMaterialPhotos] = useState('')
  const [materialQr, setMaterialQr] = useState('')
  const [materialBar, setMaterialBar] = useState('')
  const [materialSupplier, setMaterialSupplier] = useState('')
  const [materialLinkKnowledge, setMaterialLinkKnowledge] = useState(true)

  const [receptionOrderId, setReceptionOrderId] = useState('')
  const [receptionQuality, setReceptionQuality] = useState('')
  const [receptionResult, setReceptionResult] = useState<'accepted' | 'accepted-with-reserves' | 'rejected'>('accepted')
  const [receptionPv, setReceptionPv] = useState('')
  const [receptionPhotos, setReceptionPhotos] = useState('')
  const [receptionObs, setReceptionObs] = useState('')
  const [receptionReserves, setReceptionReserves] = useState('')
  const [receptionSignature, setReceptionSignature] = useState('')
  const [receptionDocs, setReceptionDocs] = useState('')

  const [logisticsOrderId, setLogisticsOrderId] = useState('')
  const [shipmentCode, setShipmentCode] = useState('')
  const [shipmentTransporter, setShipmentTransporter] = useState('')
  const [shipmentOrigin, setShipmentOrigin] = useState('')
  const [shipmentDestination, setShipmentDestination] = useState('')
  const [updateLogisticsId, setUpdateLogisticsId] = useState('')
  const [updateLogisticsStatus, setUpdateLogisticsStatus] = useState<typeof logisticsStatuses[number]>('prepared')
  const [updateLocation, setUpdateLocation] = useState('')
  const [updateIncident, setUpdateIncident] = useState('')
  const [updateDeliveryDate, setUpdateDeliveryDate] = useState('')
  const [updateSiteDate, setUpdateSiteDate] = useState('')

  const [aiQuestion, setAiQuestion] = useState('Pourquoi certaines commandes sont en retard et quels fournisseurs sont critiques ?')
  const [aiAnswer, setAiAnswer] = useState('')

  const addOrderLine = () => {
    if (!orderLineLabel.trim()) return
    setOrderLines((current) => [...current, { label: orderLineLabel.trim(), quantity: Math.max(0, orderLineQty), unitPrice: Math.max(0, orderLinePrice) }])
    setOrderLineLabel('')
    setOrderLineQty(1)
    setOrderLinePrice(0)
  }

  const createRequest = () => {
    ProcurementInventoryWorkspaceService.createPurchaseRequest({
      title: requestTitle,
      justification: requestJustification,
      priority: requestPriority,
      urgency: requestUrgency,
      budget: requestBudget,
      costCenter: requestCostCenter,
      projectId: selectedProjectId,
      projectName: selectedProject?.name ?? 'Unknown project',
    })
    setRequestTitle('')
    setRequestJustification('')
    setRequestPriority('medium')
    setRequestUrgency(false)
    setRequestBudget(0)
    setRequestCostCenter('')
    refresh()
  }

  const runRequestAction = (action: 'submit' | 'approve' | 'reject') => {
    if (!requestActionId) return
    if (action === 'submit') ProcurementInventoryWorkspaceService.submitPurchaseRequest(requestActionId, 'Procurement Officer', requestActionComment)
    if (action === 'approve') ProcurementInventoryWorkspaceService.approvePurchaseRequest(requestActionId, 'Validation Committee', requestActionComment)
    if (action === 'reject') ProcurementInventoryWorkspaceService.rejectPurchaseRequest(requestActionId, 'Validation Committee', requestActionComment)
    setRequestActionComment('')
    refresh()
  }

  const createTender = () => {
    if (!tenderRequestId) return
    ProcurementInventoryWorkspaceService.createTender({ requestId: tenderRequestId, title: tenderTitle, category: tenderCategory })
    setTenderTitle('')
    refresh()
  }

  const addBid = () => {
    if (!tenderIdForBid || !bidSupplierId) return
    const supplier = store.suppliers.find((item) => item.id === bidSupplierId)
    if (!supplier) return

    ProcurementInventoryWorkspaceService.addTenderBid(tenderIdForBid, {
      supplierId: supplier.id,
      supplierName: supplier.name,
      amount: bidAmount,
      leadTimeDays: bidLeadTime,
      qualityScore: bidQuality,
      complianceScore: bidCompliance,
      riskScore: bidRisk,
      technicalScore: bidTechnical,
      notes: bidNotes,
    })
    setBidAmount(0)
    setBidLeadTime(0)
    setBidQuality(75)
    setBidCompliance(75)
    setBidRisk(20)
    setBidTechnical(75)
    setBidNotes('')
    refresh()
  }

  const decideTender = () => {
    if (!decisionTenderId || !decisionBidId) return
    ProcurementInventoryWorkspaceService.decideTender(decisionTenderId, decisionBidId, decisionComment)
    setDecisionComment('')
    refresh()
  }

  const archiveTender = () => {
    if (!decisionTenderId) return
    ProcurementInventoryWorkspaceService.archiveTender(decisionTenderId, archiveTenderReason)
    setArchiveTenderReason('')
    refresh()
  }

  const saveSupplier = () => {
    ProcurementInventoryWorkspaceService.upsertSupplier({
      name: supplierName,
      categories: splitCsv(supplierCategoryList).map((item) => item as typeof supplierCategories[number]),
      contacts: splitCsv(supplierContacts),
      averageLeadTimeDays: supplierLeadTime,
      qualityScore: supplierQuality,
      nonConformities: supplierNc,
      onTimeRate: supplierOnTimeRate,
      contracts: splitCsv(supplierContracts).map((item) => ({ id: `${Date.now()}-${item}`, title: item, startDate: '', endDate: '', documents: [] })),
      documents: splitCsv(supplierDocs),
    })

    setSupplierName('')
    setSupplierCategoryList('electrical')
    setSupplierContacts('')
    setSupplierLeadTime(0)
    setSupplierQuality(70)
    setSupplierNc(0)
    setSupplierOnTimeRate(80)
    setSupplierDocs('')
    setSupplierContracts('')
    refresh()
  }

  const createOrder = () => {
    if (!orderRequestId || !orderSupplierId || orderLines.length === 0) return
    ProcurementInventoryWorkspaceService.createOrderFromTender({ requestId: orderRequestId, tenderId: orderTenderId || undefined, supplierId: orderSupplierId, lines: orderLines })
    setOrderLines([])
    refresh()
  }

  const updateOrderStatus = () => {
    if (!orderStatusId) return
    ProcurementInventoryWorkspaceService.updateOrderStatus(orderStatusId, orderStatusValue, orderStatusComment)
    setOrderStatusComment('')
    refresh()
  }

  const addPartialDelivery = () => {
    if (!orderStatusId) return
    ProcurementInventoryWorkspaceService.recordPartialDelivery(orderStatusId, partialQty, partialNote)
    setPartialQty(0)
    setPartialNote('')
    refresh()
  }

  const addOrderReturn = () => {
    if (!orderStatusId) return
    ProcurementInventoryWorkspaceService.recordOrderReturn(orderStatusId, returnQty, returnReason)
    setReturnQty(0)
    setReturnReason('')
    refresh()
  }

  const saveStockItem = () => {
    ProcurementInventoryWorkspaceService.upsertStockItem({
      id: stockId || undefined,
      materialRef: stockRef,
      label: stockLabel,
      category: stockCategory,
      quantity: stockQty,
      minThreshold: stockMin,
      maxThreshold: stockMax,
      location: stockLocation,
      store: stockStore,
      warehouse: stockWarehouse,
      chantierDepot: stockDepot,
      traceabilityTag: stockTrace,
    })
    setStockId('')
    setStockRef('')
    setStockLabel('')
    setStockQty(0)
    setStockMin(0)
    setStockMax(0)
    setStockLocation('')
    setStockStore('')
    setStockWarehouse('')
    setStockDepot('')
    setStockTrace('')
    refresh()
  }

  const addMovement = () => {
    if (!movementItemId) return
    ProcurementInventoryWorkspaceService.recordStockMovement({
      itemId: movementItemId,
      type: movementType,
      quantity: movementQty,
      fromLocation: movementFrom,
      toLocation: movementTo,
      reason: movementReason,
      orderId: movementOrderId || undefined,
    })
    setMovementQty(0)
    setMovementFrom('')
    setMovementTo('')
    setMovementReason('')
    setMovementOrderId('')
    refresh()
  }

  const saveMaterial = () => {
    ProcurementInventoryWorkspaceService.upsertIndustrialMaterial({
      category: materialCategory,
      reference: materialRef,
      manufacturer: materialManufacturer,
      brand: materialBrand,
      serialNumber: materialSerial,
      purchaseDate: materialPurchaseDate,
      receptionDate: materialReceptionDate,
      warrantyEndDate: materialWarrantyDate,
      documentation: splitCsv(materialDocs),
      photos: splitCsv(materialPhotos),
      qrCode: materialQr,
      barCode: materialBar,
      projectId: selectedProjectId,
      projectName: selectedProject?.name ?? 'Unknown project',
      supplierName: materialSupplier,
      linkToKnowledge: materialLinkKnowledge,
    })
    setMaterialRef('')
    setMaterialManufacturer('')
    setMaterialBrand('')
    setMaterialSerial('')
    setMaterialPurchaseDate('')
    setMaterialReceptionDate('')
    setMaterialWarrantyDate('')
    setMaterialDocs('')
    setMaterialPhotos('')
    setMaterialQr('')
    setMaterialBar('')
    setMaterialSupplier('')
    refresh()
  }

  const saveReception = () => {
    if (!receptionOrderId) return
    ProcurementInventoryWorkspaceService.recordReception({
      orderId: receptionOrderId,
      projectId: selectedProjectId,
      qualityControl: receptionQuality,
      result: receptionResult,
      pvNumber: receptionPv,
      photos: splitCsv(receptionPhotos),
      observations: receptionObs,
      reserves: splitCsv(receptionReserves),
      signature: receptionSignature,
      documents: splitCsv(receptionDocs),
    })
    setReceptionQuality('')
    setReceptionPv('')
    setReceptionPhotos('')
    setReceptionObs('')
    setReceptionReserves('')
    setReceptionSignature('')
    setReceptionDocs('')
    refresh()
  }

  const createShipment = () => {
    if (!logisticsOrderId) return
    ProcurementInventoryWorkspaceService.createLogisticsRecord({
      orderId: logisticsOrderId,
      shipmentCode,
      transporter: shipmentTransporter,
      origin: shipmentOrigin,
      destination: shipmentDestination,
      projectId: selectedProjectId,
    })
    setShipmentCode('')
    setShipmentTransporter('')
    setShipmentOrigin('')
    setShipmentDestination('')
    refresh()
  }

  const updateShipment = () => {
    if (!updateLogisticsId) return
    ProcurementInventoryWorkspaceService.updateLogisticsStatus({
      logisticsId: updateLogisticsId,
      status: updateLogisticsStatus,
      currentLocation: updateLocation,
      incident: updateIncident || undefined,
      deliveryDate: updateDeliveryDate || undefined,
      siteReceptionDate: updateSiteDate || undefined,
      actor: 'Logistics Coordinator',
    })
    setUpdateIncident('')
    refresh()
  }

  const runAi = () => {
    const insight = ProcurementInventoryWorkspaceService.askProcurementAi(selectedProjectId, aiQuestion)
    setAiAnswer(`${insight.answer}\n\nConfidence: ${insight.confidence}\nReferences: ${insight.references.join(', ') || 'n/a'}`)
    refresh()
  }

  return (
    <div className="space-y-6">
      <Section title="Procurement & Inventory Dashboard" description="Achats, approvisionnements, stocks, logistique et qualite en vue unifiee.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Requests</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.requests}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Tenders</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.tenders}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Suppliers</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.suppliers}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Orders</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.orders}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Stock items</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.stockItems}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Logistics</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.logistics}</p></div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">Request budget: {summary.requestBudget.toFixed(2)}</div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">Order value: {summary.orderValue.toFixed(2)}</div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">Stock value: {summary.stockValue.toFixed(2)}</div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">Low stock: {summary.lowStock}</div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">Incidents: {summary.incidents}</div>
        </div>
      </Section>

      <Section title="Project Scope & Filters" description="Filtrage projet et statuts pour exploiter le cycle achats complet.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 text-sm">
          <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <select value={filters.requestStatus} onChange={(event) => setFilters({ ...filters, requestStatus: event.target.value })} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
            <option value="all">All request status</option>
            {requestStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={filters.orderStatus} onChange={(event) => setFilters({ ...filters, orderStatus: event.target.value })} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
            <option value="all">All order status</option>
            {orderStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={filters.supplierCategory} onChange={(event) => setFilters({ ...filters, supplierCategory: event.target.value })} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
            <option value="all">All supplier categories</option>
            {supplierCategories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </Section>

      <Section title="Purchase Requests" description="Creation, justification, budget, centre de cout, priorite, urgence et workflow approbation.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 text-sm">
          <input value={requestTitle} onChange={(event) => setRequestTitle(event.target.value)} placeholder="Request title" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={requestJustification} onChange={(event) => setRequestJustification(event.target.value)} placeholder="Justification" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <select value={requestPriority} onChange={(event) => setRequestPriority(event.target.value as typeof priorities[number])} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">{priorities.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <input type="number" value={requestBudget} onChange={(event) => setRequestBudget(Number(event.target.value) || 0)} placeholder="Budget" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={requestCostCenter} onChange={(event) => setRequestCostCenter(event.target.value)} placeholder="Cost center" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <label className="inline-flex items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><input type="checkbox" checked={requestUrgency} onChange={(event) => setRequestUrgency(event.target.checked)} />Urgency</label>
          <button type="button" onClick={createRequest} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Create request</button>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <select value={requestActionId} onChange={(event) => setRequestActionId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
            <option value="">Select request</option>
            {filteredRequests.map((item) => <option key={item.id} value={item.id}>{item.requestCode}</option>)}
          </select>
          <input value={requestActionComment} onChange={(event) => setRequestActionComment(event.target.value)} placeholder="Comment" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={() => runRequestAction('submit')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Submit</button>
          <button type="button" onClick={() => runRequestAction('approve')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Approve</button>
          <button type="button" onClick={() => runRequestAction('reject')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Reject</button>
        </div>
        <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
          {filteredRequests.slice(0, 8).map((item) => <p key={item.id}>{item.requestCode} | {item.title} | {item.status} | budget {item.budget.toFixed(2)} | {item.projectName}</p>)}
        </div>
      </Section>

      <Section title="Tenders" description="Creation AO, comparaison fournisseurs, notation, analyse automatique, decision et archivage.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 text-sm">
          <select value={tenderRequestId} onChange={(event) => setTenderRequestId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
            <option value="">Request</option>
            {filteredRequests.map((item) => <option key={item.id} value={item.id}>{item.requestCode}</option>)}
          </select>
          <input value={tenderTitle} onChange={(event) => setTenderTitle(event.target.value)} placeholder="Tender title" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <select value={tenderCategory} onChange={(event) => setTenderCategory(event.target.value as typeof supplierCategories[number])} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">{supplierCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <button type="button" onClick={createTender} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Create tender</button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <select value={tenderIdForBid} onChange={(event) => setTenderIdForBid(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">Tender</option>{store.tenders.map((item) => <option key={item.id} value={item.id}>{item.tenderCode}</option>)}</select>
          <select value={bidSupplierId} onChange={(event) => setBidSupplierId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">Supplier</option>{filteredSuppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <input type="number" value={bidAmount} onChange={(event) => setBidAmount(Number(event.target.value) || 0)} placeholder="Amount" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={bidLeadTime} onChange={(event) => setBidLeadTime(Number(event.target.value) || 0)} placeholder="Lead time" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={bidQuality} onChange={(event) => setBidQuality(Number(event.target.value) || 0)} placeholder="Quality" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={bidCompliance} onChange={(event) => setBidCompliance(Number(event.target.value) || 0)} placeholder="Compliance" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={bidRisk} onChange={(event) => setBidRisk(Number(event.target.value) || 0)} placeholder="Risk" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={bidTechnical} onChange={(event) => setBidTechnical(Number(event.target.value) || 0)} placeholder="Technical" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={bidNotes} onChange={(event) => setBidNotes(event.target.value)} placeholder="Bid notes" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 sm:col-span-2 xl:col-span-3" />
          <button type="button" onClick={addBid} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Add bid</button>
          <button type="button" onClick={() => { if (tenderIdForBid) { ProcurementInventoryWorkspaceService.analyzeTender(tenderIdForBid); refresh() } }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Analyze tender</button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5 text-sm">
          <select value={decisionTenderId} onChange={(event) => setDecisionTenderId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">Tender for decision</option>{store.tenders.map((item) => <option key={item.id} value={item.id}>{item.tenderCode}</option>)}</select>
          <select value={decisionBidId} onChange={(event) => setDecisionBidId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">Bid</option>{store.tenders.find((item) => item.id === decisionTenderId)?.bids.map((bid) => <option key={bid.id} value={bid.id}>{bid.supplierName} | {bid.amount}</option>)}</select>
          <input value={decisionComment} onChange={(event) => setDecisionComment(event.target.value)} placeholder="Decision comment" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={decideTender} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Select bid</button>
          <input value={archiveTenderReason} onChange={(event) => setArchiveTenderReason(event.target.value)} placeholder="Archive reason" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={archiveTender} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Archive tender</button>
        </div>

        <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
          {store.tenders.slice(0, 8).map((item) => <p key={item.id}>{item.tenderCode} | {item.status} | bids {item.bids.length} | {item.autoAnalysis || 'no analysis yet'}</p>)}
        </div>
      </Section>

      <Section title="Suppliers" description="Base fournisseurs, categories, delais, qualite, non-conformites, notation automatique, contrats et contacts.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <input value={supplierName} onChange={(event) => setSupplierName(event.target.value)} placeholder="Supplier name" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={supplierCategoryList} onChange={(event) => setSupplierCategoryList(event.target.value)} placeholder="Categories comma" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={supplierContacts} onChange={(event) => setSupplierContacts(event.target.value)} placeholder="Contacts comma" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={supplierLeadTime} onChange={(event) => setSupplierLeadTime(Number(event.target.value) || 0)} placeholder="Lead time days" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={supplierQuality} onChange={(event) => setSupplierQuality(Number(event.target.value) || 0)} placeholder="Quality score" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={supplierNc} onChange={(event) => setSupplierNc(Number(event.target.value) || 0)} placeholder="Non conformities" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={supplierOnTimeRate} onChange={(event) => setSupplierOnTimeRate(Number(event.target.value) || 0)} placeholder="On-time rate" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={supplierContracts} onChange={(event) => setSupplierContracts(event.target.value)} placeholder="Contracts comma" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={supplierDocs} onChange={(event) => setSupplierDocs(event.target.value)} placeholder="Documents comma" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={saveSupplier} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Save supplier</button>
        </div>
        <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
          {filteredSuppliers.slice(0, 10).map((item) => <p key={item.id}>{item.name} | rating {item.automaticRating} | lead {item.averageLeadTimeDays}d | nc {item.nonConformities} | categories {item.categories.join('/')}</p>)}
        </div>
      </Section>

      <Section title="Orders" description="Bon de commande, statuts, livraison partielle, retour, annulation et historique.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 text-sm">
          <select value={orderRequestId} onChange={(event) => setOrderRequestId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">Request</option>{filteredRequests.map((item) => <option key={item.id} value={item.id}>{item.requestCode}</option>)}</select>
          <select value={orderTenderId} onChange={(event) => setOrderTenderId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">Tender optional</option>{store.tenders.map((item) => <option key={item.id} value={item.id}>{item.tenderCode}</option>)}</select>
          <select value={orderSupplierId} onChange={(event) => setOrderSupplierId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">Supplier</option>{store.suppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <input value={orderLineLabel} onChange={(event) => setOrderLineLabel(event.target.value)} placeholder="Line label" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={orderLineQty} onChange={(event) => setOrderLineQty(Number(event.target.value) || 0)} placeholder="Qty" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={orderLinePrice} onChange={(event) => setOrderLinePrice(Number(event.target.value) || 0)} placeholder="Unit price" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={addOrderLine} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Add line</button>
          <button type="button" onClick={createOrder} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Create order</button>
        </div>
        <div className="mt-2 text-xs text-[var(--srg-text-muted)]">Draft lines: {orderLines.map((line) => `${line.label} x${line.quantity}`).join(' | ') || 'none'}</div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <select value={orderStatusId} onChange={(event) => setOrderStatusId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">Order</option>{filteredOrders.map((item) => <option key={item.id} value={item.id}>{item.orderCode}</option>)}</select>
          <select value={orderStatusValue} onChange={(event) => setOrderStatusValue(event.target.value as typeof orderStatuses[number])} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">{orderStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <input value={orderStatusComment} onChange={(event) => setOrderStatusComment(event.target.value)} placeholder="Status comment" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={updateOrderStatus} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Update status</button>
          <input type="number" value={partialQty} onChange={(event) => setPartialQty(Number(event.target.value) || 0)} placeholder="Partial qty" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={partialNote} onChange={(event) => setPartialNote(event.target.value)} placeholder="Partial note" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={addPartialDelivery} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Add partial delivery</button>
          <input type="number" value={returnQty} onChange={(event) => setReturnQty(Number(event.target.value) || 0)} placeholder="Return qty" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={returnReason} onChange={(event) => setReturnReason(event.target.value)} placeholder="Return reason" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={addOrderReturn} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Return order</button>
        </div>
        <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
          {filteredOrders.slice(0, 8).map((item) => <p key={item.id}>{item.orderCode} | {item.status} | {item.supplierName} | total {item.total.toFixed(2)} | partial {item.partialDeliveries.length}</p>)}
        </div>
      </Section>

      <Section title="Stocks" description="Entrees, sorties, reservations, inventaires, seuils, emplacements, magasins, entrepots, depots chantier et transferts.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <select value={stockId} onChange={(event) => setStockId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">New stock item</option>{store.stockItems.map((item) => <option key={item.id} value={item.id}>{item.materialRef}</option>)}</select>
          <input value={stockRef} onChange={(event) => setStockRef(event.target.value)} placeholder="Reference" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={stockLabel} onChange={(event) => setStockLabel(event.target.value)} placeholder="Label" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <select value={stockCategory} onChange={(event) => setStockCategory(event.target.value as typeof materialCategories[number])} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">{materialCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <input type="number" value={stockQty} onChange={(event) => setStockQty(Number(event.target.value) || 0)} placeholder="Qty" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={stockMin} onChange={(event) => setStockMin(Number(event.target.value) || 0)} placeholder="Min" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={stockMax} onChange={(event) => setStockMax(Number(event.target.value) || 0)} placeholder="Max" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={stockLocation} onChange={(event) => setStockLocation(event.target.value)} placeholder="Location" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={stockStore} onChange={(event) => setStockStore(event.target.value)} placeholder="Store" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={stockWarehouse} onChange={(event) => setStockWarehouse(event.target.value)} placeholder="Warehouse" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={stockDepot} onChange={(event) => setStockDepot(event.target.value)} placeholder="Chantier depot" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={stockTrace} onChange={(event) => setStockTrace(event.target.value)} placeholder="Traceability tag" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={saveStockItem} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Save stock item</button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <select value={movementItemId} onChange={(event) => setMovementItemId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">Stock item</option>{store.stockItems.map((item) => <option key={item.id} value={item.id}>{item.materialRef}</option>)}</select>
          <select value={movementType} onChange={(event) => setMovementType(event.target.value as typeof stockMovementTypes[number])} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">{stockMovementTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <input type="number" value={movementQty} onChange={(event) => setMovementQty(Number(event.target.value) || 0)} placeholder="Qty" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={movementFrom} onChange={(event) => setMovementFrom(event.target.value)} placeholder="From" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={movementTo} onChange={(event) => setMovementTo(event.target.value)} placeholder="To" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={movementReason} onChange={(event) => setMovementReason(event.target.value)} placeholder="Reason" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <select value={movementOrderId} onChange={(event) => setMovementOrderId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">Order optional</option>{store.orders.map((item) => <option key={item.id} value={item.id}>{item.orderCode}</option>)}</select>
          <button type="button" onClick={addMovement} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Record movement</button>
        </div>

        <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
          {store.stockItems.slice(0, 10).map((item) => <p key={item.id}>{item.materialRef} | qty {item.quantity} | min {item.minThreshold} | max {item.maxThreshold} | {item.location}</p>)}
        </div>
      </Section>

      <Section title="Industrial Materials" description="Moteurs, transformateurs, pompes, variateurs, compresseurs, reducteurs, automates, capteurs, disjoncteurs, cables, accessoires, outillage, consommables et spare parts.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <select value={materialCategory} onChange={(event) => setMaterialCategory(event.target.value as typeof materialCategories[number])} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">{materialCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <input value={materialRef} onChange={(event) => setMaterialRef(event.target.value)} placeholder="Reference" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={materialManufacturer} onChange={(event) => setMaterialManufacturer(event.target.value)} placeholder="Manufacturer" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={materialBrand} onChange={(event) => setMaterialBrand(event.target.value)} placeholder="Brand" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={materialSerial} onChange={(event) => setMaterialSerial(event.target.value)} placeholder="Serial" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="date" value={materialPurchaseDate} onChange={(event) => setMaterialPurchaseDate(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="date" value={materialReceptionDate} onChange={(event) => setMaterialReceptionDate(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="date" value={materialWarrantyDate} onChange={(event) => setMaterialWarrantyDate(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={materialDocs} onChange={(event) => setMaterialDocs(event.target.value)} placeholder="Docs comma" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={materialPhotos} onChange={(event) => setMaterialPhotos(event.target.value)} placeholder="Photos comma" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={materialQr} onChange={(event) => setMaterialQr(event.target.value)} placeholder="QR code" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={materialBar} onChange={(event) => setMaterialBar(event.target.value)} placeholder="Barcode" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={materialSupplier} onChange={(event) => setMaterialSupplier(event.target.value)} placeholder="Supplier" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <label className="inline-flex items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><input type="checkbox" checked={materialLinkKnowledge} onChange={(event) => setMaterialLinkKnowledge(event.target.checked)} />Link Prompt 030 docs</label>
          <button type="button" onClick={saveMaterial} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Save material</button>
        </div>
        <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
          {store.materials.slice(0, 8).map((item) => <p key={item.id}>{item.reference} | {item.serialNumber} | warranty {item.warrantyEndDate || 'n/a'} | docs {item.linkedDocuments.length}</p>)}
        </div>
      </Section>

      <Section title="Receptions" description="Controle qualite, PV reception, photos, reserves, signature et documents.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <select value={receptionOrderId} onChange={(event) => setReceptionOrderId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">Order</option>{store.orders.map((item) => <option key={item.id} value={item.id}>{item.orderCode}</option>)}</select>
          <input value={receptionQuality} onChange={(event) => setReceptionQuality(event.target.value)} placeholder="Quality control" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <select value={receptionResult} onChange={(event) => setReceptionResult(event.target.value as typeof receptionResult)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
            <option value="accepted">accepted</option>
            <option value="accepted-with-reserves">accepted-with-reserves</option>
            <option value="rejected">rejected</option>
          </select>
          <input value={receptionPv} onChange={(event) => setReceptionPv(event.target.value)} placeholder="PV number" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={receptionPhotos} onChange={(event) => setReceptionPhotos(event.target.value)} placeholder="Photos comma" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={receptionObs} onChange={(event) => setReceptionObs(event.target.value)} placeholder="Observations" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={receptionReserves} onChange={(event) => setReceptionReserves(event.target.value)} placeholder="Reserves comma" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={receptionSignature} onChange={(event) => setReceptionSignature(event.target.value)} placeholder="Signature" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={receptionDocs} onChange={(event) => setReceptionDocs(event.target.value)} placeholder="Documents comma" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={saveReception} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Record reception</button>
        </div>
        <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
          {store.receptions.slice(0, 8).map((item) => <p key={item.id}>{item.pvNumber} | order {item.orderId} | {item.result} | sign {item.signature || 'n/a'}</p>)}
        </div>
      </Section>

      <Section title="Logistics" description="Expedition, transport, suivi, localisation, incidents, livraison et reception chantier.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <select value={logisticsOrderId} onChange={(event) => setLogisticsOrderId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">Order</option>{store.orders.map((item) => <option key={item.id} value={item.id}>{item.orderCode}</option>)}</select>
          <input value={shipmentCode} onChange={(event) => setShipmentCode(event.target.value)} placeholder="Shipment code" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={shipmentTransporter} onChange={(event) => setShipmentTransporter(event.target.value)} placeholder="Transporter" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={shipmentOrigin} onChange={(event) => setShipmentOrigin(event.target.value)} placeholder="Origin" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={shipmentDestination} onChange={(event) => setShipmentDestination(event.target.value)} placeholder="Destination" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={createShipment} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Create shipment</button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6 text-sm">
          <select value={updateLogisticsId} onChange={(event) => setUpdateLogisticsId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2"><option value="">Shipment</option>{store.logistics.map((item) => <option key={item.id} value={item.id}>{item.shipmentCode}</option>)}</select>
          <select value={updateLogisticsStatus} onChange={(event) => setUpdateLogisticsStatus(event.target.value as typeof logisticsStatuses[number])} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">{logisticsStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <input value={updateLocation} onChange={(event) => setUpdateLocation(event.target.value)} placeholder="Current location" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={updateIncident} onChange={(event) => setUpdateIncident(event.target.value)} placeholder="Incident optional" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="date" value={updateDeliveryDate} onChange={(event) => setUpdateDeliveryDate(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="date" value={updateSiteDate} onChange={(event) => setUpdateSiteDate(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={updateShipment} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Update shipment</button>
        </div>

        <div className="mt-3 space-y-2 text-xs text-[var(--srg-text-muted)]">
          {store.logistics.slice(0, 10).map((item) => <p key={item.id}>{item.shipmentCode} | {item.status} | {item.currentLocation} | incidents {item.incidents.length}</p>)}
        </div>
      </Section>

      <Section title="AI Procurement" description="Analyse automatique budget/delais/fournisseurs/stock et contexte Prompt 030-031-032.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <input value={aiQuestion} onChange={(event) => setAiQuestion(event.target.value)} placeholder="Ask procurement AI" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 sm:col-span-2 xl:col-span-3" />
          <button type="button" onClick={runAi} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Run AI</button>
          <button type="button" onClick={() => ProcurementInventoryWorkspaceService.exportStore()} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Export JSON</button>
          <button type="button" onClick={() => ProcurementInventoryWorkspaceService.exportOrdersCsv()} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Export Orders CSV</button>
          <button type="button" onClick={() => ProcurementInventoryWorkspaceService.exportStockCsv()} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Export Stock CSV</button>
          <Link to="/knowledge-center" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Open Prompt 030</Link>
          <Link to="/business-policy" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Open Prompt 031</Link>
          <Link to="/project-execution" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">Open Prompt 032</Link>
        </div>
        <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-xs text-[var(--srg-text-muted)]">{aiAnswer || 'No AI answer yet.'}</pre>

        <div className="mt-3 grid gap-3 lg:grid-cols-2 text-xs text-[var(--srg-text-muted)]">
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
            <p className="font-semibold text-[var(--srg-text-title)]">Prompt integration context</p>
            <p>Prompt 032 project: {integration.project?.name || 'n/a'}</p>
            <p>Prompt 031 policies: {integration.policySummary.policies}</p>
            <p>Prompt 031 coefficients: {integration.policySummary.coefficients}</p>
            <p>Prompt 030 linked docs: {integration.knowledgeDocuments.length}</p>
            <p>Known suppliers from Prompt 030: {integration.knownSuppliers.slice(0, 5).join(' | ') || 'n/a'}</p>
          </div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
            <p className="font-semibold text-[var(--srg-text-title)]">Observability snapshot</p>
            <p>Timeline events: {store.timeline.length}</p>
            <p>Diagnostics: {store.diagnostics.length}</p>
            <p>Metrics: {store.metrics.length}</p>
            <p>AI insights: {store.aiInsights.length}</p>
          </div>
        </div>
      </Section>
    </div>
  )
}
