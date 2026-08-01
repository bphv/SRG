import { notificationService } from '#/app/services/NotificationService'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'
import type { KnowledgeAiAnswer, KnowledgeDocumentRecord } from '#/app/services/KnowledgeWorkspaceService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export type DocumentConfidentiality = 'public' | 'internal' | 'restricted' | 'confidential'

export type KnowledgeIntelligenceDocument = {
  id: string
  title: string
  type: string
  category: string
  themes: string[]
  keywords: string[]
  summary: string
  language: string
  date: string
  version: string
  author: string
  service: string
  confidentiality: DocumentConfidentiality
  project: string
  supplier: string
  equipment: string
  status: string
  updatedAt: string
  isCritical: boolean
  isExpired: boolean
}

export type KnowledgeRelationType =
  | 'references'
  | 'depends-on'
  | 'cites'
  | 'version-of'
  | 'linked-workflow'
  | 'linked-project'
  | 'linked-equipment'
  | 'linked-supplier'

export type KnowledgeRelation = {
  id: string
  fromId: string
  toId: string
  type: KnowledgeRelationType
  reason: string
}

export type KnowledgeGraphNode = {
  id: string
  label: string
  type: 'document' | 'project' | 'equipment' | 'supplier' | 'client' | 'employee' | 'workflow'
}

export type KnowledgeGraphEdge = {
  id: string
  from: string
  to: string
  relation: string
}

export type KnowledgeQuestionResult = {
  id: string
  question: string
  answer: string
  confidence: number
  sources: Array<{
    documentId: string
    title: string
    paragraphs: string[]
    date: string
    author: string
  }>
  createdAt: string
}

export type KnowledgeComparisonResult = {
  id: string
  leftId: string
  rightId: string
  leftTitle: string
  rightTitle: string
  added: string[]
  removed: string[]
  modified: string[]
  createdAt: string
}

export type KnowledgeTimelineItem = {
  id: string
  type: 'document' | 'version' | 'revision' | 'archive' | 'query'
  title: string
  detail: string
  createdAt: string
}

export type KnowledgeIntelligenceMetrics = {
  totalDocuments: number
  recentDocuments: number
  criticalDocuments: number
  expiredDocuments: number
  linkedToWorkflows: number
  documentQueries: number
  answersGenerated: number
}

export type KnowledgeIntelligenceStore = {
  questionHistory: KnowledgeQuestionResult[]
  comparisons: KnowledgeComparisonResult[]
  timeline: KnowledgeTimelineItem[]
  events: Array<{
    id: string
    type: 'knowledge-event' | 'knowledge-metric' | 'document-query'
    title: string
    detail: string
    createdAt: string
  }>
  metricsHistory: Array<{
    date: string
    totalDocuments: number
    criticalDocuments: number
    expiredDocuments: number
    queries: number
    answers: number
  }>
  seenDocumentIds: string[]
  seenVersionKeys: string[]
}

const STORAGE_KEY = 'srg.knowledge.intelligence.workspace.v1'

function nowIso(): string {
  return new Date().toISOString()
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function dayKey(dateValue: string = nowIso()): string {
  return dateValue.slice(0, 10)
}

function toNumberDate(value: string): number {
  const time = Date.parse(value)
  return Number.isNaN(time) ? 0 : time
}

function ageInDays(value: string): number {
  const timestamp = toNumberDate(value)
  if (timestamp <= 0) return 0
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24))
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/g)
    .map((line) => line.trim())
    .filter(Boolean)
}

function normalize(text: string): string {
  return text.trim().toLowerCase()
}

function detectConfidentiality(document: KnowledgeDocumentRecord): DocumentConfidentiality {
  const haystack = `${document.title} ${document.description} ${document.content} ${document.classification.category} ${document.classification.service}`.toLowerCase()
  if (haystack.includes('salary') || haystack.includes('payroll') || haystack.includes('confidentiel')) return 'confidential'
  if (haystack.includes('contract') || haystack.includes('contrat') || haystack.includes('invoice') || haystack.includes('facture')) return 'restricted'
  if (document.classification.service && document.classification.service.toLowerCase() !== 'general') return 'internal'
  return 'public'
}

