import type { ReactNode } from 'react'

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[var(--srg-radius-lg)] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 shadow-[var(--srg-shadow-sm)]">
      <header className="mb-3">
        <h3 className="srg-h4">{title}</h3>
        {description ? <p className="srg-body mt-1 text-sm">{description}</p> : null}
      </header>
      {children}
    </section>
  )
}

export function FieldGroup({ children, columns = 2 }: { children: ReactNode; columns?: 1 | 2 | 3 | 4 }) {
  const colClass = columns === 1
    ? 'grid-cols-1'
    : columns === 2
      ? 'md:grid-cols-2'
      : columns === 3
        ? 'md:grid-cols-2 xl:grid-cols-3'
        : 'md:grid-cols-2 xl:grid-cols-4'

  return <div className={`grid gap-3 ${colClass}`}>{children}</div>
}

export function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-semibold text-[var(--srg-text-label)]">
        {label}
        {required ? <span className="ml-1 text-[var(--srg-color-danger-500)]">*</span> : null}
      </span>
      {children}
      {error ? <ValidationMessage variant="error">{error}</ValidationMessage> : hint ? <ValidationMessage variant="hint">{hint}</ValidationMessage> : null}
    </label>
  )
}

export function ValidationMessage({
  variant,
  children,
}: {
  variant: 'hint' | 'success' | 'warning' | 'error'
  children: ReactNode
}) {
  const className = variant === 'hint'
    ? 'text-[var(--srg-text-muted)]'
    : variant === 'success'
      ? 'text-[var(--srg-color-success-600)]'
      : variant === 'warning'
        ? 'text-[var(--srg-color-warning-600)]'
        : 'text-[var(--srg-color-danger-600)]'

  return <p className={`text-xs ${className}`}>{children}</p>
}

export function FormToolbar({
  children,
  autosaveLabel,
}: {
  children: ReactNode
  autosaveLabel?: string
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {children}
      {autosaveLabel ? <span className="srg-badge srg-badge-info">Autosave: {autosaveLabel}</span> : null}
    </div>
  )
}

export function WizardSteps({
  steps,
  active,
}: {
  steps: string[]
  active: number
}) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((step, index) => (
        <li
          key={step}
          className={`srg-badge ${index === active ? 'srg-badge-info' : 'srg-badge-neutral'}`}
          aria-current={index === active ? 'step' : undefined}
        >
          {index + 1}. {step}
        </li>
      ))}
    </ol>
  )
}

export function SwitchField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
        checked
          ? 'border-[var(--srg-color-primary-400)] bg-[var(--srg-color-primary-100)] text-[var(--srg-color-primary-700)]'
          : 'border-[var(--srg-border)] bg-[var(--srg-surface-strong)] text-[var(--srg-text-muted)]',
      ].join(' ')}
    >
      <span
        aria-hidden
        className={[
          'h-2.5 w-2.5 rounded-full transition',
          checked ? 'bg-[var(--srg-color-primary-500)]' : 'bg-[var(--srg-disabled)]',
        ].join(' ')}
      />
      {label}
    </button>
  )
}
