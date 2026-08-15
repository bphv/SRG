import { PDFDocument, StandardFonts } from 'pdf-lib'
import JSZip from 'jszip'
import { ConversationWorkspaceService } from '#/app/services/ConversationWorkspaceService'
import { GenerateWorkspaceService } from '#/app/services/GenerateWorkspaceService'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export type KnowledgeDocumentType =
  | 'markdown'
  | 'txt'
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'csv'
  | 'json'
  | 'xml'
  | 'html'
  | 'image'
  | 'audio'
  | 'video'
  | 'email-export'
  | 'technical-plan'
  | 'scan'
  | 'invoice'
  | 'delivery-note'
  | 'receipt-note'
  | 'photo'
  | 'report'
  | 'web-link'
  | 'note'
  | 'faq'
  | 'guide'
  | 'documentation'

export type KnowledgeDocumentStatus = 'draft' | 'validated' | 'archived' | 'trash'
export type KnowledgeIndexStatus = 'pending' | 'indexing' | 'indexed' | 'failed'
export type KnowledgeImportType =
  | 'local'
  | 'multiple'
  | 'drag-drop'
  | 'folder'
  | 'zip'
  | 'rar'
  | '7z'
  | 'url'
  | 'github'
  | 'network'
  | 'sharepoint'
  | 'google-drive'
  | 'onedrive'
  | 'dropbox'
  | 'markdown'
  | 'pdf'
  | 'csv'
  | 'json'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'html'
  | 'images'
  | 'audio'
  | 'video'
  | 'emails'
  | 'technical-plans'
  | 'scans'
  | 'invoices'
  | 'delivery-notes'
  | 'receipt-notes'
  | 'photos'
  | 'reports'

export type KnowledgeExportType = 'markdown' | 'pdf' | 'json' | 'csv' | 'zip' | 'word' | 'excel' | 'printable'

export type KnowledgeDocumentVersion = {
  id: string
  label: string
  content: string
  createdAt: string
}

export type KnowledgeDocumentComment = {
  id: string
  author: string
  message: string
  createdAt: string
}

export type KnowledgeCollection = {
  id: string
  name: string
  description: string
  documentIds: string[]
  favorite: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
}

export type KnowledgeDocumentRecord = {
  id: string
  title: string
  description: string
  content: string
  documentType: KnowledgeDocumentType
  category: string
  tags: string[]
  favorite: boolean
  status: KnowledgeDocumentStatus
  archived: boolean
  inTrash: boolean
  collectionIds: string[]
  source: string
  sourcePath: string
  originalName: string
  sourceCreatedAt: string
  sourceModifiedAt: string
  relatedDocumentIds: string[]
  createdAt: string
  updatedAt: string
  ocr: {
    status: 'pending' | 'queued' | 'running' | 'completed' | 'failed'
    progress: number
    language: string
    confidence: number
    queuePosition: number
    diagnostics: string
    preview: string
  }
  extraction: {
    entreprise: string
    client: string
    fournisseur: string
    projet: string
    site: string
    machine: string
    equipement: string
    reference: string
    marque: string
    modele: string
    puissanceKw: number
    rpm: number
    numeroSerie: string
    date: string
    auteur: string
    technicien: string
    montant: number
    devise: string
    documentsLies: string[]
    motsCles: string[]
    resume: string
    categorie: string
    tags: string[]
    version: string
  }
  classification: {
    category: string
    subCategory: string
    collection: string
    famille: string
    equipement: string
    client: string
    fournisseur: string
    site: string
    annee: string
    projet: string
    chantier: string
    service: string
    departement: string
  }
  index: {
    status: KnowledgeIndexStatus
    chunks: number
    embeddingsPlaceholder: boolean
    metadata: {
      language: string
      summary: string
      keywords: string[]
      author: string
      date: string
      version: string
      score: number
      size: number
      source: string
      hash: string
    }
  }
  versions: KnowledgeDocumentVersion[]
  comments: KnowledgeDocumentComment[]
}

export type KnowledgeEvent = {
  id: string
  at: string
  type: string
  level: 'info' | 'warning' | 'error'
  message: string
}

export type KnowledgeDiagnostic = {
  id: string
  at: string
  latencyMs: number
  volume: number
  documents: number
  imports: number
  indexations: number
  searches: number
  exports: number
}

export type KnowledgeImportRecord = {
  id: string
  type: KnowledgeImportType
  source: string
  documentIds: string[]
  createdAt: string
  durationMs: number
  volume: number
}

export type KnowledgeSearchRecord = {
  id: string
  query: string
  filters: string
  resultCount: number
  createdAt: string
  semanticUi: boolean
}

export type KnowledgeExportRecord = {
  id: string
  format: KnowledgeExportType
  documentIds: string[]
  createdAt: string
}

export type KnowledgeDecompressionRecord = {
  id: string
  archiveName: string
  archiveType: 'zip' | 'rar' | '7z'
  tree: Array<{ path: string; name: string; type: KnowledgeDocumentType; createdAt: string; modifiedAt: string }>
  createdAt: string
  linkedDocumentIds: string[]
}

export type KnowledgeOcrQueueItem = {
  id: string
  documentId: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  language: string
  confidence: number
  diagnostics: string
  createdAt: string
  updatedAt: string
}

export type KnowledgeEnterpriseSearchFilters = {
  text: string
  year: string
  chantier: string
  client: string
  fournisseur: string
  equipement: string
  reference: string
  puissanceKwMin: number
  puissanceKwMax: number
  rpmMin: number
  rpmMax: number
  numeroSerie: string
  technicien: string
  semanticUi: boolean
  favoritesOnly: boolean
}

export type KnowledgeGraphNode = {
  id: string
  label: string
  type: 'entreprise' | 'projet' | 'chantier' | 'machine' | 'equipement' | 'rapport' | 'facture' | 'photo' | 'intervention' | 'technicien' | 'fournisseur'
}

export type KnowledgeGraphEdge = {
  id: string
  from: string
  to: string
  relation: string
}

export type KnowledgeAiAnswer = {
  id: string
  question: string
  answerText: string
  answerAudioPlaceholder: string
  summary: string
  confidenceScore: number
  sources: Array<{ documentId: string; title: string; source: string; score: number }>
  documentsUsed: string[]
  references: string[]
  createdAt: string
}

export type KnowledgeRagRun = {
  id: string
  documentIds: string[]
  collectionIds: string[]
  categories: string[]
  chunkCount: number
  contextPreview: string
  references: Array<{ documentId: string; title: string; score: number; source: string }>
  createdAt: string
}

export type KnowledgeWorkspaceStore = {
  documents: KnowledgeDocumentRecord[]
  collections: KnowledgeCollection[]
  events: KnowledgeEvent[]
  diagnostics: KnowledgeDiagnostic[]
  imports: KnowledgeImportRecord[]
  decompressions: KnowledgeDecompressionRecord[]
  ocrQueue: KnowledgeOcrQueueItem[]
  searches: KnowledgeSearchRecord[]
  exports: KnowledgeExportRecord[]
  ragRuns: KnowledgeRagRun[]
  aiAnswers: KnowledgeAiAnswer[]
}

export type KnowledgeFilters = {
  search: string
  category: string
  tag: string
  author: string
  date: string
  type: 'all' | KnowledgeDocumentType
  status: 'all' | KnowledgeDocumentStatus
  favoritesOnly: boolean
  sort: 'updatedAt:desc' | 'updatedAt:asc' | 'title:asc' | 'title:desc' | 'score:desc'
  semanticUi: boolean
}

const STORAGE_KEY = 'srg.knowledge.workspace.v1'
const ZIP_MAX_ARCHIVE_BYTES = 50 * 1024 * 1024
const ZIP_MAX_FILES = 400
const ZIP_MAX_UNCOMPRESSED_BYTES = 120 * 1024 * 1024
const ZIP_MAX_ENTRY_PREVIEW_BYTES = 2 * 1024 * 1024

const DANGEROUS_ARCHIVE_EXTENSIONS = new Set([
  'exe',
  'dll',
  'bat',
  'cmd',
  'msi',
  'vbs',
  'ps1',
  'com',
  'scr',
  'hta',
  'js',
  'jar',
  'sh',
])

function nowIso(): string {
  return new Date().toISOString()
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function hashOf(value: string): string {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return `h${Math.abs(hash)}`
}

function toTypeFromName(name: string): KnowledgeDocumentType {
  const lower = name.toLowerCase()
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'markdown'
  if (lower.endsWith('.txt')) return 'txt'
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.endsWith('.doc')) return 'doc'
  if (lower.endsWith('.docx')) return 'docx'
  if (lower.endsWith('.xls')) return 'xls'
  if (lower.endsWith('.xlsx')) return 'xlsx'
  if (lower.endsWith('.csv')) return 'csv'
  if (lower.endsWith('.json')) return 'json'
  if (lower.endsWith('.xml')) return 'xml'
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html'
  if (lower.endsWith('.eml') || lower.endsWith('.msg')) return 'email-export'
  if (lower.includes('plan')) return 'technical-plan'
  if (lower.includes('scan')) return 'scan'
  if (lower.includes('facture') || lower.includes('invoice')) return 'invoice'
  if (lower.includes('livraison') || lower.includes('delivery')) return 'delivery-note'
  if (lower.includes('reception') || lower.includes('receipt')) return 'receipt-note'
  if (lower.includes('rapport') || lower.includes('report')) return 'report'
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(lower)) return 'image'
  if (/\.(mp3|wav|ogg|m4a)$/.test(lower)) return 'audio'
  if (/\.(mp4|mov|avi|mkv|webm)$/.test(lower)) return 'video'
  return 'documentation'
}

