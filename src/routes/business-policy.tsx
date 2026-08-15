import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import PageHeader from '#/app/components/PageHeader'
import UniversalFilter from '#/app/components/UniversalFilter'
import BusinessPolicyWorkspace from '#/app/components/business/BusinessPolicyWorkspace'

export const Route = createFileRoute('/business-policy')({
  component: BusinessPolicyPage,
})

const BUSINESS_POLICY_SUGGESTIONS = [
  'policy',
  'commercial',
  'intelligence',
  'pricing',
  'discounts',
  'conditions',
]

function BusinessPolicyPage() {
  const [filterQuery, setFilterQuery] = useState('')

  const matchedItems = useMemo(() => {
    const normalized = filterQuery.trim().toLowerCase()
    if (!normalized) return BUSINESS_POLICY_SUGGESTIONS
    return BUSINESS_POLICY_SUGGESTIONS.filter((item) => item.toLowerCase().includes(normalized))
  }, [filterQuery])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Policy Workspace"
        description="Enterprise business policy and commercial intelligence engine"
      />

      {/* Filtre universel : filtre local du contenu Business Policy, contexte page preserve */}
      <UniversalFilter
        persistKey="route-business-policy"
        placeholder="Filtrer le contenu Business Policy (pricing, discounts, conditions...)"
        ariaLabel="Filtre du contenu Business Policy"
        value={filterQuery}
        onValueChange={setFilterQuery}
        suggestions={BUSINESS_POLICY_SUGGESTIONS}
        resultCountLabel={`${matchedItems.length} element${matchedItems.length > 1 ? 's' : ''} correspondant${matchedItems.length > 1 ? 's' : ''}`}
      />

      <BusinessPolicyWorkspace />
    </div>
  )
}
