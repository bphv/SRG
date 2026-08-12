import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import ConversationWorkspace from '#/app/components/conversation/ConversationWorkspace'
import { getOrderedCategories } from '#/app/navigation/categoryCatalog'
import type { CategoryIconKind } from '#/app/navigation/categoryCatalog'
import { useBusiness } from '#/app/hooks/useBusiness'
import { useConversationWorkspace } from '#/app/hooks/useConversationWorkspace'
import { ConversationWorkspaceService } from '#/app/services/ConversationWorkspaceService'

type ActivityLevel = 'active' | 'watch' | 'idle'

type WorkspaceNode = {
  id: string
  icon: string
  name: string
  description?: string
  to?: string
  categorySlug?: string
  subcategorySlug?: string
  activity?: ActivityLevel
}

type WorkspaceCategory = {
  id: string
  icon: string
  name: string
  description?: string
  expanded: boolean
  pinned: boolean
  hidden: boolean
  custom: boolean
  items: WorkspaceNode[]
}

const iconByCategoryKind: Record<CategoryIconKind, string> = {
  finance: '💰',
  hr: '👷',
  operations: '🏗️',
  knowledge: '📚',
  automation: '⚙️',
  governance: '🛡️',
}

const activityByOrder = (order: number): ActivityLevel => {
  if (order === 1) return 'active'
  if (order % 2 === 0) return 'watch'
  return 'idle'
}

const createOfficialSpaces = (): WorkspaceCategory[] => {
  const base: WorkspaceCategory = {
    id: 'favoris',
    icon: '⭐',
    name: 'Favoris',
    description: 'Conversations epinglees comme WhatsApp.',
    expanded: true,
    pinned: true,
    hidden: false,
    custom: false,
    items: [],
  }

  const categories = getOrderedCategories().map((category, index) => ({
    id: category.id,
    icon: iconByCategoryKind[category.icon],
    name: category.name,
    description: category.description,
    expanded: index === 0,
    pinned: false,
    hidden: false,
    custom: false,
    items: category.subcategories.map((subcategory) => ({
      id: `${category.id}-${subcategory.id}`,
      icon: '•',
      name: subcategory.label,
      description: `Conversation contextualisee ${category.name} / ${subcategory.label}.`,
      categorySlug: category.id,
      subcategorySlug: subcategory.id,
      to: subcategory.targetPath,
      activity: activityByOrder(subcategory.order),
    })),
  }))

  return [base, ...categories]
}

const activityClass: Record<ActivityLevel, string> = {
  active: 'bg-emerald-500',
  watch: 'bg-amber-400',
  idle: 'bg-slate-300',
}

export const Route = createFileRoute('/chat')({
  component: BusinessSpacesPage,
})

