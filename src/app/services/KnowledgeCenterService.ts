export type KnowledgeCategory = 'documentation' | 'faq' | 'guides' | 'tutorials' | 'examples' | 'api'

export type KnowledgeArticle = {
  id: string
  category: KnowledgeCategory
  title: string
  summary: string
  tags: string[]
  audience: 'user' | 'builder' | 'admin'
  updatedAt: string
  body: string
}

const articles: KnowledgeArticle[] = [
  {
    id: 'doc-01',
    category: 'documentation',
    title: 'Getting Started with SRG',
    summary: 'Vue d’ensemble du dashboard, des projets, des prompts et de la génération.',
    tags: ['onboarding', 'dashboard', 'workspace'],
    audience: 'user',
    updatedAt: '2026-07-31',
    body: 'SRG centralise vos projets, prompts, historiques et providers dans un workspace unique. Commencez par creer un projet, enrichissez votre Prompt Studio, puis lancez vos generations depuis AI Playground.',
  },
  {
    id: 'faq-01',
    category: 'faq',
    title: 'Pourquoi une generation peut echouer ?',
    summary: 'Causes frequentes: provider indisponible, variables manquantes, quotas ou prompt invalide.',
    tags: ['faq', 'errors', 'generation'],
    audience: 'user',
    updatedAt: '2026-07-29',
    body: 'Avant de relancer, verifiez le provider selectionne, les variables obligatoires et le quota disponible. Utilisez la page Providers pour tester la sante du connecteur et la page History pour comparer les executions echouees.',
  },
  {
    id: 'guide-01',
    category: 'guides',
    title: 'Construire un Prompt versionne',
    summary: 'Bonnes pratiques pour les variables, la validation et la comparaison de versions.',
    tags: ['prompts', 'versioning', 'validation'],
    audience: 'builder',
    updatedAt: '2026-07-28',
    body: 'Un bon prompt versionne commence par une structure stable, des variables nommees clairement, puis un historique lisible. Dans Prompt Studio, comparez deux versions avant publication et gardez des commentaires de changement concis.',
  },
  {
    id: 'tutorial-01',
    category: 'tutorials',
    title: 'Tutoriel: de l idee au projet partage',
    summary: 'Creer, dupliquer, archiver, partager et exporter un projet.',
    tags: ['projects', 'sharing', 'export'],
    audience: 'user',
    updatedAt: '2026-07-27',
    body: 'Creez un projet, ajoutez vos prompts, epinglez-le en favori, puis utilisez les actions de partage et export pour transmettre le contexte a votre equipe.',
  },
  {
    id: 'example-01',
    category: 'examples',
    title: 'Exemple: resume produit multilingue',
    summary: 'Exemple complet avec variables de langue, ton et segment utilisateur.',
    tags: ['example', 'marketing', 'multilingual'],
    audience: 'builder',
    updatedAt: '2026-07-26',
    body: 'Prompt: Redige un resume pour {{segment}} en {{language}} avec un ton {{tone}}. Utilisez ce pattern dans Generate ou Prompt Templates pour standardiser les sorties multilingues.',
  },
  {
    id: 'api-01',
    category: 'api',
    title: 'Workspace API surface',
    summary: 'Description des services visibles: projets, prompts, notifications, history, providers.',
    tags: ['api', 'services', 'workspace'],
    audience: 'admin',
    updatedAt: '2026-07-31',
    body: 'La couche visible SRG expose des services d application pour manipuler les projets, les prompts, l historique local, le centre de notifications et les providers. Les couches kernel, execution et business bas niveau restent encapsulees.',
  },
]

export class KnowledgeCenterService {
  static list(): KnowledgeArticle[] {
    return [...articles].sort((left, right) => (left.updatedAt < right.updatedAt ? 1 : -1))
  }

  static categories(): KnowledgeCategory[] {
    return ['documentation', 'faq', 'guides', 'tutorials', 'examples', 'api']
  }
}