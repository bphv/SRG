import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export type CollaborationRole = 'owner' | 'administrator' | 'editor' | 'reviewer' | 'viewer'
export type CollaborationStatus = 'invited' | 'active' | 'inactive'
export type CollaborationEntityType = 'project' | 'prompt' | 'template'
export type CollaborationWorkflowStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived'

export type CollaborationWorkflowAction =
  | 'submit_for_review'
  | 'approve'
  | 'reject'
  | 'publish'
  | 'archive'
  | 'restore'

export type Collaborator = {
  id: string
  projectId: string
  userId: string
  username: string
  role: CollaborationRole
  status: CollaborationStatus
  invitedAt: string
  updatedAt: string
}

export type CollaborationVersion = {
  id: string
  entityType: CollaborationEntityType
  entityId: string
  versionNumber: number
  authorId: string
  authorName: string
  createdAt: string
  comment: string
  changeSummary: string
  snapshot: string
}

export type CollaborationComment = {
  id: string
  entityType: CollaborationEntityType
  entityId: string
  projectId?: string
  versionId?: string
  authorId: string
  authorName: string
  body: string
  mentions: string[]
  attachments: Array<{ name: string; kind: 'placeholder' }>
  replies: Array<{
    id: string
    authorId: string
    authorName: string
    body: string
    createdAt: string
  }>
  resolved: boolean
  createdAt: string
  updatedAt: string
}

export type CollaborationActivity = {
  id: string
  type:
    | 'collaborator.invited'
    | 'collaborator.accepted'
    | 'collaborator.removed'
    | 'collaborator.role_changed'
    | 'validation.requested'
    | 'validation.approved'
    | 'validation.rejected'
    | 'version.created'
    | 'version.restored'
    | 'entity.published'
    | 'entity.archived'
    | 'comment.added'
    | 'generation.started'
    | 'provider.updated'
  actorId: string
  actorName: string
  entityType?: CollaborationEntityType
  entityId?: string
  projectId?: string
  message: string
  createdAt: string
  metadata?: Record<string, string>
}

export type CollaborationStore = {
  collaborators: Collaborator[]
  workflow: Record<string, CollaborationWorkflowStatus>
  versions: CollaborationVersion[]
  comments: CollaborationComment[]
  activities: CollaborationActivity[]
  draftAutosave: Record<string, string>
  favorites: string[]
}

const STORAGE_KEY = 'srg.workspace.collaboration.v1'

const workflowTransitions: Record<CollaborationWorkflowAction, CollaborationWorkflowStatus[]> = {
  submit_for_review: ['draft'],
  approve: ['in_review'],
  reject: ['in_review'],
  publish: ['approved'],
  archive: ['published'],
  restore: ['archived'],
}

function nowIso() {
  return new Date().toISOString()
}

function entityKey(entityType: CollaborationEntityType, entityId: string) {
  return `${entityType}:${entityId}`
}

function defaultStore(): CollaborationStore {
  return {
    collaborators: [],
    workflow: {},
    versions: [],
    comments: [],
    activities: [],
    draftAutosave: {},
    favorites: [],
  }
}

export class CollaborationWorkspaceService {
  private static memory = defaultStore()

