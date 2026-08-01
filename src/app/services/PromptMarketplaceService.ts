import { PromptService } from '#/app/services/PromptService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export type MarketplaceVisibility = 'private' | 'shared' | 'organization' | 'public' | 'marketplace'
export type MarketplaceStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'published' | 'archived' | 'retired'

export type MarketplacePromptRecord = {
  id: string
  promptId: string
  title: string
  description: string
  authorId: string
  authorName: string
  organization: string
  category: string
  tags: string[]
  languages: string[]
  version: string
  license: string
  status: MarketplaceStatus
  visibility: MarketplaceVisibility
  price: number
  downloads: number
  views: number
  favorites: number
  copies: number
  averageRating: number
  reviewCount: number
  publishedAt?: string
  updatedAt: string
  compatibleModels: string[]
}

export type MarketplaceFilters = {
  text: string
  category: string
  tag: string
  language: string
  model: string
  author: string
  organization: string
  popularityMin: number
  minRating: number
  maxPrice: number
  visibility: MarketplaceVisibility | 'all'
  status: MarketplaceStatus | 'all'
  sortBy: 'trending' | 'downloads' | 'rating' | 'recent' | 'price'
}

const STORAGE_KEY = 'srg.prompt.marketplace.v1'

function nowIso() {
  return new Date().toISOString()
}

function defaultFilters(): MarketplaceFilters {
  const prefs = WorkspacePreferencesService.getPreferences()
  const raw = (prefs.filters['prompt-marketplace'] as Record<string, string | boolean | number> | undefined) || {}
  return {
    text: typeof raw.text === 'string' ? raw.text : '',
    category: typeof raw.category === 'string' ? raw.category : '',
    tag: typeof raw.tag === 'string' ? raw.tag : '',
    language: typeof raw.language === 'string' ? raw.language : '',
    model: typeof raw.model === 'string' ? raw.model : '',
    author: typeof raw.author === 'string' ? raw.author : '',
    organization: typeof raw.organization === 'string' ? raw.organization : '',
    popularityMin: typeof raw.popularityMin === 'number' ? raw.popularityMin : 0,
    minRating: typeof raw.minRating === 'number' ? raw.minRating : 0,
    maxPrice: typeof raw.maxPrice === 'number' ? raw.maxPrice : 9999,
    visibility:
      raw.visibility === 'private' ||
      raw.visibility === 'shared' ||
      raw.visibility === 'organization' ||
      raw.visibility === 'public' ||
      raw.visibility === 'marketplace'
        ? raw.visibility
        : 'all',
    status:
      raw.status === 'draft' ||
      raw.status === 'review' ||
      raw.status === 'approved' ||
      raw.status === 'rejected' ||
      raw.status === 'published' ||
      raw.status === 'archived' ||
      raw.status === 'retired'
        ? raw.status
        : 'all',
    sortBy:
      raw.sortBy === 'downloads' || raw.sortBy === 'rating' || raw.sortBy === 'recent' || raw.sortBy === 'price'
        ? raw.sortBy
        : 'trending',
  }
}

export class PromptMarketplaceService {
  private static memory: MarketplacePromptRecord[] = []

  static list(): MarketplacePromptRecord[] {
    return this.readStorage().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }

  static hydrateFromPrompts(actorName = 'System'): MarketplacePromptRecord[] {
    const prompts = PromptService.getPrompts()
    const existing = this.list()
    const mapped: MarketplacePromptRecord[] = prompts.map((prompt) => {
      const found = existing.find((item) => item.promptId === prompt.id)
      return (
        found ?? {
          id: `mk-${prompt.id}`,
          promptId: prompt.id,
          title: prompt.name,
          description: prompt.description,
          authorId: 'system',
          authorName: actorName,
          organization: 'SRG',
          category: prompt.category,
          tags: prompt.tags,
          languages: [prompt.language],
          version: `1.${Math.max(0, prompt.versions.length - 1)}.0`,
          license: 'Proprietary',
          status: prompt.status === 'archived' ? 'archived' : 'draft',
          visibility: 'private',
          price: 0,
          downloads: 0,
          views: 0,
          favorites: Number(prompt.favorite),
          copies: 0,
          averageRating: 0,
          reviewCount: 0,
          publishedAt: undefined,
          updatedAt: nowIso(),
          compatibleModels: [prompt.model],
        }
      )
    })

    this.writeStorage(mapped)
    return mapped
  }

