import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Button from '#/app/components/ui/Button'
import PageHeader from '#/app/components/PageHeader'
import SearchBar from '#/app/components/SearchBar'
import Section from '#/app/components/Section'
import { Tabs } from '#/app/components/ui/Tabs'
import { DashboardService } from '#/app/services/DashboardService'
import { navItems } from '#/app/navigation/navConfig'

type HomeModuleCategory = 'all' | 'intelligence' | 'operations' | 'platform'

type HomeModuleCard = {
  id: string
  title: string
  description: string
  path: string
  icon: string
  category: HomeModuleCategory
  accent: string
}

const HOME_MODULES: HomeModuleCard[] = [
  { id: 'dashboard', title: 'Dashboard', description: 'Command center for activity, health and KPI steering.', path: '/dashboard', icon: '📊', category: 'platform', accent: 'from-[rgba(79,184,178,0.22)] to-[rgba(47,106,74,0.12)]' },
  { id: 'knowledge-intelligence', title: 'Knowledge Intelligence', description: 'Document reasoning, semantic search, graph and comparisons.', path: '/knowledge-intelligence', icon: '🧩', category: 'intelligence', accent: 'from-[rgba(79,184,178,0.18)] to-[rgba(23,58,64,0.08)]' },
  { id: 'strategic-advisor', title: 'Strategic Advisor', description: 'Priority planning, simulations, scenarios and action orchestration.', path: '/strategic-advisor', icon: '🗺️', category: 'intelligence', accent: 'from-[rgba(47,106,74,0.18)] to-[rgba(79,184,178,0.08)]' },
  { id: 'workflow-automation', title: 'Workflow Automation', description: 'Design, simulate and monitor enterprise workflows.', path: '/workflow-automation', icon: '🧭', category: 'operations', accent: 'from-[rgba(79,184,178,0.16)] to-[rgba(47,106,74,0.1)]' },
  { id: 'finance', title: 'Finance', description: 'Accounting, treasury, budgets and management control.', path: '/finance', icon: '💼', category: 'operations', accent: 'from-[rgba(47,106,74,0.16)] to-[rgba(79,184,178,0.08)]' },
  { id: 'human-resources', title: 'RH', description: 'Workforce, payroll, attendance, leaves and recruitment.', path: '/human-resources', icon: '👥', category: 'operations', accent: 'from-[rgba(79,184,178,0.16)] to-[rgba(23,58,64,0.08)]' },
  { id: 'maintenance', title: 'Maintenance', description: 'Assets, interventions, technicians, spare parts and CMMS.', path: '/maintenance', icon: '🛠️', category: 'operations', accent: 'from-[rgba(47,106,74,0.16)] to-[rgba(79,184,178,0.08)]' },
  { id: 'procurement-inventory', title: 'Procurement', description: 'Purchasing, tenders, suppliers, stock and logistics.', path: '/procurement-inventory', icon: '📦', category: 'operations', accent: 'from-[rgba(79,184,178,0.14)] to-[rgba(47,106,74,0.1)]' },
  { id: 'project-execution', title: 'Projects', description: 'Industrial execution, budget, planning and delivery.', path: '/project-execution', icon: '🏗️', category: 'operations', accent: 'from-[rgba(47,106,74,0.14)] to-[rgba(79,184,178,0.08)]' },
  { id: 'chat', title: 'CRM', description: 'Conversation workspace, sessions and assistant support.', path: '/chat', icon: '💬', category: 'platform', accent: 'from-[rgba(79,184,178,0.16)] to-[rgba(47,106,74,0.08)]' },
  { id: 'enterprise-insights', title: 'Enterprise Insights', description: 'Executive analytics, recommendations, risks and opportunities.', path: '/enterprise-insights', icon: '🧠', category: 'intelligence', accent: 'from-[rgba(23,58,64,0.12)] to-[rgba(79,184,178,0.1)]' },
]

const WHY_SRG = [
  'Gestion documentaire unifiée',
  'Workflows interconnectés',
  'Knowledge et recherche intelligente',
  'IA pour la décision assistée',
  'Finance et contrôle de gestion',
  'Maintenance et actifs industriels',
  'RH et pilotage workforce',
  'Projets, achats et logistique',
  'CRM conversationnel',
]

const AI_FEATURES = [
  {
    title: 'Knowledge Intelligence',
    description: 'Explorer, comparer et retrouver les documents liés aux projets, fournisseurs et équipements.',
    path: '/knowledge-intelligence',
  },
  {
    title: 'Strategic Advisor',
    description: 'Planifier, simuler et arbitrer avec une vue consolidée des impacts.',
    path: '/strategic-advisor',
  },
  {
    title: 'Recherche intelligente',
    description: 'Accéder aux contenus, historiques et modules à partir d’une intention métier.',
    path: '/history',
  },
  {
    title: 'Archives',
    description: 'Relier les documents, décisions et exécutions déjà produits dans l’espace SRG.',
    path: '/knowledge-center',
  },
  {
    title: 'Décision assistée',
    description: 'Voir les risques, opportunités, suggestions et signaux d’alerte au même endroit.',
    path: '/enterprise-insights',
  },
]

