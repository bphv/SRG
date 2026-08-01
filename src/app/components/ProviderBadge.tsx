export default function ProviderBadge({
  provider,
}: {
  provider: string
}) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--srg-surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)] ring-1 ring-[var(--srg-border)]">
      {provider}
    </span>
  )
}
