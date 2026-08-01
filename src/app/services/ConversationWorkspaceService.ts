import { PDFDocument, StandardFonts } from 'pdf-lib'
import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { notificationService } from '#/app/services/NotificationService'
import { ProviderWorkspaceService } from '#/app/services/ProviderWorkspaceService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'

export type ConversationRole = 'user' | 'assistant' | 'system' | 'developer' | 'tool' | 'function' | 'error' | 'warning' | 'info'
export type ConversationMessageStatus = 'streaming' | 'cancelled' | 'retry' | 'failed' | 'completed' | 'pending'
export type ConversationAttachmentKind = 'text' | 'image' | 'pdf' | 'docx' | 'csv' | 'json' | 'audio' | 'video' | 'code' | 'zip'
export type ConversationStatus = 'idle' | 'running' | 'failed' | 'completed' | 'cancelled'

export type ConversationAttachment = {
  id: string
  name: string
  kind: ConversationAttachmentKind
  size: number
  mimeType: string
  createdAt: string
}

export type ConversationMessage = {
  id: string
  role: ConversationRole
  content: string
  createdAt: string
  status: ConversationMessageStatus
  tokens: number
  cost: number
  latencyMs: number
  provider: string
  model: string
  attachments: ConversationAttachment[]
}

export type ConversationVersion = {
  id: string
  createdAt: string
  label: string
  messageCount: number
  snapshot: string
}

export type ConversationComment = {
  id: string
  author: string
  body: string
  createdAt: string
  mentions: string[]
}

export type ConversationReview = {
  id: string
  author: string
  score: number
  comment: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export type ConversationEvent = {
  id: string
  createdAt: string
  level: 'info' | 'warning' | 'error'
  type: string
  message: string
}

export type ConversationDiagnostic = {
  id: string
  createdAt: string
  category: 'provider' | 'model' | 'network' | 'cost' | 'tokens' | 'runtime'
  message: string
}

export type ConversationStreamingState = {
  active: boolean
  paused: boolean
  progress: number
  deliveredChunks: number
  totalChunks: number
  reconnectAttempts: number
  startedAt?: string
  lastEventAt?: string
}

export type ConversationCollection = {
  id: string
  name: string
  conversationIds: string[]
}

export type ConversationRecord = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  provider: string
  model: string
  sdkVersion: string
  quota: string
  wallet: string
  credits: string
  subscription: string
  health: string
  latencyMs: number
  capabilities: {
    streaming: boolean
    vision: boolean
    audio: boolean
    image: boolean
    embedding: boolean
    reasoning: boolean
    toolCalling: boolean
  }
  status: ConversationStatus
  favorite: boolean
  pinned: boolean
  archived: boolean
  published: boolean
  tags: string[]
  collectionIds: string[]
  sharedLink?: string
  draft: string
  draftAttachments: ConversationAttachment[]
  draftVariables: Record<string, string>
  undoStack: string[]
  redoStack: string[]
  messages: ConversationMessage[]
  versions: ConversationVersion[]
  comments: ConversationComment[]
  reviews: ConversationReview[]
  timeline: ConversationEvent[]
  diagnostics: ConversationDiagnostic[]
  streaming: ConversationStreamingState
}

export type ConversationWorkspaceStore = {
  conversations: ConversationRecord[]
  openConversationIds: string[]
  activeConversationId: string | null
  collections: ConversationCollection[]
}

export type ConversationSearchFilters = {
  text: string
  provider: string
  model: string
  date: string
  tokensMin: number
  costMax: number
  tag: string
  favoritesOnly: boolean
  collectionId: string
}

const STORAGE_KEY = 'srg.conversation.workspace.v1'

function nowIso() {
  return new Date().toISOString()
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function guessAttachmentKind(name: string, mimeType: string): ConversationAttachmentKind {
  const lower = name.toLowerCase()
  if (mimeType.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/.test(lower)) return 'image'
  if (mimeType.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/.test(lower)) return 'audio'
  if (mimeType.startsWith('video/') || /\.(mp4|mov|avi|webm)$/.test(lower)) return 'video'
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.endsWith('.docx')) return 'docx'
  if (lower.endsWith('.csv')) return 'csv'
  if (lower.endsWith('.json')) return 'json'
  if (lower.endsWith('.zip')) return 'zip'
  if (/\.(ts|tsx|js|jsx|py|java|go|rs|cs|php|rb|sh|md)$/.test(lower)) return 'code'
  return 'text'
}

function messageTokens(content: string) {
  return Math.max(1, Math.ceil(content.length / 4))
}

