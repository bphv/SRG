import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import PageHeader from '#/app/components/PageHeader'
import Section from '#/app/components/Section'
import { KnowledgeCenterService } from '#/app/services/KnowledgeCenterService'
import type { KnowledgeCategory } from '#/app/services/KnowledgeCenterService'

export const Route = createFileRoute('/knowledge-center')({
  component: KnowledgeCenterPage,
})

function KnowledgeCenterPage() {
  const articles = useMemo(() => KnowledgeCenterService.list(), [])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | KnowledgeCategory>('all')
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(articles[0]?.id ?? null)

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
              <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-[var(--sea-ink)]">{selectedArticle.body}</p>
            </article>
          ) : (
            <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 text-[var(--sea-ink-soft)]">Aucun article correspondant.</div>
          )}
        </Section>
      </div>
    </div>
  )
}
