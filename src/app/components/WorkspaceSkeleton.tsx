type WorkspaceSkeletonVariant =
  | 'dashboard'
  | 'projects'
  | 'prompt-studio'
  | 'templates'
  | 'history'
  | 'providers'
  | 'knowledge-center'
  | 'notifications'
  | 'profile'

const variantLayout: Record<WorkspaceSkeletonVariant, { heroCards: number; bodyColumns: number; lines: number }> = {
  dashboard: { heroCards: 4, bodyColumns: 2, lines: 5 },
  projects: { heroCards: 3, bodyColumns: 2, lines: 6 },
  'prompt-studio': { heroCards: 2, bodyColumns: 3, lines: 7 },
  templates: { heroCards: 3, bodyColumns: 3, lines: 6 },
  history: { heroCards: 4, bodyColumns: 2, lines: 6 },
  providers: { heroCards: 4, bodyColumns: 2, lines: 5 },
  'knowledge-center': { heroCards: 2, bodyColumns: 2, lines: 7 },
  notifications: { heroCards: 2, bodyColumns: 1, lines: 6 },
  profile: { heroCards: 3, bodyColumns: 2, lines: 6 },
}

const heroGridClasses: Record<WorkspaceSkeletonVariant, string> = {
  dashboard: 'grid gap-4 md:grid-cols-2 xl:grid-cols-4',
  projects: 'grid gap-4 md:grid-cols-2 xl:grid-cols-3',
  'prompt-studio': 'grid gap-4 md:grid-cols-2 xl:grid-cols-2',
  templates: 'grid gap-4 md:grid-cols-2 xl:grid-cols-3',
  history: 'grid gap-4 md:grid-cols-2 xl:grid-cols-4',
  providers: 'grid gap-4 md:grid-cols-2 xl:grid-cols-4',
  'knowledge-center': 'grid gap-4 md:grid-cols-2 xl:grid-cols-2',
  notifications: 'grid gap-4 xl:grid-cols-2',
  profile: 'grid gap-4 md:grid-cols-2 xl:grid-cols-3',
}

const bodyGridClasses: Record<WorkspaceSkeletonVariant, string> = {
  dashboard: 'grid gap-6 xl:grid-cols-2',
  projects: 'grid gap-6 xl:grid-cols-2',
  'prompt-studio': 'grid gap-6 xl:grid-cols-3',
  templates: 'grid gap-6 xl:grid-cols-3',
  history: 'grid gap-6 xl:grid-cols-2',
  providers: 'grid gap-6 xl:grid-cols-2',
  'knowledge-center': 'grid gap-6 xl:grid-cols-2',
  notifications: 'grid gap-6',
  profile: 'grid gap-6 xl:grid-cols-2',
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-3xl bg-[var(--surface-strong)] ${className}`} aria-hidden />
}

export default function WorkspaceSkeleton({
  variant,
  title,
  description,
}: {
  variant: WorkspaceSkeletonVariant
  title?: string
  description?: string
}) {
  const layout = variantLayout[variant]

  return (
    <div className="space-y-6" role="status" aria-live="polite" aria-label={title ?? 'Chargement du workspace'}>
      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="mt-4 h-10 w-full max-w-xl" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-2xl" />
        <p className="mt-5 text-sm text-[var(--sea-ink-soft)]">{description ?? 'Préparation de la vue et des données du workspace.'}</p>
      </div>

      <div className={heroGridClasses[variant]}>
        {Array.from({ length: layout.heroCards }).map((_, index) => (
          <div key={`hero-${variant}-${index}`} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-4 h-9 w-20" />
            <SkeletonBlock className="mt-4 h-3 w-full" />
          </div>
        ))}
      </div>

      <div className={bodyGridClasses[variant]}>
        {Array.from({ length: layout.bodyColumns }).map((_, columnIndex) => (
          <div key={`panel-${variant}-${columnIndex}`} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
            <SkeletonBlock className="h-3 w-32" />
            <SkeletonBlock className="mt-4 h-8 w-48" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: layout.lines }, (_lineValue, lineIndex) => (
                <SkeletonBlock key={`line-${variant}-${columnIndex}-${lineIndex}`} className={`h-4 ${lineIndex % 3 === 0 ? 'w-full' : lineIndex % 2 === 0 ? 'w-5/6' : 'w-2/3'}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}