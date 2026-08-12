export type SubcategoryMeta = {
  id: string
  label: string
  targetPath: string
  order: number
  whatsappContact?: string
}

export type CategoryIconKind =
  | 'finance'
  | 'hr'
  | 'operations'
  | 'knowledge'
  | 'automation'
  | 'governance'

export type CategoryMeta = {
  id: string
  name: string
  description: string
  icon: CategoryIconKind
  order: number
  legacyDomains?: string[]
  whatsappContact?: string
  subcategories: SubcategoryMeta[]
}

export type TaxonomySnapshot = {
  id: string
  label: string
  domains: string[]
}

export const SRG_TAXONOMY_HISTORY: TaxonomySnapshot[] = [
  {
    id: 'legacy-12',
    label: 'Legacy 12-domain taxonomy',
    domains: [
      'Documents',
      'Finance',
      'RH',
      'Maintenance',
      'Achats',
      'CRM',
      'Qualite',
      'Projets',
      'Workflow',
      'Knowledge',
      'Analytics',
      'Administration',
    ],
  },
  {
    id: 'current-6',
    label: 'Current consolidated taxonomy',
    domains: ['Finance', 'Ressources Humaines', 'Operations', 'Knowledge', 'Automation', 'Gouvernance'],
  },
]

export const CATEGORY_CATALOG: CategoryMeta[] = [
  {
    id: 'finance',
    name: 'Finance',
    description: 'Comptabilite, tresorerie, budgets, clients, fournisseurs et pilotage financier.',
    icon: 'finance',
    order: 1,
    legacyDomains: ['Finance', 'CRM'],
    subcategories: [
      { id: 'accounting', label: 'Comptabilite', targetPath: '/accounting', order: 1 },
      { id: 'treasury', label: 'Tresorerie', targetPath: '/treasury', order: 2 },
      { id: 'tax', label: 'Fiscalite', targetPath: '/management-control', order: 3 },
      { id: 'budgets', label: 'Budgets', targetPath: '/finance-budgets', order: 4 },
      { id: 'customers', label: 'Clients', targetPath: '/finance-customers', order: 5 },
      { id: 'suppliers', label: 'Fournisseurs', targetPath: '/finance-suppliers', order: 6 },
      { id: 'control', label: 'Controle de gestion', targetPath: '/management-control', order: 7 },
    ],
  },
  {
    id: 'hr',
    name: 'Ressources Humaines',
    description: 'Effectifs, organisation, paie, presences, conges, competences et recrutements.',
    icon: 'hr',
    order: 2,
    legacyDomains: ['RH'],
    subcategories: [
      { id: 'employees', label: 'Employes', targetPath: '/employees', order: 1 },
      { id: 'recruitment', label: 'Recrutement', targetPath: '/recruitment', order: 2 },
      { id: 'payroll', label: 'Paie', targetPath: '/payroll', order: 3 },
      { id: 'trainings', label: 'Formation', targetPath: '/trainings', order: 4 },
      { id: 'organization', label: 'Organisation', targetPath: '/organization', order: 5 },
      { id: 'contracts', label: 'Contrats RH', targetPath: '/hr-contracts', order: 6 },
      { id: 'attendance', label: 'Presences', targetPath: '/attendance', order: 7 },
      { id: 'leaves', label: 'Conges', targetPath: '/leaves', order: 8 },
      { id: 'skills', label: 'Competences', targetPath: '/skills', order: 9 },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Execution terrain, maintenance, qualite et suivi continu des activites metier.',
    icon: 'operations',
    order: 3,
    legacyDomains: ['Maintenance', 'Achats', 'Qualite', 'Projets'],
    subcategories: [
      { id: 'procurement', label: 'Procurement & Inventory', targetPath: '/procurement-inventory', order: 1 },
      { id: 'projects', label: 'Project Execution', targetPath: '/project-execution', order: 2 },
      { id: 'maintenance', label: 'Maintenance', targetPath: '/maintenance', order: 3 },
      { id: 'quality', label: 'Reviews Qualite', targetPath: '/reviews', order: 4 },
      { id: 'history', label: 'Historique', targetPath: '/history', order: 5 },
    ],
  },
  {
    id: 'knowledge',
    name: 'Knowledge',
    description: 'Documentation, intelligence documentaire, analyses et observabilite decisionnelle.',
    icon: 'knowledge',
    order: 4,
    legacyDomains: ['Documents', 'Knowledge', 'Analytics'],
    subcategories: [
      { id: 'knowledge-center', label: 'Knowledge Center', targetPath: '/knowledge-center', order: 1 },
      { id: 'knowledge-intel', label: 'Knowledge Intelligence', targetPath: '/knowledge-intelligence', order: 2 },
      { id: 'insights', label: 'Enterprise Insights', targetPath: '/enterprise-insights', order: 3 },
      { id: 'advisor', label: 'Strategic Advisor', targetPath: '/strategic-advisor', order: 4 },
      { id: 'observability', label: 'Observability', targetPath: '/observability', order: 5 },
      { id: 'dashboard', label: 'Dashboard', targetPath: '/dashboard', order: 6 },
    ],
  },
  {
    id: 'automation',
    name: 'Automation',
    description: 'Workflows, agents IA, generation et orchestration de taches automatisables.',
    icon: 'automation',
    order: 5,
    legacyDomains: ['Workflow'],
    subcategories: [
      { id: 'workflow', label: 'Workflow Automation', targetPath: '/workflow-automation', order: 1 },
      { id: 'agents', label: 'AI Agents', targetPath: '/agents', order: 2 },
      { id: 'generate', label: 'Generation', targetPath: '/generate', order: 3 },
      { id: 'providers', label: 'Providers', targetPath: '/providers', order: 4 },
    ],
  },
  {
    id: 'governance',
    name: 'Gouvernance',
    description: 'Authentification, profil, parametres et fondations de gouvernance applicative.',
    icon: 'governance',
    order: 6,
    legacyDomains: ['Administration'],
    subcategories: [
      { id: 'auth', label: 'Authentification', targetPath: '/auth', order: 1 },
      { id: 'profile', label: 'Profil', targetPath: '/profile', order: 2 },
      { id: 'settings', label: 'Parametres', targetPath: '/settings', order: 3 },
    ],
  },
]

export function getCategoryBySlug(categorySlug: string) {
  return CATEGORY_CATALOG.find((entry) => entry.id === categorySlug)
}

export function getSubcategoryBySlug(categorySlug: string, subcategorySlug: string) {
  const category = getCategoryBySlug(categorySlug)
  if (!category) return undefined
  return category.subcategories.find((entry) => entry.id === subcategorySlug)
}

export function getOrderedCategories() {
  return CATEGORY_CATALOG.slice()
    .sort((left, right) => left.order - right.order)
    .map((category) => ({
      ...category,
      subcategories: category.subcategories.slice().sort((left, right) => left.order - right.order),
    }))
}
