import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export type PolicyDomain =
  | 'commercial'
  | 'purchase'
  | 'sales'
  | 'financial'
  | 'maintenance'
  | 'quality'
  | 'security'
  | 'logistics'
  | 'hr'
  | 'procurement'

export type BillingDocumentType =
  | 'invoice'
  | 'proforma'
  | 'purchase-order'
  | 'delivery-note'
  | 'reception-note'
  | 'credit-note'
  | 'progress-billing'
  | 'statement'

export type CoefficientKey =
  | 'import'
  | 'local'
  | 'transport'
  | 'transit'
  | 'customs'
  | 'insurance'
  | 'warranty'
  | 'contingency'
  | 'inflation'
  | 'margin'
  | 'discount'
  | 'vat'
  | 'retention'
  | 'penalty'
  | 'subcontracting'

export type BusinessPolicy = {
  id: string
  domain: PolicyDomain
  title: string
  description: string
  rules: string[]
  active: boolean
  updatedAt: string
}

export type RuleProfile = {
  id: string
  name: string
  description: string
  coefficients: Record<CoefficientKey, number>
  updatedAt: string
}

export type SupplyHistoryItem = {
  id: string
  at: string
  action: 'create' | 'price-update' | 'stock-update'
  details: string
}

export type SupplyItem = {
  id: string
  reference: string
  family: string
  subFamily: string
  brand: string
  model: string
  origin: string
  country: string
  sourcingType: 'local' | 'import'
  currency: string
  purchasePrice: number
  averagePrice: number
  salePrice: number
  stock: number
  supplier: string
  history: SupplyHistoryItem[]
  updatedAt: string
}

export type LaborRole = {
  id: string
  name: string
  hourlyCost: number
  dailyCost: number
  markupPercent: number
  normalHours: number
  nightHours: number
  weekendHours: number
  holidayHours: number
  bonus: number
  travel: number
  updatedAt: string
}

export type QuoteLineType = 'supply' | 'labor' | 'transport' | 'subcontracting' | 'rental' | 'service' | 'other'

export type QuoteLine = {
  id: string
  type: QuoteLineType
  label: string
  quantity: number
  unitPrice: number
  coefficient: number
  subtotal: number
}

export type QuoteRecord = {
  id: string
  code: string
  title: string
  customer: string
  currency: string
  lines: QuoteLine[]
  discountPercent: number
  taxPercent: number
  marginPercent: number
  attachments: string[]
  observations: string
  commercialConditions: string
  technicalConditions: string
  totals: {
    subtotal: number
    discountAmount: number
    marginAmount: number
    taxAmount: number
    total: number
  }
  createdAt: string
  updatedAt: string
}

export type BillingDocument = {
  id: string
  type: BillingDocumentType
  quoteId: string
  code: string
  title: string
  customer: string
  currency: string
  lines: QuoteLine[]
  totals: QuoteRecord['totals']
  createdAt: string
}

export type LearningSuggestion = {
  id: string
  sourceTitle: string
  extracted: {
    marginPercent: number
    discountPercent: number
    taxPercent: number
    coefficients: Partial<Record<CoefficientKey, number>>
    roles: string[]
    clauses: string[]
  }
  askForConfirmation: string
  accepted: boolean
  createdAt: string
}

export type SimulationInput = {
  quoteId: string
  label: string
  marginDelta: number
  taxPercent?: number
  importCoefficient?: number
  hourlyCostDeltaPercent?: number
  currency?: string
}

export type SimulationScenario = {
  id: string
  quoteId: string
  label: string
  beforeTotal: number
  afterTotal: number
  delta: number
  deltaPercent: number
  beforeMargin: number
  afterMargin: number
  notes: string[]
  createdAt: string
}

export type BusinessQuestionAnswer = {
  id: string
  question: string
  answer: string
  confidence: number
  references: string[]
  createdAt: string
}

export type BusinessPolicyWorkspaceStore = {
  policies: BusinessPolicy[]
  ruleProfiles: RuleProfile[]
  supplies: SupplyItem[]
  laborRoles: LaborRole[]
  quotes: QuoteRecord[]
  billingDocuments: BillingDocument[]
  learningSuggestions: LearningSuggestion[]
  simulations: SimulationScenario[]
  aiAnswers: BusinessQuestionAnswer[]
}

