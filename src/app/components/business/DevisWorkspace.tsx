import { useMemo, useState } from 'react'
import Section from '#/app/components/Section'
import { BusinessPolicyWorkspaceService } from '#/app/services/BusinessPolicyWorkspaceService'
import type { BillingDocumentType, QuoteLineType } from '#/app/services/BusinessPolicyWorkspaceService'

type DraftLine = {
  type: QuoteLineType
  label: string
  quantity: number
  unitPrice: number
  coefficient: number
}

const BILLING_TYPES: BillingDocumentType[] = [
  'invoice',
  'proforma',
  'purchase-order',
  'delivery-note',
  'reception-note',
  'credit-note',
  'progress-billing',
  'statement',
]

export default function DevisWorkspace() {
  const [tick, setTick] = useState(0)
  const refresh = () => setTick((value) => value + 1)

  const store = useMemo(() => BusinessPolicyWorkspaceService.getStore(), [tick])
  const summary = useMemo(() => BusinessPolicyWorkspaceService.getSummary(), [tick])

  const [title, setTitle] = useState('')
  const [customer, setCustomer] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [taxPercent, setTaxPercent] = useState(18)
  const [marginPercent, setMarginPercent] = useState(15)
  const [observations, setObservations] = useState('')
  const [commercialConditions, setCommercialConditions] = useState('')
  const [technicalConditions, setTechnicalConditions] = useState('')
  const [attachments, setAttachments] = useState('')

  const [lineType, setLineType] = useState<QuoteLineType>('supply')
  const [lineLabel, setLineLabel] = useState('')
  const [lineQuantity, setLineQuantity] = useState(1)
  const [lineUnitPrice, setLineUnitPrice] = useState(0)
  const [lineCoefficient, setLineCoefficient] = useState(1)
  const [lines, setLines] = useState<DraftLine[]>([])

  const [selectedQuoteId, setSelectedQuoteId] = useState(store.quotes[0]?.id ?? '')
  const [selectedDocType, setSelectedDocType] = useState<BillingDocumentType>('invoice')

  const addLine = () => {
    if (!lineLabel.trim()) return
    setLines((current) => [
      ...current,
      {
        type: lineType,
        label: lineLabel,
        quantity: lineQuantity,
        unitPrice: lineUnitPrice,
        coefficient: lineCoefficient,
      },
    ])
    setLineType('supply')
    setLineLabel('')
    setLineQuantity(1)
    setLineUnitPrice(0)
    setLineCoefficient(1)
  }

  const createQuote = () => {
    if (lines.length === 0) return
    const quote = BusinessPolicyWorkspaceService.createQuote({
      title,
      customer,
      currency,
      lines,
      discountPercent,
      taxPercent,
      marginPercent,
      attachments: attachments.split(',').map((item) => item.trim()).filter((item) => item.length > 0),
      observations,
      commercialConditions,
      technicalConditions,
    })

    setSelectedQuoteId(quote.id)
    setTitle('')
    setCustomer('')
    setCurrency('EUR')
    setDiscountPercent(0)
    setTaxPercent(18)
    setMarginPercent(15)
    setObservations('')
    setCommercialConditions('')
    setTechnicalConditions('')
    setAttachments('')
    setLines([])
    refresh()
  }

  const createBilling = () => {
    if (!selectedQuoteId) return
    BusinessPolicyWorkspaceService.createBillingDocument(selectedDocType, selectedQuoteId)
    refresh()
  }

  return (
    <div className="space-y-6">
      <Section title="Devis Workspace" description="Build quotes with supplies, labor, transport, subcontracting, rental, services, discounts, taxes and margin.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Quotes</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.quotes}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Billing docs</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.billingDocuments}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Total quotes</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.totalQuoteValue.toFixed(2)}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">Total billing</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.totalBillingValue.toFixed(2)}</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">AI answers</p><p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{summary.aiAnswers}</p></div>
        </div>
      </Section>

      <Section title="Quote Builder" description="Compose quote lines, add observations, commercial and technical conditions.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Quote title" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="Customer" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={currency} onChange={(event) => setCurrency(event.target.value)} placeholder="Currency" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={discountPercent} onChange={(event) => setDiscountPercent(Number(event.target.value) || 0)} placeholder="Discount %" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={taxPercent} onChange={(event) => setTaxPercent(Number(event.target.value) || 0)} placeholder="Tax %" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input type="number" value={marginPercent} onChange={(event) => setMarginPercent(Number(event.target.value) || 0)} placeholder="Margin %" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <input value={attachments} onChange={(event) => setAttachments(event.target.value)} placeholder="Attachments (comma separated)" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
        </div>

        <div className="mt-3 grid gap-3 text-sm">
          <textarea value={observations} onChange={(event) => setObservations(event.target.value)} placeholder="Observations" className="min-h-16 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <textarea value={commercialConditions} onChange={(event) => setCommercialConditions(event.target.value)} placeholder="Commercial conditions" className="min-h-16 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
          <textarea value={technicalConditions} onChange={(event) => setTechnicalConditions(event.target.value)} placeholder="Technical conditions" className="min-h-16 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
          <p className="text-sm font-semibold text-[var(--sea-ink)]">Add line item</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-5 text-sm">
            <select value={lineType} onChange={(event) => setLineType(event.target.value as QuoteLineType)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
              <option value="supply">Supply</option>
              <option value="labor">Labor</option>
              <option value="transport">Transport</option>
              <option value="subcontracting">Subcontracting</option>
              <option value="rental">Rental</option>
              <option value="service">Service</option>
              <option value="other">Other</option>
            </select>
            <input value={lineLabel} onChange={(event) => setLineLabel(event.target.value)} placeholder="Label" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
            <input type="number" value={lineQuantity} onChange={(event) => setLineQuantity(Number(event.target.value) || 0)} placeholder="Qty" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
            <input type="number" value={lineUnitPrice} onChange={(event) => setLineUnitPrice(Number(event.target.value) || 0)} placeholder="Unit price" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
            <input type="number" step="0.01" value={lineCoefficient} onChange={(event) => setLineCoefficient(Number(event.target.value) || 0)} placeholder="Coefficient" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2" />
            <button type="button" onClick={addLine} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-semibold text-[var(--sea-ink)]">Add line</button>
          </div>

          <div className="mt-3 space-y-2 text-xs text-[var(--sea-ink-soft)]">
            {lines.map((line, index) => (
              <p key={`${line.label}-${index}`}>{line.type} | {line.label} | qty {line.quantity} | unit {line.unitPrice} | coef {line.coefficient}</p>
            ))}
          </div>
        </div>

        <button type="button" onClick={createQuote} className="mt-4 rounded-2xl bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white">Create quote</button>
      </Section>

      <Section title="Billing Engine" description="Generate invoice, proforma, purchase order, delivery/reception notes, credit note, progress billing and statement from the same engine.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <select value={selectedQuoteId} onChange={(event) => setSelectedQuoteId(event.target.value)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
            {store.quotes.map((quote) => <option key={quote.id} value={quote.id}>{quote.code} - {quote.customer}</option>)}
          </select>
          <select value={selectedDocType} onChange={(event) => setSelectedDocType(event.target.value as BillingDocumentType)} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
            {BILLING_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <button type="button" onClick={createBilling} className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 font-semibold text-white">Generate document</button>
        </div>

        <div className="mt-4 grid gap-3 text-xs text-[var(--sea-ink-soft)] lg:grid-cols-2">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <p className="font-semibold text-[var(--sea-ink)]">Quotes</p>
            {store.quotes.slice(0, 12).map((quote) => <p key={quote.id}>{quote.code} | {quote.customer} | total {quote.totals.total.toFixed(2)} {quote.currency}</p>)}
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <p className="font-semibold text-[var(--sea-ink)]">Billing documents</p>
            {store.billingDocuments.slice(0, 12).map((doc) => <p key={doc.id}>{doc.code} | {doc.type} | {doc.customer} | total {doc.totals.total.toFixed(2)} {doc.currency}</p>)}
          </div>
        </div>
      </Section>
    </div>
  )
}
