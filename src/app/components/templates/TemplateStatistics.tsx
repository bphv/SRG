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
        <div key={item.label} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--sea-ink)] shadow-[0_18px_34px_rgba(30,90,72,0.06)]">
          <p className="text-sm text-[var(--sea-ink-soft)]">{item.label}</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--sea-ink)]">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
