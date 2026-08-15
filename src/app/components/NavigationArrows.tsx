import { useNavigate } from '@tanstack/react-router'

type NavigationArrowsProps = {
  /** Libelle du bouton retour (par defaut : "Retour"). */
  backLabel?: string
  /** Destination explicite du retour. Par defaut : historique navigateur (-1). */
  backTo?: string
  /** Destination explicite du bouton suivant. Si absent, le bouton suivant est masque. */
  nextTo?: string
  /** Libelle du bouton suivant. */
  nextLabel?: string
  /** Desactive le bouton retour. */
  disableBack?: boolean
  /** Desactive le bouton suivant. */
  disableNext?: boolean
  /** Classes additionnelles du conteneur. */
  className?: string
}

/**
 * NavigationArrows — fleches de navigation avant/retour reutilisables.
 *
 * - Retour : navigate({ to: backTo }) ou historique (-1) si backTo absent.
 * - Suivant : uniquement si nextTo est fourni.
 * - Accessible : aria-label, focus visible, boutons clavier.
 * - N'affecte pas la Homepage (composant utilise uniquement sur les autres pages).
 */
export default function NavigationArrows({
  backLabel = 'Retour',
  backTo,
  nextTo,
  nextLabel = 'Suivant',
  disableBack = false,
  disableNext = false,
  className,
}: NavigationArrowsProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backTo) {
      navigate({ to: backTo })
    } else {
      navigate({ to: -1 as never })
    }
  }

  const handleNext = () => {
    if (nextTo) {
      navigate({ to: nextTo })
    }
  }

  const buttonBase =
    'inline-flex items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] transition-colors hover:bg-[var(--srg-surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--srg-color-primary-500)] disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav aria-label="Navigation avant / retour" className={`flex items-center gap-2 ${className ?? ''}`}>
      <button type="button" onClick={handleBack} disabled={disableBack} aria-label={backLabel} className={buttonBase}>
        <span aria-hidden>←</span>
        <span>{backLabel}</span>
      </button>
      {nextTo ? (
        <button type="button" onClick={handleNext} disabled={disableNext} aria-label={nextLabel} className={buttonBase}>
          <span>{nextLabel}</span>
          <span aria-hidden>→</span>
        </button>
      ) : null}
    </nav>
  )
}