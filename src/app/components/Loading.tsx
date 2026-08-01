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
    <div className="srg-state-block text-center text-[var(--srg-text-muted)]">
      <div className={`mx-auto mb-4 animate-[spin_1.2s_linear_infinite] rounded-full border-[var(--srg-color-primary-500)] border-t-transparent ${sizeClasses[size]}`} />
      <p className="text-sm font-medium text-[var(--srg-text-title)]">{title}</p>
      {description ? <p className="mt-2 text-sm text-[var(--srg-text-muted)]">{description}</p> : null}
    </div>
  )
}