  static getStore(): CollaborationStore {
    if (typeof window === 'undefined') {
      return this.memory
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const seed = defaultStore()
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
        return seed
      }
      const parsed = JSON.parse(raw) as Partial<CollaborationStore>
      return {
        ...defaultStore(),
        ...parsed,
        collaborators: parsed.collaborators ?? [],
        workflow: parsed.workflow ?? {},
        versions: parsed.versions ?? [],
        comments: parsed.comments ?? [],
        activities: parsed.activities ?? [],
        draftAutosave: parsed.draftAutosave ?? {},
        favorites: parsed.favorites ?? [],
      }
    } catch {
      return defaultStore()
    }
  }

  static saveStore(next: CollaborationStore): void {
    this.memory = next
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
  }

  static listCollaborators(projectId: string): Collaborator[] {
    return this.getStore().collaborators.filter((item) => item.projectId === projectId)
  }

  static inviteCollaborator(input: {
    projectId: string
    userId: string
    username: string
    role: CollaborationRole
    actorId: string
    actorName: string
  }): Collaborator {
    const store = this.getStore()
    const existing = store.collaborators.find((item) => item.projectId === input.projectId && item.userId === input.userId)

    let collaborator: Collaborator
    if (existing) {
      collaborator = {
        ...existing,
        role: input.role,
        status: 'invited',
        updatedAt: nowIso(),
      }
      store.collaborators = store.collaborators.map((item) => (item.id === collaborator.id ? collaborator : item))
    } else {
      collaborator = {
        id: `collab-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        projectId: input.projectId,
        userId: input.userId,
        username: input.username,
        role: input.role,
        status: 'invited',
        invitedAt: nowIso(),
        updatedAt: nowIso(),
      }
      store.collaborators = [collaborator, ...store.collaborators]
    }

    this.pushActivity(store, {
      type: 'collaborator.invited',
      actorId: input.actorId,
      actorName: input.actorName,
      entityType: 'project',
      entityId: input.projectId,
      projectId: input.projectId,
      message: `${input.actorName} invited ${input.username} as ${input.role}.`,
      metadata: { collaborator: input.username },
    })

    notificationService.publish({
      title: 'Invitation envoyee',
      message: `${input.username} a ete invite sur le projet.`,
      level: 'info',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    this.recordHistoryEvent({
      title: 'Collaborateur invite',
      body: `${input.actorName} -> ${input.username} (${input.role})`,
      projectId: input.projectId,
      actorName: input.actorName,
      entityType: 'project',
      entityId: input.projectId,
    })

    this.saveStore(store)
    return collaborator
  }

  static acceptInvitation(collaboratorId: string, actorId: string, actorName: string): void {
    const store = this.getStore()
    const target = store.collaborators.find((item) => item.id === collaboratorId)
    if (!target) {
      return
    }

    store.collaborators = store.collaborators.map((item) =>
      item.id === collaboratorId
        ? {
            ...item,
            status: 'active',
            updatedAt: nowIso(),
          }
        : item,
    )

    this.pushActivity(store, {
      type: 'collaborator.accepted',
      actorId,
      actorName,
      entityType: 'project',
      entityId: target.projectId,
      projectId: target.projectId,
      message: `${actorName} accepted invitation.`,
      metadata: { collaborator: target.username },
    })

    notificationService.publish({
      title: 'Invitation acceptee',
      message: `${target.username} est maintenant actif sur le projet.`,
      level: 'success',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    this.saveStore(store)
  }

  static removeCollaborator(collaboratorId: string, actorId: string, actorName: string): void {
    const store = this.getStore()
    const target = store.collaborators.find((item) => item.id === collaboratorId)
    if (!target) {
      return
    }

    store.collaborators = store.collaborators.filter((item) => item.id !== collaboratorId)

    this.pushActivity(store, {
      type: 'collaborator.removed',
      actorId,
      actorName,
      entityType: 'project',
      entityId: target.projectId,
      projectId: target.projectId,
      message: `${actorName} removed ${target.username}.`,
      metadata: { collaborator: target.username },
    })

    notificationService.publish({
      title: 'Collaborateur retire',
      message: `${target.username} n'a plus acces au projet.`,
      level: 'warning',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    this.recordHistoryEvent({
      title: 'Collaborateur retire',
      body: `${actorName} removed ${target.username}`,
      projectId: target.projectId,
      actorName,
      entityType: 'project',
      entityId: target.projectId,
    })

    this.saveStore(store)
  }

  static changeCollaboratorRole(collaboratorId: string, role: CollaborationRole, actorId: string, actorName: string): void {
    const store = this.getStore()
    const target = store.collaborators.find((item) => item.id === collaboratorId)
    if (!target) {
      return
    }

    store.collaborators = store.collaborators.map((item) =>
      item.id === collaboratorId
        ? {
            ...item,
            role,
            updatedAt: nowIso(),
          }
        : item,
    )

    this.pushActivity(store, {
      type: 'collaborator.role_changed',
      actorId,
      actorName,
      entityType: 'project',
      entityId: target.projectId,
      projectId: target.projectId,
      message: `${actorName} changed ${target.username} role to ${role}.`,
      metadata: { collaborator: target.username, role },
    })

    this.saveStore(store)
  }

  static getWorkflowStatus(entityType: CollaborationEntityType, entityId: string): CollaborationWorkflowStatus {
    const store = this.getStore()
    return store.workflow[entityKey(entityType, entityId)] ?? 'draft'
  }

  static transitionWorkflow(input: {
    entityType: CollaborationEntityType
    entityId: string
    action: CollaborationWorkflowAction
    actorId: string
    actorName: string
    projectId?: string
    note?: string
  }): { ok: boolean; from: CollaborationWorkflowStatus; to: CollaborationWorkflowStatus; reason?: string } {
    const store = this.getStore()
    const key = entityKey(input.entityType, input.entityId)
    const from = store.workflow[key] ?? 'draft'
    const allowedFrom = workflowTransitions[input.action]

    if (!allowedFrom.includes(from)) {
      return { ok: false, from, to: from, reason: `Transition ${input.action} not allowed from ${from}` }
    }

    let to: CollaborationWorkflowStatus = from
    if (input.action === 'submit_for_review') to = 'in_review'
    if (input.action === 'approve') to = 'approved'
    if (input.action === 'reject') to = 'draft'
    if (input.action === 'publish') to = 'published'
    if (input.action === 'archive') to = 'archived'
    if (input.action === 'restore') to = 'draft'

    store.workflow[key] = to

    const eventType =
      input.action === 'submit_for_review'
        ? 'validation.requested'
        : input.action === 'approve'
          ? 'validation.approved'
          : input.action === 'reject'
            ? 'validation.rejected'
            : input.action === 'publish'
              ? 'entity.published'
              : 'entity.archived'

    this.pushActivity(store, {
      type: eventType,
      actorId: input.actorId,
      actorName: input.actorName,
      entityType: input.entityType,
      entityId: input.entityId,
      projectId: input.projectId,
      message: `${input.actorName} ${input.action.replaceAll('_', ' ')} (${from} -> ${to}).`,
      metadata: input.note ? { note: input.note } : undefined,
    })

    const notificationTitle =
      input.action === 'submit_for_review'
        ? 'Validation demandee'
        : input.action === 'approve'
          ? 'Validation approuvee'
          : input.action === 'reject'
            ? 'Validation rejetee'
            : input.action === 'publish'
              ? 'Publication'
              : 'Archivage'

    notificationService.publish({
      title: notificationTitle,
      message: `${input.entityType} ${input.entityId}: ${from} -> ${to}`,
      level: input.action === 'reject' ? 'warning' : 'info',
      priority: 'high',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    this.recordHistoryEvent({
      title: notificationTitle,
      body: `${input.action} ${from} -> ${to}`,
      projectId: input.projectId,
      actorName: input.actorName,
      entityType: input.entityType,
      entityId: input.entityId,
    })

    this.saveStore(store)
    return { ok: true, from, to }
  }

  static listVersions(entityType: CollaborationEntityType, entityId: string): CollaborationVersion[] {
    return this.getStore()
      .versions
      .filter((item) => item.entityType === entityType && item.entityId === entityId)
      .sort((a, b) => b.versionNumber - a.versionNumber)
  }

  static createVersion(input: {
    entityType: CollaborationEntityType
    entityId: string
    authorId: string
    authorName: string
    comment: string
    changeSummary: string
    snapshot: string
    projectId?: string
  }): CollaborationVersion {
    const store = this.getStore()
    const current = this.listVersions(input.entityType, input.entityId)
    const nextNumber = (current[0]?.versionNumber ?? 0) + 1

    const version: CollaborationVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      entityType: input.entityType,
      entityId: input.entityId,
      versionNumber: nextNumber,
      authorId: input.authorId,
      authorName: input.authorName,
      createdAt: nowIso(),
      comment: input.comment,
      changeSummary: input.changeSummary,
      snapshot: input.snapshot,
    }

    store.versions = [version, ...store.versions]

    this.pushActivity(store, {
      type: 'version.created',
      actorId: input.authorId,
      actorName: input.authorName,
      entityType: input.entityType,
      entityId: input.entityId,
      projectId: input.projectId,
      message: `${input.authorName} created version ${nextNumber}.`,
      metadata: { comment: input.comment },
    })

    notificationService.publish({
      title: 'Nouvelle version',
      message: `${input.entityType} ${input.entityId} a une nouvelle version (${nextNumber}).`,
      level: 'info',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    this.recordHistoryEvent({
      title: 'Version creee',
      body: `${input.entityType} v${nextNumber} - ${input.changeSummary}`,
      projectId: input.projectId,
      actorName: input.authorName,
      entityType: input.entityType,
      entityId: input.entityId,
    })

    this.saveStore(store)
    return version
  }

  static restoreVersion(versionId: string, actorId: string, actorName: string): CollaborationVersion | undefined {
    const store = this.getStore()
    const version = store.versions.find((item) => item.id === versionId)
    if (!version) {
      return undefined
    }

    this.pushActivity(store, {
      type: 'version.restored',
      actorId,
      actorName,
      entityType: version.entityType,
      entityId: version.entityId,
      message: `${actorName} restored version ${version.versionNumber}.`,
      metadata: { versionId },
    })

    notificationService.publish({
      title: 'Version restauree',
      message: `${version.entityType} ${version.entityId} restauré à v${version.versionNumber}.`,
      level: 'success',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    this.saveStore(store)
    return version
  }

  static compareVersions(leftId: string, rightId: string): { left?: CollaborationVersion; right?: CollaborationVersion; summary: string } {
    const store = this.getStore()
    const left = store.versions.find((item) => item.id === leftId)
    const right = store.versions.find((item) => item.id === rightId)
    if (!left || !right) {
      return { left, right, summary: 'Two versions are required for comparison.' }
    }

    const leftLines = left.snapshot.split('\n').length
    const rightLines = right.snapshot.split('\n').length
    const delta = rightLines - leftLines

    return {
      left,
      right,
      summary: `v${left.versionNumber} vs v${right.versionNumber}: ${leftLines} lines vs ${rightLines} lines (delta ${delta >= 0 ? '+' : ''}${delta}).`,
    }
  }

  static listComments(entityType: CollaborationEntityType, entityId: string): CollaborationComment[] {
    return this.getStore()
      .comments
      .filter((item) => item.entityType === entityType && item.entityId === entityId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }

  static addComment(input: {
    entityType: CollaborationEntityType
    entityId: string
    projectId?: string
    versionId?: string
    authorId: string
    authorName: string
    body: string
    attachments?: Array<{ name: string; kind: 'placeholder' }>
  }): CollaborationComment {
    const store = this.getStore()
    const mentions = extractMentions(input.body)
    const comment: CollaborationComment = {
      id: `com-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      entityType: input.entityType,
      entityId: input.entityId,
      projectId: input.projectId,
      versionId: input.versionId,
      authorId: input.authorId,
      authorName: input.authorName,
      body: input.body,
      mentions,
      attachments: input.attachments ?? [],
      replies: [],
      resolved: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }

    store.comments = [comment, ...store.comments]

    this.pushActivity(store, {
      type: 'comment.added',
      actorId: input.authorId,
      actorName: input.authorName,
      entityType: input.entityType,
      entityId: input.entityId,
      projectId: input.projectId,
      message: `${input.authorName} added a comment.`,
      metadata: { mentions: mentions.join(',') },
    })

    notificationService.publish({
      title: 'Commentaire ajoute',
      message: `${input.authorName} a commente ${input.entityType} ${input.entityId}.`,
      level: 'info',
      priority: 'medium',
      category: 'system',
      read: false,
      channels: ['email'],
    })

    this.recordHistoryEvent({
      title: 'Commentaire ajoute',
      body: input.body.slice(0, 120),
      projectId: input.projectId,
      actorName: input.authorName,
      entityType: input.entityType,
      entityId: input.entityId,
    })

    this.saveStore(store)
    return comment
  }

  static replyComment(input: {
    commentId: string
    authorId: string
    authorName: string
    body: string
  }): void {
    const store = this.getStore()
    store.comments = store.comments.map((item) =>
      item.id === input.commentId
        ? {
            ...item,
            replies: [
              ...item.replies,
              {
                id: `reply-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
                authorId: input.authorId,
                authorName: input.authorName,
                body: input.body,
                createdAt: nowIso(),
              },
            ],
            updatedAt: nowIso(),
          }
        : item,
    )
    this.saveStore(store)
  }

  static resolveComment(commentId: string, resolved: boolean): void {
    const store = this.getStore()
    store.comments = store.comments.map((item) =>
      item.id === commentId
        ? {
            ...item,
            resolved,
            updatedAt: nowIso(),
          }
        : item,
    )
    this.saveStore(store)
  }

  static getActivity(period: 'today' | 'yesterday' | 'week' | 'month' | 'all' = 'all'): CollaborationActivity[] {
    const all = this.getStore().activities.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    if (period === 'all') {
      return all
    }

    const now = new Date()
    return all.filter((item) => {
      const created = new Date(item.createdAt)
      const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      if (period === 'today') {
        return created.toDateString() === now.toDateString()
      }
      if (period === 'yesterday') {
        return diffDays >= 1 && diffDays < 2
      }
      if (period === 'week') {
        return diffDays <= 7
      }
      return diffDays <= 30
    })
  }

  static saveDraft(key: string, value: string): void {
    const store = this.getStore()
    store.draftAutosave[key] = value
    this.saveStore(store)
  }

  static loadDraft(key: string): string {
    return this.getStore().draftAutosave[key] ?? ''
  }

  static toggleFavorite(id: string): void {
    const store = this.getStore()
    if (store.favorites.includes(id)) {
      store.favorites = store.favorites.filter((item) => item !== id)
    } else {
      store.favorites = [id, ...store.favorites]
    }
    this.saveStore(store)
  }

  static searchGlobal(input: {
    query: string
    projects: Array<{ id: string; name: string; description: string }>
    prompts: Array<{ id: string; name: string; description: string }>
    templates: Array<{ id: string; name: string; description: string }>
    users: Array<{ id: string; username: string }>
  }): Array<{
    type: 'project' | 'prompt' | 'template' | 'user' | 'comment' | 'version'
    id: string
    label: string
    meta: string
  }> {
    const query = input.query.trim().toLowerCase()
    if (!query) {
      return []
    }

    const store = this.getStore()

    const projectMatches = input.projects
      .filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query))
      .map((item) => ({ type: 'project' as const, id: item.id, label: item.name, meta: item.description }))

    const promptMatches = input.prompts
      .filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query))
      .map((item) => ({ type: 'prompt' as const, id: item.id, label: item.name, meta: item.description }))

    const templateMatches = input.templates
      .filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query))
      .map((item) => ({ type: 'template' as const, id: item.id, label: item.name, meta: item.description }))

    const userMatches = input.users
      .filter((item) => item.username.toLowerCase().includes(query))
      .map((item) => ({ type: 'user' as const, id: item.id, label: item.username, meta: 'Collaborator' }))

    const commentMatches = store.comments
      .filter((item) => `${item.body} ${item.authorName}`.toLowerCase().includes(query))
      .map((item) => ({ type: 'comment' as const, id: item.id, label: item.body.slice(0, 60), meta: item.authorName }))

    const versionMatches = store.versions
      .filter((item) => `${item.comment} ${item.changeSummary}`.toLowerCase().includes(query))
      .map((item) => ({
        type: 'version' as const,
        id: item.id,
        label: `${item.entityType} v${item.versionNumber}`,
        meta: item.changeSummary,
      }))

    return [
      ...projectMatches,
      ...promptMatches,
      ...templateMatches,
      ...userMatches,
      ...commentMatches,
      ...versionMatches,
    ].slice(0, 80)
  }

  static exportVersions(entityType: CollaborationEntityType, entityId: string, format: 'json' | 'csv' | 'markdown'): void {
    const data = this.listVersions(entityType, entityId)
    if (format === 'json') {
      WorkspaceExchangeService.downloadJson(`versions-${entityType}-${entityId}.json`, data)
      return
    }
    if (format === 'csv') {
      WorkspaceExchangeService.downloadCsv(`versions-${entityType}-${entityId}.csv`, [
        ['number', 'author', 'date', 'comment', 'summary'],
        ...data.map((item) => [
          String(item.versionNumber),
          item.authorName,
          item.createdAt,
          item.comment,
          item.changeSummary,
        ]),
      ])
      return
    }

    const markdown = [
      `# Versions ${entityType} ${entityId}`,
      '',
      ...data.map(
        (item) =>
          `- v${item.versionNumber} | ${item.authorName} | ${item.createdAt}\n  - Comment: ${item.comment}\n  - Summary: ${item.changeSummary}`,
      ),
    ].join('\n')
    WorkspaceExchangeService.downloadText(`versions-${entityType}-${entityId}.md`, markdown, 'text/markdown;charset=utf-8')
  }

  static exportComments(entityType: CollaborationEntityType, entityId: string, format: 'json' | 'csv' | 'markdown'): void {
    const data = this.listComments(entityType, entityId)
    if (format === 'json') {
      WorkspaceExchangeService.downloadJson(`comments-${entityType}-${entityId}.json`, data)
      return
    }
    if (format === 'csv') {
      WorkspaceExchangeService.downloadCsv(`comments-${entityType}-${entityId}.csv`, [
        ['author', 'body', 'mentions', 'resolved', 'createdAt'],
        ...data.map((item) => [
          item.authorName,
          item.body,
          item.mentions.join('|'),
          String(item.resolved),
          item.createdAt,
        ]),
      ])
      return
    }

    const markdown = [
      `# Comments ${entityType} ${entityId}`,
      '',
      ...data.map((item) => `- ${item.authorName} (${item.createdAt}): ${item.body} ${item.resolved ? '[resolved]' : ''}`),
    ].join('\n')
    WorkspaceExchangeService.downloadText(`comments-${entityType}-${entityId}.md`, markdown, 'text/markdown;charset=utf-8')
  }

  static exportActivity(period: 'today' | 'yesterday' | 'week' | 'month' | 'all', format: 'json' | 'csv' | 'markdown'): void {
    const data = this.getActivity(period)
    if (format === 'json') {
      WorkspaceExchangeService.downloadJson(`activity-${period}.json`, data)
      return
    }
    if (format === 'csv') {
      WorkspaceExchangeService.downloadCsv(`activity-${period}.csv`, [
        ['type', 'actor', 'message', 'createdAt', 'projectId'],
        ...data.map((item) => [item.type, item.actorName, item.message, item.createdAt, item.projectId ?? '']),
      ])
      return
    }

    const markdown = [
      `# Activity ${period}`,
      '',
      ...data.map((item) => `- [${item.createdAt}] ${item.actorName}: ${item.message}`),
    ].join('\n')
    WorkspaceExchangeService.downloadText(`activity-${period}.md`, markdown, 'text/markdown;charset=utf-8')
  }

  static exportHistory(format: 'json' | 'csv' | 'markdown'): void {
    const data = HistoryWorkspaceService.getRecords()
    if (format === 'json') {
      WorkspaceExchangeService.downloadJson('history-collaboration.json', data)
      return
    }
    if (format === 'csv') {
      WorkspaceExchangeService.downloadCsv('history-collaboration.csv', [
        ['title', 'status', 'createdAt', 'project', 'type'],
        ...data.map((item) => [item.promptName, item.status, item.createdAt, item.projectName ?? '', item.requestKind]),
      ])
      return
    }

    const markdown = [
      '# History',
      '',
      ...data.map((item) => `- ${item.createdAt} | ${item.promptName} | ${item.status} | ${item.requestKind}`),
    ].join('\n')
    WorkspaceExchangeService.downloadText('history-collaboration.md', markdown, 'text/markdown;charset=utf-8')
  }

  static logGenerationStarted(input: { actorId: string; actorName: string; projectId?: string; promptName: string }): void {
    const store = this.getStore()
    this.pushActivity(store, {
      type: 'generation.started',
      actorId: input.actorId,
      actorName: input.actorName,
      projectId: input.projectId,
      message: `${input.actorName} launched generation for ${input.promptName}.`,
    })
    this.saveStore(store)
  }

  static logProviderUpdated(input: { actorId: string; actorName: string; providerId: string; action: string }): void {
    const store = this.getStore()
    this.pushActivity(store, {
      type: 'provider.updated',
      actorId: input.actorId,
      actorName: input.actorName,
      message: `${input.actorName} ${input.action} provider ${input.providerId}.`,
      metadata: { providerId: input.providerId, action: input.action },
    })
    this.saveStore(store)
  }

  private static pushActivity(
    store: CollaborationStore,
    input: Omit<CollaborationActivity, 'id' | 'createdAt'>,
  ): void {
    const next: CollaborationActivity = {
      id: `act-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      createdAt: nowIso(),
      ...input,
    }

    store.activities = [next, ...store.activities].slice(0, 500)
  }

  private static recordHistoryEvent(input: {
    title: string
    body: string
    projectId?: string
    actorName: string
    entityType: CollaborationEntityType
    entityId: string
  }): void {
    HistoryWorkspaceService.addRecord({
      id: `history-collab-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      promptName: input.title,
      promptText: input.body,
      output: `${input.entityType}:${input.entityId}`,
      provider: 'workspace',
      model: 'collaboration',
      status: 'completed',
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      projectId: input.projectId,
      projectName: input.projectId,
      actorName: input.actorName,
      entityType: input.entityType,
      entityId: input.entityId,
    })
  }
}

function extractMentions(body: string): string[] {
  return body
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.startsWith('@') && token.length > 1)
    .map((token) => token.replaceAll(/[^a-zA-Z0-9_@-]/g, ''))
}
