export default function TemplateStatistics({
  total,
  favorites,
  official,
  community,
  uses,
}: {
  total: number
  favorites: number
  official: number
  community: number
  uses: number
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {[
        { label: 'Total templates', value: total },
        { label: 'Favoris', value: favorites },
        { label: 'Officiels', value: official },
        { label: 'Communautaires', value: community },
        { label: 'Utilisations', value: uses },
      ].map((item) => (
        <div key={item.label} className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 text-sm text-[var(--srg-text-title)] shadow-[var(--srg-shadow-sm)]">
          <p className="text-sm text-[var(--srg-text-muted)]">{item.label}</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--srg-text-title)]">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