const WORKFLOW_STEPS = ['Créer', 'Analyser', 'Valider', 'Suivre', 'Archiver']

const TESTIMONIALS = [
  {
    quote: 'La navigation entre analyse et action devient immédiate.',
    author: 'Directeur des opérations',
    role: 'Placeholder testimonial',
  },
  {
    quote: 'Nous gardons le contexte métier sans reconstituer les parcours.',
    author: 'Responsable transformation',
    role: 'Placeholder testimonial',
  },
  {
    quote: 'La vitrine donne enfin une lecture claire des modules SRG.',
    author: 'Sponsor enterprise',
    role: 'Placeholder testimonial',
  },
]

const FOOTER_GROUPS = [
  {
    title: 'Navigation',
    links: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Enterprise Insights', to: '/enterprise-insights' },
      { label: 'Strategic Advisor', to: '/strategic-advisor' },
      { label: 'Knowledge Intelligence', to: '/knowledge-intelligence' },
      { label: 'Workflow Automation', to: '/workflow-automation' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'History', to: '/history' },
      { label: 'Observability', to: '/observability' },
      { label: 'Administration', to: '/administration' },
      { label: 'Profile', to: '/profile' },
      { label: 'Authentication', to: '/auth' },
    ],
  },
  {
    title: 'Documentation',
    links: [
      { label: 'Knowledge Center', to: '/knowledge-center' },
      { label: 'Prompt Studio', to: '/prompt-studio' },
      { label: 'Projects', to: '/projects' },
      { label: 'Finance', to: '/finance' },
      { label: 'CRM', to: '/chat' },
    ],
  },
]