  static upsert(record: MarketplacePromptRecord): MarketplacePromptRecord {
    const next = [record, ...this.list().filter((item) => item.id !== record.id)]
    this.writeStorage(next)
    return record
  }

  static setVisibility(id: string, visibility: MarketplaceVisibility): MarketplacePromptRecord | undefined {
    const current = this.list().find((item) => item.id === id)
    if (!current) return undefined
    const next: MarketplacePromptRecord = { ...current, visibility, updatedAt: nowIso() }
    this.upsert(next)
    return next
  }

  static setStatus(id: string, status: MarketplaceStatus): MarketplacePromptRecord | undefined {
    const current = this.list().find((item) => item.id === id)
    if (!current) return undefined
    const next: MarketplacePromptRecord = {
      ...current,
      status,
      publishedAt: status === 'published' ? nowIso() : current.publishedAt,
      updatedAt: nowIso(),
    }
    this.upsert(next)
    return next
  }

  static incrementView(id: string): void {
    const record = this.list().find((item) => item.id === id)
    if (!record) return
    this.upsert({ ...record, views: record.views + 1, updatedAt: nowIso() })
  }

  static incrementDownload(id: string): void {
    const record = this.list().find((item) => item.id === id)
    if (!record) return
    this.upsert({ ...record, downloads: record.downloads + 1, updatedAt: nowIso() })
  }

  static incrementCopy(id: string): void {
    const record = this.list().find((item) => item.id === id)
    if (!record) return
    this.upsert({ ...record, copies: record.copies + 1, updatedAt: nowIso() })
  }

  static toggleFavorite(id: string): void {
    const record = this.list().find((item) => item.id === id)
    if (!record) return
    const next = record.favorites > 0 ? record.favorites - 1 : record.favorites + 1
    this.upsert({ ...record, favorites: next, updatedAt: nowIso() })
  }

  static updateRating(id: string, rating: number, reviewCount: number): void {
    const record = this.list().find((item) => item.id === id)
    if (!record) return
    this.upsert({ ...record, averageRating: rating, reviewCount, updatedAt: nowIso() })
  }

  static getFilters(): MarketplaceFilters {
    return defaultFilters()
  }

  static persistFilters(filters: MarketplaceFilters): void {
    WorkspacePreferencesService.setFilters('prompt-marketplace', filters)
  }

  static applyFilters(records: MarketplacePromptRecord[], filters: MarketplaceFilters): MarketplacePromptRecord[] {
    const query = filters.text.trim().toLowerCase()

    const filtered = records.filter((record) => {
      if (query && !`${record.title} ${record.description} ${record.authorName} ${record.organization}`.toLowerCase().includes(query)) return false
      if (filters.category && record.category !== filters.category) return false
      if (filters.tag && !record.tags.some((tag) => tag.toLowerCase().includes(filters.tag.toLowerCase()))) return false
      if (filters.language && !record.languages.some((lang) => lang.toLowerCase().includes(filters.language.toLowerCase()))) return false
      if (filters.model && !record.compatibleModels.some((model) => model.toLowerCase().includes(filters.model.toLowerCase()))) return false
      if (filters.author && !record.authorName.toLowerCase().includes(filters.author.toLowerCase())) return false
      if (filters.organization && !record.organization.toLowerCase().includes(filters.organization.toLowerCase())) return false
      if (record.downloads < filters.popularityMin) return false
      if (record.averageRating < filters.minRating) return false
      if (record.price > filters.maxPrice) return false
      if (filters.visibility !== 'all' && record.visibility !== filters.visibility) return false
      if (filters.status !== 'all' && record.status !== filters.status) return false
      return true
    })

    return filtered.sort((a, b) => {
      if (filters.sortBy === 'downloads') return b.downloads - a.downloads
      if (filters.sortBy === 'rating') return b.averageRating - a.averageRating
      if (filters.sortBy === 'recent') return a.updatedAt < b.updatedAt ? 1 : -1
      if (filters.sortBy === 'price') return a.price - b.price
      const leftScore = a.downloads + a.favorites + a.views + a.copies
      const rightScore = b.downloads + b.favorites + b.views + b.copies
      return rightScore - leftScore
    })
  }

  private static readStorage(): MarketplacePromptRecord[] {
    if (typeof window === 'undefined') return this.memory
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as MarketplacePromptRecord[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private static writeStorage(records: MarketplacePromptRecord[]): void {
    this.memory = records
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    }
  }
}
