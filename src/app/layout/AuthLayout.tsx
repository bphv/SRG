import { Link } from '@tanstack/react-router'

/**
 * AuthLayout — layout isole pour /auth et /account-pending.
 *
 * Aucun AppShell global : pas de sidebar, pas de navigation metier,
 * pas de recherche, pas de Providers, pas de workspace/tenant,
 * pas de Conversations/Documents, pas de footer workspace.
 *
 * Design premium monochrome coherent avec l'identite SRG.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--srg-surface)] text-[var(--srg-text-body)]">
      {/* En-tete minimal : logo SRG */}
      <header className="flex items-center justify-center border-b border-[var(--srg-border)] px-6 py-5">
        <Link to="/" className="group flex flex-col items-center gap-1" aria-label="Retour a l'accueil SRG">
          <span className="text-2xl font-bold tracking-[0.25em] text-[var(--srg-text-title)]">SRG</span>
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--srg-text-muted)]">
            Enterprise Intelligence Platform
          </span>
        </Link>
      </header>

      {/* Contenu centre */}
      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 md:py-12">
        <div className="w-full max-w-xl">{children}</div>
      </main>

      {/* Footer Auth minimal */}
      <footer className="border-t border-[var(--srg-border)] px-6 py-6">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--srg-text-muted)]">
            <span className="cursor-pointer transition-colors hover:text-[var(--srg-text-title)]">Confidentialite</span>
            <span className="cursor-pointer transition-colors hover:text-[var(--srg-text-title)]">Conditions d'utilisation</span>
            <span className="cursor-pointer transition-colors hover:text-[var(--srg-text-title)]">Aide / Contact</span>
          </nav>
          <div className="flex items-center gap-3 text-xs text-[var(--srg-text-muted)]">
            <span className="cursor-pointer font-medium transition-colors hover:text-[var(--srg-text-title)]">Francais</span>
            <span aria-hidden="true">·</span>
            <span className="cursor-pointer transition-colors hover:text-[var(--srg-text-title)]">English</span>
            <span aria-hidden="true">·</span>
            <span className="cursor-pointer transition-colors hover:text-[var(--srg-text-title)]">Espanol</span>
          </div>
          <p className="text-[11px] text-[var(--srg-text-muted)]">
            © {new Date().getFullYear()} SRG Industries Holding. Tous droits reserves.
          </p>
        </div>
      </footer>
    </div>
  )
}