function fromMimeType(mimeType: string): KnowledgeDocumentType | undefined {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.includes('msword')) return 'doc'
  if (mimeType.includes('wordprocessingml')) return 'docx'
  if (mimeType.includes('spreadsheetml')) return 'xlsx'
  if (mimeType.includes('msexcel') || mimeType.includes('excel')) return 'xls'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('json')) return 'json'
  if (mimeType.includes('csv')) return 'csv'
  if (mimeType.includes('xml')) return 'xml'
  if (mimeType.includes('html')) return 'html'
  if (mimeType.includes('markdown')) return 'markdown'
  if (mimeType.includes('plain')) return 'txt'
  return undefined
}

function isTextualDocumentType(type: KnowledgeDocumentType): boolean {
  return type === 'markdown' || type === 'txt' || type === 'csv' || type === 'json' || type === 'xml' || type === 'html' || type === 'documentation' || type === 'note' || type === 'faq' || type === 'guide' || type === 'web-link' || type === 'report'
}

function normalizeArchivePath(raw: string): string | undefined {
  const value = raw.replace(/\\/g, '/').replace(/^\/+/, '')
  if (!value || /(^|\/)\.\.(\/|$)/.test(value)) return undefined
  const normalized = value
    .split('/')
    .filter((segment) => segment && segment !== '.')
    .join('/')
  return normalized || undefined
}

function extensionOf(path: string): string {
  const name = path.split('/').pop() ?? path
  const index = name.lastIndexOf('.')
  if (index <= 0 || index === name.length - 1) return ''
  return name.slice(index + 1).toLowerCase()
}

