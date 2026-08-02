import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import Button from '#/app/components/ui/Button'
import NotificationCenter from '#/app/components/NotificationCenter'
import PageHeader from '#/app/components/PageHeader'
import SearchBar from '#/app/components/SearchBar'
import Section from '#/app/components/Section'
import DataTable from '#/app/components/ui/DataTable'
import type { DataTableColumn } from '#/app/components/ui/DataTable'
import { Tabs } from '#/app/components/ui/Tabs'
import { Field, FieldGroup, FormSection, FormToolbar, SmartInputField, ValidationMessage } from '#/app/components/ui/FormPrimitives'
import { useAskSrgRuntimeContext } from '#/app/contexts/AskSrgRuntimeContext'
import { useNotifications } from '#/app/hooks/useNotifications'
import { DashboardService } from '#/app/services/DashboardService'
import { notificationService } from '#/app/services/NotificationService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'
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

type AskMemoryRow = {
  item: string
  value: string
  note: string
}

type AskDocumentSourceRow = {
  document: string
  confidence: string
  date: string
  author: string
  version: string
}

type AskReadinessRow = {
  item: string
  value: string
  note: string
}

type AskSkillCard = {
  category: string
  capability: string
  note: string
}

type AskContextSuggestionRow = {
  source: string
  detail: string
  suggestion: string
  status: string
}

type AskRuntimeSessionRow = {
  item: string
  value: string
  note: string
}

type AskSrgSkillRegistryRow = {
  id: string
  name: string
  category: string
  description: string
  icon: string
  status: string
  supportedWorkspaces: string
  suggestedPrompts: string
}

