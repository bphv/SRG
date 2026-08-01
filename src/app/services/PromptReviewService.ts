import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { PromptMarketplaceService } from '#/app/services/PromptMarketplaceService'

export type PromptReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden' | 'reported' | 'deleted'
export type PromptReviewRole = 'reviewer' | 'moderator' | 'administrator'
export type PromptReviewQueueStatus = PromptReviewStatus | 'all'
export type PromptReviewDecisionAction = 'approve' | 'reject' | 'hide' | 'report' | 'delete'

export type PromptReviewDecision = {
  id: string
  action: PromptReviewDecisionAction
  actorName: string
  actorRole: PromptReviewRole
  reason: string
  internalComment: string
  createdAt: string
}

export type PromptReview = {
  id: string
  marketplaceId: string
  promptId: string
  authorId: string
  authorName: string
  stars: number
  comment: string
  reviewerName?: string
  reviewerRole?: PromptReviewRole
  status: PromptReviewStatus
  helpfulVotes: number
  reportCount: number
  moderationReason?: string
  internalComment?: string
  createdAt: string
  updatedAt: string
  reviewedAt?: string
  hiddenAt?: string
  deletedAt?: string
  decisions: PromptReviewDecision[]
}

export type PromptReviewFilters = {
  status: PromptReviewQueueStatus
  role: 'all' | PromptReviewRole
  query: string
  page: number
  pageSize: number
}

const STORAGE_KEY = 'srg.prompt.reviews.v2'

function nowIso() {
  return new Date().toISOString()
}

function clampStars(value: number): number {
  return Math.max(1, Math.min(5, Math.round(value)))
}

function decisionId() {
  return `decision-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`
}

function reviewId() {
  return `review-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`
}

function defaultFilters(): PromptReviewFilters {
  return {
    status: 'all',
    role: 'all',
    query: '',
    page: 1,
    pageSize: 8,
  }
}

export class PromptReviewService {
  private static memory: PromptReview[] = []

  static list(marketplaceId?: string): PromptReview[] {
    const records = this.readStorage().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    return marketplaceId ? records.filter((item) => item.marketplaceId === marketplaceId) : records
  }