function parseKeywords(title: string, content: string): string[] {
  const words = `${title} ${content}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((value) => value.length > 3)
  return Array.from(new Set(words)).slice(0, 8)
}

function makeDocument(params: {
  title: string
  description: string
  content: string
  type: KnowledgeDocumentType
  category: string
  tags: string[]
  source: string
  author: string
  collectionIds?: string[]
}): KnowledgeDocumentRecord {
  const createdAt = nowIso()
  const keywords = parseKeywords(params.title, params.content)
  const text = `${params.title} ${params.content}`.toLowerCase()
  const puissanceMatch = text.match(/(\d{1,4})\s?(kw|cv)/)
  const rpmMatch = text.match(/(\d{3,5})\s?rpm/)
  const montantMatch = text.match(/(\d+(?:[.,]\d+)?)\s?(usd|eur|xaf|xof|cfa|€|\$)/)
  const serialMatch = text.match(/(?:serial|serie|s\/n|sn|numero serie|n°)\s*[:#-]?\s*([a-z0-9-]{4,})/)
  const yearMatch = text.match(/\b(20\d{2}|19\d{2})\b/)
  const technicienMatch = text.match(/(?:technicien|technician)\s*[:#-]?\s*([a-z\s'-]{3,40})/)

  return {
    id: id('kdoc'),
    title: params.title,
    description: params.description,
    content: params.content,
    documentType: params.type,
    category: params.category,
    tags: params.tags,
    favorite: false,
    status: 'draft',
    archived: false,
    inTrash: false,
    collectionIds: params.collectionIds ?? [],
    source: params.source,
    sourcePath: params.source,
    originalName: params.title,
    sourceCreatedAt: createdAt,
    sourceModifiedAt: createdAt,
    relatedDocumentIds: [],
    createdAt,
    updatedAt: createdAt,
    ocr: {
      status: 'pending',
      progress: 0,
      language: 'fr',
      confidence: 0,
      queuePosition: 0,
      diagnostics: 'OCR engine not connected (app-layer placeholder).',
      preview: '',
    },
    extraction: {
      entreprise: text.includes('abb') ? 'ABB' : '',
      client: '',
      fournisseur: text.includes('abb') ? 'ABB' : '',
      projet: text.includes('razel') ? 'Razel' : '',
      site: '',
      machine: '',
      equipement: text.includes('moteur') ? 'moteur' : '',
      reference: '',
      marque: text.includes('abb') ? 'ABB' : '',
      modele: '',
      puissanceKw: puissanceMatch ? Number(puissanceMatch[1].replace(',', '.')) : 0,
      rpm: rpmMatch ? Number(rpmMatch[1]) : 0,
      numeroSerie: serialMatch ? serialMatch[1].toUpperCase() : '',
      date: yearMatch ? `${yearMatch[1]}-01-01` : createdAt,
      auteur: params.author,
      technicien: technicienMatch ? technicienMatch[1].trim() : '',
      montant: montantMatch ? Number(montantMatch[1].replace(',', '.')) : 0,
      devise: montantMatch ? montantMatch[2].toUpperCase() : '',
      documentsLies: [],
      motsCles: keywords,
      resume: params.content.slice(0, 180),
      categorie: params.category,
      tags: params.tags,
      version: '1.0.0',
    },
    classification: {
      category: params.category,
      subCategory: params.type,
      collection: params.collectionIds?.[0] ?? 'default',
      famille: params.type,
      equipement: text.includes('moteur') ? 'moteur' : '',
      client: '',
      fournisseur: text.includes('abb') ? 'ABB' : '',
      site: '',
      annee: yearMatch ? yearMatch[1] : new Date(createdAt).getFullYear().toString(),
      projet: text.includes('razel') ? 'Razel' : '',
      chantier: text.includes('razel') ? 'Razel' : '',
      service: '',
      departement: '',
    },
    index: {
      status: 'indexed',
      chunks: Math.max(1, Math.ceil(params.content.length / 500)),
      embeddingsPlaceholder: true,
      metadata: {
        language: 'fr',
        summary: params.content.slice(0, 180),
        keywords,
        author: params.author,
        date: createdAt,
        version: '1.0.0',
        score: Number((0.6 + Math.random() * 0.39).toFixed(2)),
        size: params.content.length,
        source: params.source,
        hash: hashOf(`${params.title}:${params.content}`),
      },
    },
    versions: [
      {
        id: id('kver'),
        label: 'v1',
        content: params.content,
        createdAt,
      },
    ],
    comments: [],
  }
}

function defaultStore(): KnowledgeWorkspaceStore {
  const architecture = makeDocument({
    title: 'SRG Platform Architecture Guide',
    description: 'Overview of application workspaces and integration points.',
    content: 'This guide documents the SRG workspaces, routing map, and recommended integration patterns for app-layer features.',
    type: 'guide',
    category: 'architecture',
    tags: ['architecture', 'workspace', 'integration'],
    source: 'seed',
    author: 'System',
    collectionIds: ['kcol-core'],
  })
  const faq = makeDocument({
    title: 'RAG FAQ',
    description: 'Frequently asked questions for retrieval and context usage.',
    content: 'How many chunks should be used? How to tune retrieval score thresholds? This FAQ covers common operational questions.',
    type: 'faq',
    category: 'faq',
    tags: ['faq', 'rag', 'search'],
    source: 'seed',
    author: 'System',
    collectionIds: ['kcol-rag'],
  })
  const markdown = makeDocument({
    title: 'Prompt Engineering Notes',
    description: 'Shared notes for prompt quality and iteration loops.',
    content: '# Prompt Notes\n\nUse explicit constraints and validation steps. Keep output contracts stable.',
    type: 'markdown',
    category: 'prompting',
    tags: ['prompt', 'quality', 'notes'],
    source: 'seed',
    author: 'System',
    collectionIds: ['kcol-core'],
  })

  // Unified Knowledge Center articles (merged from legacy KnowledgeCenterService static catalog).
  const gettingStarted = makeDocument({
    title: 'Getting Started with SRG',
    description: "Vue d'ensemble du dashboard, des projets, des prompts et de la generation.",
    content: 'SRG centralise vos projets, prompts, historiques et providers dans un workspace unique. Commencez par creer un projet, enrichissez votre Prompt Studio, puis lancez vos generations depuis AI Playground.',
    type: 'documentation',
    category: 'documentation',
    tags: ['onboarding', 'dashboard', 'workspace'],
    source: 'seed:knowledge-center',
    author: 'System',
    collectionIds: ['kcol-core'],
  })
  const generationFailures = makeDocument({
    title: 'Pourquoi une generation peut echouer ?',
    description: 'Causes frequentes: provider indisponible, variables manquantes, quotas ou prompt invalide.',
    content: 'Avant de relancer, verifiez le provider selectionne, les variables obligatoires et le quota disponible. Utilisez la page Providers pour tester la sante du connecteur et la page History pour comparer les executions echouees.',
    type: 'faq',
    category: 'faq',
    tags: ['faq', 'errors', 'generation'],
    source: 'seed:knowledge-center',
    author: 'System',
    collectionIds: ['kcol-rag'],
  })
  const versionedPrompt = makeDocument({
    title: 'Construire un Prompt versionne',
    description: 'Bonnes pratiques pour les variables, la validation et la comparaison de versions.',
    content: 'Un bon prompt versionne commence par une structure stable, des variables nommees clairement, puis un historique lisible. Dans Prompt Studio, comparez deux versions avant publication et gardez des commentaires de changement concis.',
    type: 'guide',
    category: 'guides',
    tags: ['prompts', 'versioning', 'validation'],
    source: 'seed:knowledge-center',
    author: 'System',
    collectionIds: ['kcol-core'],
  })
  const projectTutorial = makeDocument({
    title: "Tutoriel: de l idee au projet partage",
    description: 'Creer, dupliquer, archiver, partager et exporter un projet.',
    content: 'Creez un projet, ajoutez vos prompts, epinglez-le en favori, puis utilisez les actions de partage et export pour transmettre le contexte a votre equipe.',
    type: 'documentation',
    category: 'tutorials',
    tags: ['projects', 'sharing', 'export'],
    source: 'seed:knowledge-center',
    author: 'System',
    collectionIds: ['kcol-core'],
  })
  const multilingualExample = makeDocument({
    title: 'Exemple: resume produit multilingue',
    description: 'Exemple complet avec variables de langue, ton et segment utilisateur.',
    content: 'Prompt: Redige un resume pour {{segment}} en {{language}} avec un ton {{tone}}. Utilisez ce pattern dans Generate ou Prompt Templates pour standardiser les sorties multilingues.',
    type: 'documentation',
    category: 'examples',
    tags: ['example', 'marketing', 'multilingual'],
    source: 'seed:knowledge-center',
    author: 'System',
    collectionIds: ['kcol-core'],
  })
  const workspaceApi = makeDocument({
    title: 'Workspace API surface',
    description: 'Description des services visibles: projets, prompts, notifications, history, providers.',
    content: "La couche visible SRG expose des services d application pour manipuler les projets, les prompts, l historique local, le centre de notifications et les providers. Les couches kernel, execution et business bas niveau restent encapsulees.",
    type: 'documentation',
    category: 'api',
    tags: ['api', 'services', 'workspace'],
    source: 'seed:knowledge-center',
    author: 'System',
    collectionIds: ['kcol-core'],
  })

  const now = nowIso()
  return {
    documents: [architecture, faq, markdown, gettingStarted, generationFailures, versionedPrompt, projectTutorial, multilingualExample, workspaceApi],
    collections: [
      {
        id: 'kcol-core',
        name: 'Core Knowledge',
        description: 'Cross-workspace documentation.',
        documentIds: [architecture.id, markdown.id, gettingStarted.id, versionedPrompt.id, projectTutorial.id, multilingualExample.id, workspaceApi.id],
        favorite: true,
        archived: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'kcol-rag',
        name: 'RAG Recipes',
        description: 'Retrieval patterns and context templates.',
        documentIds: [faq.id, generationFailures.id],
        favorite: false,
        archived: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
    events: [],
    diagnostics: [],
    imports: [],
    decompressions: [],
    ocrQueue: [],
    searches: [],
    exports: [],
    ragRuns: [],
    aiAnswers: [],
  }
}

export class KnowledgeWorkspaceService {
  private static memoryStore = defaultStore()

  static getDefaultFilters(): KnowledgeFilters {
    return {
      search: '',
      category: 'all',
      tag: '',
      author: '',
      date: '',
      type: 'all',
      status: 'all',
      favoritesOnly: false,
      sort: 'updatedAt:desc',
      semanticUi: false,
    }
  }

  static getStore(): KnowledgeWorkspaceStore {
    return this.readStorage()
  }

  static listCategories(): string[] {
    const categories = new Set(this.getStore().documents.map((item) => item.category))
    return Array.from(categories).sort((left, right) => left.localeCompare(right))
  }

  static listTags(): string[] {
    const tags = new Set(this.getStore().documents.flatMap((item) => item.tags))
    return Array.from(tags).sort((left, right) => left.localeCompare(right))
  }

  static listAuthors(): string[] {
    const authors = new Set(this.getStore().documents.map((item) => item.index.metadata.author))
    return Array.from(authors).sort((left, right) => left.localeCompare(right))
  }

  static filterDocuments(filters: KnowledgeFilters): KnowledgeDocumentRecord[] {
    const query = filters.search.trim().toLowerCase()
    const sorted = this.getStore().documents.filter((item) => {
      if (filters.favoritesOnly && !item.favorite) return false
      if (filters.status !== 'all' && item.status !== filters.status) return false
      if (filters.category !== 'all' && item.category !== filters.category) return false
      if (filters.type !== 'all' && item.documentType !== filters.type) return false
      if (filters.tag && !item.tags.some((tag) => tag.toLowerCase().includes(filters.tag.toLowerCase()))) return false
      if (filters.author && !item.index.metadata.author.toLowerCase().includes(filters.author.toLowerCase())) return false
      if (filters.date && !item.updatedAt.startsWith(filters.date)) return false
      if (!query) return true

      const haystack = [
        item.title,
        item.description,
        item.content,
        item.category,
        item.tags.join(' '),
        item.index.metadata.summary,
        item.index.metadata.keywords.join(' '),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })

    const [key, dir] = filters.sort.split(':') as ['updatedAt' | 'title' | 'score', 'asc' | 'desc']
    const direction = dir === 'asc' ? 1 : -1

    return [...sorted].sort((left, right) => {
      if (key === 'title') return left.title.localeCompare(right.title) * direction
      if (key === 'score') return (left.index.metadata.score - right.index.metadata.score) * direction
      return (left.updatedAt > right.updatedAt ? 1 : -1) * direction
    })
  }

  static createCollection(name: string, description: string): KnowledgeCollection {
    const store = this.getStore()
    const collection: KnowledgeCollection = {
      id: id('kcol'),
      name: name.trim() || 'New Collection',
      description: description.trim() || 'Knowledge collection',
      documentIds: [],
      favorite: false,
      archived: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    this.writeStorage({ ...store, collections: [collection, ...store.collections] })
    this.pushEvent('info', 'collection.created', `Collection ${collection.name} created.`)
    return collection
  }

  static addDocument(payload: {
    title: string
    description: string
    content: string
    documentType: KnowledgeDocumentType
    category: string
    tags: string[]
    source: string
    author: string
    collectionIds?: string[]
  }): KnowledgeDocumentRecord {
    const document = makeDocument({
      title: payload.title,
      description: payload.description,
      content: payload.content,
      type: payload.documentType,
      category: payload.category,
      tags: payload.tags,
      source: payload.source,
      author: payload.author,
      collectionIds: payload.collectionIds,
    })
    const store = this.getStore()
    this.writeStorage({
      ...store,
      documents: [document, ...store.documents],
      collections: store.collections.map((collection) => (
        document.collectionIds.includes(collection.id)
          ? { ...collection, documentIds: [document.id, ...collection.documentIds], updatedAt: nowIso() }
          : collection
      )),
    })
    this.pushEvent('info', 'document.created', `Document ${document.title} created.`)
    this.logHistory('Knowledge import', document.title, 'creation', 'completed')
    return document
  }

  static async importFiles(files: File[], actorName: string, importType: KnowledgeImportType): Promise<KnowledgeDocumentRecord[]> {
    const created: KnowledgeDocumentRecord[] = []
    const startedAt = Date.now()

    for (const file of files) {
      const text = await file.text().catch(() => `[binary file] ${file.name}`)
      const type = fromMimeType(file.type) ?? toTypeFromName(file.name)
      const record = this.addDocument({
        title: file.name,
        description: `Imported from file (${importType})`,
        content: text.slice(0, 4000),
        documentType: type,
        category: this.suggestCategory(type, file.name),
        tags: [importType, type, 'imported'],
        source: `${importType}:${file.name}`,
        author: actorName,
      })
      created.push(record)
    }

    this.recordImport(importType, `${files.length} file(s)`, created, Date.now() - startedAt)
    notificationService.publish({
      title: 'knowledge import completed',
      message: `${created.length} document(s) imported to Knowledge Workspace.`,
      level: 'success',
      priority: 'medium',
      category: 'system',
      read: false,
    })
    return created
  }

  static importFromUrl(url: string, actorName: string): KnowledgeDocumentRecord {
    const normalized = url.trim() || 'https://example.local/doc'
    const created = this.addDocument({
      title: normalized,
      description: 'Imported from URL',
      content: `Web source placeholder content for ${normalized}`,
      documentType: 'web-link',
      category: 'web',
      tags: ['url', 'web', 'imported'],
      source: `url:${normalized}`,
      author: actorName,
    })
    this.recordImport('url', normalized, [created], 120)
    return created
  }

  static importFromGithub(repoOrUrl: string, actorName: string): KnowledgeDocumentRecord {
    const value = repoOrUrl.trim() || 'owner/repository'
    const created = this.addDocument({
      title: `GitHub ${value}`,
      description: 'Imported from GitHub repository link',
      content: `Repository notes and readme placeholder for ${value}`,
      documentType: 'documentation',
      category: 'repository',
      tags: ['github', 'repository', 'imported'],
      source: `github:${value}`,
      author: actorName,
    })
    this.recordImport('github', value, [created], 220)
    return created
  }

  static importTextAsType(text: string, title: string, type: KnowledgeImportType, actorName: string): KnowledgeDocumentRecord {
    const mappedType = this.mapImportTypeToDocumentType(type)
    const created = this.addDocument({
      title: title.trim() || `Imported ${type}`,
      description: `Imported using ${type}`,
      content: text.trim() || `Placeholder content for ${type}`,
      documentType: mappedType,
      category: this.suggestCategory(mappedType, title),
      tags: [type, mappedType, 'imported'],
      source: `${type}:${title || 'manual'}`,
      author: actorName,
    })
    this.recordImport(type, title || 'manual', [created], 95)
    return created
  }

  static importArchivePlaceholder(type: 'zip' | 'rar' | '7z', archiveName: string, actorName: string): KnowledgeDecompressionRecord {
    const baseDate = nowIso()
    const tree = [
      { path: `${archiveName}/`, name: archiveName, type: 'documentation' as KnowledgeDocumentType, createdAt: baseDate, modifiedAt: baseDate },
      { path: `${archiveName}/reports/inspection-report-01.pdf`, name: 'inspection-report-01.pdf', type: 'pdf' as KnowledgeDocumentType, createdAt: baseDate, modifiedAt: baseDate },
      { path: `${archiveName}/invoices/facture-2022-abb.csv`, name: 'facture-2022-abb.csv', type: 'csv' as KnowledgeDocumentType, createdAt: baseDate, modifiedAt: baseDate },
      { path: `${archiveName}/photos/moteur-12345.jpg`, name: 'moteur-12345.jpg', type: 'photo' as KnowledgeDocumentType, createdAt: baseDate, modifiedAt: baseDate },
    ]

    const linkedDocumentIds = tree
      .filter((item) => item.path !== `${archiveName}/`)
      .map((item) => this.addDocument({
        title: item.name,
        description: `Imported from ${type} archive`,
        content: `Archive entry ${item.path} from ${archiveName}`,
        documentType: item.type,
        category: this.suggestCategory(item.type, item.name),
        tags: [type, 'archive', 'decompressed'],
        source: `${type}:${item.path}`,
        author: actorName,
      }).id)

    const record: KnowledgeDecompressionRecord = {
      id: id('kdecomp'),
      archiveName,
      archiveType: type,
      tree,
      createdAt: nowIso(),
      linkedDocumentIds,
    }

    const store = this.getStore()
    this.writeStorage({ ...store, decompressions: [record, ...store.decompressions].slice(0, 120) })
    this.recordImport(type, archiveName, this.getStore().documents.filter((item) => linkedDocumentIds.includes(item.id)), 240)
    this.pushEvent('info', 'decompression.done', `${type.toUpperCase()} archive analyzed: ${archiveName}`)
    this.logHistory('Knowledge decompression', `${type}:${archiveName}`, 'modification', 'completed')
    return record
  }

  static async importZipArchive(file: File, actorName: string): Promise<KnowledgeDecompressionRecord> {
    const startedAt = Date.now()
    if (file.size > ZIP_MAX_ARCHIVE_BYTES) {
      throw new Error(`Archive too large. Max size is ${Math.floor(ZIP_MAX_ARCHIVE_BYTES / (1024 * 1024))} MB.`)
    }

    const archiveName = file.name || `archive-${Date.now()}.zip`
    const buffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(buffer)
    const entries = Object.values(zip.files)
    const files = entries.filter((entry) => !entry.dir)

    const unsafePathEntries = entries.filter((entry) => {
      const rawName = (entry as unknown as { unsafeOriginalName?: string }).unsafeOriginalName ?? entry.name
      return !normalizeArchivePath(rawName)
    })
    if (unsafePathEntries.length > 0) {
      throw new Error('Archive contains unsafe path entries.')
    }

    if (files.length === 0) {
      throw new Error('The ZIP archive does not contain files.')
    }

    if (files.length > ZIP_MAX_FILES) {
      throw new Error(`Archive contains too many files. Limit is ${ZIP_MAX_FILES}.`)
    }

    let totalUncompressed = 0
    const tree: KnowledgeDecompressionRecord['tree'] = []
    const importedDocuments: KnowledgeDocumentRecord[] = []
    const blockedEntries: string[] = []

    for (const entry of files) {
      const rawName = (entry as unknown as { unsafeOriginalName?: string }).unsafeOriginalName ?? entry.name
      const normalizedPath = normalizeArchivePath(rawName)
      if (!normalizedPath) {
        blockedEntries.push(rawName)
        continue
      }

      const ext = extensionOf(normalizedPath)
      if (DANGEROUS_ARCHIVE_EXTENSIONS.has(ext)) {
        blockedEntries.push(normalizedPath)
        continue
      }

      const metadata = (entry as unknown as { _data?: { uncompressedSize?: number } })._data
      const uncompressedSize = metadata?.uncompressedSize ?? 0
      totalUncompressed += Math.max(0, uncompressedSize)
      if (totalUncompressed > ZIP_MAX_UNCOMPRESSED_BYTES) {
        throw new Error(`Archive exceeds uncompressed volume limit (${Math.floor(ZIP_MAX_UNCOMPRESSED_BYTES / (1024 * 1024))} MB).`)
      }

      const type = toTypeFromName(normalizedPath)
      const timestamp = entry.date.toISOString()
      tree.push({
        path: normalizedPath,
        name: normalizedPath.split('/').at(-1) ?? normalizedPath,
        type,
        createdAt: timestamp,
        modifiedAt: timestamp,
      })

      let content = ''
      if (isTextualDocumentType(type)) {
        try {
          const text = await entry.async('string')
          content = text.slice(0, 4000)
        } catch {
          content = `[text decode failed] ${normalizedPath}`
        }
      } else {
        const binary = await entry.async('uint8array')
        const previewBytes = Math.min(binary.byteLength, ZIP_MAX_ENTRY_PREVIEW_BYTES)
        content = `[binary ${type}] ${normalizedPath} (${binary.byteLength} bytes, preview limit ${previewBytes} bytes).`
      }

      const record = this.addDocument({
        title: normalizedPath.split('/').at(-1) ?? normalizedPath,
        description: `Imported from ZIP archive ${archiveName}`,
        content,
        documentType: type,
        category: this.suggestCategory(type, normalizedPath),
        tags: ['zip', 'archive', 'decompressed'],
        source: `zip:${archiveName}/${normalizedPath}`,
        author: actorName,
      })
      importedDocuments.push(record)
    }

    if (importedDocuments.length === 0) {
      throw new Error('No safe files were imported from this ZIP archive.')
    }

    const linkedDocumentIds = importedDocuments.map((item) => item.id)
    if (linkedDocumentIds.length > 1) {
      const linkedSet = new Set(linkedDocumentIds)
      for (const document of importedDocuments) {
        this.updateDocument(document.id, (item) => ({
          ...item,
          relatedDocumentIds: Array.from(linkedSet).filter((value) => value !== item.id),
        }))
      }
    }

    const record: KnowledgeDecompressionRecord = {
      id: id('kdecomp'),
      archiveName,
      archiveType: 'zip',
      tree,
      createdAt: nowIso(),
      linkedDocumentIds,
    }

    const store = this.getStore()
    this.writeStorage({ ...store, decompressions: [record, ...store.decompressions].slice(0, 120) })
    this.recordImport('zip', archiveName, importedDocuments, Date.now() - startedAt)
    this.pushEvent('info', 'decompression.done', `ZIP archive imported: ${archiveName} (${importedDocuments.length} file(s)).`)

    if (blockedEntries.length > 0) {
      this.pushEvent('warning', 'decompression.blocked', `${blockedEntries.length} archive entrie(s) blocked for security policy.`)
    }

    this.logHistory('Knowledge decompression', `zip:${archiveName}`, 'modification', 'completed')
    return record
  }

  static enqueueOcr(documentId: string, language: string): KnowledgeOcrQueueItem | undefined {
    const document = this.getStore().documents.find((item) => item.id === documentId)
    if (!document) return undefined

    const store = this.getStore()
    const queueItem: KnowledgeOcrQueueItem = {
      id: id('kocr'),
      documentId,
      status: 'queued',
      progress: 0,
      language: language.trim() || 'fr',
      confidence: 0,
      diagnostics: 'Queued for OCR processing (placeholder).',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    this.writeStorage({ ...store, ocrQueue: [queueItem, ...store.ocrQueue].slice(0, 240) })
    this.updateDocument(documentId, (item) => ({
      ...item,
      ocr: {
        ...item.ocr,
        status: 'queued',
        progress: 0,
        language: queueItem.language,
        queuePosition: 1,
        diagnostics: queueItem.diagnostics,
      },
    }))

    this.pushEvent('info', 'ocr.queued', `OCR queued for ${document.title}.`)
    this.logHistory('Knowledge OCR', `queued:${document.title}`, 'modification', 'completed')
    return queueItem
  }

  static runOcr(documentId: string): void {
    const store = this.getStore()
    const queueItem = store.ocrQueue.find((item) => item.documentId === documentId)
    const progress = 100
    const confidence = Number((0.78 + Math.random() * 0.2).toFixed(2))

    this.writeStorage({
      ...store,
      ocrQueue: store.ocrQueue.map((item) => (
        item.documentId === documentId
          ? {
              ...item,
              status: 'completed',
              progress,
              confidence,
              diagnostics: 'OCR completed (placeholder engine).',
              updatedAt: nowIso(),
            }
          : item
      )),
    })

    this.updateDocument(documentId, (item) => ({
      ...item,
      ocr: {
        ...item.ocr,
        status: 'completed',
        progress,
        confidence,
        queuePosition: 0,
        diagnostics: 'OCR completed (placeholder engine).',
        preview: item.content.slice(0, 500),
      },
    }))

    this.pushEvent('info', 'ocr.completed', `OCR completed for document ${documentId}.`)
    this.pushDiagnostic()
    this.logHistory('Knowledge OCR', `completed:${documentId}`, 'validation', 'completed')
    if (queueItem) {
      this.autoExtractAndClassify(documentId)
    }
  }

  static autoExtractAndClassify(documentId: string): void {
    this.updateDocument(documentId, (item) => {
      const text = `${item.title} ${item.content}`.toLowerCase()
      const kwMatch = text.match(/(\d{1,4})\s?kw/)
      const rpmMatch = text.match(/(\d{3,5})\s?rpm/)
      const yearMatch = text.match(/\b(20\d{2}|19\d{2})\b/)
      const serialMatch = text.match(/(?:serial|serie|s\/n|sn|numero serie|n°)\s*[:#-]?\s*([a-z0-9-]{4,})/)
      const amountMatch = text.match(/(\d+(?:[.,]\d+)?)\s?(usd|eur|xaf|xof|cfa|€|\$|millions?)/)
      const chantierMatch = text.match(/(?:chantier|site|project|projet)\s*[:#-]?\s*([a-z0-9\s'-]{3,50})/)

      const puissanceKw = kwMatch ? Number(kwMatch[1]) : item.extraction.puissanceKw
      const rpm = rpmMatch ? Number(rpmMatch[1]) : item.extraction.rpm
      const montant = amountMatch ? Number(amountMatch[1].replace(',', '.')) : item.extraction.montant
      const devise = amountMatch ? amountMatch[2].toUpperCase() : item.extraction.devise
      const chantier = chantierMatch ? chantierMatch[1].trim() : item.classification.chantier

      const extraction = {
        ...item.extraction,
        entreprise: text.includes('abb') ? 'ABB' : item.extraction.entreprise,
        fournisseur: text.includes('abb') ? 'ABB' : item.extraction.fournisseur,
        projet: chantier || item.extraction.projet,
        equipement: text.includes('moteur') ? 'moteur' : item.extraction.equipement,
        marque: text.includes('abb') ? 'ABB' : item.extraction.marque,
        puissanceKw,
        rpm,
        numeroSerie: serialMatch ? serialMatch[1].toUpperCase() : item.extraction.numeroSerie,
        date: yearMatch ? `${yearMatch[1]}-01-01` : item.extraction.date,
        montant,
        devise,
        motsCles: Array.from(new Set([...item.extraction.motsCles, ...parseKeywords(item.title, item.content)])).slice(0, 12),
        resume: item.content.slice(0, 220),
        categorie: item.category,
        tags: item.tags,
      }

      const classification = {
        ...item.classification,
        category: item.category,
        subCategory: item.documentType,
        famille: item.documentType,
        equipement: extraction.equipement,
        fournisseur: extraction.fournisseur,
        annee: extraction.date.slice(0, 4),
        projet: extraction.projet,
        chantier: extraction.projet,
      }

      return {
        ...item,
        extraction,
        classification,
      }
    })

    this.pushEvent('info', 'extraction.classification', `Extraction and classification completed for ${documentId}.`)
    this.logHistory('Knowledge extraction', `document:${documentId}`, 'modification', 'completed')
  }

  static getEnterpriseSearchDefaults(): KnowledgeEnterpriseSearchFilters {
    return {
      text: '',
      year: '',
      chantier: '',
      client: '',
      fournisseur: '',
      equipement: '',
      reference: '',
      puissanceKwMin: 0,
      puissanceKwMax: 0,
      rpmMin: 0,
      rpmMax: 0,
      numeroSerie: '',
      technicien: '',
      semanticUi: false,
      favoritesOnly: false,
    }
  }

  static searchEnterprise(filters: KnowledgeEnterpriseSearchFilters, track = true): KnowledgeDocumentRecord[] {
    const query = filters.text.trim().toLowerCase()
    const matches = this.getStore().documents.filter((item) => {
      if (filters.favoritesOnly && !item.favorite) return false
      if (filters.year && item.classification.annee !== filters.year) return false
      if (filters.chantier && !item.classification.chantier.toLowerCase().includes(filters.chantier.toLowerCase())) return false
      if (filters.client && !item.classification.client.toLowerCase().includes(filters.client.toLowerCase())) return false
      if (filters.fournisseur && !item.classification.fournisseur.toLowerCase().includes(filters.fournisseur.toLowerCase())) return false
      if (filters.equipement && !item.classification.equipement.toLowerCase().includes(filters.equipement.toLowerCase())) return false
      if (filters.reference && !item.extraction.reference.toLowerCase().includes(filters.reference.toLowerCase())) return false
      if (filters.numeroSerie && !item.extraction.numeroSerie.toLowerCase().includes(filters.numeroSerie.toLowerCase())) return false
      if (filters.technicien && !item.extraction.technicien.toLowerCase().includes(filters.technicien.toLowerCase())) return false
      if (filters.puissanceKwMin > 0 && item.extraction.puissanceKw < filters.puissanceKwMin) return false
      if (filters.puissanceKwMax > 0 && item.extraction.puissanceKw > filters.puissanceKwMax) return false
      if (filters.rpmMin > 0 && item.extraction.rpm < filters.rpmMin) return false
      if (filters.rpmMax > 0 && item.extraction.rpm > filters.rpmMax) return false
      if (!query) return true
      return `${item.title} ${item.description} ${item.content} ${item.tags.join(' ')} ${item.category}`.toLowerCase().includes(query)
    })

    if (track) {
      const store = this.getStore()
      const history: KnowledgeSearchRecord = {
        id: id('ksearch-enterprise'),
        query: query || 'enterprise-filter',
        filters: JSON.stringify(filters),
        resultCount: matches.length,
        createdAt: nowIso(),
        semanticUi: filters.semanticUi,
      }
      this.writeStorage({ ...store, searches: [history, ...store.searches].slice(0, 140) })
      this.pushEvent('info', 'search.enterprise', `Enterprise search returned ${matches.length} result(s).`)
    }
    return matches
  }

  static buildDocumentGraph(): { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } {
    const documents = this.getStore().documents
    const nodes = new Map<string, KnowledgeGraphNode>()
    const edges: KnowledgeGraphEdge[] = []

    for (const item of documents) {
      const entrepriseId = `entreprise:${item.extraction.entreprise || 'unknown'}`
      const projetId = `projet:${item.classification.projet || 'unknown'}`
      const chantierId = `chantier:${item.classification.chantier || 'unknown'}`
      const machineId = `machine:${item.extraction.machine || 'unknown'}`
      const equipementId = `equipement:${item.classification.equipement || 'unknown'}`
      const fournisseurId = `fournisseur:${item.classification.fournisseur || 'unknown'}`
      const technicienId = `technicien:${item.extraction.technicien || 'unknown'}`
      const documentTypeNode: KnowledgeGraphNode['type'] = item.documentType === 'invoice'
        ? 'facture'
        : item.documentType === 'photo' || item.documentType === 'image'
          ? 'photo'
          : 'rapport'
      const documentNodeId = `${documentTypeNode}:${item.id}`

      const pairs: Array<[string, string, KnowledgeGraphNode['type'], string]> = [
        [entrepriseId, item.extraction.entreprise || 'Unknown Enterprise', 'entreprise', 'contains'],
        [projetId, item.classification.projet || 'Unknown Project', 'projet', 'owns'],
        [chantierId, item.classification.chantier || 'Unknown Chantier', 'chantier', 'hosts'],
        [machineId, item.extraction.machine || 'Unknown Machine', 'machine', 'mounts'],
        [equipementId, item.classification.equipement || 'Unknown Equipment', 'equipement', 'includes'],
        [documentNodeId, item.title, documentTypeNode, 'documents'],
        [technicienId, item.extraction.technicien || 'Unknown Technician', 'technicien', 'handled-by'],
        [fournisseurId, item.classification.fournisseur || 'Unknown Supplier', 'fournisseur', 'provided-by'],
      ]

      for (const [nodeId, label, type] of pairs) {
        if (!nodes.has(nodeId)) nodes.set(nodeId, { id: nodeId, label, type })
      }

      edges.push(
        { id: id('gedge'), from: entrepriseId, to: projetId, relation: 'entreprise-projet' },
        { id: id('gedge'), from: projetId, to: chantierId, relation: 'projet-chantier' },
        { id: id('gedge'), from: chantierId, to: machineId, relation: 'chantier-machine' },
        { id: id('gedge'), from: machineId, to: equipementId, relation: 'machine-equipement' },
        { id: id('gedge'), from: equipementId, to: documentNodeId, relation: 'equipement-document' },
        { id: id('gedge'), from: documentNodeId, to: technicienId, relation: 'document-technicien' },
        { id: id('gedge'), from: documentNodeId, to: fournisseurId, relation: 'document-fournisseur' },
      )
    }

    return { nodes: Array.from(nodes.values()).slice(0, 300), edges: edges.slice(0, 800) }
  }

  static answerEnterpriseQuestion(question: string): KnowledgeAiAnswer {
    const normalized = question.toLowerCase()
    let candidates = this.getStore().documents

    const abb = normalized.includes('abb')
    const moteurs = normalized.includes('moteur') || normalized.includes('moteurs')
    const razel = normalized.includes('razel')
    const montant = normalized.match(/(\d+)\s?(million|millions)/)
    const year = normalized.match(/\b(20\d{2}|19\d{2})\b/)
    const serial = normalized.match(/(?:moteur|document).*?(\d{4,})/)

    if (abb) candidates = candidates.filter((item) => item.extraction.marque.toLowerCase().includes('abb') || item.title.toLowerCase().includes('abb'))
    if (moteurs) candidates = candidates.filter((item) => item.classification.equipement.toLowerCase().includes('moteur') || item.title.toLowerCase().includes('moteur'))
    if (razel) candidates = candidates.filter((item) => item.classification.chantier.toLowerCase().includes('razel') || item.content.toLowerCase().includes('razel'))
    if (year) candidates = candidates.filter((item) => item.classification.annee === year[1])
    if (serial) candidates = candidates.filter((item) => item.extraction.numeroSerie.includes(serial[1]) || item.content.includes(serial[1]))
    if (montant) {
      const threshold = Number(montant[1]) * 1000000
      candidates = candidates.filter((item) => item.extraction.montant >= threshold)
    }

    const sources = candidates.slice(0, 8).map((item) => ({
      documentId: item.id,
      title: item.title,
      source: item.source,
      score: Number((item.index.metadata.score + 0.05).toFixed(2)),
    }))

    const answerText = candidates.length === 0
      ? 'No exact enterprise document found for this question. Try broader filters.'
      : `Found ${candidates.length} matching enterprise document(s). Top sources include ${sources.map((item) => item.title).join(', ')}.`

    const result: KnowledgeAiAnswer = {
      id: id('kai'),
      question,
      answerText,
      answerAudioPlaceholder: 'audio-response-placeholder',
      summary: answerText,
      confidenceScore: candidates.length === 0 ? 0.32 : Number(Math.min(0.96, 0.55 + candidates.length * 0.04).toFixed(2)),
      sources,
      documentsUsed: sources.map((item) => item.documentId),
      references: sources.map((item) => `${item.title} (${item.source})`),
      createdAt: nowIso(),
    }

    const store = this.getStore()
    this.writeStorage({ ...store, aiAnswers: [result, ...store.aiAnswers].slice(0, 160) })
    this.pushEvent('info', 'ai.question', `Enterprise AI answer generated for question: ${question.slice(0, 80)}`)
    this.logHistory('Knowledge AI question', question, 'validation', 'completed')
    return result
  }

  static async exportEnterpriseReport(format: 'pdf' | 'word' | 'excel' | 'csv' | 'markdown' | 'json' | 'printable', title: string, documentIds: string[]): Promise<void> {
    const selected = this.getStore().documents.filter((item) => documentIds.includes(item.id))
    const reportTitle = title.trim() || 'EDI report'

    if (format === 'json') {
      WorkspaceExchangeService.downloadJson(`${reportTitle}.json`, selected)
    }

    if (format === 'markdown') {
      const markdown = [`# ${reportTitle}`, '', `Generated at: ${nowIso()}`, '']
      for (const item of selected) {
        markdown.push(`## ${item.title}`)
        markdown.push(`- Type: ${item.documentType}`)
        markdown.push(`- Equipement: ${item.classification.equipement || 'n/a'}`)
        markdown.push(`- Fournisseur: ${item.classification.fournisseur || 'n/a'}`)
        markdown.push(`- Puissance: ${item.extraction.puissanceKw || 0} KW`)
        markdown.push(`- RPM: ${item.extraction.rpm || 0}`)
        markdown.push(`- Montant: ${item.extraction.montant || 0} ${item.extraction.devise || ''}`)
        markdown.push('')
      }
      WorkspaceExchangeService.downloadText(`${reportTitle}.md`, markdown.join('\n'), 'text/markdown;charset=utf-8')
    }

    if (format === 'csv' || format === 'excel') {
      const rows = [
        ['title', 'type', 'category', 'fournisseur', 'equipement', 'puissanceKw', 'rpm', 'numeroSerie', 'montant', 'devise', 'annee'],
        ...selected.map((item) => [
          item.title,
          item.documentType,
          item.category,
          item.classification.fournisseur,
          item.classification.equipement,
          String(item.extraction.puissanceKw),
          String(item.extraction.rpm),
          item.extraction.numeroSerie,
          String(item.extraction.montant),
          item.extraction.devise,
          item.classification.annee,
        ]),
      ]
      if (format === 'csv') {
        WorkspaceExchangeService.downloadCsv(`${reportTitle}.csv`, rows)
      } else {
        const tsv = rows.map((row) => row.join('\t')).join('\n')
        WorkspaceExchangeService.downloadText(`${reportTitle}.xlsx`, tsv, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      }
    }

    if (format === 'word') {
      const lines = [reportTitle, `Generated at: ${nowIso()}`, '']
      for (const item of selected) {
        lines.push(`${item.title} | ${item.documentType} | ${item.classification.fournisseur} | ${item.classification.equipement}`)
      }
      WorkspaceExchangeService.downloadText(`${reportTitle}.docx`, lines.join('\n'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    }

    if (format === 'printable') {
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${reportTitle}</title></head><body><h1>${reportTitle}</h1>${selected.map((item) => `<article><h2>${item.title}</h2><p>${item.description}</p></article>`).join('')}</body></html>`
      WorkspaceExchangeService.downloadText(`${reportTitle}.html`, html, 'text/html;charset=utf-8')
    }

    if (format === 'pdf') {
      await this.downloadPdf(selected)
    }

    const store = this.getStore()
    this.writeStorage({
      ...store,
      exports: [{ id: id('kexport'), format, documentIds: selected.map((item) => item.id), createdAt: nowIso() }, ...store.exports].slice(0, 160),
    })

    this.pushEvent('info', 'report.export', `Enterprise report exported in ${format}.`)
    this.logHistory('Knowledge report', format, 'publication', 'completed')
  }

  static reindexDocument(documentId: string): void {
    const store = this.getStore()
    const target = store.documents.find((item) => item.id === documentId)
    if (!target) return

    const indexed = {
      ...target,
      index: {
        ...target.index,
        status: 'indexed' as const,
        chunks: Math.max(1, Math.ceil(target.content.length / 400)),
        embeddingsPlaceholder: true,
        metadata: {
          ...target.index.metadata,
          summary: target.content.slice(0, 220),
          keywords: parseKeywords(target.title, target.content),
          score: Number((0.55 + Math.random() * 0.44).toFixed(2)),
          size: target.content.length,
          hash: hashOf(`${target.title}:${target.content}:${Date.now()}`),
        },
      },
      updatedAt: nowIso(),
    }

    this.writeStorage({
      ...store,
      documents: store.documents.map((item) => (item.id === documentId ? indexed : item)),
    })

    this.pushEvent('info', 'indexation.document', `Indexed ${indexed.title} (${indexed.index.chunks} chunks).`)
    this.pushDiagnostic()
    this.logHistory('Knowledge indexation', indexed.title, 'modification', 'completed')
  }

  static reindexAll(): void {
    for (const item of this.getStore().documents) {
      this.reindexDocument(item.id)
    }
  }

  static toggleFavorite(documentId: string): void {
    this.updateDocument(documentId, (item) => ({ ...item, favorite: !item.favorite }))
  }

  static setStatus(documentId: string, status: KnowledgeDocumentStatus): void {
    this.updateDocument(documentId, (item) => ({
      ...item,
      status,
      archived: status === 'archived',
      inTrash: status === 'trash',
    }))

    this.pushEvent(status === 'trash' ? 'warning' : 'info', 'document.status', `Document status changed to ${status}.`)
    this.logHistory('Knowledge status', status, status === 'validated' ? 'validation' : status === 'archived' ? 'archiving' : 'modification', 'completed')
  }

  static addTag(documentId: string, tag: string): void {
    const value = tag.trim()
    if (!value) return
    this.updateDocument(documentId, (item) => ({ ...item, tags: Array.from(new Set([...item.tags, value])) }))
  }

  static addComment(documentId: string, author: string, message: string): void {
    const value = message.trim()
    if (!value) return
    this.updateDocument(documentId, (item) => ({
      ...item,
      comments: [{ id: id('kcomment'), author, message: value, createdAt: nowIso() }, ...item.comments].slice(0, 120),
    }))
    this.logHistory('Knowledge comment', value.slice(0, 80), 'comment', 'completed')
  }

  static createVersion(documentId: string, label: string): void {
    this.updateDocument(documentId, (item) => ({
      ...item,
      versions: [
        {
          id: id('kver'),
          label: label.trim() || `v${item.versions.length + 1}`,
          content: item.content,
          createdAt: nowIso(),
        },
        ...item.versions,
      ].slice(0, 80),
      index: {
        ...item.index,
        metadata: {
          ...item.index.metadata,
          version: label.trim() || `v${item.versions.length + 1}`,
        },
      },
    }))
    this.logHistory('Knowledge version', label || 'version', 'version', 'completed')
  }

  static assignToCollection(documentId: string, collectionId: string): void {
    const store = this.getStore()
    this.writeStorage({
      ...store,
      documents: store.documents.map((item) => (
        item.id === documentId
          ? { ...item, collectionIds: Array.from(new Set([...item.collectionIds, collectionId])), updatedAt: nowIso() }
          : item
      )),
      collections: store.collections.map((collection) => (
        collection.id === collectionId
          ? { ...collection, documentIds: Array.from(new Set([...collection.documentIds, documentId])), updatedAt: nowIso() }
          : collection
      )),
    })
  }

  static buildRagContext(input: {
    documentIds: string[]
    collectionIds: string[]
    categories: string[]
    chunkCount: number
  }): KnowledgeRagRun {
    const store = this.getStore()
    const selectedById = store.documents.filter((item) => input.documentIds.includes(item.id))
    const selectedByCollection = store.documents.filter((item) => item.collectionIds.some((idValue) => input.collectionIds.includes(idValue)))
    const selectedByCategory = store.documents.filter((item) => input.categories.includes(item.category))
    const selected = Array.from(new Map([...selectedById, ...selectedByCollection, ...selectedByCategory].map((item) => [item.id, item])).values())

    const chunkCount = Math.max(1, input.chunkCount)
    const references = selected
      .map((item) => ({
        documentId: item.id,
        title: item.title,
        score: Number((item.index.metadata.score + Math.random() * 0.1).toFixed(2)),
        source: item.source,
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, chunkCount)

    const contextPreview = references
      .map((ref) => {
        const item = selected.find((candidate) => candidate.id === ref.documentId)
        return `${ref.title} (score ${ref.score})\n${item?.content.slice(0, 240) ?? ''}`
      })
      .join('\n\n---\n\n')

    const run: KnowledgeRagRun = {
      id: id('krag'),
      documentIds: selected.map((item) => item.id),
      collectionIds: input.collectionIds,
      categories: input.categories,
      chunkCount,
      contextPreview,
      references,
      createdAt: nowIso(),
    }

    this.writeStorage({ ...store, ragRuns: [run, ...store.ragRuns].slice(0, 80) })
    this.pushEvent('info', 'rag.preview', `RAG context prepared with ${run.references.length} references.`)
    this.logHistory('Knowledge RAG', `chunks:${run.chunkCount}`, 'validation', 'completed')
    return run
  }

  static connectToGenerate(documentIds: string[]): void {
    const selected = this.getStore().documents.filter((item) => documentIds.includes(item.id))
    const context = selected.map((item) => `- ${item.title}: ${item.content.slice(0, 180)}`).join('\n')
    const draft = GenerateWorkspaceService.getDraft()

    GenerateWorkspaceService.saveDraft({
      ...draft,
      promptName: draft.promptName || 'Knowledge Context Prompt',
      promptContent: `${draft.promptContent}\n\nKnowledge context:\n${context}`.trim(),
      selectedTemplateId: draft.selectedTemplateId,
      selectedPromptId: draft.selectedPromptId,
      variables: draft.variables,
    })

    this.pushEvent('info', 'integration.generate', `Context sent to Generate (${selected.length} docs).`)
    this.logHistory('Knowledge integration', 'generate', 'modification', 'completed')
  }

  static connectToConversation(documentIds: string[]): void {
    const selected = this.getStore().documents.filter((item) => documentIds.includes(item.id))
    const conversation = ConversationWorkspaceService.createConversation({ title: 'Knowledge Context Session' })
    const context = selected.map((item) => `- ${item.title}: ${item.content.slice(0, 180)}`).join('\n')
    ConversationWorkspaceService.setDraft(conversation.id, `Use this shared knowledge context:\n${context}`)

    this.pushEvent('info', 'integration.conversation', `Context prepared in Conversation (${selected.length} docs).`)
    this.logHistory('Knowledge integration', 'conversation', 'modification', 'completed')
  }

  static registerIntegration(target: string): void {
    this.pushEvent('info', 'integration.workspace', `Knowledge workspace linked to ${target}.`)
    this.logHistory('Knowledge integration', target, 'modification', 'completed')
  }

  static performSearch(filters: KnowledgeFilters): {
    documents: KnowledgeDocumentRecord[]
    suggestions: string[]
    similar: KnowledgeDocumentRecord[]
  } {
    const documents = this.filterDocuments(filters)
    const suggestions = this.listTags().filter((item) => item.includes(filters.search.toLowerCase())).slice(0, 6)

    const basis = documents.at(0)
    const similar = basis
      ? this.getStore().documents
        .filter((item) => item.id !== basis.id && item.tags.some((tag) => basis.tags.includes(tag)))
        .slice(0, 6)
      : []

    const store = this.getStore()
    const query = filters.search || [filters.category, filters.tag, filters.author].filter(Boolean).join(' ')
    const search: KnowledgeSearchRecord = {
      id: id('ksearch'),
      query,
      filters: JSON.stringify(filters),
      resultCount: documents.length,
      createdAt: nowIso(),
      semanticUi: filters.semanticUi,
    }
    this.writeStorage({ ...store, searches: [search, ...store.searches].slice(0, 120) })

    this.pushEvent('info', 'search.executed', `Search returned ${documents.length} document(s).`)
    this.logHistory('Knowledge search', query || 'empty-query', 'validation', 'completed')
    return { documents, suggestions, similar }
  }

  static async exportDocuments(format: KnowledgeExportType, documentIds: string[]): Promise<void> {
    const selected = this.getStore().documents.filter((item) => documentIds.includes(item.id))
    if (selected.length === 0) return

    if (format === 'json') {
      WorkspaceExchangeService.downloadJson('srg-knowledge-export.json', selected)
    }

    if (format === 'csv') {
      const rows = [
        ['id', 'title', 'type', 'category', 'status', 'score', 'updatedAt', 'source'],
        ...selected.map((item) => [
          item.id,
          item.title,
          item.documentType,
          item.category,
          item.status,
          String(item.index.metadata.score),
          item.updatedAt,
          item.source,
        ]),
      ]
      WorkspaceExchangeService.downloadCsv('srg-knowledge-export.csv', rows)
    }

    if (format === 'markdown') {
      const body = selected
        .map((item) => `# ${item.title}\n\nType: ${item.documentType}\nCategory: ${item.category}\nTags: ${item.tags.join(', ')}\n\n${item.content}`)
        .join('\n\n---\n\n')
      WorkspaceExchangeService.downloadText('srg-knowledge-export.md', body, 'text/markdown;charset=utf-8')
    }

    if (format === 'word') {
      const lines = selected.map((item) => `${item.title} | ${item.documentType} | ${item.category} | score ${item.index.metadata.score}`)
      WorkspaceExchangeService.downloadText('srg-knowledge-export.docx', lines.join('\n'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    }

    if (format === 'excel') {
      const rows = [
        ['title', 'type', 'category', 'status', 'score', 'updatedAt'],
        ...selected.map((item) => [item.title, item.documentType, item.category, item.status, String(item.index.metadata.score), item.updatedAt]),
      ]
      const tsv = rows.map((row) => row.join('\t')).join('\n')
      WorkspaceExchangeService.downloadText('srg-knowledge-export.xlsx', tsv, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    }

    if (format === 'printable') {
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>SRG Knowledge Export</title></head><body><h1>SRG Knowledge Export</h1>${selected.map((item) => `<article><h2>${item.title}</h2><p>${item.description}</p></article>`).join('')}</body></html>`
      WorkspaceExchangeService.downloadText('srg-knowledge-export.html', html, 'text/html;charset=utf-8')
    }

    if (format === 'zip') {
      const pseudoZip = {
        note: 'Application-layer ZIP placeholder bundle.',
        createdAt: nowIso(),
        documents: selected,
      }
      WorkspaceExchangeService.downloadText('srg-knowledge-export.zip', JSON.stringify(pseudoZip, null, 2), 'application/zip')
    }

    if (format === 'pdf') {
      await this.downloadPdf(selected)
    }

    const store = this.getStore()
    this.writeStorage({
      ...store,
      exports: [{ id: id('kexport'), format, documentIds: selected.map((item) => item.id), createdAt: nowIso() }, ...store.exports].slice(0, 120),
    })

    this.pushEvent('info', 'export.done', `Exported ${selected.length} document(s) as ${format}.`)
    this.pushDiagnostic()
    this.logHistory('Knowledge export', format, 'publication', 'completed')
  }

  static getSummary() {
    const store = this.getStore()
    const documents = store.documents
    const collections = store.collections
    const favorites = documents.filter((item) => item.favorite)
    const indexed = documents.filter((item) => item.index.status === 'indexed')
    const volume = documents.reduce((sum, item) => sum + item.index.metadata.size, 0)

    const topCategories = Array.from(
      documents.reduce((acc, item) => acc.set(item.category, (acc.get(item.category) ?? 0) + 1), new Map<string, number>()).entries(),
    )
      .map(([category, count]) => ({ category, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6)

    const topTags = Array.from(
      documents.flatMap((item) => item.tags).reduce((acc, tag) => acc.set(tag, (acc.get(tag) ?? 0) + 1), new Map<string, number>()).entries(),
    )
      .map(([tag, count]) => ({ tag, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 8)

    const archiveTypes = ['zip', 'rar', '7z'] as const
    const byArchiveType = archiveTypes.map((type) => ({
      type,
      count: store.decompressions.filter((item) => item.archiveType === type).length,
    }))

    const byDocumentType = Array.from(
      documents.reduce((acc, item) => acc.set(item.documentType, (acc.get(item.documentType) ?? 0) + 1), new Map<string, number>()).entries(),
    )
      .map(([type, count]) => ({ type, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 12)

    const topFournisseurs = Array.from(
      documents
        .filter((item) => item.classification.fournisseur)
        .reduce((acc, item) => acc.set(item.classification.fournisseur, (acc.get(item.classification.fournisseur) ?? 0) + 1), new Map<string, number>())
        .entries(),
    )
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 8)

    const topChantiers = Array.from(
      documents
        .filter((item) => item.classification.chantier)
        .reduce((acc, item) => acc.set(item.classification.chantier, (acc.get(item.classification.chantier) ?? 0) + 1), new Map<string, number>())
        .entries(),
    )
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 8)

    return {
      documents: documents.length,
      collections: collections.length,
      imports: store.imports.length,
      indexations: indexed.length,
      favorites: favorites.length,
      lastImports: store.imports.slice(0, 8),
      topCategories,
      topTags,
      volume,
      timeline: store.events.slice(0, 20),
      diagnostics: store.diagnostics.slice(0, 20),
      importHistory: store.imports.slice(0, 20),
      deletionHistory: documents.filter((item) => item.status === 'trash').slice(0, 20),
      indexationHistory: documents.filter((item) => item.index.status === 'indexed').slice(0, 20),
      searchHistory: store.searches.slice(0, 20),
      consultationHistory: documents.slice(0, 20),
      exportHistory: store.exports.slice(0, 20),
      ragHistory: store.ragRuns.slice(0, 20),
      charts: {
        imports: store.imports.slice(0, 12).map((item) => item.documentIds.length),
        indexations: documents.slice(0, 12).map((item) => item.index.chunks),
        searches: store.searches.slice(0, 12).map((item) => item.resultCount),
        volume: documents.slice(0, 12).map((item) => item.index.metadata.size),
        latency: store.diagnostics.slice(0, 12).map((item) => item.latencyMs),
      },
      edi: {
        decompressions: store.decompressions.length,
        ocrQueued: store.ocrQueue.filter((item) => item.status === 'queued' || item.status === 'running').length,
        ocrCompleted: store.ocrQueue.filter((item) => item.status === 'completed').length,
        enterpriseAnswers: store.aiAnswers.length,
        reports: store.exports.length,
        byArchiveType,
        byDocumentType,
        topFournisseurs,
        topChantiers,
      },
    }
  }

  private static updateDocument(documentId: string, updater: (doc: KnowledgeDocumentRecord) => KnowledgeDocumentRecord): void {
    const store = this.getStore()
    this.writeStorage({
      ...store,
      documents: store.documents.map((item) => (item.id === documentId ? { ...updater(item), updatedAt: nowIso() } : item)),
    })
  }

  private static recordImport(type: KnowledgeImportType, source: string, documents: KnowledgeDocumentRecord[], durationMs: number): void {
    const store = this.getStore()
    const record: KnowledgeImportRecord = {
      id: id('kimport'),
      type,
      source,
      documentIds: documents.map((item) => item.id),
      createdAt: nowIso(),
      durationMs,
      volume: documents.reduce((sum, item) => sum + item.index.metadata.size, 0),
    }

    this.writeStorage({ ...store, imports: [record, ...store.imports].slice(0, 120) })
    this.pushEvent('info', 'import.done', `Imported ${documents.length} document(s) via ${type}.`)
    this.pushDiagnostic()
  }

  private static suggestCategory(type: KnowledgeDocumentType, title: string): string {
    if (type === 'faq') return 'faq'
    if (type === 'guide') return 'guides'
    if (type === 'documentation') return 'documentation'
    if (title.toLowerCase().includes('faq')) return 'faq'
    if (title.toLowerCase().includes('guide')) return 'guides'
    if (type === 'web-link') return 'web'
    return type
  }

  private static mapImportTypeToDocumentType(type: KnowledgeImportType): KnowledgeDocumentType {
    if (type === 'markdown') return 'markdown'
    if (type === 'pdf') return 'pdf'
    if (type === 'doc') return 'doc'
    if (type === 'csv') return 'csv'
    if (type === 'json') return 'json'
    if (type === 'docx') return 'docx'
    if (type === 'xls') return 'xls'
    if (type === 'xlsx') return 'xlsx'
    if (type === 'html') return 'html'
    if (type === 'images') return 'image'
    if (type === 'audio') return 'audio'
    if (type === 'video') return 'video'
    if (type === 'emails') return 'email-export'
    if (type === 'technical-plans') return 'technical-plan'
    if (type === 'scans') return 'scan'
    if (type === 'invoices') return 'invoice'
    if (type === 'delivery-notes') return 'delivery-note'
    if (type === 'receipt-notes') return 'receipt-note'
    if (type === 'photos') return 'photo'
    if (type === 'reports') return 'report'
    if (type === 'url') return 'web-link'
    if (type === 'github') return 'documentation'
    if (type === 'zip' || type === 'rar' || type === '7z') return 'documentation'
    return 'documentation'
  }

  private static pushEvent(level: 'info' | 'warning' | 'error', type: string, message: string): void {
    const store = this.getStore()
    this.writeStorage({
      ...store,
      events: [{ id: id('kevent'), at: nowIso(), level, type, message }, ...store.events].slice(0, 220),
    })
  }

  private static pushDiagnostic(): void {
    const store = this.getStore()
    const diagnostic: KnowledgeDiagnostic = {
      id: id('kdiag'),
      at: nowIso(),
      latencyMs: Math.max(20, Math.round(Math.random() * 180)),
      volume: store.documents.reduce((sum, item) => sum + item.index.metadata.size, 0),
      documents: store.documents.length,
      imports: store.imports.length,
      indexations: store.documents.filter((item) => item.index.status === 'indexed').length,
      searches: store.searches.length,
      exports: store.exports.length,
    }
    this.writeStorage({ ...store, diagnostics: [diagnostic, ...store.diagnostics].slice(0, 220) })
  }

  private static logHistory(promptName: string, payload: string, eventType: 'creation' | 'modification' | 'validation' | 'publication' | 'archiving' | 'comment' | 'version', status: 'completed' | 'failed'): void {
    HistoryWorkspaceService.addRecord({
      id: id('khistory'),
      promptName,
      promptText: payload,
      output: payload,
      provider: 'workspace',
      model: 'knowledge',
      status,
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      eventType,
      actorName: 'Knowledge Workspace',
    })
  }

  private static async downloadPdf(documents: KnowledgeDocumentRecord[]): Promise<void> {
    if (typeof window === 'undefined') return

    const doc = await PDFDocument.create()
    const bold = await doc.embedFont(StandardFonts.HelveticaBold)
    const regular = await doc.embedFont(StandardFonts.Helvetica)

    for (const item of documents) {
      const page = doc.addPage([595.28, 841.89])
      page.drawText(item.title, { x: 40, y: 800, size: 16, font: bold })
      page.drawText(`Type: ${item.documentType} | Category: ${item.category} | Score: ${item.index.metadata.score}`, { x: 40, y: 780, size: 10, font: regular })
      const text = item.content.slice(0, 2300)
      const lines = text.match(/.{1,92}(\s|$)/g) ?? [text]
      let y = 760
      for (const line of lines) {
        if (y < 60) break
        page.drawText(line.trim(), { x: 40, y, size: 9, font: regular })
        y -= 12
      }
    }

    const bytes = await doc.save()
    const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'srg-knowledge-export.pdf'
    anchor.click()
    window.URL.revokeObjectURL(url)
  }

  private static readStorage(): KnowledgeWorkspaceStore {
    if (typeof window === 'undefined') {
      return this.memoryStore
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const seed = defaultStore()
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
        return seed
      }
      const parsed = JSON.parse(raw) as Partial<KnowledgeWorkspaceStore>
      if (!Array.isArray(parsed.documents) || !Array.isArray(parsed.collections)) {
        return defaultStore()
      }

      const now = nowIso()
      const normalizedDocuments = parsed.documents.map((item) => {
        const doc = item as Partial<KnowledgeDocumentRecord>
        const keywords = Array.isArray(doc.index?.metadata.keywords) ? doc.index.metadata.keywords : []
        const fallbackDate = typeof doc.createdAt === 'string' ? doc.createdAt : now
        const fallbackUpdatedAt = typeof doc.updatedAt === 'string' ? doc.updatedAt : fallbackDate
        const fallbackType = doc.documentType ?? 'documentation'
        const fallbackCategory = typeof doc.category === 'string' ? doc.category : 'documentation'
        const fallbackTags = Array.isArray(doc.tags) ? doc.tags : []
        const fallbackCollection = Array.isArray(doc.collectionIds) ? doc.collectionIds : []

        return {
          ...(doc as KnowledgeDocumentRecord),
          title: typeof doc.title === 'string' ? doc.title : 'Untitled',
          description: typeof doc.description === 'string' ? doc.description : '',
          content: typeof doc.content === 'string' ? doc.content : '',
          documentType: fallbackType,
          category: fallbackCategory,
          tags: fallbackTags,
          sourcePath: typeof doc.sourcePath === 'string' ? doc.sourcePath : doc.source ?? 'unknown',
          originalName: typeof doc.originalName === 'string' ? doc.originalName : doc.title ?? 'Untitled',
          sourceCreatedAt: typeof doc.sourceCreatedAt === 'string' ? doc.sourceCreatedAt : fallbackDate,
          sourceModifiedAt: typeof doc.sourceModifiedAt === 'string' ? doc.sourceModifiedAt : fallbackUpdatedAt,
          relatedDocumentIds: Array.isArray(doc.relatedDocumentIds) ? doc.relatedDocumentIds : [],
          createdAt: fallbackDate,
          updatedAt: fallbackUpdatedAt,
          collectionIds: fallbackCollection,
          ocr: {
            status: doc.ocr?.status ?? 'pending',
            progress: typeof doc.ocr?.progress === 'number' ? doc.ocr.progress : 0,
            language: typeof doc.ocr?.language === 'string' ? doc.ocr.language : 'fr',
            confidence: typeof doc.ocr?.confidence === 'number' ? doc.ocr.confidence : 0,
            queuePosition: typeof doc.ocr?.queuePosition === 'number' ? doc.ocr.queuePosition : 0,
            diagnostics: typeof doc.ocr?.diagnostics === 'string' ? doc.ocr.diagnostics : 'OCR engine not connected (app-layer placeholder).',
            preview: typeof doc.ocr?.preview === 'string' ? doc.ocr.preview : '',
          },
          extraction: {
            entreprise: doc.extraction?.entreprise ?? '',
            client: doc.extraction?.client ?? '',
            fournisseur: doc.extraction?.fournisseur ?? '',
            projet: doc.extraction?.projet ?? '',
            site: doc.extraction?.site ?? '',
            machine: doc.extraction?.machine ?? '',
            equipement: doc.extraction?.equipement ?? '',
            reference: doc.extraction?.reference ?? '',
            marque: doc.extraction?.marque ?? '',
            modele: doc.extraction?.modele ?? '',
            puissanceKw: typeof doc.extraction?.puissanceKw === 'number' ? doc.extraction.puissanceKw : 0,
            rpm: typeof doc.extraction?.rpm === 'number' ? doc.extraction.rpm : 0,
            numeroSerie: doc.extraction?.numeroSerie ?? '',
            date: doc.extraction?.date ?? fallbackDate,
            auteur: doc.extraction?.auteur ?? doc.index?.metadata.author ?? 'System',
            technicien: doc.extraction?.technicien ?? '',
            montant: typeof doc.extraction?.montant === 'number' ? doc.extraction.montant : 0,
            devise: doc.extraction?.devise ?? '',
            documentsLies: Array.isArray(doc.extraction?.documentsLies) ? doc.extraction.documentsLies : [],
            motsCles: Array.isArray(doc.extraction?.motsCles) ? doc.extraction.motsCles : keywords,
            resume: doc.extraction?.resume ?? doc.index?.metadata.summary ?? '',
            categorie: doc.extraction?.categorie ?? fallbackCategory,
            tags: Array.isArray(doc.extraction?.tags) ? doc.extraction.tags : fallbackTags,
            version: doc.extraction?.version ?? doc.index?.metadata.version ?? '1.0.0',
          },
          classification: {
            category: doc.classification?.category ?? fallbackCategory,
            subCategory: doc.classification?.subCategory ?? fallbackType,
            collection: doc.classification?.collection ?? (fallbackCollection[0] ?? 'default'),
            famille: doc.classification?.famille ?? fallbackType,
            equipement: doc.classification?.equipement ?? '',
            client: doc.classification?.client ?? '',
            fournisseur: doc.classification?.fournisseur ?? '',
            site: doc.classification?.site ?? '',
            annee: doc.classification?.annee ?? new Date(fallbackDate).getFullYear().toString(),
            projet: doc.classification?.projet ?? '',
            chantier: doc.classification?.chantier ?? '',
            service: doc.classification?.service ?? '',
            departement: doc.classification?.departement ?? '',
          },
        }
      })

      return {
        ...defaultStore(),
        ...parsed,
        documents: normalizedDocuments,
        collections: parsed.collections,
        events: Array.isArray(parsed.events) ? parsed.events : [],
        diagnostics: Array.isArray(parsed.diagnostics) ? parsed.diagnostics : [],
        imports: Array.isArray(parsed.imports) ? parsed.imports : [],
        decompressions: Array.isArray(parsed.decompressions) ? parsed.decompressions : [],
        ocrQueue: Array.isArray(parsed.ocrQueue) ? parsed.ocrQueue : [],
        searches: Array.isArray(parsed.searches) ? parsed.searches : [],
        exports: Array.isArray(parsed.exports) ? parsed.exports : [],
        ragRuns: Array.isArray(parsed.ragRuns) ? parsed.ragRuns : [],
        aiAnswers: Array.isArray(parsed.aiAnswers) ? parsed.aiAnswers : [],
      }
    } catch {
      return defaultStore()
    }
  }

  private static writeStorage(store: KnowledgeWorkspaceStore): void {
    this.memoryStore = store
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }
}
