import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import Section from '#/app/components/Section'
import { useBusinessPolicyWorkspace } from '#/app/hooks/useBusinessPolicyWorkspace'
import { BusinessPolicyWorkspaceService } from '#/app/services/BusinessPolicyWorkspaceService'
import type { CoefficientKey } from '#/app/services/BusinessPolicyWorkspaceService'

function toLines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

export default function BusinessPolicyWorkspace() {
  const { store, summary, refresh, selectedDomain, setSelectedDomain, domains, coefficientKeys } = useBusinessPolicyWorkspace()
  const selectedPolicy = useMemo(() => store.policies.find((item) => item.domain === selectedDomain), [store.policies, selectedDomain])
  const defaultProfile = store.ruleProfiles[0]

  const [policyTitle, setPolicyTitle] = useState(selectedPolicy?.title ?? '')
  const [policyDescription, setPolicyDescription] = useState(selectedPolicy?.description ?? '')
  const [policyRules, setPolicyRules] = useState((selectedPolicy?.rules ?? []).join('\n'))
  const [policyActive, setPolicyActive] = useState(selectedPolicy?.active ?? true)

  const [supplyReference, setSupplyReference] = useState('')
  const [supplyFamily, setSupplyFamily] = useState('')
  const [supplySubFamily, setSupplySubFamily] = useState('')
  const [supplyBrand, setSupplyBrand] = useState('')
  const [supplyModel, setSupplyModel] = useState('')
  const [supplyOrigin, setSupplyOrigin] = useState('')
  const [supplyCountry, setSupplyCountry] = useState('')
  const [supplySourcingType, setSupplySourcingType] = useState<'local' | 'import'>('local')
  const [supplyCurrency, setSupplyCurrency] = useState('EUR')
  const [supplyPurchasePrice, setSupplyPurchasePrice] = useState(0)
  const [supplyAveragePrice, setSupplyAveragePrice] = useState(0)
  const [supplySalePrice, setSupplySalePrice] = useState(0)
  const [supplyStock, setSupplyStock] = useState(0)
  const [supplySupplier, setSupplySupplier] = useState('')

  const [roleName, setRoleName] = useState('')
  const [roleHourlyCost, setRoleHourlyCost] = useState(0)
  const [roleDailyCost, setRoleDailyCost] = useState(0)
  const [roleMarkupPercent, setRoleMarkupPercent] = useState(0)
  const [roleNormalHours, setRoleNormalHours] = useState(8)
  const [roleNightHours, setRoleNightHours] = useState(0)
  const [roleWeekendHours, setRoleWeekendHours] = useState(0)
  const [roleHolidayHours, setRoleHolidayHours] = useState(0)
  const [roleBonus, setRoleBonus] = useState(0)
  const [roleTravel, setRoleTravel] = useState(0)

  const [learningTitle, setLearningTitle] = useState('')
  const [learningContent, setLearningContent] = useState('')
  const [simulationQuoteId, setSimulationQuoteId] = useState(store.quotes[0]?.id ?? '')
  const [simulationLabel, setSimulationLabel] = useState('Margin +2 / VAT scenario')
  const [simulationMarginDelta, setSimulationMarginDelta] = useState(2)
  const [simulationTaxPercent, setSimulationTaxPercent] = useState(18)
  const [simulationImportCoefficient, setSimulationImportCoefficient] = useState(1.12)
  const [simulationHourlyDelta, setSimulationHourlyDelta] = useState(0)
  const [simulationCurrency, setSimulationCurrency] = useState('EUR')

  const [businessQuestion, setBusinessQuestion] = useState('Pourquoi ce devis coute plus cher ?')
  const [businessAnswer, setBusinessAnswer] = useState('')

  const coefficientMap = defaultProfile.coefficients

  const updateCoefficient = (key: CoefficientKey, value: number) => {
    BusinessPolicyWorkspaceService.updateDefaultRuleProfile({ [key]: value })
    refresh()
  }

  const savePolicy = () => {
    BusinessPolicyWorkspaceService.upsertPolicy(selectedDomain, {
      title: policyTitle,
      description: policyDescription,
      rules: toLines(policyRules),
      active: policyActive,
    })
    refresh()
  }

  const createSupply = () => {
    BusinessPolicyWorkspaceService.addSupply({
      reference: supplyReference,
      family: supplyFamily,
      subFamily: supplySubFamily,
      brand: supplyBrand,
      model: supplyModel,
      origin: supplyOrigin,
      country: supplyCountry,
      sourcingType: supplySourcingType,
      currency: supplyCurrency,
      purchasePrice: supplyPurchasePrice,
      averagePrice: supplyAveragePrice,
      salePrice: supplySalePrice,
      stock: supplyStock,
      supplier: supplySupplier,
    })

    setSupplyReference('')
    setSupplyFamily('')
    setSupplySubFamily('')
    setSupplyBrand('')
    setSupplyModel('')
    setSupplyOrigin('')
    setSupplyCountry('')
    setSupplySourcingType('local')
    setSupplyCurrency('EUR')
    setSupplyPurchasePrice(0)
    setSupplyAveragePrice(0)
    setSupplySalePrice(0)
    setSupplyStock(0)
    setSupplySupplier('')
    refresh()
  }

  const createRole = () => {
    BusinessPolicyWorkspaceService.addLaborRole({
      name: roleName,
      hourlyCost: roleHourlyCost,
      dailyCost: roleDailyCost,
      markupPercent: roleMarkupPercent,
      normalHours: roleNormalHours,
      nightHours: roleNightHours,
      weekendHours: roleWeekendHours,
      holidayHours: roleHolidayHours,
      bonus: roleBonus,
      travel: roleTravel,
    })

    setRoleName('')
    setRoleHourlyCost(0)
    setRoleDailyCost(0)
    setRoleMarkupPercent(0)
    setRoleNormalHours(8)
    setRoleNightHours(0)
    setRoleWeekendHours(0)
    setRoleHolidayHours(0)
    setRoleBonus(0)
    setRoleTravel(0)
    refresh()
  }

  const analyzeLearning = () => {
    BusinessPolicyWorkspaceService.importAndAnalyzeQuoteDocument(learningTitle, learningContent)
    refresh()
  }

  const runSimulation = () => {
    BusinessPolicyWorkspaceService.runSimulation({
      quoteId: simulationQuoteId,
      label: simulationLabel,
      marginDelta: simulationMarginDelta,
      taxPercent: simulationTaxPercent,
      importCoefficient: simulationImportCoefficient,
      hourlyCostDeltaPercent: simulationHourlyDelta,
      currency: simulationCurrency,
    })
    refresh()
  }

  const askBusiness = () => {
    const result = BusinessPolicyWorkspaceService.askBusinessQuestion(businessQuestion, simulationQuoteId)
    setBusinessAnswer(`${result.answer}\n\nConfidence: ${result.confidence}`)
    refresh()
  }

  return (
    <div className="space-y-6">
      <Section title="Business Policy Workspace" description="Define enterprise policy, rules and coefficients for commercial intelligence.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Policies</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.policies}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Coefficients</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.coefficients}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Supplies</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.supplies}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Labor roles</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.laborRoles}</p></div>
          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Learning suggestions</p><p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{summary.learningSuggestions}</p></div>
        </div>
      </Section>

      <Section title="Commercial Policies" description="Commercial, purchase, sales, financial, maintenance, quality, security, logistics, HR and procurement policies.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {domains.map((domain) => (
            <button
              key={domain}
              type="button"
              onClick={() => {
                setSelectedDomain(domain)
                const policy = store.policies.find((item) => item.domain === domain)
                setPolicyTitle(policy?.title ?? '')
                setPolicyDescription(policy?.description ?? '')
                setPolicyRules((policy?.rules ?? []).join('\n'))
                setPolicyActive(policy?.active ?? true)
              }}
              className={`rounded-2xl border px-3 py-2 text-sm ${selectedDomain === domain ? 'border-[var(--srg-color-primary-400)] bg-[var(--srg-surface)] font-semibold text-[var(--srg-text-title)]' : 'border-[var(--srg-border)] bg-[var(--srg-surface-strong)] text-[var(--srg-text-muted)]'}`}
            >
              {domain}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3">
          <input value={policyTitle} onChange={(event) => setPolicyTitle(event.target.value)} placeholder="Policy title" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
          <textarea value={policyDescription} onChange={(event) => setPolicyDescription(event.target.value)} placeholder="Policy description" className="min-h-16 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
          <textarea value={policyRules} onChange={(event) => setPolicyRules(event.target.value)} placeholder="One rule per line" className="min-h-28 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-sm" />
          <label className="inline-flex items-center gap-2 text-sm text-[var(--srg-text-muted)]">
            <input type="checkbox" checked={policyActive} onChange={(event) => setPolicyActive(event.target.checked)} /> active
          </label>
          <button type="button" onClick={savePolicy} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 text-sm font-semibold text-white">Save policy</button>
        </div>
      </Section>

      <Section title="Configurable Coefficients" description="Import, local, transport, transit, customs, insurance, warranty, contingency, inflation, margin, discount, VAT, retention, penalty and subcontracting coefficients.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 text-sm">
          {coefficientKeys.map((key) => (
            <label key={key} className="grid gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
              <span className="font-semibold text-[var(--srg-text-title)]">{key}</span>
              <input
                type="number"
                step="0.01"
                  value={coefficientMap[key]}
                onChange={(event) => updateCoefficient(key, Number(event.target.value) || 0)}
                className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2"
              />
            </label>
          ))}
        </div>
      </Section>

      <Section title="Supplies Library" description="Manage references, family, model, origin, sourcing type, prices, stock, supplier and history.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <input value={supplyReference} onChange={(event) => setSupplyReference(event.target.value)} placeholder="Reference" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={supplyFamily} onChange={(event) => setSupplyFamily(event.target.value)} placeholder="Family" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={supplySubFamily} onChange={(event) => setSupplySubFamily(event.target.value)} placeholder="Sub-family" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={supplyBrand} onChange={(event) => setSupplyBrand(event.target.value)} placeholder="Brand" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={supplyModel} onChange={(event) => setSupplyModel(event.target.value)} placeholder="Model" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={supplyOrigin} onChange={(event) => setSupplyOrigin(event.target.value)} placeholder="Origin" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={supplyCountry} onChange={(event) => setSupplyCountry(event.target.value)} placeholder="Country" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <select value={supplySourcingType} onChange={(event) => setSupplySourcingType(event.target.value as 'local' | 'import')} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
            <option value="local">Local</option>
            <option value="import">Import</option>
          </select>
          <input value={supplyCurrency} onChange={(event) => setSupplyCurrency(event.target.value)} placeholder="Currency" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={supplyPurchasePrice} onChange={(event) => setSupplyPurchasePrice(Number(event.target.value) || 0)} placeholder="Purchase price" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={supplyAveragePrice} onChange={(event) => setSupplyAveragePrice(Number(event.target.value) || 0)} placeholder="Average price" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={supplySalePrice} onChange={(event) => setSupplySalePrice(Number(event.target.value) || 0)} placeholder="Sale price" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={supplyStock} onChange={(event) => setSupplyStock(Number(event.target.value) || 0)} placeholder="Stock" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={supplySupplier} onChange={(event) => setSupplySupplier(event.target.value)} placeholder="Supplier" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={createSupply} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Add supply</button>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-[var(--srg-text-muted)]">
          {store.supplies.slice(0, 10).map((item) => (
            <div key={item.id} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
              {item.reference} | {item.family}/{item.subFamily} | {item.brand} {item.model} | {item.sourcingType} | stock {item.stock} | buy {item.purchasePrice} | sell {item.salePrice}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Labor Library" description="Hourly and daily costs, markup, normal/night/weekend/holiday hours, bonus and travel.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <input value={roleName} onChange={(event) => setRoleName(event.target.value)} placeholder="Role name" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={roleHourlyCost} onChange={(event) => setRoleHourlyCost(Number(event.target.value) || 0)} placeholder="Hourly cost" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={roleDailyCost} onChange={(event) => setRoleDailyCost(Number(event.target.value) || 0)} placeholder="Daily cost" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={roleMarkupPercent} onChange={(event) => setRoleMarkupPercent(Number(event.target.value) || 0)} placeholder="Markup %" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={roleNormalHours} onChange={(event) => setRoleNormalHours(Number(event.target.value) || 0)} placeholder="Normal hours" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={roleNightHours} onChange={(event) => setRoleNightHours(Number(event.target.value) || 0)} placeholder="Night hours" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={roleWeekendHours} onChange={(event) => setRoleWeekendHours(Number(event.target.value) || 0)} placeholder="Weekend hours" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={roleHolidayHours} onChange={(event) => setRoleHolidayHours(Number(event.target.value) || 0)} placeholder="Holiday hours" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={roleBonus} onChange={(event) => setRoleBonus(Number(event.target.value) || 0)} placeholder="Bonus" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={roleTravel} onChange={(event) => setRoleTravel(Number(event.target.value) || 0)} placeholder="Travel" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={createRole} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Add role</button>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-[var(--srg-text-muted)]">
          {store.laborRoles.slice(0, 12).map((item) => (
            <div key={item.id} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
              {item.name} | hourly {item.hourlyCost} | daily {item.dailyCost} | markup {item.markupPercent}% | hours N:{item.normalHours} Nght:{item.nightHours} Wknd:{item.weekendHours} Hol:{item.holidayHours}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Documentary Learning (Prompt 030 reuse)" description="Analyze imported quote text and require manual confirmation before storing any rule.">
        <div className="grid gap-3 text-sm">
          <input value={learningTitle} onChange={(event) => setLearningTitle(event.target.value)} placeholder="Imported quote title" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <textarea value={learningContent} onChange={(event) => setLearningContent(event.target.value)} placeholder="Paste imported quote content" className="min-h-28 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={analyzeLearning} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Analyze and propose rule</button>
        </div>

        <div className="mt-4 grid gap-3 text-xs text-[var(--srg-text-muted)]">
          {store.learningSuggestions.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
              <p className="font-semibold text-[var(--srg-text-title)]">{item.sourceTitle}</p>
              <p>{item.askForConfirmation}</p>
              <p>marge {item.extracted.marginPercent}% | remise {item.extracted.discountPercent}% | TVA {item.extracted.taxPercent}%</p>
              <p>roles: {item.extracted.roles.join(', ') || 'n/a'}</p>
              <p>clauses: {item.extracted.clauses.join(', ') || 'n/a'}</p>
              <button type="button" onClick={() => { BusinessPolicyWorkspaceService.acceptLearningSuggestion(item.id); refresh() }} className="mt-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-xs font-semibold text-[var(--srg-text-title)]" disabled={item.accepted}>
                {item.accepted ? 'Rule saved' : 'Save this rule manually'}
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Simulation" description="Adjust margin, tax, import coefficient, labor cost, currency and compare scenarios.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <select value={simulationQuoteId} onChange={(event) => setSimulationQuoteId(event.target.value)} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2">
            {store.quotes.map((quote) => <option key={quote.id} value={quote.id}>{quote.code} - {quote.customer}</option>)}
          </select>
          <input value={simulationLabel} onChange={(event) => setSimulationLabel(event.target.value)} placeholder="Scenario label" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={simulationMarginDelta} onChange={(event) => setSimulationMarginDelta(Number(event.target.value) || 0)} placeholder="Margin delta" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={simulationTaxPercent} onChange={(event) => setSimulationTaxPercent(Number(event.target.value) || 0)} placeholder="Tax percent" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" step="0.01" value={simulationImportCoefficient} onChange={(event) => setSimulationImportCoefficient(Number(event.target.value) || 0)} placeholder="Import coefficient" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input type="number" value={simulationHourlyDelta} onChange={(event) => setSimulationHourlyDelta(Number(event.target.value) || 0)} placeholder="Labor delta %" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <input value={simulationCurrency} onChange={(event) => setSimulationCurrency(event.target.value)} placeholder="Currency" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={runSimulation} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Run simulation</button>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-[var(--srg-text-muted)]">
          {store.simulations.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
              {item.label} | before {item.beforeTotal.toFixed(2)} {'->'} after {item.afterTotal.toFixed(2)} | delta {item.delta.toFixed(2)} ({item.deltaPercent.toFixed(2)}%)
            </div>
          ))}
        </div>
      </Section>

      <Section title="Business AI" description="Explain quote cost, margin and expensive line items.">
        <div className="grid gap-3 text-sm">
          <input value={businessQuestion} onChange={(event) => setBusinessQuestion(event.target.value)} placeholder="Ask business question" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2" />
          <button type="button" onClick={askBusiness} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Ask</button>
          <pre className="whitespace-pre-wrap rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-xs text-[var(--srg-text-muted)]">{businessAnswer || 'No answer yet.'}</pre>
        </div>
      </Section>

      <Section title="Integrations" description="Open Devis Workspace and export enterprise business policy data.">
        <div className="flex flex-wrap gap-2 text-sm">
          <Link to="/devis" className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 font-semibold text-white">Open Devis Workspace</Link>
          <button type="button" onClick={() => BusinessPolicyWorkspaceService.exportStore()} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 font-semibold text-[var(--srg-text-title)]">Export JSON</button>
          <button type="button" onClick={() => BusinessPolicyWorkspaceService.exportQuotesCsv()} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 font-semibold text-[var(--srg-text-title)]">Export Devis CSV</button>
        </div>
      </Section>
    </div>
  )
}
