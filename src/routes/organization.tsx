import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import PageHeader from '#/app/components/PageHeader'
import UniversalFilter from '#/app/components/UniversalFilter'
import HumanResourcesWorkspace from '#/app/components/hr/HumanResourcesWorkspace'

export const Route = createFileRoute('/organization')({
  component: OrganizationPage,
})

const ORGANIZATION_SUGGESTIONS = [
  'structure',
  'unites',
  'management',
  'capacites',
  'equipes',
  'departements',
]

function OrganizationPage() {
  const [filterQuery, setFilterQuery] = useState('')

  const matchedItems = useMemo(() => {
    const normalized = filterQuery.trim().toLowerCase()
    if (!normalized) return ORGANIZATION_SUGGESTIONS
    return ORGANIZATION_SUGGESTIONS.filter((item) => item.toLowerCase().includes(normalized))
  }, [filterQuery])

  return (
    <div className="space-y-6">
      <PageHeader title="Organisation" description="Structure organisationnelle, unites, management et capacites." />

      {/* Filtre universel : filtre local du contenu Organisation, contexte page preserve */}
      <UniversalFilter
        persistKey="route-organization"
        placeholder="Filtrer le contenu Organisation (structure, unites, management...)"
        ariaLabel="Filtre du contenu Organisation"
        value={filterQuery}
        onValueChange={setFilterQuery}
        suggestions={ORGANIZATION_SUGGESTIONS}
        resultCountLabel={`${matchedItems.length} element${matchedItems.length > 1 ? 's' : ''} correspondant${matchedItems.length > 1 ? 's' : ''}`}
      />

      <HumanResourcesWorkspace initialView="organization" />
    </div>
  )
}