function defaultStore(): ConversationWorkspaceStore {
  const providers = ProviderWorkspaceService.list()
  const base = providers.find((item) => item.status === 'enabled') ?? providers[0]
  const first = createConversationRecord(
    'Daily AI Workspace',
    base.label,
    base.id === 'anthropic' ? 'claude-sonnet-4' : base.id === 'azure-openai' ? 'gpt-4.1' : 'gpt-5',
    base.sdkVersion,
    base.quota,
    base.wallet,
    base.credits,
    base.subscription,
    base.health,
    base.latencyMs,
    base.modalities,
  )
  return {
    conversations: [first],
    openConversationIds: [first.id],
    activeConversationId: first.id,
    collections: [
      { id: 'conv-col-favorites', name: 'Favorites', conversationIds: [] },
      { id: 'conv-col-recent', name: 'Recent', conversationIds: [first.id] },
      { id: 'conv-col-published', name: 'Published', conversationIds: [] },
    ],
  }
}

function createConversationRecord(
  title: string,
  provider: string,
  model: string,
  sdkVersion: string,
  quota: string,
  wallet: string,
  credits: string,
  subscription: string,
  health: string,
  latencyMs: number,
  modalities: string[],
): ConversationRecord {
  const createdAt = nowIso()
  return {
    id: id('conv'),
    title,
    createdAt,
    updatedAt: createdAt,
    provider,
    model,
    sdkVersion,
    quota,
    wallet,
    credits,
    subscription,
    health,
    latencyMs,
    capabilities: {
      streaming: modalities.includes('streaming'),
      vision: modalities.includes('vision'),
      audio: modalities.includes('audio'),
      image: modalities.includes('image'),
      embedding: modalities.includes('embedding'),
      reasoning: true,
      toolCalling: true,
    },
    status: 'idle',
    favorite: false,
    pinned: false,
    archived: false,
    published: false,
    tags: ['workspace'],
    collectionIds: [],
    draft: '',
    draftAttachments: [],
    draftVariables: {},
    undoStack: [],
    redoStack: [],
    messages: [],
    versions: [],
    comments: [],
    reviews: [],
    timeline: [],
    diagnostics: [],
    streaming: {
      active: false,
      paused: false,
      progress: 0,
      deliveredChunks: 0,
      totalChunks: 0,
      reconnectAttempts: 0,
    },
  }
}

function buildAssistantResponse(prompt: string, provider: string, model: string): string {
  return [
    `Provider: ${provider}`,
    `Model: ${model}`,
    '',
    'Synthese de la demande:',
    prompt,
    '',
    'Plan propose:',
    '- Clarifier le contexte et les contraintes.',
    '- Proposer une solution actionnable.',
    '- Lister points de controle (cout, latence, tokens, risque).',
  ].join('\n')
}

export class ConversationWorkspaceService {
  private static memory = defaultStore()

  static getStore(): ConversationWorkspaceStore {
    return this.readStorage()
  }

