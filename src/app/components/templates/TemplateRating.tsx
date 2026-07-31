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
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Notation</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-3 text-sm text-[var(--sea-ink-soft)]">
        <div className="rounded-3xl bg-[var(--surface)] p-4">
          <p className="font-semibold text-[var(--sea-ink)]">Score</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{score.toFixed(1)}/5</p>
        </div>
        <div className="rounded-3xl bg-[var(--surface)] p-4">
          <p className="font-semibold text-[var(--sea-ink)]">Utilisations</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{uses}</p>
        </div>
        <div className="rounded-3xl bg-[var(--surface)] p-4">
          <p className="font-semibold text-[var(--sea-ink)]">Popularité</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">{popularity}%</p>
        </div>
      </div>
    </div>
  )
}
