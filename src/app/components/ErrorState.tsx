type ErrorStateVariant = 'generic' | 'offline' | 'unauthorized' | 'forbidden' | 'server'

const variantCopy: Record<ErrorStateVariant, { title: string; description: string }> = {
  generic: {
    title: 'Something went wrong',
    description: 'Une erreur inattendue a interrompu cette partie du workspace.',
  },
  offline: {
    title: 'Offline',
    description: 'La connexion réseau semble indisponible. Les dernières données locales restent affichées.',
  },
  unauthorized: {
    title: 'Unauthorized',
    description: 'Cette action nécessite une session ou des droits supplémentaires.',
  },
  forbidden: {
    title: 'Forbidden',
    description: 'Votre profil ne possède pas les autorisations nécessaires pour cette zone.',
  },
  server: {
    title: 'Server error',
    description: 'Le service a répondu avec une erreur. Vous pouvez réessayer.',
  },
}

export default function ErrorState({
  message,
  variant = 'generic',
  retryLabel = 'Retry',
  onRetry,
}: {
  message: string
  variant?: ErrorStateVariant
  retryLabel?: string
  onRetry?: () => void
}) {
  const copy = variantCopy[variant]

  return (
    <div className="rounded-[2rem] border border-[color-mix(in_oklab,var(--srg-color-danger-500)_30%,transparent)] bg-[color-mix(in_oklab,var(--srg-color-danger-50)_86%,var(--srg-surface)_14%)] p-8 text-center text-[var(--srg-color-danger-800)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-[color-mix(in_oklab,var(--srg-color-danger-500)_30%,transparent)] bg-[var(--srg-surface-strong)] text-2xl text-[var(--srg-color-danger-700)]" aria-hidden>
        !
      </div>
      <p className="mt-5 text-xl font-semibold">{copy.title}</p>
      <p className="mt-2 text-sm text-[var(--srg-color-danger-700)]">{copy.description}</p>
      <p className="mt-3 text-sm text-[var(--srg-color-danger-800)]">{message}</p>
      {onRetry ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-3xl border border-[color-mix(in_oklab,var(--srg-color-danger-500)_30%,transparent)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-color-danger-700)] transition hover:bg-[color-mix(in_oklab,var(--srg-color-danger-100)_76%,transparent)]"
          >
            {retryLabel}
          </button>
        </div>
      ) : null}
    </div>
  )
}