  static listConversations(): ConversationRecord[] {
    return this.getStore().conversations.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return a.updatedAt < b.updatedAt ? 1 : -1
    })
  }

  static getConversation(idValue: string): ConversationRecord | undefined {
    return this.getStore().conversations.find((item) => item.id === idValue)
  }

  static getActiveConversation(): ConversationRecord | undefined {
    const store = this.getStore()
    if (!store.activeConversationId) return undefined
    return this.getConversation(store.activeConversationId)
  }

  static createConversation(input?: { title?: string; providerId?: string; model?: string }): ConversationRecord {
    const providers = ProviderWorkspaceService.list()
    const provider = providers.find((item) => item.id === input?.providerId) ?? providers.find((item) => item.status === 'enabled') ?? providers[0]
    const next = createConversationRecord(
      input?.title?.trim() || 'New Conversation',
      provider.label,
      input?.model?.trim() || 'gpt-5',
      provider.sdkVersion,
      provider.quota,
      provider.wallet,
      provider.credits,
      provider.subscription,
      provider.health,
      provider.latencyMs,
      provider.modalities,
    )

    const store = this.getStore()
    const updated: ConversationWorkspaceStore = {
      ...store,
      conversations: [next, ...store.conversations],
      openConversationIds: [next.id, ...store.openConversationIds.filter((item) => item !== next.id)],
      activeConversationId: next.id,
    }
    this.writeStorage(updated)
    this.pushTimeline(next.id, 'info', 'conversation.created', `Conversation ${next.title} created.`)
    return next
  }

  static setActiveConversation(idValue: string): void {
    const store = this.getStore()
    if (!store.conversations.some((item) => item.id === idValue)) return
    this.writeStorage({
      ...store,
      activeConversationId: idValue,
      openConversationIds: [idValue, ...store.openConversationIds.filter((item) => item !== idValue)],
    })
  }

  static closeConversationTab(idValue: string): void {
    const store = this.getStore()
    const openIds = store.openConversationIds.filter((item) => item !== idValue)
    const activeConversationId = store.activeConversationId === idValue ? openIds[0] ?? null : store.activeConversationId
    this.writeStorage({ ...store, openConversationIds: openIds, activeConversationId })
  }

  static openConversationTab(idValue: string): void {
    const store = this.getStore()
    if (!store.conversations.some((item) => item.id === idValue)) return
    this.writeStorage({
      ...store,
      openConversationIds: [idValue, ...store.openConversationIds.filter((item) => item !== idValue)],
      activeConversationId: idValue,
    })
  }

  static toggleFavorite(idValue: string): void {
    this.updateConversation(idValue, (item) => ({ ...item, favorite: !item.favorite, updatedAt: nowIso() }))
  }

  static togglePinned(idValue: string): void {
    this.updateConversation(idValue, (item) => ({ ...item, pinned: !item.pinned, updatedAt: nowIso() }))
  }

  static archiveConversation(idValue: string): void {
    this.updateConversation(idValue, (item) => ({ ...item, archived: true, status: 'completed', updatedAt: nowIso() }))
    this.pushTimeline(idValue, 'info', 'conversation.archived', 'Conversation archived.')
  }

  static deleteConversation(idValue: string): void {
    const store = this.getStore()
    const conversations = store.conversations.filter((item) => item.id !== idValue)
    const openConversationIds = store.openConversationIds.filter((item) => item !== idValue)
    let activeConversationId = store.activeConversationId
    if (store.activeConversationId === idValue) {
      activeConversationId = openConversationIds.length > 0 ? openConversationIds[0] : conversations.length > 0 ? conversations[0].id : null
    }
    this.writeStorage({ ...store, conversations, openConversationIds, activeConversationId })
  }

  static duplicateConversation(idValue: string): ConversationRecord | undefined {
    const current = this.getConversation(idValue)
    if (!current) return undefined
    const next: ConversationRecord = {
      ...current,
      id: id('conv'),
      title: `${current.title} (Copy)`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      favorite: false,
      pinned: false,
      sharedLink: undefined,
      versions: current.versions.map((item) => ({ ...item, id: id('version') })),
      comments: [...current.comments],
      reviews: [...current.reviews],
      timeline: [...current.timeline],
      diagnostics: [...current.diagnostics],
    }
    const store = this.getStore()
    this.writeStorage({
      ...store,
      conversations: [next, ...store.conversations],
      openConversationIds: [next.id, ...store.openConversationIds],
      activeConversationId: next.id,
    })
    return next
  }

  static setProviderModel(idValue: string, provider: string, model: string): void {
    this.updateConversation(idValue, (item) => {
      const providerInfo = ProviderWorkspaceService.list().find((entry) => entry.label === provider || entry.id === provider.toLowerCase())
      return {
        ...item,
        provider,
        model,
        sdkVersion: providerInfo?.sdkVersion ?? item.sdkVersion,
        quota: providerInfo?.quota ?? item.quota,
        wallet: providerInfo?.wallet ?? item.wallet,
        credits: providerInfo?.credits ?? item.credits,
        subscription: providerInfo?.subscription ?? item.subscription,
        health: providerInfo?.health ?? item.health,
        latencyMs: providerInfo?.latencyMs ?? item.latencyMs,
        capabilities: providerInfo
          ? {
              streaming: providerInfo.capabilities.streaming,
              vision: providerInfo.capabilities.vision,
              audio: providerInfo.capabilities.audio,
              image: providerInfo.capabilities.image,
              embedding: providerInfo.capabilities.embeddings,
              reasoning: providerInfo.capabilities.reasoning,
              toolCalling: providerInfo.capabilities.toolCalling,
            }
          : item.capabilities,
        updatedAt: nowIso(),
      }
    })
    const running = this.getConversation(idValue)
    if (running?.streaming.active) {
      this.pushTimeline(idValue, 'warning', 'stream.provider.switch', `Provider switched in-stream to ${provider} (${model}).`)
      this.pushDiagnostic(idValue, 'provider', `In-stream provider switch: ${provider} / ${model}.`)
    }
    this.pushTimeline(idValue, 'info', 'conversation.provider', `Provider updated to ${provider} (${model}).`)
  }

  static setDraft(idValue: string, draft: string): void {
    this.updateConversation(idValue, (item) => ({
      ...item,
      undoStack: item.draft !== draft ? [...item.undoStack.slice(-40), item.draft] : item.undoStack,
      redoStack: item.draft !== draft ? [] : item.redoStack,
      draft,
      updatedAt: nowIso(),
    }))
  }

  static undoDraft(idValue: string): void {
    this.updateConversation(idValue, (item) => {
      const last = item.undoStack[item.undoStack.length - 1]
      if (typeof last !== 'string') return item
      return {
        ...item,
        draft: last,
        undoStack: item.undoStack.slice(0, -1),
        redoStack: [...item.redoStack, item.draft].slice(-40),
        updatedAt: nowIso(),
      }
    })
  }

  static redoDraft(idValue: string): void {
    this.updateConversation(idValue, (item) => {
      const last = item.redoStack[item.redoStack.length - 1]
      if (typeof last !== 'string') return item
      return {
        ...item,
        draft: last,
        redoStack: item.redoStack.slice(0, -1),
        undoStack: [...item.undoStack, item.draft].slice(-40),
        updatedAt: nowIso(),
      }
    })
  }

  static setVariable(idValue: string, name: string, value: string): void {
    this.updateConversation(idValue, (item) => ({
      ...item,
      draftVariables: { ...item.draftVariables, [name]: value },
      updatedAt: nowIso(),
    }))
  }

  static addAttachment(idValue: string, file: File): ConversationAttachment {
    const attachment: ConversationAttachment = {
      id: id('attachment'),
      name: file.name,
      kind: guessAttachmentKind(file.name, file.type),
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      createdAt: nowIso(),
    }
    this.updateConversation(idValue, (item) => ({
      ...item,
      draftAttachments: [attachment, ...item.draftAttachments],
      updatedAt: nowIso(),
    }))
    return attachment
  }

  static removeAttachment(idValue: string, attachmentId: string): void {
    this.updateConversation(idValue, (item) => ({
      ...item,
      draftAttachments: item.draftAttachments.filter((entry) => entry.id !== attachmentId),
      updatedAt: nowIso(),
    }))
  }

  static sendMessage(idValue: string): ConversationRecord | undefined {
    const current = this.getConversation(idValue)
    if (!current) return undefined
    const prompt = current.draft.trim()
    if (!prompt && current.draftAttachments.length === 0) return current

    const createdAt = nowIso()
    const userMessage: ConversationMessage = {
      id: id('msg-user'),
      role: 'user',
      content: prompt || '[Attachments sent] ',
      createdAt,
      status: 'completed',
      tokens: messageTokens(prompt),
      cost: 0,
      latencyMs: 0,
      provider: current.provider,
      model: current.model,
      attachments: [...current.draftAttachments],
    }

    const assistantBody = buildAssistantResponse(prompt, current.provider, current.model)
    const latency = Math.max(120, current.latencyMs)
    const outputTokens = messageTokens(assistantBody)
    const assistantMessage: ConversationMessage = {
      id: id('msg-assistant'),
      role: 'assistant',
      content: 'Streaming in progress...',
      createdAt: nowIso(),
      status: 'streaming',
      tokens: outputTokens,
      cost: Number((outputTokens * 0.000002).toFixed(6)),
      latencyMs: latency,
      provider: current.provider,
      model: current.model,
      attachments: [],
    }

    this.updateConversation(idValue, (item) => ({
      ...item,
      status: 'running',
      messages: [...item.messages, userMessage, assistantMessage],
      draft: '',
      draftAttachments: [],
      undoStack: [],
      redoStack: [],
      streaming: {
        active: true,
        paused: false,
        progress: 35,
        deliveredChunks: 3,
        totalChunks: 8,
        reconnectAttempts: 0,
        startedAt: nowIso(),
        lastEventAt: nowIso(),
      },
      updatedAt: nowIso(),
    }))

    this.pushTimeline(idValue, 'info', 'conversation.message', 'User message sent and assistant streaming started.')
    this.pushTimeline(idValue, 'info', 'stream.started', 'Assistant stream opened.')
    this.pushTimeline(idValue, 'info', 'provider.telemetry', `Provider ${current.provider} • quota ${current.quota} • wallet ${current.wallet} • credits ${current.credits}.`)
    this.pushTimeline(idValue, 'info', 'subscription.state', `Subscription ${current.subscription} in use.`)
    this.pushDiagnostic(idValue, 'tokens', `Input ${userMessage.tokens} / Output ${assistantMessage.tokens} tokens.`)
    this.pushDiagnostic(idValue, 'cost', `Estimated cost ${assistantMessage.cost.toFixed(6)} on ${current.provider}/${current.model}.`)

    HistoryWorkspaceService.addRecord({
      id: id('history-conversation'),
      promptName: `Conversation ${current.title}`,
      promptText: prompt,
      output: assistantBody,
      provider: current.provider,
      model: current.model,
      status: 'completed',
      durationMs: latency,
      tokensInput: userMessage.tokens,
      tokensOutput: assistantMessage.tokens,
      costEstimate: assistantMessage.cost,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      eventType: 'modification',
      entityType: 'prompt',
      entityId: current.id,
      actorName: 'Conversation Workspace',
    })

    notificationService.publish({
      title: 'conversation completed',
      message: `${current.title} completed on ${current.provider}/${current.model}`,
      level: 'success',
      priority: 'medium',
      category: 'generation',
      read: false,
      channels: ['email'],
    })

    return this.getConversation(idValue)
  }

  static retryLastAssistant(idValue: string): void {
    const conversation = this.getConversation(idValue)
    if (!conversation) return
    const lastUser = [...conversation.messages].reverse().find((item) => item.role === 'user')
    if (!lastUser) return
    this.setDraft(idValue, `${lastUser.content}\n\nRetry with stricter output quality.`)
    this.sendMessage(idValue)
    this.pushTimeline(idValue, 'warning', 'conversation.retry', 'Conversation retried.')
  }

  static stopConversation(idValue: string): void {
    this.updateConversation(idValue, (item) => ({
      ...item,
      status: 'cancelled',
      messages: item.messages.map((entry) =>
        entry.status === 'streaming'
          ? { ...entry, status: 'cancelled' }
          : entry,
      ),
      streaming: {
        ...item.streaming,
        active: false,
        paused: true,
        lastEventAt: nowIso(),
      },
      updatedAt: nowIso(),
    }))
    this.pushTimeline(idValue, 'warning', 'conversation.stop', 'Conversation stopped by user.')
  }

  static resumeConversation(idValue: string): void {
    this.updateConversation(idValue, (item) => {
      const hasStreaming = item.messages.some((entry) => entry.status === 'streaming' || entry.status === 'cancelled')
      if (!hasStreaming) {
        return { ...item, status: 'running', updatedAt: nowIso() }
      }

      const assistantBody = buildAssistantResponse(
        item.messages.filter((entry) => entry.role === 'user').at(-1)?.content ?? item.draft,
        item.provider,
        item.model,
      )
      return {
        ...item,
        status: 'completed',
        messages: item.messages.map((entry) =>
          entry.role === 'assistant' && (entry.status === 'streaming' || entry.status === 'cancelled')
            ? { ...entry, status: 'completed', content: assistantBody }
            : entry,
        ),
        streaming: {
          ...item.streaming,
          active: false,
          paused: false,
          progress: 100,
          deliveredChunks: Math.max(item.streaming.deliveredChunks, item.streaming.totalChunks),
          lastEventAt: nowIso(),
        },
        updatedAt: nowIso(),
      }
    })
    this.pushTimeline(idValue, 'info', 'conversation.resume', 'Conversation resumed and stream completed.')
    this.pushDiagnostic(idValue, 'runtime', 'Streaming resumed to completion.')
  }

  static reconnectConversation(idValue: string): void {
    this.updateConversation(idValue, (item) => ({
      ...item,
      status: 'running',
      streaming: {
        ...item.streaming,
        active: true,
        paused: false,
        reconnectAttempts: item.streaming.reconnectAttempts + 1,
        progress: Math.min(95, item.streaming.progress + 15),
        deliveredChunks: Math.min(item.streaming.totalChunks, item.streaming.deliveredChunks + 1),
        lastEventAt: nowIso(),
      },
      updatedAt: nowIso(),
    }))
    this.pushTimeline(idValue, 'warning', 'stream.reconnect', 'Reconnection attempt applied to active stream.')
    this.pushDiagnostic(idValue, 'network', 'Stream reconnect attempt executed.')
  }

  static forkConversation(idValue: string): ConversationRecord | undefined {
    const current = this.getConversation(idValue)
    if (!current) return undefined
    const forked = this.duplicateConversation(idValue)
    if (!forked) return undefined
    this.updateConversation(forked.id, (item) => ({
      ...item,
      title: `${current.title} (Fork)`,
      tags: Array.from(new Set([...item.tags, 'fork'])),
      updatedAt: nowIso(),
    }))
    return this.getConversation(forked.id)
  }

  static createVersion(idValue: string, label: string): void {
    const conversation = this.getConversation(idValue)
    if (!conversation) return
    const version: ConversationVersion = {
      id: id('version'),
      createdAt: nowIso(),
      label: label.trim() || 'Snapshot',
      messageCount: conversation.messages.length,
      snapshot: JSON.stringify(conversation.messages, null, 2),
    }
    this.updateConversation(idValue, (item) => ({ ...item, versions: [version, ...item.versions], updatedAt: nowIso() }))
  }

  static addComment(idValue: string, author: string, body: string): void {
    const mentions = Array.from(body.matchAll(/@([\w.-]+)/g)).map((item) => item[1])
    const comment: ConversationComment = {
      id: id('comment'),
      author,
      body,
      mentions,
      createdAt: nowIso(),
    }
    this.updateConversation(idValue, (item) => ({ ...item, comments: [comment, ...item.comments], updatedAt: nowIso() }))
  }

  static addReview(idValue: string, author: string, score: number, comment: string): void {
    const review: ConversationReview = {
      id: id('review'),
      author,
      score: Math.max(1, Math.min(5, Math.round(score))),
      comment,
      createdAt: nowIso(),
      status: 'pending',
    }
    this.updateConversation(idValue, (item) => ({ ...item, reviews: [review, ...item.reviews], updatedAt: nowIso() }))
  }

  static togglePublished(idValue: string): void {
    this.updateConversation(idValue, (item) => ({ ...item, published: !item.published, updatedAt: nowIso() }))
  }

  static createShareLink(idValue: string): string | undefined {
    const conversation = this.getConversation(idValue)
    if (!conversation) return undefined
    const link = WorkspaceExchangeService.createShareLink('conversation', conversation.id, conversation.title)
    this.updateConversation(idValue, (item) => ({ ...item, sharedLink: link, updatedAt: nowIso() }))
    return link
  }

  static addTag(idValue: string, tag: string): void {
    const value = tag.trim()
    if (!value) return
    this.updateConversation(idValue, (item) => ({ ...item, tags: Array.from(new Set([...item.tags, value])), updatedAt: nowIso() }))
  }

  static removeTag(idValue: string, tag: string): void {
    this.updateConversation(idValue, (item) => ({ ...item, tags: item.tags.filter((entry) => entry !== tag), updatedAt: nowIso() }))
  }

  static assignToCollection(idValue: string, collectionId: string): void {
    const store = this.getStore()
    const collections = store.collections.map((item) =>
      item.id === collectionId
        ? { ...item, conversationIds: Array.from(new Set([idValue, ...item.conversationIds])) }
        : item,
    )
    const conversations = store.conversations.map((item) =>
      item.id === idValue ? { ...item, collectionIds: Array.from(new Set([collectionId, ...item.collectionIds])), updatedAt: nowIso() } : item,
    )
    this.writeStorage({ ...store, collections, conversations })
  }

  static createCollection(name: string): ConversationCollection {
    const store = this.getStore()
    const collection: ConversationCollection = {
      id: id('conv-col'),
      name: name.trim() || 'Collection',
      conversationIds: [],
    }
    this.writeStorage({ ...store, collections: [...store.collections, collection] })
    return collection
  }

  static search(filters: ConversationSearchFilters): ConversationRecord[] {
    const text = filters.text.trim().toLowerCase()
    return this.listConversations().filter((conversation) => {
      if (conversation.archived && !filters.favoritesOnly && !filters.collectionId && !filters.text && !filters.provider && !filters.model && !filters.tag && !filters.date) {
        return true
      }
      if (filters.favoritesOnly && !conversation.favorite) return false
      if (filters.provider && !conversation.provider.toLowerCase().includes(filters.provider.toLowerCase())) return false
      if (filters.model && !conversation.model.toLowerCase().includes(filters.model.toLowerCase())) return false
      if (filters.date && !conversation.updatedAt.startsWith(filters.date)) return false
      if (filters.tag && !conversation.tags.some((tag) => tag.toLowerCase().includes(filters.tag.toLowerCase()))) return false
      if (filters.collectionId && !conversation.collectionIds.includes(filters.collectionId)) return false
      const stats = this.getStatistics(conversation)
      if (stats.totalTokens < filters.tokensMin) return false
      if (stats.totalCost > filters.costMax) return false
      if (text) {
        const blob = `${conversation.title} ${conversation.provider} ${conversation.model} ${conversation.tags.join(' ')} ${conversation.messages.map((item) => item.content).join(' ')}`.toLowerCase()
        if (!blob.includes(text)) return false
      }
      return true
    })
  }

  static getStatistics(conversation: ConversationRecord): {
    totalTokens: number
    totalCost: number
    averageLatencyMs: number
    userMessages: number
    assistantMessages: number
  } {
    const totalTokens = conversation.messages.reduce((sum, item) => sum + item.tokens, 0)
    const totalCost = conversation.messages.reduce((sum, item) => sum + item.cost, 0)
    const averageLatencyMs = conversation.messages.length
      ? Math.round(conversation.messages.reduce((sum, item) => sum + item.latencyMs, 0) / conversation.messages.length)
      : 0
    const userMessages = conversation.messages.filter((item) => item.role === 'user').length
    const assistantMessages = conversation.messages.filter((item) => item.role === 'assistant').length
    return {
      totalTokens,
      totalCost: Number(totalCost.toFixed(6)),
      averageLatencyMs,
      userMessages,
      assistantMessages,
    }
  }

  static getGlobalSummary(): {
    active: number
    archived: number
    totalTokens: number
    totalCost: number
    averageLatencyMs: number
    topProviders: Array<{ provider: string; count: number }>
    topModels: Array<{ model: string; count: number }>
    topConversations: Array<{ id: string; title: string; tokens: number }>
    lifecycle: {
      running: number
      cancelled: number
      completed: number
      failed: number
      avgStreamProgress: number
    }
    charts: {
      tokens: number[]
      costs: number[]
      latencies: number[]
    }
  } {
    const conversations = this.listConversations()
    const active = conversations.filter((item) => !item.archived).length
    const archived = conversations.filter((item) => item.archived).length
    const totals = conversations.map((item) => ({ id: item.id, title: item.title, ...this.getStatistics(item), provider: item.provider, model: item.model }))
    const totalTokens = totals.reduce((sum, item) => sum + item.totalTokens, 0)
    const totalCost = totals.reduce((sum, item) => sum + item.totalCost, 0)
    const averageLatencyMs = totals.length ? Math.round(totals.reduce((sum, item) => sum + item.averageLatencyMs, 0) / totals.length) : 0

    const topProviders = Array.from(
      totals.reduce((acc, item) => acc.set(item.provider, (acc.get(item.provider) ?? 0) + 1), new Map<string, number>()),
    ).map(([provider, count]) => ({ provider, count })).sort((a, b) => b.count - a.count).slice(0, 5)

    const topModels = Array.from(
      totals.reduce((acc, item) => acc.set(item.model, (acc.get(item.model) ?? 0) + 1), new Map<string, number>()),
    ).map(([model, count]) => ({ model, count })).sort((a, b) => b.count - a.count).slice(0, 5)

    const topConversations = totals
      .map((item) => ({ id: item.id, title: item.title, tokens: item.totalTokens }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 5)

    const lifecycle = {
      running: conversations.filter((item) => item.status === 'running').length,
      cancelled: conversations.filter((item) => item.status === 'cancelled').length,
      completed: conversations.filter((item) => item.status === 'completed').length,
      failed: conversations.filter((item) => item.status === 'failed').length,
      avgStreamProgress: conversations.length
        ? Math.round(conversations.reduce((sum, item) => sum + item.streaming.progress, 0) / conversations.length)
        : 0,
    }

    const charts = {
      tokens: totals.slice(0, 10).map((item) => item.totalTokens),
      costs: totals.slice(0, 10).map((item) => Number(item.totalCost.toFixed(6))),
      latencies: totals.slice(0, 10).map((item) => item.averageLatencyMs),
    }

    return {
      active,
      archived,
      totalTokens,
      totalCost: Number(totalCost.toFixed(6)),
      averageLatencyMs,
      topProviders,
      topModels,
      topConversations,
      lifecycle,
      charts,
    }
  }

  static compare(leftId: string, rightId: string): string {
    const left = this.getConversation(leftId)
    const right = this.getConversation(rightId)
    if (!left || !right) return 'Comparison unavailable.'
    const leftStats = this.getStatistics(left)
    const rightStats = this.getStatistics(right)
    return [
      `${left.title} vs ${right.title}`,
      `Messages: ${left.messages.length} vs ${right.messages.length}`,
      `Tokens: ${leftStats.totalTokens} vs ${rightStats.totalTokens}`,
      `Cost: ${leftStats.totalCost} vs ${rightStats.totalCost}`,
      `Latency(ms): ${leftStats.averageLatencyMs} vs ${rightStats.averageLatencyMs}`,
    ].join('\n')
  }

  static exportConversation(idValue: string, format: 'markdown' | 'json' | 'pdf' | 'html' | 'txt'): void {
    const conversation = this.getConversation(idValue)
    if (!conversation) return
    const content = this.toExportText(conversation)
    if (format === 'json') {
      WorkspaceExchangeService.downloadJson(`${conversation.title}.json`, conversation)
      return
    }
    if (format === 'markdown') {
      WorkspaceExchangeService.downloadText(`${conversation.title}.md`, content.markdown, 'text/markdown;charset=utf-8')
      return
    }
    if (format === 'txt') {
      WorkspaceExchangeService.downloadText(`${conversation.title}.txt`, content.txt)
      return
    }
    if (format === 'html') {
      WorkspaceExchangeService.downloadText(`${conversation.title}.html`, content.html, 'text/html;charset=utf-8')
      return
    }
    void this.exportPdf(conversation, content.txt)
  }

  private static toExportText(conversation: ConversationRecord): { markdown: string; txt: string; html: string } {
    const body = conversation.messages
      .map((item) => `\n[${item.role.toUpperCase()}|${item.status}] ${item.content}`)
      .join('\n')
    const markdown = `# ${conversation.title}\n\nProvider: ${conversation.provider} (${conversation.model})\n\n${body}`
    const txt = `${conversation.title}\nProvider: ${conversation.provider} (${conversation.model})\n${body}`
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${conversation.title}</title></head><body><h1>${conversation.title}</h1><p>Provider: ${conversation.provider} (${conversation.model})</p><pre>${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>`
    return { markdown, txt, html }
  }

  private static async exportPdf(conversation: ConversationRecord, text: string): Promise<void> {
    const doc = await PDFDocument.create()
    const page = doc.addPage([595.28, 841.89])
    const font = await doc.embedFont(StandardFonts.Helvetica)
    const titleFont = await doc.embedFont(StandardFonts.HelveticaBold)
    page.drawText(conversation.title, { x: 42, y: 800, size: 18, font: titleFont })
    const lines = text.split('\n').slice(0, 80)
    let cursor = 772
    lines.forEach((line) => {
      if (cursor < 40) return
      page.drawText(line.slice(0, 105), { x: 42, y: cursor, size: 9, font })
      cursor -= 11
    })
    const bytes = await doc.save()
    const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${conversation.title}.pdf`
    anchor.click()
    window.URL.revokeObjectURL(url)
  }

  private static pushTimeline(idValue: string, level: 'info' | 'warning' | 'error', type: string, message: string): void {
    this.updateConversation(idValue, (item) => ({
      ...item,
      timeline: [{ id: id('event'), createdAt: nowIso(), level, type, message }, ...item.timeline].slice(0, 120),
      updatedAt: nowIso(),
    }))
  }

  private static pushDiagnostic(idValue: string, category: ConversationDiagnostic['category'], message: string): void {
    this.updateConversation(idValue, (item) => ({
      ...item,
      diagnostics: [{ id: id('diag'), createdAt: nowIso(), category, message }, ...item.diagnostics].slice(0, 120),
      updatedAt: nowIso(),
    }))
  }

  private static updateConversation(idValue: string, updater: (item: ConversationRecord) => ConversationRecord): void {
    const store = this.getStore()
    const conversations = store.conversations.map((item) => (item.id === idValue ? updater(item) : item))
    this.writeStorage({ ...store, conversations })
  }

  private static readStorage(): ConversationWorkspaceStore {
    if (typeof window === 'undefined') return this.memory
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const seed = defaultStore()
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
        return seed
      }
      const parsedUnknown = JSON.parse(raw) as unknown
      if (typeof parsedUnknown !== 'object' || parsedUnknown === null) return defaultStore()
      const parsed = parsedUnknown as Partial<ConversationWorkspaceStore>
      if (!Array.isArray(parsed.conversations)) return defaultStore()
      return {
        ...defaultStore(),
        ...parsed,
        conversations: parsed.conversations.map((conversationUnknown) => {
          const conversation = conversationUnknown as Partial<ConversationRecord>
          return {
          ...conversation,
          streaming: conversation.streaming ?? {
            active: false,
            paused: false,
            progress: 0,
            deliveredChunks: 0,
            totalChunks: 0,
            reconnectAttempts: 0,
          },
          } as ConversationRecord
        }),
        collections: Array.isArray(parsed.collections) ? parsed.collections : defaultStore().collections,
        openConversationIds: Array.isArray(parsed.openConversationIds) ? parsed.openConversationIds : [],
      }
    } catch {
      return defaultStore()
    }
  }

  private static writeStorage(store: ConversationWorkspaceStore): void {
    this.memory = store
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }
}
