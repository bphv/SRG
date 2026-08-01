export default function TemplateRating({
  score,
  uses,
  popularity,
}: {
  score: number
  uses: number
  popularity: number
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6 shadow-[var(--srg-shadow-md)]">
      <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Notation</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-3 text-sm text-[var(--srg-text-muted)]">
        <div className="rounded-3xl bg-[var(--srg-surface)] p-4">
          <p className="font-semibold text-[var(--srg-text-title)]">Score</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{score.toFixed(1)}/5</p>
        </div>
        <div className="rounded-3xl bg-[var(--srg-surface)] p-4">
          <p className="font-semibold text-[var(--srg-text-title)]">Utilisations</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{uses}</p>
        </div>
        <div className="rounded-3xl bg-[var(--srg-surface)] p-4">
          <p className="font-semibold text-[var(--srg-text-title)]">Popularité</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{popularity}%</p>
        </div>
      </div>
    </div>
  )
}
