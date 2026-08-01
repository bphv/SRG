import { PDFDocument, StandardFonts } from 'pdf-lib'
import { ConversationWorkspaceService } from '#/app/services/ConversationWorkspaceService'
import { GenerateWorkspaceService } from '#/app/services/GenerateWorkspaceService'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export type KnowledgeDocumentType =
  | 'markdown'
  | 'txt'
  | 'pdf'
  | 'docx'
  | 'csv'
  | 'json'
  | 'xml'
  | 'html'
  | 'image'
  | 'audio'
  | 'video'
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
  | 'zip'
  | 'url'
  | 'github'
  | 'markdown'
  | 'pdf'
  | 'csv'
  | 'json'
  | 'docx'
  | 'html'
  | 'images'
  | 'audio'
  | 'video'

export type KnowledgeExportType = 'markdown' | 'pdf' | 'json' | 'csv' | 'zip'

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
  createdAt: string
  updatedAt: string
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
  searches: KnowledgeSearchRecord[]
  exports: KnowledgeExportRecord[]
  ragRuns: KnowledgeRagRun[]
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
  if (lower.endsWith('.docx')) return 'docx'
  if (lower.endsWith('.csv')) return 'csv'
  if (lower.endsWith('.json')) return 'json'
  if (lower.endsWith('.xml')) return 'xml'
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html'
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(lower)) return 'image'
  if (/\.(mp3|wav|ogg|m4a)$/.test(lower)) return 'audio'
  if (/\.(mp4|mov|avi|mkv|webm)$/.test(lower)) return 'video'
  return 'documentation'
}

function fromMimeType(mimeType: string): KnowledgeDocumentType | undefined {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('json')) return 'json'
  if (mimeType.includes('csv')) return 'csv'
  if (mimeType.includes('xml')) return 'xml'
  if (mimeType.includes('html')) return 'html'
  if (mimeType.includes('markdown')) return 'markdown'
  if (mimeType.includes('plain')) return 'txt'
  return undefined
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
    createdAt,
    updatedAt: createdAt,
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

  const now = nowIso()
  return {
    documents: [architecture, faq, markdown],
    collections: [
      {
        id: 'kcol-core',
        name: 'Core Knowledge',
        description: 'Cross-workspace documentation.',
        documentIds: [architecture.id, markdown.id],
        favorite: true,
        archived: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'kcol-rag',
        name: 'RAG Recipes',
        description: 'Retrieval patterns and context templates.',
        documentIds: [faq.id],
        favorite: false,
        archived: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
    events: [],
    diagnostics: [],
    imports: [],
    searches: [],
    exports: [],
    ragRuns: [],
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
    if (type === 'csv') return 'csv'
    if (type === 'json') return 'json'
    if (type === 'docx') return 'docx'
    if (type === 'html') return 'html'
    if (type === 'images') return 'image'
    if (type === 'audio') return 'audio'
    if (type === 'video') return 'video'
    if (type === 'url') return 'web-link'
    if (type === 'github') return 'documentation'
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
      return {
        ...defaultStore(),
        ...parsed,
        documents: parsed.documents,
        collections: parsed.collections,
        events: Array.isArray(parsed.events) ? parsed.events : [],
        diagnostics: Array.isArray(parsed.diagnostics) ? parsed.diagnostics : [],
        imports: Array.isArray(parsed.imports) ? parsed.imports : [],
        searches: Array.isArray(parsed.searches) ? parsed.searches : [],
        exports: Array.isArray(parsed.exports) ? parsed.exports : [],
        ragRuns: Array.isArray(parsed.ragRuns) ? parsed.ragRuns : [],
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
