import { useEffect, useMemo, useState } from 'react'
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
    <section className="srg-premium-card rounded-[var(--srg-radius-lg)] p-4">
      <header className="mb-3 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--srg-text-muted)]">Form Section</p>
        <h3 className="srg-h4 mt-1 inline-flex items-center gap-2"><span aria-hidden>✦</span>{title}</h3>
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

  return <div className={`grid gap-4 ${colClass}`}>{children}</div>
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
    <label className="grid gap-2 rounded-2xl border border-transparent p-2 text-sm transition hover:border-[var(--srg-border)] hover:bg-[var(--srg-surface)]">
      <span className="inline-flex items-center gap-2 font-semibold text-[var(--srg-text-label)]">
        <span aria-hidden>•</span>
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
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-2">
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

export function CollapsibleFormSection({
  id,
  title,
  description,
  children,
  defaultOpen = true,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const storageKey = `srg.form.section.${id}`
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return defaultOpen
    const value = window.localStorage.getItem(storageKey)
    return value === null ? defaultOpen : value === 'open'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, open ? 'open' : 'closed')
    }
  }, [open, storageKey])

  return (
    <section className="srg-premium-card rounded-[var(--srg-radius-lg)] p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-1 text-left"
        aria-expanded={open}
        aria-controls={`${id}-content`}
        onClick={() => setOpen((current) => !current)}
      >
        <div>
          <h3 className="srg-h4">{title}</h3>
          {description ? <p className="srg-body mt-1 text-sm">{description}</p> : null}
        </div>
        <span className="text-xs text-[var(--srg-text-muted)]">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open ? <div id={`${id}-content`} className="mt-3">{children}</div> : null}
    </section>
  )
}

export function FormProgress({
  completed,
  total,
  label = 'Completion',
}: {
  completed: number
  total: number
  label?: string
}) {
  const safeTotal = Math.max(1, total)
  const clamped = Math.min(safeTotal, Math.max(0, completed))
  const percent = Math.round((clamped / safeTotal) * 100)

  return (
    <div className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--srg-text-label)]">{label}</span>
        <span className="text-[var(--srg-text-muted)]">{percent}%</span>
      </div>
      <progress
        value={clamped}
        max={safeTotal}
        className="srg-progress h-2 w-full overflow-hidden rounded-full"
        aria-label={`${label}: ${percent}%`}
      />
    </div>
  )
}

export function SmartInputField({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  required,
  validator,
  autosaveLabel,
}: {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  required?: boolean
  validator?: (value: string) => string | null
  autosaveLabel?: string
}) {
  const historyKey = `srg.form.history.${id}`
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(historyKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as string[]
      setHistory(Array.isArray(parsed) ? parsed : [])
    } catch {
      setHistory([])
    }
  }, [historyKey])

  const error = useMemo(() => {
    if (validator) return validator(value)
    if (required && !value.trim()) return `${label} is required.`
    return null
  }, [label, required, validator, value])

  const commitValueToHistory = () => {
    const normalized = value.trim()
    if (!normalized || typeof window === 'undefined') return
    const next = [normalized, ...history.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 10)
    setHistory(next)
    window.localStorage.setItem(historyKey, JSON.stringify(next))
  }

  return (
    <Field label={label} required={required} error={error ?? undefined} hint={error ? undefined : autosaveLabel}>
      <>
        <input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onBlur={commitValueToHistory}
          placeholder={placeholder}
          list={`${id}-history`}
        />
        <datalist id={`${id}-history`}>
          {history.map((item) => <option key={item} value={item} />)}
        </datalist>
      </>
    </Field>
  )
}
