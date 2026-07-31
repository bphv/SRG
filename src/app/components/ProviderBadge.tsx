export default function ProviderBadge({
  provider,
}: {
  provider: string
}) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lagoon-deep)] ring-1 ring-[var(--line)]">
      {provider}
    </span>
  )
}
