import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import ConversationWorkspace from '#/app/components/conversation/ConversationWorkspace'
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

const OFFICIAL_SPACES: WorkspaceCategory[] = [
  {
    id: 'favoris',
    icon: '⭐',
    name: 'Favoris',
    description: 'Conversations epinglees comme WhatsApp.',
    expanded: true,
    pinned: true,
    hidden: false,
    custom: false,
    items: [],
  },
  {
    id: 'operations',
    icon: '🏗️',
    name: 'Operations',
    description: 'Execution, maintenance, essais, livrables et supply chain.',
    expanded: true,
    pinned: false,
    hidden: false,
    custom: false,
    items: [
      { id: 'maintenance', icon: '🔧', name: 'Maintenance', description: 'CMMS et interventions.', to: '/maintenance', activity: 'active' },
      { id: 'commissioning', icon: '⚙️', name: 'Commissioning', description: 'Mise en route et controle.', to: '/project-execution', activity: 'watch' },
      { id: 'essais', icon: '🧪', name: 'Essais', description: 'Planification et validation.', to: '/project-execution', activity: 'idle' },
      { id: 'mise-en-service', icon: '🏭', name: 'Mise en service', description: 'Go-live industriel.', to: '/project-execution', activity: 'watch' },
      { id: 'rapports', icon: '📑', name: 'Rapports', description: 'Generer et centraliser.', to: '/generate', activity: 'watch' },
      { id: 'devis', icon: '💵', name: 'Devis', description: 'Chiffrage client.', to: '/devis', activity: 'active' },
      { id: 'planning', icon: '📅', name: 'Planning', description: 'Delais et jalons.', to: '/projects', activity: 'watch' },
      { id: 'stocks', icon: '📦', name: 'Stocks', description: 'Inventaire et alertes.', to: '/procurement-inventory', activity: 'active' },
      { id: 'logistique', icon: '🚚', name: 'Logistique', description: 'Flux et expeditions.', to: '/procurement-inventory', activity: 'watch' },
      { id: 'fournisseurs', icon: '🤝', name: 'Fournisseurs', description: 'Pilotage partenaire.', to: '/finance-suppliers', activity: 'idle' },
      { id: 'clients-op', icon: '👥', name: 'Clients', description: 'Execution cote client.', to: '/finance-customers', activity: 'watch' },
    ],
  },
  {
    id: 'hr',
    icon: '👷',
    name: 'Ressources Humaines',
    description: 'Employes, paie, conges, competences et recrutements.',
    expanded: false,
    pinned: false,
    hidden: false,
    custom: false,
    items: [
      { id: 'employees', icon: '👤', name: 'Employes', to: '/employees', activity: 'watch' },
      { id: 'attendance', icon: '⏱️', name: 'Pointage', to: '/attendance', activity: 'active' },
      { id: 'codes-affaires', icon: '🏷️', name: 'Codes d\'affaires', to: '/organization', activity: 'idle' },
      { id: 'leaves', icon: '📅', name: 'Conges', to: '/leaves', activity: 'watch' },
      { id: 'payroll', icon: '💰', name: 'Paie', to: '/payroll', activity: 'active' },
      { id: 'trainings', icon: '🎓', name: 'Formations', to: '/trainings', activity: 'watch' },
      { id: 'evaluations', icon: '📈', name: 'Evaluations', to: '/evaluations', activity: 'idle' },
    ],
  },
  {
    id: 'finance',
    icon: '💰',
    name: 'Finance',
    description: 'Comptabilite, facturation, paiements, budget et tresorerie.',
    expanded: false,
    pinned: false,
    hidden: false,
    custom: false,
    items: [
      { id: 'accounting', icon: '📒', name: 'Comptabilite', to: '/accounting', activity: 'active' },
      { id: 'facturation', icon: '🧾', name: 'Facturation', to: '/finance', activity: 'watch' },
      { id: 'payments', icon: '💳', name: 'Paiements', to: '/treasury', activity: 'watch' },
      { id: 'budgets', icon: '📊', name: 'Budgets', to: '/finance-budgets', activity: 'active' },
      { id: 'tresorerie', icon: '💹', name: 'Tresorerie', to: '/treasury', activity: 'active' },
    ],
  },
  {
    id: 'meetings',
    icon: '👥',
    name: 'Reunions',
    description: 'Preparation, compte rendu, actions et decisions.',
    expanded: false,
    pinned: false,
    hidden: false,
    custom: false,
    items: [
      { id: 'reunion-ia', icon: '🎙️', name: 'Reunion IA', to: '/chat', activity: 'watch' },
      { id: 'comptes-rendus', icon: '📝', name: 'Comptes rendus', to: '/reviews', activity: 'watch' },
      { id: 'plans-action', icon: '✅', name: 'Plans d\'action', to: '/workflow-automation', activity: 'active' },
      { id: 'decisions', icon: '📌', name: 'Decisions', to: '/enterprise-insights', activity: 'active' },
    ],
  },
  {
    id: 'documents',
    icon: '📄',
    name: 'Documents',
    description: 'Rapports, contrats, procedures et courriers.',
    expanded: false,
    pinned: false,
    hidden: false,
    custom: false,
    items: [
      { id: 'docs-rapports', icon: '📁', name: 'Rapports', to: '/knowledge-center', activity: 'watch' },
      { id: 'contrats', icon: '📃', name: 'Contrats', to: '/prompt-templates', activity: 'watch' },
      { id: 'procedures', icon: '📚', name: 'Procedures', to: '/knowledge-center', activity: 'idle' },
      { id: 'courriers', icon: '✉️', name: 'Courriers', to: '/history', activity: 'idle' },
    ],
  },
  {
    id: 'knowledge',
    icon: '📚',
    name: 'Knowledge Center',
    description: 'Normes, guides, documentation, FAQ et historique.',
    expanded: false,
    pinned: false,
    hidden: false,
    custom: false,
    items: [
      { id: 'normes', icon: '📖', name: 'Normes', to: '/knowledge-center', activity: 'watch' },
      { id: 'guides', icon: '📘', name: 'Guides', to: '/knowledge-center', activity: 'watch' },
      { id: 'documentation', icon: '📗', name: 'Documentation', to: '/knowledge-intelligence', activity: 'active' },
      { id: 'faq', icon: '❓', name: 'FAQ', to: '/about', activity: 'idle' },
      { id: 'historique', icon: '🗄️', name: 'Historique', to: '/history', activity: 'active' },
    ],
  },
  {
    id: 'analyses',
    icon: '📊',
    name: 'Analyses',
    description: 'KPI, insights, previsions et tableaux de bord.',
    expanded: false,
    pinned: false,
    hidden: false,
    custom: false,
    items: [
      { id: 'kpi', icon: '📈', name: 'KPI', to: '/dashboard', activity: 'active' },
      { id: 'enterprise-insights', icon: '🧠', name: 'Enterprise Insights', to: '/enterprise-insights', activity: 'active' },
      { id: 'previsions', icon: '📉', name: 'Previsions', to: '/strategic-advisor', activity: 'watch' },
      { id: 'tableaux-bord', icon: '📋', name: 'Tableaux de bord', to: '/observability', activity: 'watch' },
    ],
  },
  {
    id: 'automation',
    icon: '⚙️',
    name: 'Automatisation',
    description: 'Agents IA, workflows, prompts et templates.',
    expanded: false,
    pinned: false,
    hidden: false,
    custom: false,
    items: [
      { id: 'agents-ia', icon: '🤖', name: 'Agents IA', to: '/agents', activity: 'active' },
      { id: 'workflows', icon: '🔄', name: 'Workflows', to: '/workflow-automation', activity: 'active' },
      { id: 'prompt-studio', icon: '🧩', name: 'Prompt Studio', to: '/prompt-studio', activity: 'watch' },
      { id: 'templates', icon: '📦', name: 'Templates', to: '/prompt-templates', activity: 'watch' },
    ],
  },
  {
    id: 'crm',
    icon: '🤝',
    name: 'CRM',
    description: 'Prospects, clients et contrats.',
    expanded: false,
    pinned: false,
    hidden: false,
    custom: false,
    items: [
      { id: 'prospects', icon: '👥', name: 'Prospects', to: '/chat', activity: 'watch' },
      { id: 'clients-crm', icon: '🤝', name: 'Clients', to: '/finance-customers', activity: 'watch' },
      { id: 'contracts-crm', icon: '📑', name: 'Contrats', to: '/hr-contracts', activity: 'idle' },
    ],
  },
  {
    id: 'admin',
    icon: '🛡️',
    name: 'Administration',
    description: 'Utilisateurs, roles, API et connecteurs.',
    expanded: false,
    pinned: false,
    hidden: false,
    custom: false,
    items: [
      { id: 'users', icon: '👤', name: 'Utilisateurs', to: '/administration', activity: 'watch' },
      { id: 'roles', icon: '🔑', name: 'Roles', to: '/administration', activity: 'watch' },
      { id: 'api', icon: '🔌', name: 'API', to: '/providers', activity: 'active' },
      { id: 'connecteurs', icon: '🌐', name: 'Connecteurs', to: '/settings', activity: 'watch' },
    ],
  },
  {
    id: 'pages',
    icon: '🌍',
    name: 'Pages',
    description: 'Contenus publics et institutionnels.',
    expanded: false,
    pinned: false,
    hidden: false,
    custom: false,
    items: [
      { id: 'notre-histoire', icon: '📖', name: 'Notre histoire', to: '/about', activity: 'idle' },
      { id: 'blog', icon: '📰', name: 'Blog', to: '/about', activity: 'idle' },
      { id: 'documentation-pages', icon: '📚', name: 'Documentation', to: '/knowledge-center', activity: 'watch' },
      { id: 'faq-pages', icon: '❓', name: 'FAQ', to: '/about', activity: 'idle' },
      { id: 'contact', icon: '📞', name: 'Contact', to: '/about', activity: 'idle' },
    ],
  },
  {
    id: 'settings',
    icon: '⚙️',
    name: 'Parametres',
    description: 'Apparence, entreprise, langues, notifications et personnalisation.',
    expanded: false,
    pinned: false,
    hidden: false,
    custom: false,
    items: [
      { id: 'appearance', icon: '🎨', name: 'Apparence', to: '/settings', activity: 'watch' },
      { id: 'enterprise', icon: '🏢', name: 'Entreprise', to: '/settings', activity: 'watch' },
      { id: 'languages', icon: '🌍', name: 'Langues', to: '/settings', activity: 'watch' },
      { id: 'notifications', icon: '🔔', name: 'Notifications', to: '/settings', activity: 'active' },
      { id: 'personnalisation', icon: '🧩', name: 'Personnalisation', to: '/settings', activity: 'watch' },
    ],
  },
]

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

  const [categories, setCategories] = useState<WorkspaceCategory[]>(OFFICIAL_SPACES)
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