function detectThemes(document: KnowledgeDocumentRecord): string[] {
  const tags = document.tags.map((tag) => normalize(tag))
  const words = `${document.title} ${document.description} ${document.extraction.resume}`.toLowerCase()
  const themes = new Set<string>()

  if (words.includes('maintenance') || tags.includes('maintenance')) themes.add('maintenance')
  if (words.includes('finance') || words.includes('invoice') || tags.includes('finance')) themes.add('finance')
  if (words.includes('procurement') || words.includes('supplier') || tags.includes('procurement')) themes.add('procurement')
  if (words.includes('project') || words.includes('chantier') || tags.includes('project')) themes.add('projects')
  if (words.includes('workflow') || tags.includes('workflow')) themes.add('workflow')
  if (themes.size === 0) themes.add(document.category.toLowerCase())

  return Array.from(themes)
}

function compareText(left: string, right: string): { added: string[]; removed: string[]; modified: string[] } {
  const leftLines = left.split('\n').map((line) => line.trim()).filter(Boolean)
  const rightLines = right.split('\n').map((line) => line.trim()).filter(Boolean)

  const leftSet = new Set(leftLines)
  const rightSet = new Set(rightLines)

  const added = rightLines.filter((line) => !leftSet.has(line)).slice(0, 24)
  const removed = leftLines.filter((line) => !rightSet.has(line)).slice(0, 24)

  const modified: string[] = []
  const pivot = Math.min(leftLines.length, rightLines.length)
  for (let index = 0; index < pivot; index += 1) {
    const leftLine = leftLines[index]
    const rightLine = rightLines[index]
    if (leftLine === rightLine) continue
    if (leftLine.length < 10 || rightLine.length < 10) continue
    if (normalize(leftLine).slice(0, 24) === normalize(rightLine).slice(0, 24)) {
      modified.push(`${leftLine} -> ${rightLine}`)
    }
    if (modified.length >= 20) break
  }

  return { added, removed, modified }
}

export class KnowledgeIntelligenceWorkspaceService {
  private static memoryStore: KnowledgeIntelligenceStore = {
    questionHistory: [],
    comparisons: [],
    timeline: [],
    events: [],
    metricsHistory: [],
    seenDocumentIds: [],
    seenVersionKeys: [],
  }

  static getStore(): KnowledgeIntelligenceStore {
    if (typeof window === 'undefined') return this.memoryStore

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const seed = this.memoryStore
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
        return seed
      }

