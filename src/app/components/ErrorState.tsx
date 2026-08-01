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
    <div className="rounded-[2rem] border border-[rgba(223,78,78,0.24)] bg-[linear-gradient(180deg,rgba(255,245,245,0.98),rgba(255,235,235,0.94))] p-8 text-center text-red-900 dark:bg-[linear-gradient(180deg,rgba(55,21,21,0.92),rgba(44,18,18,0.94))]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-[rgba(223,78,78,0.24)] bg-white/80 text-2xl text-[#9b2f2f] dark:bg-black/10" aria-hidden>
        !
      </div>
      <p className="mt-5 text-xl font-semibold">{copy.title}</p>
      <p className="mt-2 text-sm text-red-700">{copy.description}</p>
      <p className="mt-3 text-sm text-red-800">{message}</p>
      {onRetry ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-3xl border border-[rgba(223,78,78,0.24)] bg-white px-4 py-2 text-sm font-semibold text-[#9b2f2f] transition hover:bg-red-50 dark:bg-black/10 dark:hover:bg-black/20"
          >
            {retryLabel}
          </button>
        </div>
      ) : null}
    </div>
  )
}