const STORAGE_KEY = 'srg.business.policy.workspace.v1'

const COEFFICIENT_KEYS: CoefficientKey[] = [
  'import',
  'local',
  'transport',
  'transit',
  'customs',
  'insurance',
  'warranty',
  'contingency',
  'inflation',
  'margin',
  'discount',
  'vat',
  'retention',
  'penalty',
  'subcontracting',
]

const POLICY_DOMAINS: PolicyDomain[] = [
  'commercial',
  'purchase',
  'sales',
  'financial',
  'maintenance',
  'quality',
  'security',
  'logistics',
  'hr',
  'procurement',
]

function nowIso(): string {
  return new Date().toISOString()
}

function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function asNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback
}

function defaultCoefficients(): Record<CoefficientKey, number> {
  return {
    import: 1.12,
    local: 1,
    transport: 1.06,
    transit: 1.03,
    customs: 1.08,
    insurance: 1.02,
    warranty: 1.01,
    contingency: 1.04,
    inflation: 1.02,
    margin: 0.18,
    discount: 0.03,
    vat: 0.18,
    retention: 0,
    penalty: 0,
    subcontracting: 1.07,
  }
}

function makeDomainPolicy(domain: PolicyDomain): BusinessPolicy {
  return {
    id: `bpol-${domain}`,
    domain,
    title: `${domain} policy`,
    description: `Configurable ${domain} policy for enterprise operations.`,
    rules: [],
    active: true,
    updatedAt: nowIso(),
  }
}

function seedStore(): BusinessPolicyWorkspaceStore {
  const profile: RuleProfile = {
    id: 'brule-default',
    name: 'Standard enterprise profile',
    description: 'Default coefficients for quote and billing calculations.',
    coefficients: defaultCoefficients(),
    updatedAt: nowIso(),
  }

  const supplies: SupplyItem[] = [
    {
      id: 'bsup-motor-abb',
      reference: 'ABB-MTR-12345',
      family: 'electrical',
      subFamily: 'motor',
      brand: 'ABB',
      model: 'MTR-12345',
      origin: 'factory',
      country: 'SE',
      sourcingType: 'import',
      currency: 'EUR',
      purchasePrice: 8200,
      averagePrice: 8600,
      salePrice: 11400,
      stock: 4,
      supplier: 'ABB Group',
      history: [{ id: id('hist'), at: nowIso(), action: 'create', details: 'Initial import' }],
      updatedAt: nowIso(),
    },
  ]

  const laborRoles: LaborRole[] = [
    {
      id: 'blab-engineer',
      name: 'Ingenieur',
      hourlyCost: 55,
      dailyCost: 420,
      markupPercent: 12,
      normalHours: 8,
      nightHours: 0,
      weekendHours: 0,
      holidayHours: 0,
      bonus: 0,
      travel: 0,
      updatedAt: nowIso(),
    },
    {
      id: 'blab-electrician',
      name: 'Electricien',
      hourlyCost: 24,
      dailyCost: 180,
      markupPercent: 10,
      normalHours: 8,
      nightHours: 0,
      weekendHours: 0,
      holidayHours: 0,
      bonus: 0,
      travel: 0,
      updatedAt: nowIso(),
    },
  ]

  const quote = computeQuoteTotals({
    id: 'bq-seed-1',
    code: 'DEV-0001',
    title: 'Motor replacement - Razel site',
    customer: 'Razel Cameroun',
    currency: 'EUR',
    lines: [
      {
        id: id('line'),
        type: 'supply',
        label: 'ABB motor MTR-12345',
        quantity: 1,
        unitPrice: 11400,
        coefficient: 1,
        subtotal: 11400,
      },
      {
        id: id('line'),
        type: 'labor',
        label: 'Electricien x 16h',
        quantity: 16,
        unitPrice: 24,
        coefficient: 1,
        subtotal: 384,
      },
      {
        id: id('line'),
        type: 'transport',
        label: 'Transport and logistics',
        quantity: 1,
        unitPrice: 950,
        coefficient: 1,
        subtotal: 950,
      },
    ],
    discountPercent: 2,
    taxPercent: 18,
    marginPercent: 15,
    attachments: [],
    observations: 'Standard delivery window 14 days.',
    commercialConditions: 'Payment terms: 40/40/20.',
    technicalConditions: 'Installation and test included.',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  })

  return {
    policies: POLICY_DOMAINS.map((domain) => makeDomainPolicy(domain)),
    ruleProfiles: [profile],
    supplies,
    laborRoles,
    quotes: [quote],
    billingDocuments: [],
    learningSuggestions: [],
    simulations: [],
    aiAnswers: [],
  }
}

