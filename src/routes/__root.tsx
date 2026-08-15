import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { AppProviders } from '#/app/contexts/AppProviders'
import AppShell from '#/app/layout/AppShell'
import KernelBootstrap from '#/core/bootstrap/KernelBootstrap'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'SRG Enterprise Intelligence Platform',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--srg-color-primary-500)]">Erreur 404</p>
      <h1 className="max-w-xl text-3xl font-bold text-[var(--srg-text-title)] md:text-4xl">
        Cette page n'existe pas dans SRG.
      </h1>
      <p className="max-w-lg text-sm text-[var(--srg-text-muted)]">
        La ressource demandee est introuvable ou a ete deplacee. Utilisez la navigation officielle pour retrouver votre espace metier.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="rounded-3xl bg-[var(--srg-color-primary-500)] px-6 py-3 text-sm font-semibold text-white">
          Retour a l'accueil
        </Link>
        <Link to="/categories" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-6 py-3 text-sm font-semibold text-[var(--srg-text-title)]">
          Ouvrir les categories metier
        </Link>
      </div>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
        <KernelBootstrap />
        <Scripts />
      </body>
    </html>
  )
}
