import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import PageHeader from '#/app/components/PageHeader'
import UniversalFilter from '#/app/components/UniversalFilter'
import HumanResourcesWorkspace from '#/app/components/hr/HumanResourcesWorkspace'

export const Route = createFileRoute('/attendance')({
  component: AttendancePage,
})

const ATTENDANCE_SUGGESTIONS = [
  'pointage',
  'absences',
  'heures supplementaires',
  'suivi terrain',
  'equipes',
  'planning',
]

function AttendancePage() {
  const [filterQuery, setFilterQuery] = useState('')

  const matchedItems = useMemo(() => {
    const normalized = filterQuery.trim().toLowerCase()
    if (!normalized) return ATTENDANCE_SUGGESTIONS
    return ATTENDANCE_SUGGESTIONS.filter((item) => item.toLowerCase().includes(normalized))
  }, [filterQuery])

  return (
    <div className="space-y-6">
      <PageHeader title="Presences" description="Pointages, absences, heures supplementaires et suivi terrain." />

      {/* Filtre universel : filtre local du contenu Presences, contexte page preserve */}
      <UniversalFilter
        persistKey="route-attendance"
        placeholder="Filtrer le contenu Presences (pointage, absences, heures sup...)"
        ariaLabel="Filtre du contenu Presences"
        value={filterQuery}
        onValueChange={setFilterQuery}
        suggestions={ATTENDANCE_SUGGESTIONS}
        resultCountLabel={`${matchedItems.length} element${matchedItems.length > 1 ? 's' : ''} correspondant${matchedItems.length > 1 ? 's' : ''}`}
      />

      <HumanResourcesWorkspace initialView="attendance" />
    </div>
  )
}
