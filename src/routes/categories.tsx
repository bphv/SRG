import { Link, createFileRoute } from '@tanstack/react-router'
import { getOrderedCategories } from '#/app/navigation/categoryCatalog'

export const Route = createFileRoute('/categories')({
  component: CategoriesPage,
})

function CategoriesPage() {
  const buildWhatsAppHref = (rawContact?: string) => {
    if (!rawContact) return null
    const digits = rawContact.replace(/[^\d]/g, '')
    if (!digits) return null
    return `https://wa.me/${digits}`
  }

  const orderedRows = getOrderedCategories()

  return (
    <main className="srg-categories-page space-y-4 overflow-x-hidden text-slate-900" aria-label="Page 2 SRG Categories">
      <header className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-[0_1px_0_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.05)] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold tracking-[0.06em] text-slate-900 no-underline"
              aria-label="Retour accueil SRG"
              preload="intent"
            >
              SRG
            </Link>
            <Link
              to="/"
              className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-slate-100 px-3 text-sm font-medium text-slate-900 no-underline transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              preload="intent"
            >
              Accueil
            </Link>
          </div>

          <nav aria-label="Fil d Ariane" className="text-sm text-slate-600">
            <Link to="/" className="font-medium text-slate-700 no-underline hover:text-slate-900" preload="intent">
              Accueil
            </Link>{' '}
            / <span className="font-semibold text-slate-900">Categories</span>
          </nav>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">Centre de navigation des categories</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
          Explorez les domaines SRG depuis une taxonomie canonique unique, puis accedez a la Page 3 dediee a chaque
          categorie.
        </p>
      </header>

      <section className="space-y-2.5" aria-label="Categories principales SRG">
        {orderedRows.map((category) => (
          (() => {
            const categoryWhatsAppHref = buildWhatsAppHref(category.whatsappContact)

            return (
          <article
            key={category.id}
            className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_14px_rgba(15,23,42,0.05)] transition hover:border-slate-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_20px_rgba(15,23,42,0.08)] sm:px-4"
            data-category-id={category.id}
          >
            <div className="grid gap-3 md:grid-cols-[18rem_minmax(0,1fr)] md:items-start lg:grid-cols-[20rem_minmax(0,1fr)]">
              <div className="min-w-0 shrink-0 rounded-xl border border-slate-200 bg-slate-100/80 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-800">
                    <CategoryIcon kind={category.icon} />
                  </span>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.04em] text-slate-900 sm:text-base">{category.name}</h2>
                </div>
                <p className="mt-1.5 whitespace-normal break-words text-xs leading-relaxed text-slate-600 sm:text-sm">{category.description}</p>
                {categoryWhatsAppHref ? (
                  <a
                    href={categoryWhatsAppHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 no-underline md:hidden"
                    aria-label={`Ouvrir WhatsApp pour ${category.name}`}
                  >
                    WhatsApp
                  </a>
                ) : null}
              </div>

              <div className="flex items-center justify-start md:justify-end">
                <Link
                  to="/category/$categorySlug"
                  params={{ categorySlug: category.id }}
                  className="inline-flex min-h-10 items-center rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 no-underline transition hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                  data-category-id={category.id}
                  preload="intent"
                >
                  Ouvrir {category.name}
                </Link>
              </div>
            </div>
          </article>
            )
          })()
        ))}
      </section>
    </main>
  )
}

function CategoryIcon({ kind }: { kind: ReturnType<typeof getOrderedCategories>[number]['icon'] }) {
  if (kind === 'finance') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path d="M4 19h16M6 16V9m4 7V6m4 10v-5m4 5V8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'hr') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <circle cx="8" cy="8" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16" cy="9" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.7 18a4.3 4.3 0 0 1 8.6 0M12.5 18a3.5 3.5 0 0 1 7 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'operations') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <rect x="4" y="5" width="16" height="14" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 12h8M12 8v8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'knowledge') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path d="M6 5h9l3 3v11H6z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M15 5v3h3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 12h6M9 15h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (kind === 'automation') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.2 6.2l2.8 2.8M15 15l2.8 2.8M17.8 6.2 15 9M9 15l-2.8 2.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M12 3 5 6v5c0 4.2 2.7 7.9 7 9 4.3-1.1 7-4.8 7-9V6z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m9.5 12 1.7 1.7L14.8 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
