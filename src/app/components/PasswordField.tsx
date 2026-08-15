import { useId, useState } from 'react'

type PasswordFieldProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  autoComplete?: string
  className?: string
  inputClassName?: string
  disabled?: boolean
  error?: string
}

/**
 * PasswordField — champ mot de passe SRG reutilisable.
 *
 * - type=password par defaut (jamais affiche automatiquement)
 * - bouton oeil accessible (clavier + souris) pour afficher/masquer
 * - aria-label explicite
 * - aucun stockage du mot de passe en clair
 */
export default function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  ariaLabel,
  autoComplete = 'current-password',
  className,
  inputClassName,
  disabled,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const fieldId = useId()

  const baseInputClass =
    inputClassName ??
    'w-full rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2.5 pr-12 text-sm text-[var(--srg-text-body)] outline-none transition-colors placeholder:text-[var(--srg-text-muted)] focus:border-[var(--srg-color-primary-500)] focus:ring-2 focus:ring-[rgba(79,184,178,0.2)]'

  return (
    <div className={className ?? 'grid gap-1.5 text-sm'}>
      {label ? (
        <label htmlFor={fieldId} className="font-medium text-[var(--srg-text-title)]">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={fieldId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel ?? label ?? 'Mot de passe'}
          autoComplete={autoComplete}
          disabled={disabled}
          className={baseInputClass}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          aria-pressed={visible}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-base text-[var(--srg-text-muted)] transition-colors hover:bg-[var(--srg-surface-strong)] hover:text-[var(--srg-text-title)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--srg-color-primary-500)]"
        >
          <span aria-hidden>{visible ? '🙈' : '👁'}</span>
        </button>
      </div>
      {error ? <span className="text-xs text-[#9b2f2f]">{error}</span> : null}
    </div>
  )
}