function BusinessSpacesPage() {
  const navigate = useNavigate()
  const business = useBusiness()
  const { allConversations, refresh } = useConversationWorkspace()

  const [categories, setCategories] = useState<WorkspaceCategory[]>(() => createOfficialSpaces())
  const [favoriteItems, setFavoriteItems] = useState<string[]>([])
  const [showConversation, setShowConversation] = useState(true)
  const [newCategory, setNewCategory] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState<string>('')
  const [draggedItem, setDraggedItem] = useState<{ categoryId: string; itemId: string } | null>(null)

  const flattenedItems = useMemo(
    () => categories.flatMap((category) => category.items.map((item) => ({ categoryId: category.id, categoryName: category.name, item }))),
    [categories],
  )

  const favoriteRows = useMemo(
    () => flattenedItems.filter(({ item }) => favoriteItems.includes(item.id)),
    [favoriteItems, flattenedItems],
  )

  const visibleCategories = useMemo(
    () => categories.filter((category) => !category.hidden && category.id !== 'favoris'),
    [categories],
  )

  const sortedCategories = useMemo(() => {
    const pinned = visibleCategories.filter((item) => item.pinned)
    const normal = visibleCategories.filter((item) => !item.pinned)
    return [...pinned, ...normal]
  }, [visibleCategories])

  const activityCount = useMemo(
    () => flattenedItems.filter(({ item }) => item.activity === 'active').length,
    [flattenedItems],
  )

  const toggleCategory = (categoryId: string) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId ? { ...category, expanded: !category.expanded } : category,
      ),
    )
  }

  const togglePinned = (categoryId: string) => {
    setCategories((current) =>
      current.map((category) => (category.id === categoryId ? { ...category, pinned: !category.pinned } : category)),
    )
  }

  const toggleHidden = (categoryId: string) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId && category.custom ? { ...category, hidden: !category.hidden } : category,
      ),
    )
  }

  const moveCategory = (categoryId: string, direction: 'up' | 'down') => {
    setCategories((current) => {
      const index = current.findIndex((item) => item.id === categoryId)
      if (index < 0) return current
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= current.length) return current
      const next = [...current]
      const [picked] = next.splice(index, 1)
      next.splice(targetIndex, 0, picked)
      return next
    })
  }

  const addCategory = () => {
    const trimmed = newCategory.trim()
    if (!trimmed) return

    const id = `custom-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    setCategories((current) => {
      if (current.some((item) => item.id === id)) return current
      return [
        ...current,
        {
          id,
          icon: '🧠',
          name: trimmed,
          description: 'Categorie personnalisee.',
          expanded: true,
          pinned: false,
          hidden: false,
          custom: true,
          items: [],
        },
      ]
    })
    setNewCategory('')
  }

  const addSubcategory = (categoryId: string) => {
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== categoryId || !category.custom) return category
        const nextCount = category.items.length + 1
        return {
          ...category,
          items: [
            ...category.items,
            {
              id: `${categoryId}-item-${nextCount}`,
              icon: '📌',
              name: `Sous-categorie ${nextCount}`,
              description: 'Conversation specialisee Ask SRG.',
              to: '/chat',
              activity: 'idle',
            },
          ],
        }
      }),
    )
  }

  const toggleFavoriteItem = (itemId: string) => {
    setFavoriteItems((current) =>
      current.includes(itemId) ? current.filter((entry) => entry !== itemId) : [itemId, ...current],
    )
  }

  const moveItemInsideCategory = (categoryId: string, sourceItemId: string, targetItemId: string) => {
    if (sourceItemId === targetItemId) return
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== categoryId) return category
        const sourceIndex = category.items.findIndex((item) => item.id === sourceItemId)
        const targetIndex = category.items.findIndex((item) => item.id === targetItemId)
        if (sourceIndex < 0 || targetIndex < 0) return category
        const nextItems = [...category.items]
        const [picked] = nextItems.splice(sourceIndex, 1)
        nextItems.splice(targetIndex, 0, picked)
        return { ...category, items: nextItems }
      }),
    )
  }

  const openSpecializedConversation = (categoryName: string, item: WorkspaceNode) => {
    setSelectedNodeId(item.id)
    const title = `${categoryName} · ${item.name}`
    const existing = allConversations.find((conversation) => conversation.title === title)

    if (existing) {
      ConversationWorkspaceService.setActiveConversation(existing.id)
    } else {
      ConversationWorkspaceService.createConversation({ title })
    }

    refresh()
    setShowConversation(true)

    if (item.categorySlug && item.subcategorySlug) {
      navigate({
        to: '/conversation/$categorySlug/$subcategorySlug',
        params: {
          categorySlug: item.categorySlug,
          subcategorySlug: item.subcategorySlug,
        },
      })
      return
    }

    if (item.to && item.to !== '/chat') {
      navigate({ to: item.to as never })
    }
  }

  const isAuthenticated = Boolean(business.currentSession)

  return (
    <main className="srg-space-page min-h-screen px-4 py-6 text-[var(--srg-text-title)] sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <section className="srg-space-header rounded-[2rem] border border-[#d9e5ff] bg-white/90 p-5 shadow-[0_20px_54px_rgba(21,68,186,0.14)] backdrop-blur-lg">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#2f5fd4]">🤖 Ask SRG</p>
              <h1 className="mt-2 text-2xl font-bold text-[#102243] sm:text-3xl">Espaces metiers</h1>
              <p className="mt-2 text-sm text-[#5d6f92]">
                Interface inspiree de WhatsApp: vos domaines d\'expertise remplacent les contacts, Ask SRG reste l\'interlocuteur central.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#d5e2ff] bg-[#f5f9ff] px-3 py-1 text-xs font-semibold text-[#24448f]">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Activites en cours: {activityCount}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-[#cad9ff] bg-white px-3 py-2 text-xs font-semibold text-[#1b3f8a]"
                onClick={() => setShowConversation((current) => !current)}
              >
                {showConversation ? 'Masquer conversation' : 'Afficher conversation'}
              </button>
              <Link to="/observability" className="rounded-xl bg-[#1f4fff] px-3 py-2 text-xs font-semibold text-white no-underline">
                Observability
              </Link>
              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#1f4fff] px-2 text-xs font-bold text-white" aria-label="Notifications">
                {activityCount}
              </span>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="mt-4 rounded-2xl border border-[#ffd89d] bg-[#fff9eb] p-3 text-sm text-[#745a21]">
              Connectez-vous pour activer une session persistante. Vous pouvez deja explorer les espaces et lancer des conversations specialisees.
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/auth" className="rounded-xl bg-[#1f4fff] px-3 py-2 text-xs font-semibold text-white no-underline">Se connecter</Link>
                <Link to="/auth" className="rounded-xl border border-[#c9d7f6] bg-white px-3 py-2 text-xs font-semibold text-[#1b3f8a] no-underline">Creer un compte</Link>
              </div>
            </div>
          ) : null}
        </section>

        <section className="srg-space-favorites rounded-[2rem] border border-[#d9e5ff] bg-white/92 p-5 shadow-[0_14px_40px_rgba(21,68,186,0.12)]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#2f5fd4]">⭐ Favoris</p>
              <p className="mt-1 text-sm text-[#607399]">Epingles rapides, comme les conversations prioritaires WhatsApp.</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {favoriteRows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#cfdbf8] bg-[#f8fbff] px-3 py-3 text-sm text-[#7584a5]">
                Aucun favori pour le moment. Epingler une sous-categorie pour la retrouver ici.
              </p>
            ) : (
              favoriteRows.map(({ categoryName, item }) => (
                <button
                  key={`fav-${item.id}`}
                  type="button"
                  onClick={() => openSpecializedConversation(categoryName, item)}
                  className="srg-space-row flex w-full items-center gap-3 rounded-xl border border-[#d8e4fb] bg-[#f9fbff] px-3 py-3 text-left"
                >
                  <span className="srg-space-icon">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#172d56]">{item.name}</p>
                    <p className="truncate text-xs text-[#6c7ea2]">{categoryName}</p>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full ${activityClass[item.activity ?? 'idle']}`} />
                </button>
              ))
            )}
          </div>
        </section>

        <section className="srg-space-list rounded-[2rem] border border-[#d9e5ff] bg-white/95 p-4 shadow-[0_16px_44px_rgba(21,68,186,0.12)] sm:p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="Nouvelle categorie personnalisee"
              className="min-w-[14rem] flex-1 rounded-xl border border-[#c7d7fb] bg-[#f8fbff] px-3 py-2 text-sm text-[#13254a] outline-none focus:border-[#2f5fd4]"
            />
            <button type="button" onClick={addCategory} className="rounded-xl bg-[#1f4fff] px-4 py-2 text-sm font-semibold text-white">
              Creer
            </button>
          </div>

          <div className="space-y-3">
            {sortedCategories.map((category) => (
              <article key={category.id} className="overflow-hidden rounded-2xl border border-[#d9e4fb] bg-[#fbfdff]">
                <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#c9d8fa] bg-white text-sm text-[#2a4f9f]"
                    aria-label={`Developper ou reduire ${category.name}`}
                  >
                    {category.expanded ? '▾' : '▸'}
                  </button>
                  <span className="srg-space-icon">{category.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#10284f]">{category.name}</p>
                    {category.description ? <p className="truncate text-xs text-[#6d80a5]">{category.description}</p> : null}
                  </div>
                  <button type="button" onClick={() => togglePinned(category.id)} className="rounded-lg border border-[#c8d6f6] bg-white px-2 py-1 text-xs text-[#2c4d97]">
                    {category.pinned ? 'Desepingler' : 'Epingler'}
                  </button>
                  <button type="button" onClick={() => moveCategory(category.id, 'up')} className="rounded-lg border border-[#c8d6f6] bg-white px-2 py-1 text-xs text-[#2c4d97]">↑</button>
                  <button type="button" onClick={() => moveCategory(category.id, 'down')} className="rounded-lg border border-[#c8d6f6] bg-white px-2 py-1 text-xs text-[#2c4d97]">↓</button>
                  {category.custom ? (
                    <>
                      <button type="button" onClick={() => addSubcategory(category.id)} className="rounded-lg border border-[#c8d6f6] bg-white px-2 py-1 text-xs text-[#2c4d97]">+ Sous-cat.</button>
                      <button type="button" onClick={() => toggleHidden(category.id)} className="rounded-lg border border-[#f4d7d7] bg-white px-2 py-1 text-xs text-[#8f3030]">
                        {category.hidden ? 'Restaurer' : 'Supprimer'}
                      </button>
                    </>
                  ) : null}
                </div>

                {category.expanded ? (
                  <div className="border-t border-[#e6eefc] bg-white/80 px-2 py-2 sm:px-3">
                    {category.items.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-[#cddaf7] bg-[#f8fbff] px-3 py-3 text-xs text-[#7385ab]">
                        Cette categorie est vide. Ajoutez des sous-categories personnalisees.
                      </p>
                    ) : (
                      <div className="overflow-x-auto pb-2">
                        <div className="flex min-w-max gap-2">
                        {category.items.map((item) => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(event) => {
                              setDraggedItem({ categoryId: category.id, itemId: item.id })
                              event.dataTransfer.effectAllowed = 'move'
                            }}
                            onDragOver={(event) => {
                              event.preventDefault()
                              event.dataTransfer.dropEffect = 'move'
                            }}
                            onDrop={(event) => {
                              event.preventDefault()
                              if (!draggedItem || draggedItem.categoryId !== category.id) return
                              moveItemInsideCategory(category.id, draggedItem.itemId, item.id)
                              setDraggedItem(null)
                            }}
                            onDragEnd={() => setDraggedItem(null)}
                            className={`srg-space-row flex w-[16.5rem] shrink-0 items-center gap-3 rounded-xl border px-3 py-2 ${selectedNodeId === item.id ? 'border-[#2f5fd4] bg-[#edf4ff]' : 'border-[#dce7fb] bg-[#f9fbff]'}`}
                          >
                            <button
                              type="button"
                              onClick={() => openSpecializedConversation(category.name, item)}
                              className="flex min-w-0 flex-1 items-center gap-3 text-left"
                            >
                              <span className="srg-space-icon">{item.icon}</span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#17305d]">{item.name}</p>
                                <p className="truncate text-xs text-[#7284a9]">{item.description ?? 'Conversation specialisee Ask SRG.'}</p>
                              </div>
                            </button>
                            <span className={`h-2.5 w-2.5 rounded-full ${activityClass[item.activity ?? 'idle']}`} aria-hidden />
                            <button
                              type="button"
                              onClick={() => toggleFavoriteItem(item.id)}
                              className="rounded-lg border border-[#cad8f8] bg-white px-2 py-1 text-xs text-[#2c4f9c]"
                            >
                              {favoriteItems.includes(item.id) ? '★' : '☆'}
                            </button>
                          </div>
                        ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        {showConversation ? (
          <section className="srg-space-conversation rounded-[2rem] border border-[#d9e5ff] bg-white/96 p-4 shadow-[0_16px_44px_rgba(21,68,186,0.12)] sm:p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#2f5fd4]">Conversation specialisee</p>
            <p className="mt-1 text-sm text-[#60739a]">
              Cliquer une sous-categorie ouvre automatiquement la conversation Ask SRG correspondante, puis redirige vers le bon espace metier si necessaire.
            </p>
            <div className="mt-4">
              <ConversationWorkspace />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