  static listQueue(filters: PromptReviewFilters = defaultFilters()): { items: PromptReview[]; total: number; totalPages: number } {
    const query = filters.query.trim().toLowerCase()
    const filtered = this.list().filter((review) => {
      if (filters.status !== 'all' && review.status !== filters.status) return false
      if (filters.role !== 'all' && review.reviewerRole !== filters.role) return false
      if (query && !`${review.authorName} ${review.comment} ${review.moderationReason ?? ''} ${review.internalComment ?? ''}`.toLowerCase().includes(query)) {
        return false
      }
      return true
    })
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize))
    const page = Math.min(Math.max(1, filters.page), totalPages)
    const items = filtered.slice((page - 1) * filters.pageSize, page * filters.pageSize)
    return { items, total, totalPages }
  }

  static summary(): Record<PromptReviewStatus, number> {
    const records = this.list()
    return {
      pending: records.filter((item) => item.status === 'pending').length,
      approved: records.filter((item) => item.status === 'approved').length,
      rejected: records.filter((item) => item.status === 'rejected').length,
      hidden: records.filter((item) => item.status === 'hidden').length,
      reported: records.filter((item) => item.status === 'reported').length,
      deleted: records.filter((item) => item.status === 'deleted').length,
    }
  }

  static add(input: {
    marketplaceId: string
    promptId: string
    authorId: string
    authorName: string
    stars: number
    comment: string
    reviewerName?: string
    reviewerRole?: PromptReviewRole
  }): PromptReview {
    const review: PromptReview = {
      id: reviewId(),
      marketplaceId: input.marketplaceId,
      promptId: input.promptId,
      authorId: input.authorId,
      authorName: input.authorName,
      stars: clampStars(input.stars),
      comment: input.comment,
      reviewerName: input.reviewerName,
      reviewerRole: input.reviewerRole ?? 'reviewer',
      status: 'pending',
      helpfulVotes: 0,
      reportCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      decisions: [],
    }

    this.writeStorage([review, ...this.list()])
    this.syncMarketplaceRating(input.marketplaceId)

    notificationService.publish({
      title: 'review en attente',
      message: `${input.authorName} created a pending review for prompt ${input.promptId}.`,
      level: 'info',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    HistoryWorkspaceService.addRecord({
      id: `history-review-${Date.now()}`,
      promptName: 'Prompt review',
      promptText: input.comment,
      output: `${input.stars}`,
      provider: 'workspace',
      model: 'review',
      status: 'completed',
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      eventType: 'comment',
      entityType: 'prompt',
      entityId: input.promptId,
      actorName: input.authorName,
    })

    return review
  }

  static approve(id: string, actorName: string, reason: string, internalComment = '', actorRole: PromptReviewRole = 'moderator'): PromptReview | undefined {
    return this.decide(id, 'approve', actorName, reason, internalComment, actorRole)
  }

  static reject(id: string, actorName: string, reason: string, internalComment = '', actorRole: PromptReviewRole = 'moderator'): PromptReview | undefined {
    return this.decide(id, 'reject', actorName, reason, internalComment, actorRole)
  }

  static hide(id: string, actorName: string, reason: string, internalComment = '', actorRole: PromptReviewRole = 'moderator'): PromptReview | undefined {
    return this.decide(id, 'hide', actorName, reason, internalComment, actorRole)
  }

  static report(id: string, actorName = 'Community', reason = 'Reported by community'): PromptReview | undefined {
    const review = this.list().find((item) => item.id === id)
    if (!review) return undefined

    const next: PromptReview = {
      ...review,
      status: 'reported',
      reportCount: review.reportCount + 1,
      updatedAt: nowIso(),
      moderationReason: reason,
      decisions: [
        ...review.decisions,
        {
          id: decisionId(),
          action: 'report',
          actorName,
          actorRole: 'reviewer',
          reason,
          internalComment: '',
          createdAt: nowIso(),
        },
      ],
    }

    this.persist(next)
    this.syncMarketplaceRating(review.marketplaceId)
    return next
  }

  static delete(id: string, actorName: string, reason: string, internalComment = '', actorRole: PromptReviewRole = 'administrator'): PromptReview | undefined {
    return this.decide(id, 'delete', actorName, reason, internalComment, actorRole)
  }

  static voteHelpful(id: string): void {
    this.writeStorage(this.list().map((item) => (item.id === id ? { ...item, helpfulVotes: item.helpfulVotes + 1, updatedAt: nowIso() } : item)))
  }

  static moderate(id: string, status: 'visible' | 'flagged' | 'hidden'): void {
    const review = this.list().find((item) => item.id === id)
    if (!review) return

    const mappedStatus: PromptReviewStatus = status === 'visible' ? 'approved' : status === 'flagged' ? 'reported' : 'hidden'
    this.persist({
      ...review,
      status: mappedStatus,
      updatedAt: nowIso(),
    })
  }

  static getApprovedReviews(marketplaceId?: string): PromptReview[] {
    return this.list(marketplaceId).filter((item) => item.status === 'approved')
  }

  static getTopReviewed(limit = 5): Array<{ promptId: string; count: number; average: number }> {
    const grouped = new Map<string, PromptReview[]>()
    this.getApprovedReviews().forEach((review) => {
      const bucket = grouped.get(review.promptId) ?? []
      bucket.push(review)
      grouped.set(review.promptId, bucket)
    })

    return Array.from(grouped.entries())
      .map(([promptId, reviews]) => ({
        promptId,
        count: reviews.length,
        average: reviews.reduce((sum, item) => sum + item.stars, 0) / reviews.length,
      }))
      .sort((a, b) => b.average - a.average || b.count - a.count)
      .slice(0, limit)
  }

  private static decide(
    id: string,
    action: PromptReviewDecisionAction,
    actorName: string,
    reason: string,
    internalComment: string,
    actorRole: PromptReviewRole,
  ): PromptReview | undefined {
    const review = this.list().find((item) => item.id === id)
    if (!review) return undefined
    if (!reason.trim()) return undefined

    const nextStatus: PromptReviewStatus =
      action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'hide' ? 'hidden' : action === 'delete' ? 'deleted' : 'reported'

    const decision: PromptReviewDecision = {
      id: decisionId(),
      action,
      actorName,
      actorRole,
      reason: reason.trim(),
      internalComment: internalComment.trim(),
      createdAt: nowIso(),
    }

    const next: PromptReview = {
      ...review,
      status: nextStatus,
      reviewerName: actorName,
      reviewerRole: actorRole,
      moderationReason: reason.trim(),
      internalComment: internalComment.trim() || review.internalComment,
      updatedAt: nowIso(),
      reviewedAt: nowIso(),
      hiddenAt: action === 'hide' ? nowIso() : review.hiddenAt,
      deletedAt: action === 'delete' ? nowIso() : review.deletedAt,
      decisions: [...review.decisions, decision],
    }

    this.persist(next)
    this.syncMarketplaceRating(review.marketplaceId)

    notificationService.publish({
      title: `review ${nextStatus}`,
      message: `${actorName} set review ${review.id} to ${nextStatus}.`,
      level: nextStatus === 'approved' ? 'success' : nextStatus === 'rejected' ? 'warning' : 'info',
      priority: 'high',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    HistoryWorkspaceService.addRecord({
      id: `history-review-decision-${Date.now()}`,
      promptName: 'Review moderation',
      promptText: review.comment,
      output: `${nextStatus} :: ${reason.trim()}`,
      provider: 'workspace',
      model: 'moderation',
      status: 'completed',
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      eventType: 'validation',
      entityType: 'prompt',
      entityId: review.promptId,
      actorName,
    })

    return next
  }

  private static syncMarketplaceRating(marketplaceId: string): void {
    const reviews = this.getApprovedReviews(marketplaceId)
    if (reviews.length === 0) {
      PromptMarketplaceService.updateRating(marketplaceId, 0, 0)
      return
    }

    const average = reviews.reduce((sum, item) => sum + item.stars, 0) / reviews.length
    PromptMarketplaceService.updateRating(marketplaceId, Number(average.toFixed(2)), reviews.length)
  }

  private static persist(review: PromptReview): void {
    this.writeStorage([review, ...this.list().filter((item) => item.id !== review.id)])
  }

  private static readStorage(): PromptReview[] {
    if (typeof window === 'undefined') return this.memory
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as PromptReview[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private static writeStorage(reviews: PromptReview[]): void {
    this.memory = reviews
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
    }
  }
}
