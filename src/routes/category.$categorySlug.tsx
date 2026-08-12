import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { navItems } from '#/app/navigation/navConfig'
import { CATEGORY_CATALOG } from '#/app/navigation/categoryCatalog'

export const Route = createFileRoute('/category/$categorySlug')({
  component: CategoryPage,
})

function CategoryPage() {
  const { categorySlug } = Route.useParams()
  const [query, setQuery] = useState('')
  const navByPath = useMemo(() => new Map(navItems.map((item) => [item.path, item])), [])

  const category = useMemo(
    () => CATEGORY_CATALOG.find((entry) => entry.id === categorySlug),
    [categorySlug],
  )

  const normalizedQuery = query.trim().toLowerCase()
  const filteredSubcategories = useMemo(() => {
    if (!category) return []
    if (!normalizedQuery) return category.subcategories
    return category.subcategories.filter((entry) => entry.label.toLowerCase().includes(normalizedQuery))
  }, [category, normalizedQuery])

  const categoryName = category?.name ?? categorySlug
  const categoryDescription = category?.description ?? 'Categorie inconnue ou non disponible.'

  return (
    <main className="space-y-4 overflow-x-hidden px-4 py-4 text-zinc-900 sm:px-6" aria-label="Page 3 categorie specifique">
      <header className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-[0_1px_0_rgba(24,24,27,0.04),0_8px_24px_rgba(24,24,27,0.05)] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="inline-flex h-10 items-center rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold tracking-[0.06em] text-zinc-900 no-underline"
              preload="intent"
            >
              SRG
            </Link>
            <Link
              to="/"
              className="inline-flex h-10 items-center rounded-xl border border-zinc-300 bg-zinc-100 px-3 text-sm font-medium text-zinc-900 no-underline transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
              preload="intent"
            >
              Accueil
            </Link>
          </div>

          <nav aria-label="Fil d Ariane page categorie" className="text-sm text-zinc-600">
            <Link to="/" className="font-medium text-zinc-700 no-underline hover:text-zinc-900" preload="intent">
              Accueil
            </Link>{' '}
            / <Link to="/categories" className="font-medium text-zinc-700 no-underline hover:text-zinc-900" preload="intent">Categories</Link>{' '}
            / <span className="font-semibold text-zinc-900">{categoryName}</span>
          </nav>
        </div>

        <div className="mt-4">
          <Link
            to="/categories"
            className="inline-flex min-h-10 items-center rounded-xl border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 no-underline transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
            preload="intent"
          >
            ← Retour aux categories
          </Link>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">Categorie</p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl">{categoryName}</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 sm:text-base">{categoryDescription}</p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-[linear-gradient(180deg,#fafafa_0%,#f4f4f5_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_4px_14px_rgba(24,24,27,0.05)] sm:p-5" aria-label="Recherche locale sous-categorie">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher dans cette categorie"
            className="min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            aria-label="Recherche locale"
          />
          <button
            type="button"
            className="min-h-11 rounded-xl border border-zinc-300 bg-zinc-100 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
            aria-label="Lancer la recherche locale"
          >
            Rechercher
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-[linear-gradient(180deg,#fafafa_0%,#f4f4f5_100%)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_4px_14px_rgba(24,24,27,0.05)] sm:px-4" aria-label={`Sous-categories de ${categoryName}`}>
        {filteredSubcategories.length > 0 ? (
          <>
            <ul className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 pr-1 [scrollbar-width:thin]" data-subcategory-rail={categorySlug}>
              {filteredSubcategories.map((subcategory) => (
                <li key={subcategory.id} className="snap-start">
                  <Link
                    to="/category/$categorySlug/$subcategorySlug"
                    params={{ categorySlug, subcategorySlug: subcategory.id }}
                    className="inline-flex min-h-[5rem] w-[15.5rem] shrink-0 flex-col items-start rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-zinc-800 no-underline transition hover:border-zinc-400 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                    data-subcategory-id={subcategory.id}
                    preload="intent"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-300 bg-zinc-50 text-[12px]">
                        {navByPath.get(subcategory.targetPath)?.icon ?? '•'}
                      </span>
                      <span>{subcategory.label}</span>
                    </span>
                    <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-600">
                      {navByPath.get(subcategory.targetPath)?.description ?? categoryDescription}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-[11px] text-zinc-500 md:hidden">Glissez horizontalement pour voir plus de sous-categories.</p>
            <p className="mt-1 hidden text-[11px] text-zinc-500 md:block">Defilement horizontal: souris, trackpad ou tactile.</p>
          </>
        ) : (
          <article className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 sm:px-5">
            <h2 className="text-sm font-semibold text-zinc-900">Sous-categories</h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600">Aucune sous-categorie disponible pour cette recherche.</p>
          </article>
        )}
      </section>
      <Outlet />
    </main>
  )
}