      const parsed = JSON.parse(raw) as Partial<KnowledgeIntelligenceStore>
      return {
        questionHistory: Array.isArray(parsed.questionHistory) ? parsed.questionHistory : [],
        comparisons: Array.isArray(parsed.comparisons) ? parsed.comparisons : [],
        timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
        events: Array.isArray(parsed.events) ? parsed.events : [],
        metricsHistory: Array.isArray(parsed.metricsHistory) ? parsed.metricsHistory : [],
        seenDocumentIds: Array.isArray(parsed.seenDocumentIds) ? parsed.seenDocumentIds : [],
        seenVersionKeys: Array.isArray(parsed.seenVersionKeys) ? parsed.seenVersionKeys : [],
      }
    } catch {
      return this.memoryStore
    }
  }

  private static persist(store: KnowledgeIntelligenceStore): void {
    this.memoryStore = store
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }

  static getIntelligenceDocuments(): KnowledgeIntelligenceDocument[] {
    const documents = KnowledgeWorkspaceService.getStore().documents

    return documents.map((document) => {
      const updatedAgeDays = ageInDays(document.updatedAt)
      const metadataDate = document.index.metadata.date || document.updatedAt
      const isExpiredType = document.documentType === 'invoice' || document.documentType === 'delivery-note' || document.documentType === 'receipt-note' || document.documentType === 'report' || document.documentType === 'technical-plan'
      const isExpired = isExpiredType && updatedAgeDays > 365
      const isCritical = document.status !== 'validated' || document.ocr.status === 'failed' || document.index.status === 'failed' || document.index.metadata.score < 65

      return {
        id: document.id,
        title: document.title,
        type: document.documentType,
        category: document.classification.category || document.category,
        themes: detectThemes(document),
        keywords: document.index.metadata.keywords,
        summary: document.index.metadata.summary || document.extraction.resume || document.description,
        language: document.index.metadata.language || document.ocr.language || 'unknown',
        date: metadataDate,
        version: document.index.metadata.version || document.extraction.version || '1.0.0',
        author: document.index.metadata.author || document.extraction.auteur || 'unknown',
        service: document.classification.service || 'general',
        confidentiality: detectConfidentiality(document),
        project: document.classification.projet || document.extraction.projet || 'n/a',
        supplier: document.classification.fournisseur || document.extraction.fournisseur || 'n/a',
        equipment: document.classification.equipement || document.extraction.equipement || 'n/a',
        status: document.status,
        updatedAt: document.updatedAt,
        isCritical,
        isExpired,
      }
    })
  }

  static getDashboardSummary() {
    const docs = this.getIntelligenceDocuments()
    const recentDocuments = docs.filter((item) => ageInDays(item.updatedAt) <= 14).length
    const criticalDocuments = docs.filter((item) => item.isCritical).length
    const expiredDocuments = docs.filter((item) => item.isExpired).length

    const workflowLinked = docs.filter((item) => item.themes.includes('workflow') || item.type === 'procedure' || item.type === 'documentation').length

    const topConsulted = this.getMostConsultedDocuments().slice(0, 8)

    return {
      totalDocuments: docs.length,
      recentDocuments,
      criticalDocuments,
      expiredDocuments,
      mostConsultedDocuments: topConsulted,
      linkedToWorkflows: workflowLinked,
      documentMetrics: {
        public: docs.filter((item) => item.confidentiality === 'public').length,
        internal: docs.filter((item) => item.confidentiality === 'internal').length,
        restricted: docs.filter((item) => item.confidentiality === 'restricted').length,
        confidential: docs.filter((item) => item.confidentiality === 'confidential').length,
      },
    }
  }

  static buildRelations(): KnowledgeRelation[] {
    const store = KnowledgeWorkspaceService.getStore()
    const docs = store.documents
    const relations: KnowledgeRelation[] = []

    docs.forEach((document) => {
      document.relatedDocumentIds.forEach((relatedId) => {
        relations.push({
          id: id('rel'),
          fromId: document.id,
          toId: relatedId,
          type: 'references',
          reason: 'relatedDocumentIds link',
        })
      })

      const dependencies = document.extraction.documentsLies
      dependencies.forEach((reference) => {
        const target = docs.find((item) => item.title.toLowerCase().includes(reference.toLowerCase()) || item.originalName.toLowerCase().includes(reference.toLowerCase()))
        if (!target) return
        relations.push({
          id: id('rel'),
          fromId: document.id,
          toId: target.id,
          type: 'depends-on',
          reason: `Declared dependency: ${reference}`,
        })
      })

      if (document.classification.projet) {
        relations.push({
          id: id('rel'),
          fromId: document.id,
          toId: `project:${document.classification.projet}`,
          type: 'linked-project',
          reason: 'Project classification match',
        })
      }

      if (document.classification.equipement || document.extraction.equipement) {
        relations.push({
          id: id('rel'),
          fromId: document.id,
          toId: `equipment:${document.classification.equipement || document.extraction.equipement}`,
          type: 'linked-equipment',
          reason: 'Equipment extraction/classification match',
        })
      }

      if (document.classification.fournisseur || document.extraction.fournisseur) {
        relations.push({
          id: id('rel'),
          fromId: document.id,
          toId: `supplier:${document.classification.fournisseur || document.extraction.fournisseur}`,
          type: 'linked-supplier',
          reason: 'Supplier extraction/classification match',
        })
      }

      if (document.versions.length > 1) {
        for (let index = 0; index < document.versions.length - 1; index += 1) {
          const left = document.versions[index]
          const right = document.versions[index + 1]
          relations.push({
            id: id('rel'),
            fromId: `${document.id}:version:${left.id}`,
            toId: `${document.id}:version:${right.id}`,
            type: 'version-of',
            reason: `${left.label} -> ${right.label}`,
          })
        }
      }

      const content = document.content.toLowerCase()
      if (content.includes('workflow') || content.includes('approv') || content.includes('validation')) {
        relations.push({
          id: id('rel'),
          fromId: document.id,
          toId: 'workflow:knowledge',
          type: 'linked-workflow',
          reason: 'Workflow terms detected in content',
        })
      }
    })

    return relations
  }

  static buildDocumentGraph(): { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } {
    const docs = KnowledgeWorkspaceService.getStore().documents
    const relations = this.buildRelations()
    const nodes = new Map<string, KnowledgeGraphNode>()
    const edges: KnowledgeGraphEdge[] = []

    docs.forEach((document) => {
      nodes.set(document.id, { id: document.id, label: document.title, type: 'document' })

      if (document.classification.projet) {
        const projectId = `project:${document.classification.projet}`
        if (!nodes.has(projectId)) {
          nodes.set(projectId, { id: projectId, label: document.classification.projet, type: 'project' })
        }
      }

      if (document.classification.equipement || document.extraction.equipement) {
        const equipmentName = document.classification.equipement || document.extraction.equipement
        const equipmentId = `equipment:${equipmentName}`
        if (!nodes.has(equipmentId)) {
          nodes.set(equipmentId, { id: equipmentId, label: equipmentName, type: 'equipment' })
        }
      }

      if (document.classification.fournisseur || document.extraction.fournisseur) {
        const supplierName = document.classification.fournisseur || document.extraction.fournisseur
        const supplierId = `supplier:${supplierName}`
        if (!nodes.has(supplierId)) {
          nodes.set(supplierId, { id: supplierId, label: supplierName, type: 'supplier' })
        }
      }

      if (document.classification.client || document.extraction.client) {
        const clientName = document.classification.client || document.extraction.client
        const clientId = `client:${clientName}`
        if (!nodes.has(clientId)) {
          nodes.set(clientId, { id: clientId, label: clientName, type: 'client' })
        }
      }

      if (document.extraction.technicien) {
        const employeeId = `employee:${document.extraction.technicien}`
        if (!nodes.has(employeeId)) {
          nodes.set(employeeId, { id: employeeId, label: document.extraction.technicien, type: 'employee' })
        }
      }
    })

    relations.forEach((relation) => {
      if (!nodes.has(relation.fromId) && relation.fromId.includes(':')) {
        nodes.set(relation.fromId, { id: relation.fromId, label: relation.fromId, type: 'document' })
      }
      if (!nodes.has(relation.toId) && relation.toId.includes(':')) {
        const type = relation.toId.startsWith('project:')
          ? 'project'
          : relation.toId.startsWith('equipment:')
            ? 'equipment'
            : relation.toId.startsWith('supplier:')
              ? 'supplier'
              : relation.toId.startsWith('client:')
                ? 'client'
                : relation.toId.startsWith('employee:')
                  ? 'employee'
                  : relation.toId.startsWith('workflow:')
                    ? 'workflow'
                    : 'document'
        nodes.set(relation.toId, { id: relation.toId, label: relation.toId, type })
      }

      edges.push({
        id: relation.id,
        from: relation.fromId,
        to: relation.toId,
        relation: relation.type,
      })
    })

    return {
      nodes: Array.from(nodes.values()),
      edges,
    }
  }

  static askDocumentsQuestion(question: string): KnowledgeQuestionResult {
    const result = KnowledgeWorkspaceService.answerEnterpriseQuestion(question)
    const documentsById = new Map(KnowledgeWorkspaceService.getStore().documents.map((item) => [item.id, item]))

    const sources = result.sources.map((source) => {
      const document = documentsById.get(source.documentId)
      const paragraphs = splitParagraphs(document?.content ?? '').slice(0, 3)
      return {
        documentId: source.documentId,
        title: source.title,
        paragraphs,
        date: document?.index.metadata.date || document?.updatedAt || nowIso(),
        author: document?.index.metadata.author || 'unknown',
      }
    })

    const answer: KnowledgeQuestionResult = {
      id: id('kq'),
      question,
      answer: result.answerText,
      confidence: result.confidenceScore,
      sources,
      createdAt: nowIso(),
    }

    const store = this.getStore()
    const nextStore: KnowledgeIntelligenceStore = {
      ...store,
      questionHistory: [answer, ...store.questionHistory].slice(0, 400),
      timeline: [
        {
          id: id('ktl'),
          type: 'query' as const,
          title: 'Document question answered',
          detail: question,
          createdAt: answer.createdAt,
        },
        ...store.timeline,
      ].slice(0, 1000),
      events: [
        {
          id: id('kev'),
          type: 'document-query' as const,
          title: 'Document query answered',
          detail: `${question.slice(0, 120)} | confidence ${answer.confidence}%`,
          createdAt: answer.createdAt,
        },
        ...store.events,
      ].slice(0, 1000),
    }

    this.persist(nextStore)
    return answer
  }

  static compareDocuments(leftId: string, rightId: string): KnowledgeComparisonResult | null {
    const documents = KnowledgeWorkspaceService.getStore().documents
    const left = documents.find((item) => item.id === leftId)
    const right = documents.find((item) => item.id === rightId)
    if (!left || !right) return null

    const comparison = compareText(left.content, right.content)
    const result: KnowledgeComparisonResult = {
      id: id('kcmp'),
      leftId,
      rightId,
      leftTitle: left.title,
      rightTitle: right.title,
      added: comparison.added,
      removed: comparison.removed,
      modified: comparison.modified,
      createdAt: nowIso(),
    }

    const store = this.getStore()
    this.persist({
      ...store,
      comparisons: [result, ...store.comparisons].slice(0, 300),
      timeline: [
        {
          id: id('ktl'),
          type: 'revision' as const,
          title: 'Document comparison executed',
          detail: `${left.title} <> ${right.title}`,
          createdAt: result.createdAt,
        },
        ...store.timeline,
      ].slice(0, 1000),
    })

    return result
  }

  static getDocumentTimeline(): KnowledgeTimelineItem[] {
    const store = KnowledgeWorkspaceService.getStore()
    const baseTimeline: KnowledgeTimelineItem[] = []

    store.documents.forEach((document) => {
      baseTimeline.push({
        id: `${document.id}:created`,
        type: 'document',
        title: document.title,
        detail: `${document.documentType} created`,
        createdAt: document.createdAt,
      })

      document.versions.forEach((version) => {
        baseTimeline.push({
          id: `${document.id}:version:${version.id}`,
          type: 'version',
          title: document.title,
          detail: `version ${version.label}`,
          createdAt: version.createdAt,
        })
      })

      if (document.status === 'archived' || document.inTrash) {
        baseTimeline.push({
          id: `${document.id}:archive`,
          type: 'archive',
          title: document.title,
          detail: `status ${document.status}`,
          createdAt: document.updatedAt,
        })
      }
    })

    const intelligenceTimeline = this.getStore().timeline
    return [...intelligenceTimeline, ...baseTimeline]
      .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))
      .slice(0, 1200)
  }

  static getMostConsultedDocuments(): Array<{ id: string; title: string; consultations: number }> {
    const documents = KnowledgeWorkspaceService.getStore().documents
    const store = KnowledgeWorkspaceService.getStore()
    const usage = new Map<string, number>()

    store.searches.forEach((search) => {
      const query = normalize(search.query)
      if (!query) return
      documents.forEach((document) => {
        const haystack = `${document.title} ${document.description} ${document.content}`.toLowerCase()
        if (haystack.includes(query)) {
          usage.set(document.id, (usage.get(document.id) ?? 0) + 1)
        }
      })
    })

    store.aiAnswers.forEach((answer: KnowledgeAiAnswer) => {
      answer.documentsUsed.forEach((documentId) => {
        usage.set(documentId, (usage.get(documentId) ?? 0) + 3)
      })
    })

    return documents
      .map((document) => ({ id: document.id, title: document.title, consultations: usage.get(document.id) ?? 0 }))
      .sort((left, right) => right.consultations - left.consultations)
      .slice(0, 20)
  }

  static refreshAndEmit(): { metrics: KnowledgeIntelligenceMetrics } {
    const docs = this.getIntelligenceDocuments()
    const now = nowIso()
    const day = dayKey(now)
    const store = this.getStore()

    const metrics: KnowledgeIntelligenceMetrics = {
      totalDocuments: docs.length,
      recentDocuments: docs.filter((item) => ageInDays(item.updatedAt) <= 14).length,
      criticalDocuments: docs.filter((item) => item.isCritical).length,
      expiredDocuments: docs.filter((item) => item.isExpired).length,
      linkedToWorkflows: docs.filter((item) => item.themes.includes('workflow')).length,
      documentQueries: store.questionHistory.length,
      answersGenerated: KnowledgeWorkspaceService.getStore().aiAnswers.length,
    }

    const newDocs = docs.filter((document) => !store.seenDocumentIds.includes(document.id))
    const versionKeys = docs.map((document) => `${document.id}:${document.version}`)
    const newVersions = versionKeys.filter((key) => !store.seenVersionKeys.includes(key))

    const eventItems = [
      {
        id: id('kev'),
        type: 'knowledge-metric' as const,
        title: 'Knowledge metrics refreshed',
        detail: `docs ${metrics.totalDocuments} | critical ${metrics.criticalDocuments} | expired ${metrics.expiredDocuments}`,
        createdAt: now,
      },
      {
        id: id('kev'),
        type: 'knowledge-event' as const,
        title: 'Knowledge timeline updated',
        detail: `${metrics.recentDocuments} recent documents in 14 days`,
        createdAt: now,
      },
    ]

    const metricsHistory = [
      {
        date: day,
        totalDocuments: metrics.totalDocuments,
        criticalDocuments: metrics.criticalDocuments,
        expiredDocuments: metrics.expiredDocuments,
        queries: metrics.documentQueries,
        answers: metrics.answersGenerated,
      },
      ...store.metricsHistory.filter((item) => item.date !== day),
    ].slice(0, 365)

    this.persist({
      ...store,
      events: [...eventItems, ...store.events].slice(0, 1000),
      metricsHistory,
      seenDocumentIds: docs.map((item) => item.id),
      seenVersionKeys: versionKeys,
    })

    if (newDocs.length > 0) {
      notificationService.publish({
        title: 'Nouveau document',
        message: `${newDocs.length} nouveau(x) document(s) détecté(s).`,
        level: 'info',
        priority: 'medium',
        category: 'system',
        read: false,
        channels: ['email'],
      })
    }

    if (newVersions.length > 0) {
      notificationService.publish({
        title: 'Nouvelle version',
        message: `${newVersions.length} nouvelle(s) version(s) documentaire(s).`,
        level: 'success',
        priority: 'low',
        category: 'system',
        read: false,
        channels: ['email'],
      })
    }

    if (metrics.expiredDocuments > 0) {
      notificationService.publish({
        title: 'Document expiré',
        message: `${metrics.expiredDocuments} document(s) potentiellement expiré(s).`,
        level: 'warning',
        priority: 'high',
        category: 'system',
        read: false,
        channels: ['email', 'whatsapp'],
      })
    }

    if (metrics.criticalDocuments > 0) {
      notificationService.publish({
        title: 'Document critique',
        message: `${metrics.criticalDocuments} document(s) critique(s) à surveiller.`,
        level: 'error',
        priority: 'high',
        category: 'system',
        read: false,
        channels: ['email', 'whatsapp'],
      })
    }

    return { metrics }
  }

  static getObservability() {
    const store = this.getStore()
    const latestMetrics = store.metricsHistory.at(0)

    return {
      knowledgeEvents: store.events.slice(0, 80),
      knowledgeMetrics: {
        snapshots: store.metricsHistory.length,
        totalDocuments: latestMetrics?.totalDocuments ?? 0,
        criticalDocuments: latestMetrics?.criticalDocuments ?? 0,
        expiredDocuments: latestMetrics?.expiredDocuments ?? 0,
      },
      documentQueries: {
        total: store.questionHistory.length,
        lastQuestions: store.questionHistory.slice(0, 20),
      },
      knowledgeTimeline: this.getDocumentTimeline().slice(0, 120),
    }
  }

  static exportQuestionHistory(): void {
    WorkspaceExchangeService.downloadJson('srg-knowledge-intelligence-questions.json', this.getStore().questionHistory)
  }

  static exportComparisons(): void {
    WorkspaceExchangeService.downloadJson('srg-knowledge-intelligence-comparisons.json', this.getStore().comparisons)
  }

  static exportTimeline(): void {
    WorkspaceExchangeService.downloadJson('srg-knowledge-intelligence-timeline.json', this.getDocumentTimeline())
  }
}
