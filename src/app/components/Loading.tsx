type LoadingProps = {
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<NonNullable<LoadingProps['size']>, string> = {
  sm: 'h-10 w-10 border-[3px]',
  md: 'h-14 w-14 border-4',
  lg: 'h-16 w-16 border-4',
}

export default function Loading({
  title = 'Loading…',
  description,
  size = 'md',
}: LoadingProps) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-8 text-center text-[var(--sea-ink-soft)]">
      <div className={`mx-auto mb-4 animate-[spin_1.2s_linear_infinite] rounded-full border-[var(--lagoon-deep)] border-t-transparent ${sizeClasses[size]}`} />
      <p className="text-sm font-medium text-[var(--sea-ink)]">{title}</p>
      {description ? <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">{description}</p> : null}
    </div>
  )
}
