import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import { KnowledgeCenterService } from '#/app/services/KnowledgeCenterService'
import type { KnowledgeCategory } from '#/app/services/KnowledgeCenterService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export const Route = createFileRoute('/knowledge-center')({
  component: KnowledgeCenterPage,
})

function KnowledgeCenterPage() {
  const articles = useMemo(() => KnowledgeCenterService.list(), [])
  const preferences = WorkspacePreferencesService.getPreferences()
  const persistedFilters = preferences.filters['knowledge-center'] ?? {}
  const [search, setSearch] = useState(typeof persistedFilters.search === 'string' ? persistedFilters.search : '')
  const [category, setCategory] = useState<'all' | KnowledgeCategory>(persistedFilters.category === 'documentation' || persistedFilters.category === 'faq' || persistedFilters.category === 'guides' || persistedFilters.category === 'tutorials' || persistedFilters.category === 'examples' || persistedFilters.category === 'api' ? persistedFilters.category : 'all')
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(articles[0]?.id ?? null)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(preferences.favorites['knowledge-center'] ?? [])

  useEffect(() => {
    WorkspacePreferencesService.setFilters('knowledge-center', { search, category })
  }, [search, category])

  useEffect(() => {
    WorkspacePreferencesService.setFavorites('knowledge-center', favoriteIds)
  }, [favoriteIds])

  const categories = KnowledgeCenterService.categories()

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase()
    return articles.filter((article) => {
      if (category !== 'all' && article.category !== category) {
        return false
      }
      if (!query) {
        return true
      }
      return (
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    })
  }, [articles, category, search])

  const selectedArticle = useMemo(() => {
    if (filteredArticles.length === 0) {
      return undefined
    }

    return filteredArticles.find((article) => article.id === selectedArticleId) || filteredArticles[0]
  }, [filteredArticles, selectedArticleId])

  const recentArticles = articles.slice(0, 3)

  const toggleFavorite = (articleId: string) => {
    setFavoriteIds((current) => current.includes(articleId) ? current.filter((id) => id !== articleId) : [articleId, ...current])
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge Center" description="Documentation, FAQ, guides, tutoriels, exemples et surface API du workspace." />

      <Section title="Recherche" description="Parcourez les contenus SRG par categorie ou mot-cle.">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un guide, une FAQ, un exemple..." className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm" />
          <select value={category} onChange={(event) => setCategory(event.target.value as 'all' | KnowledgeCategory)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
            <option value="all">Toutes les categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Section title="Catalogue" description="Articles disponibles dans le knowledge center.">
          <div className="space-y-3 text-sm">
            {filteredArticles.length === 0 ? (
              <EmptyState
                eyebrow="Knowledge Center"
                illustration={<span aria-hidden>⌕</span>}
                title="Aucune connaissance disponible"
                description="Aucun article ne correspond à la recherche ou à la catégorie actuelle."
                action={<button type="button" onClick={() => { setSearch(''); setCategory('all') }} className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 text-sm font-semibold text-white">Réinitialiser</button>}
              />
            ) : null}
            {filteredArticles.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => setSelectedArticleId(article.id)}
                className={`w-full rounded-[2rem] border p-4 text-left shadow-[0_18px_34px_rgba(30,90,72,0.08)] ${selectedArticle && selectedArticle.id === article.id ? 'border-[var(--lagoon)] bg-[var(--surface)]' : 'border-[var(--line)] bg-[var(--surface-strong)]'}`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">{article.category}</p>
                <p className="mt-2 font-semibold text-[var(--sea-ink)]">{article.title}</p>
                <p className="mt-2 text-[var(--sea-ink-soft)]">{article.summary}</p>
                <p className="mt-3 text-xs text-[var(--sea-ink-soft)]">{favoriteIds.includes(article.id) ? 'Favori' : 'Standard'}</p>
              </button>
            ))}
          </div>
        </Section>

        <Section title={selectedArticle ? selectedArticle.title : 'Lecture'} description="Contenu detaille selectionne.">
          {selectedArticle ? (
            <article className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
              <div className="flex flex-wrap gap-2">
                {selectedArticle.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs text-[var(--sea-ink-soft)]">{tag}</span>
                ))}
              </div>
              <p className="mt-4 text-sm text-[var(--sea-ink-soft)]">Audience: {selectedArticle.audience} • Updated: {selectedArticle.updatedAt}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => toggleFavorite(selectedArticle.id)} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">
                  {favoriteIds.includes(selectedArticle.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                </button>
              </div>
              <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-[var(--sea-ink)]">{selectedArticle.body}</p>
            </article>
          ) : (
            <EmptyState eyebrow="Knowledge Center" illustration={<span aria-hidden>□</span>} title="Aucun article correspondant" description="Sélectionnez un autre filtre ou ouvrez un article récent depuis la colonne latérale." />
          )}
        </Section>
      </div>

      <Section title="Derniers articles" description="Accès rapide aux contenus récemment mis à jour.">
        <div className="grid gap-4 md:grid-cols-3">
          {recentArticles.map((article) => (
            <button key={article.id} type="button" onClick={() => setSelectedArticleId(article.id)} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 text-left shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">{article.updatedAt}</p>
              <p className="mt-2 font-semibold text-[var(--sea-ink)]">{article.title}</p>
              <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">{article.summary}</p>
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}
