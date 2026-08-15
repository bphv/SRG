import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import PageHeader from '#/app/components/PageHeader'
import UniversalFilter from '#/app/components/UniversalFilter'
import DevisWorkspace from '#/app/components/business/DevisWorkspace'

export const Route = createFileRoute('/devis')({
  component: DevisPage,
})

const DEVIS_SUGGESTIONS = [
  'quotes',
  'devis',
  'facturation',
  'billing',
  'clients',
  'lignes',
]

function DevisPage() {
  const [filterQuery, setFilterQuery] = useState('')

  const matchedItems = useMemo(() => {
    const normalized = filterQuery.trim().toLowerCase()
    if (!normalized) return DEVIS_SUGGESTIONS
    return DEVIS_SUGGESTIONS.filter((item) => item.toLowerCase().includes(normalized))
  }, [filterQuery])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Devis Workspace"
        description="Quotes and unified billing document engine"
      />

      {/* Filtre universel : filtre local du contenu Devis, contexte page preserve */}
      <UniversalFilter
        persistKey="route-devis"
        placeholder="Filtrer le contenu Devis (quotes, facturation, clients...)"
        ariaLabel="Filtre du contenu Devis"
        value={filterQuery}
        onValueChange={setFilterQuery}
        suggestions={DEVIS_SUGGESTIONS}
        resultCountLabel={`${matchedItems.length} element${matchedItems.length > 1 ? 's' : ''} correspondant${matchedItems.length > 1 ? 's' : ''}`}
      />

      <DevisWorkspace />
    </div>
  )
}
