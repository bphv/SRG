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
  | 'crm'
  | 'meetings'
  | 'documents'
  | 'projects'
  | 'analytics'
  | 'quality'

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
    id: 'consolidated-6',
    label: 'Consolidated 6-category taxonomy (superseded)',
    domains: ['Finance', 'Ressources Humaines', 'Operations', 'Knowledge', 'Automation', 'Gouvernance'],
  },
  {
    id: 'official-12',
    label: 'Official unified 12-category taxonomy',
    domains: [
      'Finance',
      'Ressources Humaines',
      'Operations',
      'Projets',
      'CRM',
      'Reunions',
      'Documents',
      'Knowledge',
      'Analytics',
      'Automation',
      'Qualite',
      'Gouvernance',
    ],
  },
]

export const CATEGORY_CATALOG: CategoryMeta[] = [
  {
    id: 'finance',
    name: 'Finance',
    description: 'Comptabilite, tresorerie, budgets, clients, fournisseurs et pilotage financier.',
    icon: 'finance',
    order: 1,
    legacyDomains: ['Finance'],
    subcategories: [
      { id: 'accounting', label: 'Comptabilite', targetPath: '/accounting', order: 1 },
      { id: 'treasury', label: 'Tresorerie', targetPath: '/treasury', order: 2 },
      { id: 'budgets', label: 'Budgets', targetPath: '/finance-budgets', order: 3 },
      { id: 'customers', label: 'Clients', targetPath: '/finance-customers', order: 4 },
      { id: 'suppliers', label: 'Fournisseurs', targetPath: '/finance-suppliers', order: 5 },
      { id: 'control', label: 'Controle de gestion', targetPath: '/management-control', order: 6 },
      { id: 'finance-overview', label: 'Finance globale', targetPath: '/finance', order: 7 },
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
      { id: 'attendance', label: 'Presences et pointage', targetPath: '/attendance', order: 7 },
      { id: 'leaves', label: 'Conges', targetPath: '/leaves', order: 8 },
      { id: 'skills', label: 'Competences', targetPath: '/skills', order: 9 },
      { id: 'evaluations', label: 'Evaluations', targetPath: '/evaluations', order: 10 },
      { id: 'hr-overview', label: 'RH globale', targetPath: '/human-resources', order: 11 },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Execution terrain, maintenance, achats, stocks, devis et politique metier.',
    icon: 'operations',
    order: 3,
    legacyDomains: ['Maintenance', 'Achats'],
    subcategories: [
      { id: 'procurement', label: 'Procurement & Inventory', targetPath: '/procurement-inventory', order: 1 },
      { id: 'maintenance', label: 'Maintenance', targetPath: '/maintenance', order: 2 },
      { id: 'devis', label: 'Devis', targetPath: '/devis', order: 3 },
      { id: 'business-policy', label: 'Business Policy', targetPath: '/business-policy', order: 4 },
      { id: 'operations-history', label: 'Historique operations', targetPath: '/history', order: 5 },
    ],
  },
  {
    id: 'projects',
    name: 'Projets',
    description: 'Projets, chantiers, execution industrielle, planning, equipes et avancement.',
    icon: 'projects',
    order: 4,
    legacyDomains: ['Projets'],
    subcategories: [
      { id: 'project-execution', label: 'Execution & Chantiers', targetPath: '/project-execution', order: 1 },
      { id: 'projects-portfolio', label: 'Portefeuille projets', targetPath: '/projects', order: 2 },
      { id: 'projects-history', label: 'Historique projets', targetPath: '/history', order: 3 },
    ],
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Prospects, clients, contrats commerciaux et suivi relation client.',
    icon: 'crm',
    order: 5,
    legacyDomains: ['CRM'],
    subcategories: [
      { id: 'crm-clients', label: 'Clients', targetPath: '/finance-customers', order: 1 },
      { id: 'crm-prospects', label: 'Prospects', targetPath: '/finance-customers', order: 2 },
      { id: 'crm-contracts', label: 'Contrats', targetPath: '/hr-contracts', order: 3 },
      { id: 'crm-reviews', label: 'Revue clients', targetPath: '/reviews', order: 4 },
    ],
  },
  {
    id: 'meetings',
    name: 'Reunions',
    description: 'Preparation, compte rendu, plans d\'action et decisions.',
    icon: 'meetings',
    order: 6,
    legacyDomains: [],
    subcategories: [
      { id: 'meeting-reviews', label: 'Comptes rendus', targetPath: '/reviews', order: 1 },
      { id: 'meeting-actions', label: 'Plans d\'action', targetPath: '/workflow-automation', order: 2 },
      { id: 'meeting-decisions', label: 'Decisions', targetPath: '/enterprise-insights', order: 3 },
      { id: 'meeting-ai', label: 'Reunion IA', targetPath: '/chat', order: 4 },
    ],
  },
  {
    id: 'documents',
    name: 'Documents',
    description: 'Rapports, contrats, procedures et courriers.',
    icon: 'documents',
    order: 7,
    legacyDomains: ['Documents'],
    subcategories: [
      { id: 'docs-reports', label: 'Rapports', targetPath: '/knowledge-center', order: 1 },
      { id: 'docs-contracts', label: 'Contrats', targetPath: '/prompt-templates', order: 2 },
      { id: 'docs-procedures', label: 'Procedures', targetPath: '/knowledge-center', order: 3 },
      { id: 'docs-mail', label: 'Courriers', targetPath: '/history', order: 4 },
      { id: 'docs-generate', label: 'Generer un rapport', targetPath: '/generate', order: 5 },
    ],
  },
  {
    id: 'knowledge',
    name: 'Knowledge',
    description: 'Documentation, intelligence documentaire, normes, guides et historique.',
    icon: 'knowledge',
    order: 8,
    legacyDomains: ['Knowledge'],
    subcategories: [
      { id: 'knowledge-center', label: 'Knowledge Center', targetPath: '/knowledge-center', order: 1 },
      { id: 'knowledge-intel', label: 'Knowledge Intelligence', targetPath: '/knowledge-intelligence', order: 2 },
      { id: 'knowledge-history', label: 'Historique', targetPath: '/history', order: 3 },
      { id: 'knowledge-about', label: 'FAQ & A propos', targetPath: '/about', order: 4 },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'KPI, insights, previsions, tableaux de bord et observabilite decisionnelle.',
    icon: 'analytics',
    order: 9,
    legacyDomains: ['Analytics'],
    subcategories: [
      { id: 'analytics-dashboard', label: 'Dashboard & KPI', targetPath: '/dashboard', order: 1 },
      { id: 'analytics-insights', label: 'Enterprise Insights', targetPath: '/enterprise-insights', order: 2 },
      { id: 'analytics-advisor', label: 'Strategic Advisor', targetPath: '/strategic-advisor', order: 3 },
      { id: 'analytics-observability', label: 'Observability', targetPath: '/observability', order: 4 },
    ],
  },
  {
    id: 'automation',
    name: 'Automation',
    description: 'Workflows, agents IA, generation, prompts et orchestration automatisable.',
    icon: 'automation',
    order: 10,
    legacyDomains: ['Workflow'],
    subcategories: [
      { id: 'workflow', label: 'Workflow Automation', targetPath: '/workflow-automation', order: 1 },
      { id: 'agents', label: 'AI Agents', targetPath: '/agents', order: 2 },
      { id: 'generate', label: 'Generation', targetPath: '/generate', order: 3 },
      { id: 'prompt-studio', label: 'Prompt Studio', targetPath: '/prompt-studio', order: 4 },
      { id: 'prompt-templates', label: 'Prompt Templates', targetPath: '/prompt-templates', order: 5 },
      { id: 'providers', label: 'Providers & Moteurs', targetPath: '/providers', order: 6 },
    ],
  },
  {
    id: 'quality',
    name: 'Qualite',
    description: 'Revues qualite, essais, validation et conformite.',
    icon: 'quality',
    order: 11,
    legacyDomains: ['Qualite'],
    subcategories: [
      { id: 'quality-reviews', label: 'Revues Qualite', targetPath: '/reviews', order: 1 },
      { id: 'quality-history', label: 'Historique qualite', targetPath: '/history', order: 2 },
    ],
  },
  {
    id: 'governance',
    name: 'Gouvernance',
    description: 'Authentification, administration, profil, parametres et fondations de gouvernance.',
    icon: 'governance',
    order: 12,
    legacyDomains: ['Administration'],
    subcategories: [
      { id: 'administration', label: 'Administration', targetPath: '/administration', order: 1 },
      { id: 'auth', label: 'Authentification', targetPath: '/auth', order: 2 },
      { id: 'profile', label: 'Profil', targetPath: '/profile', order: 3 },
      { id: 'settings', label: 'Parametres', targetPath: '/settings', order: 4 },
      { id: 'providers-admin', label: 'Providers', targetPath: '/providers', order: 5 },
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