import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Section from '#/app/components/Section'
import { useFinanceWorkspace } from '#/app/hooks/useFinanceWorkspace'
import { FinanceWorkspaceService } from '#/app/services/FinanceWorkspaceService'
import { ProjectExecutionWorkspaceService } from '#/app/services/ProjectExecutionWorkspaceService'

type FinanceView = 'overview' | 'accounting' | 'treasury' | 'customers' | 'suppliers' | 'budgets' | 'management-control'

export default function FinanceWorkspace(props: { initialView?: FinanceView }) {
  const workspace = useFinanceWorkspace()
  const projects = ProjectExecutionWorkspaceService.getStore().projects
  const [activeView, setActiveView] = useState<FinanceView>(props.initialView ?? 'overview')

  const [entryDescription, setEntryDescription] = useState('Ajustement comptable')
  const [entryDebitAccount, setEntryDebitAccount] = useState('411000')
  const [entryCreditAccount, setEntryCreditAccount] = useState('706000')
  const [entryAmount, setEntryAmount] = useState(0)

  const [customerName, setCustomerName] = useState('')
  const [customerCode, setCustomerCode] = useState('')
  const [customerContact, setCustomerContact] = useState('')
  const [customerInvoiceCustomerId, setCustomerInvoiceCustomerId] = useState(workspace.store.customers[0]?.id ?? '')
  const [customerInvoiceAmount, setCustomerInvoiceAmount] = useState(0)
  const [customerInvoiceDueDate, setCustomerInvoiceDueDate] = useState('')
  const [customerInvoiceIssueDate, setCustomerInvoiceIssueDate] = useState('')
  const [customerInvoiceDesc, setCustomerInvoiceDesc] = useState('Facturation travaux')
  const [customerReceiptInvoiceId, setCustomerReceiptInvoiceId] = useState(workspace.store.customerInvoices[0]?.id ?? '')
  const [customerReceiptAmount, setCustomerReceiptAmount] = useState(0)

  const [supplierName, setSupplierName] = useState('')
  const [supplierOrderCode, setSupplierOrderCode] = useState('')
  const [supplierInvoiceAmount, setSupplierInvoiceAmount] = useState(0)
  const [supplierInvoiceDueDate, setSupplierInvoiceDueDate] = useState('')
  const [supplierInvoiceIssueDate, setSupplierInvoiceIssueDate] = useState('')
  const [supplierPaymentInvoiceId, setSupplierPaymentInvoiceId] = useState(workspace.store.supplierInvoices[0]?.id ?? '')
  const [supplierPaymentAmount, setSupplierPaymentAmount] = useState(0)

  const [treasuryCode, setTreasuryCode] = useState('')
  const [treasuryLabel, setTreasuryLabel] = useState('')
  const [treasuryCurrency, setTreasuryCurrency] = useState('XAF')
  const [treasuryOpening, setTreasuryOpening] = useState(0)
  const [treasuryCurrent, setTreasuryCurrent] = useState(0)
  const [treasuryChannel, setTreasuryChannel] = useState<'bank' | 'cash' | 'mobile-money' | 'card'>('bank')

  const [transferFrom, setTransferFrom] = useState(workspace.store.treasuryAccounts[0]?.id ?? '')
  const [transferTo, setTransferTo] = useState(workspace.store.treasuryAccounts[1]?.id ?? '')
  const [transferAmount, setTransferAmount] = useState(0)
  const [transferReference, setTransferReference] = useState('TRF-001')

  const [budgetVersionCode, setBudgetVersionCode] = useState('')
  const [budgetVersionLabel, setBudgetVersionLabel] = useState('')
  const [budgetVersionRevision, setBudgetVersionRevision] = useState(1)

  const [costCenterCode, setCostCenterCode] = useState('')
  const [costCenterLabel, setCostCenterLabel] = useState('')
  const [costCenterDimension, setCostCenterDimension] = useState<'direction' | 'service' | 'workshop' | 'site' | 'project' | 'client' | 'equipment'>('project')
  const [costCenterPlanned, setCostCenterPlanned] = useState(0)
  const [costCenterActual, setCostCenterActual] = useState(0)

  const [docQuery, setDocQuery] = useState('facture recu releve bancaire zip ocr')
  const [aiProjectId, setAiProjectId] = useState(workspace.selectedProjectId === 'all' ? projects[0].id : workspace.selectedProjectId)
  const [aiQuestion, setAiQuestion] = useState('Pourquoi le chantier Razel depasse-t-il son budget ?')
  const [aiAnswer, setAiAnswer] = useState('')

  const currentProjectId = useMemo(() => {
    if (workspace.selectedProjectId !== 'all') return workspace.selectedProjectId
    return projects[0].id
  }, [workspace.selectedProjectId, projects])

  const postEntry = () => {
    const period = workspace.store.fiscalPeriods[0]
    FinanceWorkspaceService.postAccountingEntry({
      journalCode: 'GEN',
      periodId: period.id,
      date: new Date().toISOString().slice(0, 10),
      description: entryDescription,
      lines: [
        { accountCode: entryDebitAccount, description: entryDescription, debit: entryAmount, credit: 0, costCenterCode: 'GEN', projectId: currentProjectId },
        { accountCode: entryCreditAccount, description: entryDescription, debit: 0, credit: entryAmount, costCenterCode: 'GEN', projectId: currentProjectId },
      ],
    })
    workspace.refresh()
  }

  const createCustomer = () => {
    FinanceWorkspaceService.upsertCustomer({
      code: customerCode,
      name: customerName,
      projectId: currentProjectId,
      contact: customerContact,
      paymentTermsDays: 30,
    })
    setCustomerCode('')
    setCustomerName('')
    setCustomerContact('')
    workspace.refresh()
  }

  const createCustomerInvoice = () => {
    FinanceWorkspaceService.createCustomerInvoice({
      customerId: customerInvoiceCustomerId,
      projectId: currentProjectId,
      amountExclTax: customerInvoiceAmount,
      dueDate: customerInvoiceDueDate,
      issueDate: customerInvoiceIssueDate,
      description: customerInvoiceDesc,
    })
    workspace.refresh()
  }

  const receiveCustomerPayment = () => {
    const account = workspace.store.treasuryAccounts[0]
    FinanceWorkspaceService.registerCustomerReceipt({
      invoiceId: customerReceiptInvoiceId,
      amount: customerReceiptAmount,
      channel: 'bank',
      accountId: account.id,
      date: new Date().toISOString().slice(0, 10),
      reference: `RCP-${Date.now()}`,
    })
    workspace.refresh()
  }

  const createSupplierInvoice = () => {
    FinanceWorkspaceService.createSupplierInvoice({
      supplierName,
      projectId: currentProjectId,
      procurementOrderCode: supplierOrderCode,
      amountExclTax: supplierInvoiceAmount,
      dueDate: supplierInvoiceDueDate,
      issueDate: supplierInvoiceIssueDate,
    })
    workspace.refresh()
  }

  const paySupplier = () => {
    const account = workspace.store.treasuryAccounts[0]
    FinanceWorkspaceService.registerSupplierPayment({
      supplierInvoiceId: supplierPaymentInvoiceId,
      amount: supplierPaymentAmount,
      channel: 'bank',
      accountId: account.id,
      date: new Date().toISOString().slice(0, 10),
      reference: `PAY-${Date.now()}`,
    })
    workspace.refresh()
  }

  const createTreasury = () => {
    FinanceWorkspaceService.upsertTreasuryAccount({
      code: treasuryCode,
      label: treasuryLabel,
      channel: treasuryChannel,
      currency: treasuryCurrency,
      openingBalance: treasuryOpening,
      currentBalance: treasuryCurrent,
      active: true,
    })
    workspace.refresh()
  }

  const transfer = () => {
    if (!transferFrom || !transferTo) return
    FinanceWorkspaceService.transferFunds({
      fromAccountId: transferFrom,
      toAccountId: transferTo,
      amount: transferAmount,
      date: new Date().toISOString().slice(0, 10),
      reference: transferReference,
    })
    workspace.refresh()
  }

  const createBudgetVersion = () => {
    FinanceWorkspaceService.upsertBudgetVersion({
      code: budgetVersionCode,
      label: budgetVersionLabel,
      revision: budgetVersionRevision,
      status: 'validated',
    })
    workspace.refresh()
  }

  const upsertCostCenter = () => {
    FinanceWorkspaceService.upsertCostCenterSnapshot({
      code: costCenterCode,
      label: costCenterLabel,
      dimension: costCenterDimension,
      planned: costCenterPlanned,
      actual: costCenterActual,
    })
    workspace.refresh()
  }

  const ingestDocs = () => {
    FinanceWorkspaceService.ingestFinancialDocuments(docQuery)
    workspace.refresh()
  }

  const askAi = () => {
    const answer = FinanceWorkspaceService.askFinanceAi(aiProjectId, aiQuestion)
    setAiAnswer(`${answer.answer}\n\nConfidence: ${answer.confidence}`)
    workspace.refresh()
  }

  const latestStatement = workspace.store.statements[0]

  return (
    <div className="space-y-6">
      <Section title="Enterprise Accounting, Finance & Management Control" description="Comptabilite generale/clients/fournisseurs, tresorerie, budgets, centres de cout, analyses, IA et observabilite financiere.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Metric label="Comptes" value={workspace.summary.accounts} />
          <Metric label="Ecritures" value={workspace.summary.entries} />
          <Metric label="Factures clients" value={workspace.summary.customerInvoices} />
          <Metric label="Factures fournisseurs" value={workspace.summary.supplierInvoices} />
          <Metric label="Tresorerie" value={workspace.summary.treasuryBalance.toFixed(2)} />
          <Metric label="Marge" value={workspace.summary.margin.toFixed(2)} />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-6 text-sm">
          <Info label="Cash Flow" value={workspace.summary.cashFlow.toFixed(2)} />
          <Info label="EBITDA" value={workspace.summary.ebitda.toFixed(2)} />
          <Info label="ROI" value={`${workspace.summary.roi.toFixed(2)}%`} />
          <Info label="Factures en retard" value={`${workspace.summary.customerOverdue + workspace.summary.supplierOverdue}`} />
          <Info label="Ecart budget" value={workspace.summary.budgetVariance.toFixed(2)} />
          <Info label="Diagnostics" value={`${workspace.summary.diagnostics}`} />
        </div>
      </Section>

      <Section title="Navigation Finance" description="Vues metier finance et acces directs par route.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7 text-sm">
          {[
            ['overview', 'Finance'],
            ['accounting', 'Comptabilite'],
            ['treasury', 'Tresorerie'],
            ['customers', 'Clients'],
            ['suppliers', 'Fournisseurs'],
            ['budgets', 'Budgets'],
            ['management-control', 'Controle de gestion'],
          ].map((item) => (
            <button
              key={item[0]}
              type="button"
              onClick={() => setActiveView(item[0] as FinanceView)}
              className={`rounded-3xl border px-4 py-3 ${activeView === item[0] ? 'border-[var(--lagoon)] bg-[var(--surface)] font-semibold text-[var(--sea-ink)]' : 'border-[var(--line)] bg-[var(--surface-strong)] text-[var(--sea-ink-soft)]'}`}
            >
              {item[1]}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <select value={workspace.selectedProjectId} onChange={(event) => workspace.setSelectedProjectId(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
            <option value="all">all projects</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <input value={workspace.search} onChange={(event) => workspace.setSearch(event.target.value)} placeholder="Recherche facture/ecriture" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
          <select value={workspace.customerStatusFilter} onChange={(event) => workspace.setCustomerStatusFilter(event.target.value as typeof workspace.customerStatusFilter)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
            <option value="all">all customer status</option>
            {workspace.customerStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select value={workspace.supplierStatusFilter} onChange={(event) => workspace.setSupplierStatusFilter(event.target.value as typeof workspace.supplierStatusFilter)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
            <option value="all">all supplier status</option>
            {workspace.supplierStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </Section>

      {activeView === 'overview' || activeView === 'accounting' ? (
        <Section title="Comptabilite generale" description="Plan comptable, journaux, grand livre, balance, periodes, clotures/reouvertures, ecritures et pieces comptables.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
            <input value={entryDescription} onChange={(event) => setEntryDescription(event.target.value)} placeholder="Description ecriture" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input value={entryDebitAccount} onChange={(event) => setEntryDebitAccount(event.target.value)} placeholder="Compte debit" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input value={entryCreditAccount} onChange={(event) => setEntryCreditAccount(event.target.value)} placeholder="Compte credit" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input type="number" value={entryAmount} onChange={(event) => setEntryAmount(Number(event.target.value) || 0)} placeholder="Montant" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <button type="button" onClick={postEntry} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 font-semibold text-white">Poster ecriture</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => FinanceWorkspaceService.closePeriod(workspace.store.fiscalPeriods[0]?.id ?? '', 'Monthly close', 'Finance Manager')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Cloturer periode</button>
            <button type="button" onClick={() => FinanceWorkspaceService.reopenPeriod(workspace.store.fiscalPeriods[0]?.id ?? '', 'Adjustment needed', 'Finance Manager')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Reouvrir periode</button>
            <button type="button" onClick={() => FinanceWorkspaceService.exportGeneralLedgerCsv()} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Export Grand Livre CSV</button>
          </div>
          <div className="mt-3 grid gap-3 text-xs text-[var(--sea-ink-soft)]">
            {workspace.store.entries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4">
                {entry.entryNumber} | {entry.journalCode} | {entry.status} | D {entry.debitTotal} | C {entry.creditTotal}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeView === 'overview' || activeView === 'customers' ? (
        <Section title="Comptabilite clients" description="Clients, factures, avoirs, encaissements, echeances, relances, soldes, historique et retards.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
            <input value={customerCode} onChange={(event) => setCustomerCode(event.target.value)} placeholder="Code client" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nom client" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input value={customerContact} onChange={(event) => setCustomerContact(event.target.value)} placeholder="Contact" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <button type="button" onClick={createCustomer} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 font-semibold text-white">Creer client</button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-6 text-sm">
            <select value={customerInvoiceCustomerId} onChange={(event) => setCustomerInvoiceCustomerId(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              {workspace.store.customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.code}</option>)}
            </select>
            <input type="number" value={customerInvoiceAmount} onChange={(event) => setCustomerInvoiceAmount(Number(event.target.value) || 0)} placeholder="Montant HT" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input type="date" value={customerInvoiceIssueDate} onChange={(event) => setCustomerInvoiceIssueDate(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input type="date" value={customerInvoiceDueDate} onChange={(event) => setCustomerInvoiceDueDate(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input value={customerInvoiceDesc} onChange={(event) => setCustomerInvoiceDesc(event.target.value)} placeholder="Description" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <button type="button" onClick={createCustomerInvoice} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Creer facture</button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
            <select value={customerReceiptInvoiceId} onChange={(event) => setCustomerReceiptInvoiceId(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              {workspace.store.customerInvoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoiceNumber}</option>)}
            </select>
            <input type="number" value={customerReceiptAmount} onChange={(event) => setCustomerReceiptAmount(Number(event.target.value) || 0)} placeholder="Encaissement" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <button type="button" onClick={receiveCustomerPayment} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Enregistrer paiement</button>
            <button type="button" onClick={() => FinanceWorkspaceService.createReminder(customerReceiptInvoiceId, 1, 'Reminder L1')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Relance L1</button>
            <button type="button" onClick={() => FinanceWorkspaceService.exportCustomerAgingCsv()} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Export balance agee</button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
            {workspace.filteredCustomerInvoices.slice(0, 12).map((invoice) => (
              <div key={invoice.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4">
                {invoice.invoiceNumber} | {invoice.customerName} | {invoice.status} | balance {invoice.balanceDue.toFixed(2)}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeView === 'overview' || activeView === 'suppliers' ? (
        <Section title="Comptabilite fournisseurs" description="Factures fournisseurs, paiements, echeances, avoirs, retenues et historique.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6 text-sm">
            <input value={supplierName} onChange={(event) => setSupplierName(event.target.value)} placeholder="Fournisseur" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input value={supplierOrderCode} onChange={(event) => setSupplierOrderCode(event.target.value)} placeholder="Commande achat" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input type="number" value={supplierInvoiceAmount} onChange={(event) => setSupplierInvoiceAmount(Number(event.target.value) || 0)} placeholder="Montant HT" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input type="date" value={supplierInvoiceIssueDate} onChange={(event) => setSupplierInvoiceIssueDate(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input type="date" value={supplierInvoiceDueDate} onChange={(event) => setSupplierInvoiceDueDate(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <button type="button" onClick={createSupplierInvoice} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 font-semibold text-white">Creer facture fournisseur</button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
            <select value={supplierPaymentInvoiceId} onChange={(event) => setSupplierPaymentInvoiceId(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              {workspace.store.supplierInvoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoiceNumber}</option>)}
            </select>
            <input type="number" value={supplierPaymentAmount} onChange={(event) => setSupplierPaymentAmount(Number(event.target.value) || 0)} placeholder="Paiement" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <button type="button" onClick={paySupplier} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Enregistrer paiement</button>
            <button type="button" onClick={() => FinanceWorkspaceService.exportSupplierAgingCsv()} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Export echeances</button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
            {workspace.filteredSupplierInvoices.slice(0, 12).map((invoice) => (
              <div key={invoice.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4">
                {invoice.invoiceNumber} | {invoice.supplierName} | {invoice.status} | retention {invoice.retentionAmount.toFixed(2)} | balance {invoice.balanceDue.toFixed(2)}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeView === 'overview' || activeView === 'treasury' ? (
        <Section title="Tresorerie" description="Banques, caisses, comptes, virements, mobile money, cartes, flux, previsions, soldes et rapprochements.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6 text-sm">
            <input value={treasuryCode} onChange={(event) => setTreasuryCode(event.target.value)} placeholder="Code compte" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input value={treasuryLabel} onChange={(event) => setTreasuryLabel(event.target.value)} placeholder="Libelle" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <select value={treasuryChannel} onChange={(event) => setTreasuryChannel(event.target.value as 'bank' | 'cash' | 'mobile-money' | 'card')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              {workspace.treasuryChannels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
            </select>
            <input value={treasuryCurrency} onChange={(event) => setTreasuryCurrency(event.target.value)} placeholder="Devise" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input type="number" value={treasuryOpening} onChange={(event) => setTreasuryOpening(Number(event.target.value) || 0)} placeholder="Ouverture" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input type="number" value={treasuryCurrent} onChange={(event) => setTreasuryCurrent(Number(event.target.value) || 0)} placeholder="Solde courant" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <button type="button" onClick={createTreasury} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 font-semibold text-white">Creer compte</button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
            <select value={transferFrom} onChange={(event) => setTransferFrom(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              {workspace.store.treasuryAccounts.map((account) => <option key={account.id} value={account.id}>{account.code}</option>)}
            </select>
            <select value={transferTo} onChange={(event) => setTransferTo(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              {workspace.store.treasuryAccounts.map((account) => <option key={account.id} value={account.id}>{account.code}</option>)}
            </select>
            <input type="number" value={transferAmount} onChange={(event) => setTransferAmount(Number(event.target.value) || 0)} placeholder="Montant virement" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input value={transferReference} onChange={(event) => setTransferReference(event.target.value)} placeholder="Reference" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <button type="button" onClick={transfer} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Virement</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => FinanceWorkspaceService.reconcileAccount({ accountId: transferFrom, statementBalance: workspace.store.treasuryAccounts.find((item) => item.id === transferFrom)?.currentBalance ?? 0, date: new Date().toISOString().slice(0, 10), note: 'Auto reconcile check' })} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">Rapprochement</button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
            {workspace.store.treasuryAccounts.slice(0, 12).map((account) => (
              <div key={account.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4">
                {account.code} | {account.channel} | solde {account.currentBalance.toFixed(2)} {account.currency}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeView === 'overview' || activeView === 'budgets' || activeView === 'management-control' ? (
        <Section title="Budgets & controle de gestion" description="Budgets, previsions, realise, ecarts, revisions, simulations, versions et centres de cout.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 text-sm">
            <input value={budgetVersionCode} onChange={(event) => setBudgetVersionCode(event.target.value)} placeholder="Code version" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input value={budgetVersionLabel} onChange={(event) => setBudgetVersionLabel(event.target.value)} placeholder="Libelle version" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input type="number" value={budgetVersionRevision} onChange={(event) => setBudgetVersionRevision(Number(event.target.value) || 1)} placeholder="Revision" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <button type="button" onClick={createBudgetVersion} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 font-semibold text-white">Creer version</button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-6 text-sm">
            <input value={costCenterCode} onChange={(event) => setCostCenterCode(event.target.value)} placeholder="Code centre" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input value={costCenterLabel} onChange={(event) => setCostCenterLabel(event.target.value)} placeholder="Libelle centre" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <select value={costCenterDimension} onChange={(event) => setCostCenterDimension(event.target.value as 'direction' | 'service' | 'workshop' | 'site' | 'project' | 'client' | 'equipment')} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
              {['direction', 'service', 'workshop', 'site', 'project', 'client', 'equipment'].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input type="number" value={costCenterPlanned} onChange={(event) => setCostCenterPlanned(Number(event.target.value) || 0)} placeholder="Prevu" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <input type="number" value={costCenterActual} onChange={(event) => setCostCenterActual(Number(event.target.value) || 0)} placeholder="Realise" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3" />
            <button type="button" onClick={upsertCostCenter} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Enregistrer centre</button>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-3 text-xs text-[var(--sea-ink-soft)]">
            <InfoCard title="Budget" rows={[`Prevu ${workspace.summary.budgetPlanned.toFixed(2)}`, `Realise ${workspace.summary.budgetActual.toFixed(2)}`, `Ecart ${workspace.summary.budgetVariance.toFixed(2)}`]} />
            <InfoCard title="Ratios" rows={[`Liquidite ${workspace.summary.liquidityRatio}`, `ROI ${workspace.summary.roi.toFixed(2)}%`, `Marge ${workspace.summary.margin.toFixed(2)}`]} />
            <InfoCard title="Centres" rows={workspace.store.costCenters.slice(0, 5).map((item) => `${item.code} ${item.variance.toFixed(2)}`)} />
          </div>
        </Section>
      ) : null}

      <Section title="Analyse financiere automatique" description="Compte de resultat, bilan, flux, ratios, marge, rentabilite, ROI, cash flow et EBITDA.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <Info label="CA" value={latestStatement.profitAndLoss.revenue.toFixed(2)} />
          <Info label="Charges" value={latestStatement.profitAndLoss.expense.toFixed(2)} />
          <Info label="Marge" value={latestStatement.profitAndLoss.margin.toFixed(2)} />
          <Info label="EBITDA" value={latestStatement.profitAndLoss.ebitda.toFixed(2)} />
          <Info label="Actifs" value={latestStatement.balanceSheet.assets.toFixed(2)} />
          <Info label="Passifs" value={latestStatement.balanceSheet.liabilities.toFixed(2)} />
          <Info label="Cash flow net" value={latestStatement.cashFlow.net.toFixed(2)} />
          <Info label="ROI" value={`${latestStatement.ratios.roi.toFixed(2)}%`} />
        </div>
      </Section>

      <Section title="IA Finance" description="Analyse depenses, anomalies, doublons, previsions de tresorerie/retards/risques et explications en langage naturel.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <input value={docQuery} onChange={(event) => setDocQuery(event.target.value)} placeholder="Requete docs 030 (pdf/factures/recus/releves/zip/ocr)" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 xl:col-span-3" />
          <button type="button" onClick={ingestDocs} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Ingerer docs</button>
          <select value={aiProjectId} onChange={(event) => setAiProjectId(event.target.value)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <input value={aiQuestion} onChange={(event) => setAiQuestion(event.target.value)} placeholder="Question IA" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 xl:col-span-2" />
          <button type="button" onClick={askAi} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 font-semibold text-white">Analyser</button>
        </div>
        <pre className="mt-3 whitespace-pre-wrap rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 text-xs text-[var(--sea-ink-soft)]">{aiAnswer || 'No AI answer yet.'}</pre>
      </Section>

      <Section title="Integrations & Exports" description="Prompts 030/031/032/033/034, dashboard finance, history/export et observabilite.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <Link to="/knowledge-center" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Prompt 030 Knowledge</Link>
          <Link to="/business-policy" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Prompt 031 Business Policy</Link>
          <Link to="/project-execution" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Prompt 032 Project Execution</Link>
          <Link to="/procurement-inventory" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Prompt 033 Procurement</Link>
          <Link to="/maintenance" className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Prompt 034 Maintenance</Link>
          <button type="button" onClick={() => FinanceWorkspaceService.exportStore()} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Export JSON</button>
          <button type="button" onClick={() => FinanceWorkspaceService.exportGeneralLedgerCsv()} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Export Journal CSV</button>
          <button type="button" onClick={() => FinanceWorkspaceService.exportCustomerAgingCsv()} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 font-semibold text-[var(--sea-ink)]">Export Clients CSV</button>
        </div>
      </Section>
    </div>
  )
}

function Metric(props: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">{props.label}</p>
      <p className="mt-2 text-3xl font-semibold text-[var(--sea-ink)]">{props.value}</p>
    </div>
  )
}

function Info(props: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-[var(--sea-ink-soft)]">
      <strong className="text-[var(--sea-ink)]">{props.label}: </strong>
      {props.value}
    </div>
  )
}

function InfoCard(props: { title: string; rows: string[] }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
      <p className="font-semibold text-[var(--sea-ink)]">{props.title}</p>
      <div className="mt-2 space-y-1">
        {props.rows.map((row) => <p key={row}>{row}</p>)}
      </div>
    </div>
  )
}