const CATEGORY_OPTIONS: Array<{ key: HomeModuleCategory; label: string }> = [
  { key: 'all', label: 'Tout' },
  { key: 'platform', label: 'Plateforme' },
  { key: 'intelligence', label: 'IA & Knowledge' },
  { key: 'operations', label: 'Operations' },
]

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const navigate = useNavigate()
  const metrics = DashboardService.getMetrics()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<HomeModuleCategory>('all')

  const featuredModules = useMemo(() => {
    const search = query.trim().toLowerCase()

    return HOME_MODULES.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false
      if (!search) return true
      return `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(search)
    })
  }, [activeCategory, query])

  const stats = [
    { label: 'KPI visibles', value: metrics.projects + metrics.generations + metrics.prompts + metrics.providers },
    { label: 'Modules', value: HOME_MODULES.length },
    { label: 'Workspaces', value: navItems.length },
    { label: 'Connecteurs préparés', value: 4 },
  ]

  return (
    <main className="page-wrap px-4 pb-10 pt-8 sm:pt-12">
      <section className="island-shell relative overflow-hidden rounded-[2.25rem] px-6 py-10 shadow-[var(--srg-shadow-md)] sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.36),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.22),transparent_66%)]" />
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <p className="island-kicker">Enterprise home experience</p>
            <div className="space-y-4">
              <h1 className="display-title max-w-3xl text-4xl font-bold leading-[1.02] tracking-tight text-[var(--srg-text-title)] sm:text-6xl">
                SRG, la vitrine enterprise pour piloter l’exécution, la connaissance et la décision.
              </h1>
              <p className="max-w-2xl text-base text-[var(--srg-text-muted)] sm:text-lg">
                Une page d’accueil pensée comme un point d’entrée produit: accéder aux modules, aux espaces d’intelligence et aux parcours métier sans perdre le contexte.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="lg" onClick={() => navigate({ to: '/dashboard' })}>
                Ouvrir le Dashboard
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate({ to: '/enterprise-insights' })}>
                Découvrir Enterprise Insights
              </Button>
              <Button variant="ghost" size="lg" onClick={() => navigate({ to: '/knowledge-intelligence' })}>
                Explorer Knowledge Intelligence
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-[var(--srg-text-muted)]">
              <span className="demo-pill">Design tokens</span>
              <span className="demo-pill">Responsive</span>
              <span className="demo-pill">Accessible</span>
              <span className="demo-pill">Enterprise ready</span>
            </div>
          </div>

          <div className="island-shell relative overflow-hidden rounded-[2rem] p-5 sm:p-6">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(79,184,178,0.12),transparent_42%,rgba(47,106,74,0.1))]" />
            <div className="relative grid gap-4">
              <div className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-5 shadow-[var(--srg-shadow-sm)]">
                <p className="island-kicker">Live snapshot</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--srg-text-title)]">{metrics.projects} projets actifs</p>
                <p className="mt-2 text-sm text-[var(--srg-text-muted)]">{metrics.generations} générations, {metrics.providers} providers, {metrics.successRate} de succès.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 shadow-[var(--srg-shadow-sm)]">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Knowledge</p>
                  <p className="mt-2 text-xl font-semibold text-[var(--srg-text-title)]">Recherche intelligente</p>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 shadow-[var(--srg-shadow-sm)]">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Decision</p>
                  <p className="mt-2 text-xl font-semibold text-[var(--srg-text-title)]">Arbitrage assisté</p>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4 shadow-[var(--srg-shadow-sm)]">
                <p className="text-sm font-semibold text-[var(--srg-text-title)]">Parcours recommandé</p>
                <p className="mt-1 text-sm text-[var(--srg-text-muted)]">Dashboard → Enterprise Insights → Strategic Advisor → Knowledge Intelligence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageHeader title="Enterprise Home" description="Une porte d’entrée claire vers les espaces SRG, leurs modules et leurs parcours d’intelligence." />

      <Section title="Pourquoi SRG ?" description="Une plateforme unique pour passer du document à l’action.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {WHY_SRG.map((item, index) => (
            <article key={item} className="island-shell feature-card rise-in rounded-[1.75rem] p-5" style={{ animationDelay: `${index * 70}ms` }}>
              <p className="text-sm font-semibold text-[var(--srg-text-title)]">{item}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Les modules" description="Accès direct aux workspaces enterprise existants.">
        <div className="space-y-4">
          <SearchBar
            value={query}
            onSearch={setQuery}
            onValueChange={setQuery}
            placeholder="Rechercher un module ou une capability"
            instant
            persistKey="home-modules"
          />
          <Tabs
            items={CATEGORY_OPTIONS}
            active={activeCategory}
            onChange={(key: string) => setActiveCategory(key as HomeModuleCategory)}
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredModules.map((module, index) => (
              <article
                key={module.id}
                className={`island-shell rise-in rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)] transition hover:-translate-y-1 hover:border-[var(--srg-color-primary-400)]`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className={`rounded-[1.25rem] bg-gradient-to-br ${module.accent} p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-3xl">{module.icon}</p>
                      <h3 className="mt-3 text-lg font-semibold text-[var(--srg-text-title)]">{module.title}</h3>
                    </div>
                    <span className="rounded-full border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--srg-text-muted)]">
                      {module.category}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-[var(--srg-text-muted)]">{module.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-[var(--srg-text-muted)]">{module.path}</p>
                  <Link
                    to={module.path}
                    className="rounded-2xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-[var(--srg-color-primary-600)]"
                  >
                    Ouvrir
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Fonctionnalités IA" description="Intelligence documentaire et décisionnelle déjà disponible dans la plateforme.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {AI_FEATURES.map((feature) => (
            <article key={feature.title} className="island-shell feature-card rounded-[1.75rem] p-5">
              <p className="text-sm font-semibold text-[var(--srg-text-title)]">{feature.title}</p>
              <p className="mt-2 text-sm text-[var(--srg-text-muted)]">{feature.description}</p>
              <Link to={feature.path} className="mt-4 inline-flex text-sm font-semibold no-underline">
                Continuer vers
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Workflows" description="Un parcours simple pour matérialiser le cycle Enterprise.">
        <div className="grid gap-4 md:grid-cols-5">
          {WORKFLOW_STEPS.map((step, index) => (
            <div key={step} className="relative rounded-[1.5rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">0{index + 1}</p>
              <p className="mt-3 text-lg font-semibold text-[var(--srg-text-title)]">{step}</p>
              <p className="mt-2 text-sm text-[var(--srg-text-muted)]">
                {index === 0 ? 'Formaliser le besoin.' : index === 1 ? 'Explorer les signaux utiles.' : index === 2 ? 'Faire converger les arbitrages.' : index === 3 ? 'Suivre les progrès visibles.' : 'Conserver la mémoire des décisions.'}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Statistiques" description="Des repères rapides pour situer la plateforme.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item, index) => (
            <article
              key={item.label}
              className="island-shell rise-in rounded-[1.75rem] p-5 shadow-[var(--srg-shadow-md)]"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--srg-color-primary-500)]">{item.label}</p>
              <p className="mt-3 text-4xl font-semibold text-[var(--srg-text-title)]">{item.value}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Témoignages" description="Structure placeholder prête pour la validation produit finale.">
        <div className="grid gap-4 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <article key={testimonial.author} className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
              <p className="text-sm text-[var(--srg-text-muted)]">“{testimonial.quote}”</p>
              <div className="mt-4">
                <p className="font-semibold text-[var(--srg-text-title)]">{testimonial.author}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-text-muted)]">{testimonial.role}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <footer className="site-footer mt-8 rounded-[2rem] px-6 py-8 shadow-[var(--srg-shadow-md)]">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="island-kicker mb-3">Footer Enterprise</p>
            <h2 className="display-title text-3xl font-semibold text-[var(--srg-text-title)]">Navigation, support, documentation et version.</h2>
            <p className="mt-3 max-w-2xl text-sm text-[var(--srg-text-muted)]">
              La Home sert de vitrine d’entrée vers l’ensemble des espaces SRG, avec un langage visuel cohérent et une lecture immédiate des parcours clés.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{group.title}</p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--srg-text-muted)]">
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="text-[var(--srg-text-muted)] no-underline hover:text-[var(--srg-text-title)]">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--srg-border)] pt-5 text-xs text-[var(--srg-text-muted)]">
          <span>SRG Studio Enterprise Home</span>
          <span>Version showcase 0.47 • UI/UX readiness</span>
        </div>
      </footer>
    </main>
  )
}