function normalizeCoefficients(input?: Partial<Record<CoefficientKey, number>>): Record<CoefficientKey, number> {
  const base = defaultCoefficients()
  if (!input) return base
  const next = { ...base }
  for (const key of COEFFICIENT_KEYS) {
    const value = input[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      next[key] = value
    }
  }
  return next
}

function computeQuoteTotals(input: Omit<QuoteRecord, 'totals'>): QuoteRecord {
  const subtotal = input.lines.reduce((sum, line) => sum + line.subtotal, 0)
  const discountAmount = subtotal * (input.discountPercent / 100)
  const afterDiscount = subtotal - discountAmount
  const marginAmount = afterDiscount * (input.marginPercent / 100)
  const taxable = afterDiscount + marginAmount
  const taxAmount = taxable * (input.taxPercent / 100)
  const total = taxable + taxAmount

  return {
    ...input,
    totals: {
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      marginAmount: Number(marginAmount.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
    },
  }
}

export class BusinessPolicyWorkspaceService {
  private static memoryStore: BusinessPolicyWorkspaceStore = seedStore()

  static getCoefficientKeys(): CoefficientKey[] {
    return [...COEFFICIENT_KEYS]
  }

  static getPolicyDomains(): PolicyDomain[] {
    return [...POLICY_DOMAINS]
  }

  static getStore(): BusinessPolicyWorkspaceStore {
    return this.readStorage()
  }

  static getSummary() {
    const store = this.getStore()
    const latestProfile = store.ruleProfiles[0]
    const totalQuoteValue = store.quotes.reduce((sum, quote) => sum + quote.totals.total, 0)
    const totalBillingValue = store.billingDocuments.reduce((sum, document) => sum + document.totals.total, 0)
    return {
      policies: store.policies.length,
      activePolicies: store.policies.filter((item) => item.active).length,
      coefficients: Object.keys(latestProfile.coefficients).length,
      supplies: store.supplies.length,
      laborRoles: store.laborRoles.length,
      quotes: store.quotes.length,
      billingDocuments: store.billingDocuments.length,
      learningSuggestions: store.learningSuggestions.length,
      simulations: store.simulations.length,
      aiAnswers: store.aiAnswers.length,
      totalQuoteValue: Number(totalQuoteValue.toFixed(2)),
      totalBillingValue: Number(totalBillingValue.toFixed(2)),
    }
  }

  static upsertPolicy(domain: PolicyDomain, payload: { title: string; description: string; rules: string[]; active: boolean }): BusinessPolicy {
    const store = this.getStore()
    const current = store.policies.find((item) => item.domain === domain) ?? makeDomainPolicy(domain)
    const next: BusinessPolicy = {
      ...current,
      title: payload.title.trim() || `${domain} policy`,
      description: payload.description.trim(),
      rules: payload.rules.map((item) => item.trim()).filter((item) => item.length > 0),
      active: payload.active,
      updatedAt: nowIso(),
    }

    const policies = store.policies.some((item) => item.domain === domain)
      ? store.policies.map((item) => (item.domain === domain ? next : item))
      : [next, ...store.policies]

    this.writeStorage({ ...store, policies })
    this.publish('Business policy updated', `${domain} policy saved.`)
    this.logHistory('Business policy', `${domain} updated`, 'modification')
    return next
  }

  static updateDefaultRuleProfile(coefficients: Partial<Record<CoefficientKey, number>>): RuleProfile {
    const store = this.getStore()
    const current = store.ruleProfiles[0] ?? {
      id: id('brule'),
      name: 'Standard enterprise profile',
      description: 'Main profile',
      coefficients: defaultCoefficients(),
      updatedAt: nowIso(),
    }

    const next: RuleProfile = {
      ...current,
      coefficients: normalizeCoefficients({ ...current.coefficients, ...coefficients }),
      updatedAt: nowIso(),
    }

    const others = store.ruleProfiles.filter((item) => item.id !== current.id)
    this.writeStorage({ ...store, ruleProfiles: [next, ...others] })
    this.publish('Calculation coefficients updated', 'Quote and billing coefficients were updated.')
    this.logHistory('Business coefficients', 'Default profile updated', 'modification')
    return next
  }

  static addSupply(input: Omit<SupplyItem, 'id' | 'history' | 'updatedAt'>): SupplyItem {
    const store = this.getStore()
    const next: SupplyItem = {
      ...input,
      id: id('bsup'),
      history: [{ id: id('hist'), at: nowIso(), action: 'create', details: 'Supply item created' }],
      updatedAt: nowIso(),
    }
    this.writeStorage({ ...store, supplies: [next, ...store.supplies] })
    this.publish('Supply item created', `${next.reference} registered.`)
    this.logHistory('Business supplies', `${next.reference} created`, 'creation')
    return next
  }

  static addLaborRole(input: Omit<LaborRole, 'id' | 'updatedAt'>): LaborRole {
    const store = this.getStore()
    const next: LaborRole = {
      ...input,
      id: id('blab'),
      updatedAt: nowIso(),
    }
    this.writeStorage({ ...store, laborRoles: [next, ...store.laborRoles] })
    this.publish('Labor role created', `${next.name} registered.`)
    this.logHistory('Business labor', `${next.name} created`, 'creation')
    return next
  }

  static createQuote(input: {
    title: string
    customer: string
    currency: string
    lines: Array<{ type: QuoteLineType; label: string; quantity: number; unitPrice: number; coefficient?: number }>
    discountPercent: number
    taxPercent: number
    marginPercent: number
    attachments: string[]
    observations: string
    commercialConditions: string
    technicalConditions: string
  }): QuoteRecord {
    const store = this.getStore()
    const sequence = store.quotes.length + 1
    const code = `DEV-${String(sequence).padStart(4, '0')}`
    const lines: QuoteLine[] = input.lines
      .filter((item) => item.label.trim().length > 0 && item.quantity > 0)
      .map((item) => {
        const coefficient = asNumber(item.coefficient ?? 1, 1)
        const base = asNumber(item.quantity, 0) * asNumber(item.unitPrice, 0) * coefficient
        return {
          id: id('qline'),
          type: item.type,
          label: item.label.trim(),
          quantity: asNumber(item.quantity, 0),
          unitPrice: asNumber(item.unitPrice, 0),
          coefficient,
          subtotal: Number(base.toFixed(2)),
        }
      })

    const quote = computeQuoteTotals({
      id: id('quote'),
      code,
      title: input.title.trim() || 'Untitled quote',
      customer: input.customer.trim() || 'Unknown customer',
      currency: input.currency.trim() || 'EUR',
      lines,
      discountPercent: asNumber(input.discountPercent, 0),
      taxPercent: asNumber(input.taxPercent, 0),
      marginPercent: asNumber(input.marginPercent, 0),
      attachments: input.attachments,
      observations: input.observations,
      commercialConditions: input.commercialConditions,
      technicalConditions: input.technicalConditions,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    })

    this.writeStorage({ ...store, quotes: [quote, ...store.quotes] })
    this.publish('Quote created', `${quote.code} for ${quote.customer}`)
    this.logHistory('Business quote', `${quote.code} created`, 'creation')
    return quote
  }

  static createBillingDocument(type: BillingDocumentType, quoteId: string): BillingDocument | undefined {
    const store = this.getStore()
    const quote = store.quotes.find((item) => item.id === quoteId)
    if (!quote) return undefined

    const codePrefixByType: Record<BillingDocumentType, string> = {
      invoice: 'FAC',
      proforma: 'PRO',
      'purchase-order': 'BC',
      'delivery-note': 'BL',
      'reception-note': 'BR',
      'credit-note': 'AVR',
      'progress-billing': 'SIT',
      statement: 'DEC',
    }

    const typeCount = store.billingDocuments.filter((item) => item.type === type).length + 1
    const code = `${codePrefixByType[type]}-${String(typeCount).padStart(4, '0')}`

    const document: BillingDocument = {
      id: id('bill'),
      type,
      quoteId: quote.id,
      code,
      title: quote.title,
      customer: quote.customer,
      currency: quote.currency,
      lines: quote.lines,
      totals: quote.totals,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, billingDocuments: [document, ...store.billingDocuments] })
    this.publish('Billing document created', `${code} generated from ${quote.code}`)
    this.logHistory('Business billing', `${code} generated`, 'creation')
    return document
  }

  static importAndAnalyzeQuoteDocument(sourceTitle: string, content: string): LearningSuggestion {
    const lower = `${sourceTitle}\n${content}`.toLowerCase()
    const marginPercent = extractPercent(lower, /marge\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*%/)
    const discountPercent = extractPercent(lower, /remise\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*%/)
    const taxPercent = extractPercent(lower, /(?:tva|taxe)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*%/)

    const coefficients: Partial<Record<CoefficientKey, number>> = {}
    coefficients.import = extractPercent(lower, /coefficient\s*import\s*[:=]?\s*(\d+(?:[.,]\d+)?)/)
    coefficients.transport = extractPercent(lower, /coefficient\s*transport\s*[:=]?\s*(\d+(?:[.,]\d+)?)/)
    coefficients.customs = extractPercent(lower, /coefficient\s*douane\s*[:=]?\s*(\d+(?:[.,]\d+)?)/)
    coefficients.insurance = extractPercent(lower, /coefficient\s*assurance\s*[:=]?\s*(\d+(?:[.,]\d+)?)/)

    const roleNames = ['ingenieur', 'chef de projet', 'chef de chantier', 'chef d\'equipe', 'electricien', 'electromecanicien', 'mecanicien', 'soudeur', 'automaticien', 'programmeur', 'magasinier', 'assistant']
    const roles = roleNames.filter((item) => lower.includes(item))

    const clauses = [
      'conditions commerciales',
      'conditions techniques',
      'penalite',
      'garantie',
      'modalites de paiement',
    ].filter((item) => lower.includes(item))

    const suggestion: LearningSuggestion = {
      id: id('learn'),
      sourceTitle: sourceTitle.trim() || 'Imported quote',
      extracted: {
        marginPercent,
        discountPercent,
        taxPercent,
        coefficients,
        roles,
        clauses,
      },
      askForConfirmation: 'Souhaitez-vous enregistrer cette regle comme politique commerciale ?',
      accepted: false,
      createdAt: nowIso(),
    }

    const store = this.getStore()
    this.writeStorage({ ...store, learningSuggestions: [suggestion, ...store.learningSuggestions].slice(0, 160) })
    this.publish('Document learning suggestion', suggestion.askForConfirmation)
    this.logHistory('Business learning', `${suggestion.sourceTitle} analyzed`, 'validation')
    return suggestion
  }

  static acceptLearningSuggestion(suggestionId: string): boolean {
    const store = this.getStore()
    const suggestion = store.learningSuggestions.find((item) => item.id === suggestionId)
    if (!suggestion) return false

    const profile = store.ruleProfiles[0] ?? {
      id: id('brule'),
      name: 'Standard enterprise profile',
      description: 'Main profile',
      coefficients: defaultCoefficients(),
      updatedAt: nowIso(),
    }

    const merged = { ...profile.coefficients }
    for (const key of COEFFICIENT_KEYS) {
      const value = suggestion.extracted.coefficients[key]
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        merged[key] = value
      }
    }

    if (suggestion.extracted.marginPercent > 0) merged.margin = suggestion.extracted.marginPercent / 100
    if (suggestion.extracted.discountPercent > 0) merged.discount = suggestion.extracted.discountPercent / 100
    if (suggestion.extracted.taxPercent > 0) merged.vat = suggestion.extracted.taxPercent / 100

    const nextProfile: RuleProfile = { ...profile, coefficients: merged, updatedAt: nowIso() }
    const nextSuggestions = store.learningSuggestions.map((item) => (item.id === suggestionId ? { ...item, accepted: true } : item))

    this.writeStorage({
      ...store,
      ruleProfiles: [nextProfile, ...store.ruleProfiles.filter((item) => item.id !== profile.id)],
      learningSuggestions: nextSuggestions,
    })

    this.publish('Learning suggestion accepted', 'Rules added to commercial policy profile.')
    this.logHistory('Business learning', `${suggestion.sourceTitle} accepted`, 'modification')
    return true
  }

  static runSimulation(input: SimulationInput): SimulationScenario | undefined {
    const store = this.getStore()
    const quote = store.quotes.find((item) => item.id === input.quoteId)
    if (!quote) return undefined

    const beforeTotal = quote.totals.total
    const beforeMargin = quote.marginPercent

    const adjustedLines = quote.lines.map((line) => {
      if (line.type !== 'labor' || !input.hourlyCostDeltaPercent) return line
      const nextUnitPrice = line.unitPrice * (1 + input.hourlyCostDeltaPercent / 100)
      const subtotal = nextUnitPrice * line.quantity * line.coefficient
      return {
        ...line,
        unitPrice: Number(nextUnitPrice.toFixed(2)),
        subtotal: Number(subtotal.toFixed(2)),
      }
    })

    const adjusted = computeQuoteTotals({
      ...quote,
      lines: adjustedLines,
      marginPercent: quote.marginPercent + input.marginDelta,
      taxPercent: typeof input.taxPercent === 'number' ? input.taxPercent : quote.taxPercent,
      currency: input.currency?.trim() || quote.currency,
      updatedAt: nowIso(),
    })

    const afterTotal = adjusted.totals.total
    const delta = afterTotal - beforeTotal
    const deltaPercent = beforeTotal === 0 ? 0 : (delta / beforeTotal) * 100

    const notes: string[] = []
    if (input.marginDelta !== 0) notes.push(`Margin changed by ${input.marginDelta.toFixed(2)} points.`)
    if (typeof input.taxPercent === 'number') notes.push(`Tax changed to ${input.taxPercent.toFixed(2)}%.`)
    if (typeof input.importCoefficient === 'number') notes.push(`Import coefficient scenario value: ${input.importCoefficient.toFixed(3)}.`)
    if (typeof input.hourlyCostDeltaPercent === 'number') notes.push(`Labor costs changed by ${input.hourlyCostDeltaPercent.toFixed(2)}%.`)
    if (input.currency && input.currency !== quote.currency) notes.push(`Currency changed from ${quote.currency} to ${input.currency}.`)

    const scenario: SimulationScenario = {
      id: id('sim'),
      quoteId: quote.id,
      label: input.label.trim() || 'Untitled scenario',
      beforeTotal: Number(beforeTotal.toFixed(2)),
      afterTotal: Number(afterTotal.toFixed(2)),
      delta: Number(delta.toFixed(2)),
      deltaPercent: Number(deltaPercent.toFixed(2)),
      beforeMargin,
      afterMargin: quote.marginPercent + input.marginDelta,
      notes,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, simulations: [scenario, ...store.simulations].slice(0, 160) })
    this.publish('Simulation completed', `${scenario.label}: delta ${scenario.delta.toFixed(2)} ${quote.currency}`)
    this.logHistory('Business simulation', scenario.label, 'validation')
    return scenario
  }

  static askBusinessQuestion(question: string, quoteId?: string): BusinessQuestionAnswer {
    const store = this.getStore()
    const normalized = question.toLowerCase()
    const quote = quoteId
      ? store.quotes.find((item) => item.id === quoteId) ?? store.quotes[0]
      : store.quotes[0]

    let answer = 'No quote data available yet.'
    const references: string[] = []
    let confidence = 0.35

    references.push(`Quote ${quote.code}`)

    if (normalized.includes('marge')) {
      answer = `La marge du devis ${quote.code} est ${quote.marginPercent.toFixed(2)}% pour un montant de marge de ${quote.totals.marginAmount.toFixed(2)} ${quote.currency}.`
      confidence = 0.92
    } else if (normalized.includes('pourquoi') || normalized.includes('cher') || normalized.includes('coute')) {
      const topLine = [...quote.lines].sort((a, b) => b.subtotal - a.subtotal).at(0)
      answer = `Le devis ${quote.code} est tire vers le haut par le poste ${topLine?.label ?? 'n/a'} (${topLine ? topLine.subtotal.toFixed(2) : '0'} ${quote.currency}), puis par la marge (${quote.totals.marginAmount.toFixed(2)}) et la taxe (${quote.totals.taxAmount.toFixed(2)}).`
      confidence = 0.89
    } else if (normalized.includes('poste')) {
      const ranked = [...quote.lines].sort((a, b) => b.subtotal - a.subtotal).slice(0, 3)
      answer = `Top postes du devis ${quote.code}: ${ranked.map((item) => `${item.label} (${item.subtotal.toFixed(2)} ${quote.currency})`).join(', ')}.`
      confidence = 0.88
    } else if (normalized.includes('tva') || normalized.includes('taxe')) {
      answer = `Le taux applique est ${quote.taxPercent.toFixed(2)}%, pour un montant de taxe de ${quote.totals.taxAmount.toFixed(2)} ${quote.currency}.`
      confidence = 0.9
    } else {
      answer = `Le devis ${quote.code} totalise ${quote.totals.total.toFixed(2)} ${quote.currency} (sous-total ${quote.totals.subtotal.toFixed(2)}, remise ${quote.totals.discountAmount.toFixed(2)}, marge ${quote.totals.marginAmount.toFixed(2)}, taxe ${quote.totals.taxAmount.toFixed(2)}).`
      confidence = 0.8
    }

    const result: BusinessQuestionAnswer = {
      id: id('qa'),
      question,
      answer,
      confidence,
      references,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, aiAnswers: [result, ...store.aiAnswers].slice(0, 180) })
    this.logHistory('Business AI', question, 'validation')
    return result
  }

  static exportStore(): void {
    WorkspaceExchangeService.downloadJson('srg-business-policy-workspace.json', this.getStore())
  }

  static exportQuotesCsv(): void {
    const rows = [
      ['code', 'title', 'customer', 'currency', 'subtotal', 'discount', 'margin', 'tax', 'total', 'updatedAt'],
      ...this.getStore().quotes.map((quote) => [
        quote.code,
        quote.title,
        quote.customer,
        quote.currency,
        quote.totals.subtotal.toString(),
        quote.totals.discountAmount.toString(),
        quote.totals.marginAmount.toString(),
        quote.totals.taxAmount.toString(),
        quote.totals.total.toString(),
        quote.updatedAt,
      ]),
    ]
    WorkspaceExchangeService.downloadCsv('srg-devis.csv', rows)
  }

  private static publish(title: string, message: string): void {
    notificationService.publish({
      title,
      message,
      level: 'info',
      priority: 'medium',
      category: 'system',
      read: false,
    })
  }

  private static logHistory(promptName: string, payload: string, eventType: 'creation' | 'modification' | 'validation' | 'publication' | 'archiving'): void {
    HistoryWorkspaceService.addRecord({
      id: id('histbiz'),
      promptName,
      promptText: payload,
      output: payload,
      provider: 'workspace',
      model: 'business-policy',
      status: 'completed',
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      actorName: 'Business Policy Workspace',
      eventType,
    })
  }

  private static readStorage(): BusinessPolicyWorkspaceStore {
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

      const parsed = JSON.parse(raw) as Partial<BusinessPolicyWorkspaceStore>
      const seed = seedStore()
      return {
        ...seed,
        ...parsed,
        policies: Array.isArray(parsed.policies) ? parsed.policies : seed.policies,
        ruleProfiles: Array.isArray(parsed.ruleProfiles) ? parsed.ruleProfiles : seed.ruleProfiles,
        supplies: Array.isArray(parsed.supplies) ? parsed.supplies : seed.supplies,
        laborRoles: Array.isArray(parsed.laborRoles) ? parsed.laborRoles : seed.laborRoles,
        quotes: Array.isArray(parsed.quotes) ? parsed.quotes : seed.quotes,
        billingDocuments: Array.isArray(parsed.billingDocuments) ? parsed.billingDocuments : seed.billingDocuments,
        learningSuggestions: Array.isArray(parsed.learningSuggestions) ? parsed.learningSuggestions : seed.learningSuggestions,
        simulations: Array.isArray(parsed.simulations) ? parsed.simulations : seed.simulations,
        aiAnswers: Array.isArray(parsed.aiAnswers) ? parsed.aiAnswers : seed.aiAnswers,
      }
    } catch {
      return seedStore()
    }
  }

  private static writeStorage(store: BusinessPolicyWorkspaceStore): void {
    this.memoryStore = store
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }
}

function extractPercent(text: string, pattern: RegExp): number {
  const match = text.match(pattern)
  if (!match || !match[1]) return 0
  return Number(match[1].replace(',', '.'))
}