type AskSrgSkillSimpleRow = {
  skillId: string
  name: string
  category: string
  status: string
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

const ASK_SRG_SUGGESTIONS = [
  'Quels sont les contrats Razel ?',
  'Combien de moteurs ABB avons-nous reçus en 2022 ?',
  'Résume ce rapport.',
  'Compare ces deux devis.',
  'Quels projets sont en retard ?',
  'Quelles interventions restent ouvertes ?',
]

const ASK_LANGUAGE_OPTIONS = ['Auto Detection', 'Français', 'English', 'Español', 'Deutsch', 'Italiano', 'Português', 'العربية', '中文', '日本語']

const ASK_SRG_SKILL_CATEGORIES = ['Documents', 'Maintenance', 'Finance', 'RH', 'Achats', 'Projets', 'CRM', 'Qualité', 'Sécurité', 'Workflows', 'Rapports', 'Décisions']

const ASK_SRG_ACTION_EXAMPLES = [
  'Retrouver un document',
  'Comparer deux contrats',
  'Résumer un rapport',
  'Créer un devis',
  'Préparer une offre',
  'Analyser les dépenses',
  'Lister les interventions',
  'Comparer deux années',
  'Créer un workflow',
  'Créer un rapport',
  'Créer une tâche',
  'Exporter un tableau',
]

const ASK_SRG_QUICK_COMMANDS = ['/rapport', '/devis', '/maintenance', '/finance', '/rh', '/projet', '/archive', '/workflow', '/export', '/search']

function getStoredAskString(key: string, fallback: string) {
  const isBrowser = typeof window !== 'undefined' && typeof window.location !== 'undefined' && typeof window.location.search === 'string'
  if (!isBrowser) {
    return fallback
  }

  const record = WorkspacePreferencesService.getPreferences().filters['home-ask-srg'] ?? {}
  const value = record[key]
  return typeof value === 'string' ? value : fallback
}

const CATEGORY_OPTIONS: Array<{ key: HomeModuleCategory; label: string }> = [
  { key: 'all', label: 'Tout' },
  { key: 'platform', label: 'Plateforme' },
  { key: 'intelligence', label: 'IA & Knowledge' },
  { key: 'operations', label: 'Operations' },
]

const ENTERPRISE_READINESS_ITEMS = [
  { label: 'API readiness', value: 'Prepared', note: 'Endpoint, tenant ID, client ID and webhook placeholders are now modeled in Settings.' },
  { label: 'Tenant preview', value: 'Visible', note: 'Active enterprise, isolated space, modules and archives are staged in UI.' },
  { label: 'Security overview', value: 'Placeholder', note: 'API keys, OAuth, JWT, permissions and audit logs are reserved.' },
  { label: 'Connectors', value: '23 coming soon', note: 'ERP, CRM, cloud storage, BI, communication and industrial systems are prepared in the hub.' },
]

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const notifications = useNotifications()
  const askSrgRuntime = useAskSrgRuntimeContext()
  const navigate = useNavigate()
  const metrics = DashboardService.getMetrics()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<HomeModuleCategory>('all')
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const [askSearch, setAskSearch] = useState(() => getStoredAskString('search', ''))
  const [askInput, setAskInput] = useState(() => getStoredAskString('input', ''))
  const [responseLanguage, setResponseLanguage] = useState(() => askSrgRuntime.session.language || getStoredAskString('responseLanguage', 'Français'))
  const [documentsLanguage, setDocumentsLanguage] = useState(() => getStoredAskString('documentsLanguage', 'Auto Detection'))
  const [translationMode, setTranslationMode] = useState(() => getStoredAskString('translationMode', 'Placeholder'))
  const [selectedSuggestion, setSelectedSuggestion] = useState('')
  const [activeSkillCategory, setActiveSkillCategory] = useState(() => getStoredAskString('activeSkillCategory', 'Documents'))
  const [consultedModule, setConsultedModule] = useState(() => getStoredAskString('consultedModule', 'Dashboard'))
  const [skillsSearch, setSkillsSearch] = useState(() => getStoredAskString('skillsSearch', ''))

  useEffect(() => {
    WorkspacePreferencesService.setFilters('home-ask-srg', {
      search: askSearch,
      input: askInput,
      responseLanguage,
      documentsLanguage,
      translationMode,
      activeSkillCategory,
      consultedModule,
      skillsSearch,
    })
  }, [activeSkillCategory, askInput, askSearch, consultedModule, documentsLanguage, responseLanguage, skillsSearch, translationMode])

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
    { label: 'Connecteurs préparés', value: 23 },
  ]

  const filteredAskSuggestions = useMemo(() => {
    const normalized = askSearch.trim().toLowerCase()
    if (!normalized) return ASK_SRG_SUGGESTIONS
    return ASK_SRG_SUGGESTIONS.filter((item) => item.toLowerCase().includes(normalized))
  }, [askSearch])

  const askMemoryRows = useMemo<AskMemoryRow[]>(() => {
    const preferences = WorkspacePreferencesService.getPreferences()
    const recentSearchesValue = preferences.recentSearches.slice(0, 4).join(' | ') || 'Placeholder'
    const favoritesValue = askSrgRuntime.session.favoriteCommands.join(' | ') || 'Placeholder'
    const recentDocumentsValue = askSrgRuntime.session.recentDocuments.join(' | ') || 'Placeholder'

    return [
      { item: 'Conversations', value: askSrgRuntime.session.conversationId, note: 'Conversation locale Ask SRG sans backend.' },
      { item: 'Documents consultés', value: recentDocumentsValue, note: 'Liste locale recentDocuments du runtime context.' },
      { item: 'Recherches récentes', value: recentSearchesValue, note: 'Réutilise WorkspacePreferencesService.' },
      { item: 'Favoris', value: favoritesValue, note: 'favoriteCommands locaux persistés dans WorkspacePreferencesService.' },
    ]
  }, [askSearch, askSrgRuntime.session.conversationId, askSrgRuntime.session.favoriteCommands, askSrgRuntime.session.recentDocuments])

  const askDocumentSourceRows = useMemo<AskDocumentSourceRow[]>(() => [
    { document: 'Contrat Razel 2022', confidence: 'Placeholder · 92%', date: '2026-08-02', author: 'Direction Achats', version: 'v3-placeholder' },
    { document: 'Rapport maintenance T4', confidence: 'Placeholder · 87%', date: '2026-08-02', author: 'Maintenance Lead', version: 'v2-placeholder' },
    { document: 'Devis ABB moteurs', confidence: 'Placeholder · 90%', date: '2026-08-02', author: 'Procurement Team', version: 'v5-placeholder' },
    { document: 'Suivi projets retard', confidence: 'Placeholder · 84%', date: '2026-08-02', author: 'PMO Office', version: 'v1-placeholder' },
  ], [])

  const askSkillCards = useMemo<AskSkillCard[]>(() => ASK_SRG_SKILL_CATEGORIES.map((category, index) => ({
    category,
    capability: ASK_SRG_ACTION_EXAMPLES[index % ASK_SRG_ACTION_EXAMPLES.length],
    note: 'Placeholder UI/UX - aucune exécution métier réelle.',
  })), [])

  const filteredAskSkillCards = useMemo(() => {
    const normalized = askSearch.trim().toLowerCase()
    return askSkillCards.filter((card) => {
      if (activeSkillCategory !== 'all' && card.category !== activeSkillCategory) return false
      if (!normalized) return true
      return `${card.category} ${card.capability} ${card.note}`.toLowerCase().includes(normalized)
    })
  }, [activeSkillCategory, askSearch, askSkillCards])

  const languageRows = useMemo<AskReadinessRow[]>(() => [
    { item: 'Langue détectée automatiquement', value: 'Placeholder', note: 'Détection prévue sans moteur IA actif.' },
    { item: 'Langue de réponse', value: responseLanguage, note: 'Configuration visuelle uniquement.' },
    { item: 'Langue des documents', value: documentsLanguage, note: 'Aucun parseur documentaire en runtime.' },
    { item: 'Mode traduction', value: translationMode, note: 'Préparation UI sans service de traduction.' },
  ], [documentsLanguage, responseLanguage, translationMode])

  const voiceRows = useMemo<AskReadinessRow[]>(() => [
    { item: 'Microphone', value: askSrgRuntime.session.voiceEnabled ? 'Placeholder · Enabled' : 'Placeholder · Disabled', note: 'voiceEnabled local sans moteur STT.' },
    { item: 'Reconnaissance vocale', value: 'Placeholder', note: 'Aucun moteur STT actif.' },
    { item: 'Synthèse vocale', value: 'Placeholder', note: 'Aucun moteur TTS actif.' },
    { item: 'Statut', value: 'Preparation Mode', note: 'Stack vocale réservée pour intégration future.' },
  ], [askSrgRuntime.session.voiceEnabled])

  const contextRows = useMemo<AskReadinessRow[]>(() => [
    { item: 'Entreprise active', value: 'SRG Industries Holding', note: 'Contexte enterprise affiché sans isolation runtime.' },
    { item: 'Modules consultés', value: 'Dashboard | Knowledge | Workflow', note: 'Contexte de navigation préparé.' },
    { item: 'Historique récent', value: 'Placeholder · 18 événements', note: 'Historique relié visuellement seulement.' },
    { item: 'Contexte courant', value: 'Ask SRG Intelligence Center', note: 'Contexte de session UI sans mémoire backend.' },
  ], [])

  const confidenceRows = useMemo<AskReadinessRow[]>(() => [
    { item: 'Confiance de la réponse', value: 'Placeholder · 89%', note: 'Aucun score IA calculé côté runtime.' },
    { item: 'Nombre de sources', value: 'Placeholder · 7 sources', note: 'Chaîne de citation non orchestrée.' },
    { item: 'Dernière mise à jour', value: 'Placeholder · 2026-08-02 12:00', note: 'Horodatage de démonstration.' },
    { item: 'Entreprise', value: 'SRG Industries Holding', note: 'Contexte enterprise placeholder.' },
    { item: 'Utilisateur', value: 'Enterprise user placeholder', note: 'Identité affichée sans auth runtime.' },
  ], [])

  const askActionsRows = useMemo<AskReadinessRow[]>(() => [
    { item: 'Créer une tâche', value: 'Placeholder', note: 'Aucune création de tâche métier.' },
    { item: 'Créer un workflow', value: 'Placeholder', note: 'Aucune orchestration workflow backend.' },
    { item: 'Partager', value: 'Placeholder', note: 'Partage non connecté à un canal runtime.' },
    { item: 'Exporter', value: 'Placeholder', note: 'Export non connecté à un backend.' },
    { item: 'Ouvrir le document', value: 'Placeholder', note: 'Ouverture documentaire simulée.' },
    { item: 'Ajouter aux favoris', value: 'Placeholder', note: 'Ajout favori visuel sans logique métier.' },
  ], [])

  const askContextSuggestionRows = useMemo<AskContextSuggestionRow[]>(() => {
    const preferences = WorkspacePreferencesService.getPreferences()
    const recentDocs = askDocumentSourceRows.slice(0, 2).map((item) => item.document).join(' | ')
    const recentHistory = preferences.recentSearches.slice(0, 3).join(' | ') || 'Placeholder'
    const favorites = preferences.commandFavorites.slice(0, 3).join(' | ') || 'Placeholder'

    return [
      { source: 'Module consulté', detail: consultedModule, suggestion: `Approfondir les actions ${consultedModule} en mode Ask SRG.`, status: 'Placeholder' },
      { source: 'Documents récents', detail: recentDocs || 'Placeholder', suggestion: 'Résumer les documents récemment consultés.', status: 'Placeholder' },
      { source: 'Historique', detail: recentHistory, suggestion: 'Reprendre la dernière analyse et proposer une suite.', status: 'Placeholder' },
      { source: 'Favoris', detail: favorites, suggestion: 'Exécuter une suggestion basée sur vos favoris.', status: 'Placeholder' },
    ]
  }, [askDocumentSourceRows, consultedModule, askSearch])

  const askRuntimeSessionRows = useMemo<AskRuntimeSessionRow[]>(() => [
    { item: 'conversationId', value: askSrgRuntime.session.conversationId, note: 'Session locale placeholder.' },
    { item: 'tenantId', value: askSrgRuntime.session.tenantId, note: 'Référence tenant locale placeholder.' },
    { item: 'userId', value: askSrgRuntime.session.userId, note: 'Référence utilisateur locale placeholder.' },
    { item: 'workspace', value: askSrgRuntime.session.workspace, note: 'Workspace courant local.' },
    { item: 'language', value: askSrgRuntime.session.language, note: 'Langue locale de session.' },
    { item: 'voiceEnabled', value: askSrgRuntime.session.voiceEnabled ? 'true' : 'false', note: 'Activation voix placeholder.' },
    { item: 'favoriteCommands', value: askSrgRuntime.session.favoriteCommands.join(' | ') || 'Placeholder', note: 'Commandes favorites locales.' },
    { item: 'recentCommands', value: askSrgRuntime.session.recentCommands.join(' | ') || 'Placeholder', note: 'Commandes récentes locales.' },
    { item: 'recentDocuments', value: askSrgRuntime.session.recentDocuments.join(' | ') || 'Placeholder', note: 'Documents récents locaux.' },
  ], [askSrgRuntime.session])

  const filteredSkillsRegistry = useMemo(() => {
    const normalized = skillsSearch.trim().toLowerCase()
    return askSrgRuntime.skillsRegistry.filter((skill) => {
      if (activeSkillCategory !== 'all' && skill.category !== activeSkillCategory) {
        return false
      }
      if (!normalized) {
        return true
      }
      return `${skill.id} ${skill.name} ${skill.category} ${skill.description} ${skill.status} ${skill.supportedWorkspaces.join(' ')}`
        .toLowerCase()
        .includes(normalized)
    })
  }, [activeSkillCategory, askSrgRuntime.skillsRegistry, skillsSearch])

  const skillsRegistryRows = useMemo<AskSrgSkillRegistryRow[]>(() => (
    filteredSkillsRegistry.map((skill) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      description: skill.description,
      icon: skill.icon,
      status: skill.status,
      supportedWorkspaces: skill.supportedWorkspaces.join(' | '),
      suggestedPrompts: skill.suggestedPrompts.join(' | '),
    }))
  ), [filteredSkillsRegistry])

  const recentSkillRows = useMemo<AskSrgSkillSimpleRow[]>(() => (
    askSrgRuntime.recentSkills
      .map((id) => askSrgRuntime.skillsRegistry.find((skill) => skill.id === id))
      .filter((skill): skill is NonNullable<typeof skill> => Boolean(skill))
      .map((skill) => ({
        skillId: skill.id,
        name: skill.name,
        category: skill.category,
        status: skill.status,
      }))
  ), [askSrgRuntime.recentSkills, askSrgRuntime.skillsRegistry])

  const favoriteSkillRows = useMemo<AskSrgSkillSimpleRow[]>(() => (
    askSrgRuntime.favoriteSkills
      .map((id) => askSrgRuntime.skillsRegistry.find((skill) => skill.id === id))
      .filter((skill): skill is NonNullable<typeof skill> => Boolean(skill))
      .map((skill) => ({
        skillId: skill.id,
        name: skill.name,
        category: skill.category,
        status: skill.status,
      }))
  ), [askSrgRuntime.favoriteSkills, askSrgRuntime.skillsRegistry])

  const skillsCategoryRows = useMemo(
    () => askSrgRuntime.skillsCategories.map((category) => ({
      category,
      count: String(askSrgRuntime.skillsRegistry.filter((skill) => skill.category === category).length),
    })),
    [askSrgRuntime.skillsCategories, askSrgRuntime.skillsRegistry],
  )

  const suggestedPromptRows = useMemo(
    () => askSrgRuntime.suggestedPrompts.map((prompt) => ({ prompt })),
    [askSrgRuntime.suggestedPrompts],
  )

  const askReadinessColumns: Array<DataTableColumn<AskReadinessRow>> = [
    { key: 'item', label: 'Item', sortable: true },
    { key: 'value', label: 'Valeur', sortable: true },
    { key: 'note', label: 'Note' },
  ]

  const askMemoryColumns: Array<DataTableColumn<AskMemoryRow>> = [
    { key: 'item', label: 'Item', sortable: true },
    { key: 'value', label: 'Valeur' },
    { key: 'note', label: 'Note' },
  ]

  const askDocumentColumns: Array<DataTableColumn<AskDocumentSourceRow>> = [
    { key: 'document', label: 'Documents utilisés', sortable: true },
    { key: 'confidence', label: 'Confiance', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'author', label: 'Auteur', sortable: true },
    { key: 'version', label: 'Version', sortable: true },
  ]

  const askContextSuggestionColumns: Array<DataTableColumn<AskContextSuggestionRow>> = [
    { key: 'source', label: 'Source', sortable: true },
    { key: 'detail', label: 'Détail' },
    { key: 'suggestion', label: 'Suggestion' },
    { key: 'status', label: 'Statut', sortable: true },
  ]

  const askRuntimeSessionColumns: Array<DataTableColumn<AskRuntimeSessionRow>> = [
    { key: 'item', label: 'Champ', sortable: true },
    { key: 'value', label: 'Valeur' },
    { key: 'note', label: 'Note' },
  ]

  const skillsRegistryColumns: Array<DataTableColumn<AskSrgSkillRegistryRow>> = [
    { key: 'icon', label: 'Icon' },
    { key: 'name', label: 'Skill', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'supportedWorkspaces', label: 'Workspaces' },
    { key: 'suggestedPrompts', label: 'Suggested prompts' },
  ]

  const skillSimpleColumns: Array<DataTableColumn<AskSrgSkillSimpleRow>> = [
    { key: 'name', label: 'Skill', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ]

  const skillsCategoryColumns: Array<DataTableColumn<{ category: string; count: string }>> = [
    { key: 'category', label: 'Category', sortable: true },
    { key: 'count', label: 'Skills', sortable: true },
  ]

  const suggestedPromptColumns: Array<DataTableColumn<{ prompt: string }>> = [
    { key: 'prompt', label: 'Suggested prompt', sortable: true },
  ]

  const publishAskNotification = (title: string, message: string) => {
    notificationService.publish({
      title,
      message,
      level: 'info',
      priority: 'low',
      category: 'system',
      read: false,
      channels: ['email'],
    })
  }

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

      <Section title="Enterprise Readiness" description="La plateforme est préparée visuellement pour un futur backend multi-entreprises.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ENTERPRISE_READINESS_ITEMS.map((item) => (
            <article key={item.label} className="island-shell rounded-[1.75rem] p-5 shadow-[var(--srg-shadow-md)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">{item.value}</p>
              <p className="mt-3 text-sm text-[var(--srg-text-muted)]">{item.note}</p>
            </article>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/settings" className="rounded-2xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-[var(--srg-color-primary-600)]">
            Ouvrir Enterprise Configuration
          </Link>
          <Link to="/administration" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline">
            Administration
          </Link>
          <Link to="/profile" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] no-underline">
            Profile
          </Link>
        </div>
      </Section>

      <Section title="Ask SRG" description="Centre d'intelligence Ask SRG en mode préparation UI/UX sans moteur IA, sans backend et sans API runtime.">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowNotificationCenter((current) => !current)}
            aria-expanded={showNotificationCenter}
            aria-controls="home-ask-notification-center"
          >
            Notifications Ask SRG
          </Button>
        </div>

        <div className="mt-4">
          <DataTable
            tableId="home-ask-srg-runtime-session"
            title="Ask SRG Runtime Session"
            rows={askRuntimeSessionRows}
            columns={askRuntimeSessionColumns}
            pageSize={10}
            exportFileName="srg-ask-runtime-session.csv"
          />
        </div>

        {showNotificationCenter ? (
          <div id="home-ask-notification-center" className="mt-4">
            <NotificationCenter
              notifications={notifications.notifications}
              onClose={() => setShowNotificationCenter(false)}
              onDismiss={notifications.dismiss}
              onClear={notifications.clear}
              onMarkRead={notifications.markRead}
              onMarkAllRead={notifications.markAllRead}
            />
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <FormSection title="Ask SRG Home" description="Zone de conversation, saisie, microphone, document et partage en mode placeholder.">
            <div className="rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4" role="log" aria-live="polite" aria-label="Zone de conversation Ask SRG">
              <p className="text-sm text-[var(--srg-text-muted)]">Conversation placeholder: Ask SRG affichera ici les échanges, les sources et les contextes enterprise.</p>
            </div>
            <div className="mt-4">
              <FieldGroup columns={2}>
                <SmartInputField
                  id="home-ask-srg-input"
                  label="Champ de saisie"
                  value={askInput}
                  onValueChange={setAskInput}
                  placeholder="Posez une question à Ask SRG"
                  autosaveLabel="WorkspacePreferencesService"
                />
                <Field label="Suggestions rapides" hint="Sélection d’un prompt préconfiguré.">
                  <select
                    value={selectedSuggestion}
                    onChange={(event) => {
                      setSelectedSuggestion(event.target.value)
                      setAskInput(event.target.value)
                    }}
                    aria-label="Suggestions Ask SRG"
                  >
                    <option value="">Choisir une suggestion</option>
                    {ASK_SRG_SUGGESTIONS.map((suggestion) => <option key={suggestion} value={suggestion}>{suggestion}</option>)}
                  </select>
                </Field>
              </FieldGroup>
              <FormToolbar autosaveLabel="UI readiness only">
                <Button
                  variant="secondary"
                  onClick={() => {
                    askSrgRuntime.setVoiceEnabled(!askSrgRuntime.session.voiceEnabled)
                    publishAskNotification('Ask SRG microphone', `Microphone en mode placeholder (${!askSrgRuntime.session.voiceEnabled ? 'enabled' : 'disabled'}).`)
                  }}
                >
                  Microphone
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    askSrgRuntime.pushRecentDocument('Document placeholder')
                    publishAskNotification('Ask SRG documents', 'Pièce jointe en mode placeholder.')
                  }}
                >
                  Joindre un document
                </Button>
                <Button variant="secondary" onClick={() => publishAskNotification('Ask SRG sharing', 'Partage en mode placeholder.')}>Partager</Button>
                <Button
                  onClick={() => {
                    const command = askInput.trim() || selectedSuggestion || 'Ask SRG placeholder command'
                    askSrgRuntime.pushRecentCommand(command)
                    publishAskNotification('Ask SRG conversation', 'Conversation envoyée en mode préparation sans IA réelle.')
                  }}
                >
                  Envoyer
                </Button>
              </FormToolbar>
            </div>
          </FormSection>

          <FormSection title="Smart Suggestions" description="Exemples de questions enterprise pour démarrer rapidement.">
            <Field label="Recherche suggestions" hint="Réutilise SearchBar + WorkspacePreferencesService.">
              <SearchBar
                value={askSearch}
                onValueChange={(value) => {
                  setAskSearch(value)
                  WorkspacePreferencesService.pushRecentSearch(value)
                }}
                onSearch={(value) => {
                  setAskSearch(value)
                  WorkspacePreferencesService.pushRecentSearch(value)
                }}
                placeholder="Rechercher une suggestion Ask SRG"
                persistKey="home-ask-srg-suggestions"
                instant
              />
            </Field>
            <ul className="mt-3 space-y-2 text-sm text-[var(--srg-text-muted)]" aria-label="Liste de suggestions Ask SRG">
              {filteredAskSuggestions.map((suggestion) => (
                <li key={suggestion} className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2">{suggestion}</li>
              ))}
            </ul>
          </FormSection>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <FormSection title="Skills Categories" description="Catégories locales du Skills Runtime Ask SRG.">
            <FieldGroup columns={2}>
              <Field label="Catégorie active" hint="Filtre des skills registry.">
                <select
                  value={activeSkillCategory}
                  onChange={(event) => setActiveSkillCategory(event.target.value)}
                  aria-label="Catégorie active des compétences Ask SRG"
                >
                  <option value="all">Toutes catégories</option>
                  {askSrgRuntime.skillsCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </Field>
              <Field label="Recherche skills" hint="Réutilise SearchBar + WorkspacePreferencesService.">
                <SearchBar
                  value={skillsSearch}
                  onSearch={setSkillsSearch}
                  onValueChange={setSkillsSearch}
                  placeholder="Rechercher un skill Ask SRG"
                  persistKey="home-ask-srg-skills"
                  instant
                />
              </Field>
            </FieldGroup>
            <ValidationMessage variant="hint">Toutes les catégories sont des placeholders locaux sans backend ni IA.</ValidationMessage>
          </FormSection>

          <DataTable
            tableId="home-ask-srg-skills-categories"
            title="Skills categories"
            rows={skillsCategoryRows}
            columns={skillsCategoryColumns}
            pageSize={12}
            exportFileName="srg-ask-skills-categories.csv"
          />
        </div>

        <div className="mt-4">
          <DataTable
            tableId="home-ask-srg-skills-registry"
            title="Skills registry"
            rows={skillsRegistryRows}
            columns={skillsRegistryColumns}
            pageSize={10}
            exportFileName="srg-ask-skills-registry.csv"
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <DataTable
            tableId="home-ask-srg-suggested-prompts"
            title="Suggested prompts"
            rows={suggestedPromptRows}
            columns={suggestedPromptColumns}
            pageSize={8}
            exportFileName="srg-ask-suggested-prompts.csv"
          />

          <FormSection title="Skills Actions" description="Actions locales de Skills Runtime sans moteur IA.">
            <FieldGroup columns={2}>
              <Field label="Skill récent" hint="Marque une compétence comme utilisée récemment.">
                <select
                  defaultValue=""
                  onChange={(event) => {
                    const skillId = event.target.value
                    if (!skillId) return
                    askSrgRuntime.useSkill(skillId)
                    notificationService.publish({
                      title: 'Ask SRG skill used',
                      message: `${skillId} ajouté aux compétences récentes.`,
                      level: 'info',
                      priority: 'low',
                      category: 'system',
                      read: false,
                      channels: ['email'],
                    })
                  }}
                  aria-label="Sélectionner un skill récent"
                >
                  <option value="">Choisir une compétence</option>
                  {askSrgRuntime.skillsRegistry.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
                </select>
              </Field>
              <Field label="Favori" hint="Ajoute ou retire une compétence des favoris.">
                <select
                  defaultValue=""
                  onChange={(event) => {
                    const skillId = event.target.value
                    if (!skillId) return
                    askSrgRuntime.toggleFavoriteSkill(skillId)
                    notificationService.publish({
                      title: 'Ask SRG favorite toggled',
                      message: `${skillId} mis à jour dans les favoris.`,
                      level: 'info',
                      priority: 'low',
                      category: 'system',
                      read: false,
                      channels: ['email'],
                    })
                  }}
                  aria-label="Sélectionner un skill favori"
                >
                  <option value="">Choisir une compétence</option>
                  {askSrgRuntime.skillsRegistry.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
                </select>
              </Field>
            </FieldGroup>
            <FormToolbar autosaveLabel="WorkspacePreferencesService">
              <Button
                variant="secondary"
                disabled={filteredSkillsRegistry.length === 0}
                onClick={() => {
                  const firstSkill = filteredSkillsRegistry[0]
                  askSrgRuntime.useSkill(firstSkill.id)
                  publishAskNotification('Ask SRG skills', `${firstSkill.name} ajouté aux compétences récentes.`)
                }}
              >
                Utiliser la première compétence filtrée
              </Button>
            </FormToolbar>
          </FormSection>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <DataTable
            tableId="home-ask-srg-recent-skills"
            title="Recent skills"
            rows={recentSkillRows}
            columns={skillSimpleColumns}
            pageSize={8}
            exportFileName="srg-ask-recent-skills.csv"
          />
          <DataTable
            tableId="home-ask-srg-favorite-skills"
            title="Favorite skills"
            rows={favoriteSkillRows}
            columns={skillSimpleColumns}
            pageSize={8}
            exportFileName="srg-ask-favorite-skills.csv"
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <FormSection title="Ce que Ask SRG peut faire" description="Skills Center: compétences enterprise en mode préparation UI/UX.">
            <FieldGroup columns={2}>
              <Field label="Catégorie" hint="Filtre des compétences préparées.">
                <select value={activeSkillCategory} onChange={(event) => setActiveSkillCategory(event.target.value)} aria-label="Filtrer les compétences Ask SRG">
                  <option value="all">Toutes catégories</option>
                  {ASK_SRG_SKILL_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </Field>
              <Field label="Module consulté" hint="Contexte utilisé pour suggestions placeholder.">
                <select value={consultedModule} onChange={(event) => setConsultedModule(event.target.value)} aria-label="Module consulté pour suggestions Ask SRG">
                  <option value="Dashboard">Dashboard</option>
                  <option value="Knowledge Intelligence">Knowledge Intelligence</option>
                  <option value="Workflow Automation">Workflow Automation</option>
                  <option value="Enterprise Insights">Enterprise Insights</option>
                  <option value="Strategic Advisor">Strategic Advisor</option>
                  <option value="History">History</option>
                  <option value="Observability">Observability</option>
                </select>
              </Field>
            </FieldGroup>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {filteredAskSkillCards.map((card) => (
                <article key={card.category} className="rounded-[1.5rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">{card.category}</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--srg-text-title)]">{card.capability}</p>
                  <p className="mt-2 text-xs text-[var(--srg-text-muted)]">{card.note}</p>
                </article>
              ))}
            </div>
          </FormSection>

          <FormSection title="Exemples d'actions" description="Actions préparées uniquement en placeholder.">
            <ul className="space-y-2 text-sm text-[var(--srg-text-muted)]" aria-label="Exemples d'actions Ask SRG">
              {ASK_SRG_ACTION_EXAMPLES.map((example) => (
                <li key={example} className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2">{example}</li>
              ))}
            </ul>
          </FormSection>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <DataTable
            tableId="home-ask-srg-memory"
            title="Enterprise Memory"
            rows={askMemoryRows}
            columns={askMemoryColumns}
            pageSize={8}
            exportFileName="srg-ask-memory.csv"
          />
          <DataTable
            tableId="home-ask-srg-document-sources"
            title="Sources documentaires"
            rows={askDocumentSourceRows}
            columns={askDocumentColumns}
            pageSize={8}
            exportFileName="srg-ask-document-sources.csv"
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <DataTable
            tableId="home-ask-srg-contextual-suggestions"
            title="Suggestions"
            rows={askContextSuggestionRows}
            columns={askContextSuggestionColumns}
            pageSize={8}
            exportFileName="srg-ask-contextual-suggestions.csv"
          />
          <FormSection title="Quick Commands" description="Commandes rapides Ask SRG (placeholder uniquement).">
            <div className="grid gap-2 sm:grid-cols-2">
              {ASK_SRG_QUICK_COMMANDS.map((command) => (
                <Button
                  key={command}
                  variant="secondary"
                  onClick={() => {
                    askSrgRuntime.pushRecentCommand(command)
                    askSrgRuntime.toggleFavoriteCommand(command)
                    publishAskNotification('Ask SRG quick command', `${command} exécutée en mode placeholder.`)
                  }}
                  aria-label={`Commande rapide ${command}`}
                >
                  {command}
                </Button>
              ))}
            </div>
          </FormSection>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <FormSection title="Language" description="Configuration multilingue en mode préparation.">
            <FieldGroup columns={2}>
              <Field label="Langue de réponse" hint="Configuration locale uniquement.">
                <select
                  value={responseLanguage}
                  onChange={(event) => {
                    setResponseLanguage(event.target.value)
                    askSrgRuntime.updateSession({ language: event.target.value, workspace: 'Ask SRG Home' })
                  }}
                  aria-label="Langue de réponse Ask SRG"
                >
                  {ASK_LANGUAGE_OPTIONS.map((language) => <option key={language} value={language}>{language}</option>)}
                </select>
              </Field>
              <Field label="Langue des documents" hint="Configuration locale uniquement.">
                <select value={documentsLanguage} onChange={(event) => setDocumentsLanguage(event.target.value)} aria-label="Langue des documents Ask SRG">
                  {ASK_LANGUAGE_OPTIONS.map((language) => <option key={language} value={language}>{language}</option>)}
                </select>
              </Field>
              <Field label="Mode traduction" hint="Placeholder uniquement.">
                <select value={translationMode} onChange={(event) => setTranslationMode(event.target.value)} aria-label="Mode traduction Ask SRG">
                  <option value="Placeholder">Placeholder</option>
                  <option value="Automatic Placeholder">Automatic Placeholder</option>
                  <option value="Manual Placeholder">Manual Placeholder</option>
                </select>
              </Field>
            </FieldGroup>
            <ValidationMessage variant="hint">Ask SRG détectera automatiquement la langue des messages et des documents.</ValidationMessage>
          </FormSection>
          <DataTable
            tableId="home-ask-srg-language"
            title="Language readiness"
            rows={languageRows}
            columns={askReadinessColumns}
            pageSize={8}
            exportFileName="srg-ask-language-readiness.csv"
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <DataTable
            tableId="home-ask-srg-voice"
            title="Voice readiness"
            rows={voiceRows}
            columns={askReadinessColumns}
            pageSize={8}
            exportFileName="srg-ask-voice-readiness.csv"
          />
          <DataTable
            tableId="home-ask-srg-context"
            title="Context readiness"
            rows={contextRows}
            columns={askReadinessColumns}
            pageSize={8}
            exportFileName="srg-ask-context-readiness.csv"
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <DataTable
            tableId="home-ask-srg-trust-panel"
            title="Trust Panel"
            rows={confidenceRows}
            columns={askReadinessColumns}
            pageSize={8}
            exportFileName="srg-ask-trust-panel.csv"
          />
          <FormSection title="Actions après réponse" description="Actions de sortie et d’orchestration en mode placeholder.">
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => publishAskNotification('Ask SRG task', 'Créer une tâche en mode placeholder.')}>Créer une tâche</Button>
              <Button variant="secondary" onClick={() => publishAskNotification('Ask SRG workflow', 'Créer un workflow en mode placeholder.')}>Créer un workflow</Button>
              <Button variant="secondary" onClick={() => publishAskNotification('Ask SRG share', 'Partager en mode placeholder.')}>Partager</Button>
              <Button variant="secondary" onClick={() => publishAskNotification('Ask SRG export', 'Exporter en mode placeholder.')}>Exporter</Button>
              <Button variant="secondary" onClick={() => publishAskNotification('Ask SRG document', 'Ouvrir le document en mode placeholder.')}>Ouvrir le document</Button>
              <Button variant="secondary" onClick={() => publishAskNotification('Ask SRG favorites', 'Ajouter aux favoris en mode placeholder.')}>Ajouter aux favoris</Button>
            </div>
            <div className="mt-4">
              <DataTable
                tableId="home-ask-srg-actions"
                title="Actions readiness"
                rows={askActionsRows}
                columns={askReadinessColumns}
                pageSize={8}
                exportFileName="srg-ask-actions-readiness.csv"
              />
            </div>
          </FormSection>
        </div>
      </Section>

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
