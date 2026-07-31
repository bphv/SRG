export default function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--lagoon-deep)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-[var(--sea-ink)]">{value}</p>
    </div>
  )
}
