import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import Section from '#/app/components/Section'
import { useBusiness } from '#/app/hooks/useBusiness'
import { useConversationWorkspace } from '#/app/hooks/useConversationWorkspace'
import { useVoiceAssistant } from '#/app/hooks/useVoiceAssistant'
import { ConversationWorkspaceService } from '#/app/services/ConversationWorkspaceService'
import { ProviderWorkspaceService } from '#/app/services/ProviderWorkspaceService'
import type { ConversationAttachment, ConversationMessage, ConversationRecord, ConversationRole } from '#/app/services/ConversationWorkspaceService'

const messageRoleOrder: ConversationRole[] = ['user', 'assistant', 'system', 'developer', 'tool', 'function', 'error', 'warning', 'info']

function roleTone(role: ConversationRole): string {
  if (role === 'assistant') return 'bg-[var(--srg-surface)]'
  if (role === 'user') return 'bg-[var(--srg-surface-strong)]'
  if (role === 'error') return 'bg-[rgba(223,78,78,0.12)]'
  if (role === 'warning') return 'bg-[rgba(230,168,67,0.16)]'
  return 'bg-[var(--srg-surface)]'
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function previewLabel(kind: ConversationAttachment['kind']): string {
  if (kind === 'image') return 'Image Preview'
  if (kind === 'audio') return 'Audio Preview'
  if (kind === 'video') return 'Video Preview'
  if (kind === 'code') return 'Code Preview'
  if (kind === 'pdf') return 'PDF Preview'
  if (kind === 'docx') return 'Document Preview'
  if (kind === 'csv') return 'Table Preview'
  if (kind === 'json') return 'JSON Preview'
  return 'Markdown Preview'
}

function sparkline(values: number[], limit = 10): string {
  const glyphs = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
  const sample = values.slice(0, limit)
  const max = Math.max(...sample, 1)
  return sample.map((value) => glyphs[Math.min(glyphs.length - 1, Math.floor((value / max) * (glyphs.length - 1)))]).join('')
}

function messagePreview(message: ConversationMessage): string {
  if (message.attachments.length > 0) return `Attachments: ${message.attachments.map((item) => item.kind).join(', ')}`
  if (message.content.includes('```')) return 'Code Preview available'
  if (message.content.includes('#') || message.content.includes('- ')) return 'Markdown Preview available'
  return message.content.slice(0, 200)
}

function collectionNames(conversation: ConversationRecord, allCollections: Array<{ id: string; name: string }>): string {
  const labels = allCollections.filter((item) => conversation.collectionIds.includes(item.id)).map((item) => item.name)
  return labels.length > 0 ? labels.join(', ') : 'None'
}

export default function ConversationWorkspace() {
  const business = useBusiness()
  const { store, conversations, allConversations, activeConversation, globalSummary, filters, setFilters, refresh } = useConversationWorkspace()
  const providerCatalog = useMemo(() => ProviderWorkspaceService.list(), [])
  const [newTag, setNewTag] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [reviewScore, setReviewScore] = useState(5)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const actorId = business.currentSession ? business.currentSession.userId : (business.snapshot.users[0]?.id ?? 'system')
  const actorName = business.snapshot.users.find((item) => item.id === actorId)?.username ?? 'System'

  const selectedStats = activeConversation ? ConversationWorkspaceService.getStatistics(activeConversation) : null
  const compared = useMemo(() => allConversations.filter((item) => compareIds.includes(item.id)).slice(0, 2), [allConversations, compareIds])

  // Ask SRG vocal : Speech Recognition -> draft -> sendMessage (pipeline existant).
  const voiceAssistant = useVoiceAssistant()
  const voiceTranscriptRef = useState({ last: '' })[0]

  // Lorsque la reconnaissance vocale produit un resultat final, on l'injecte
  // dans le draft puis on envoie via le pipeline existant.
  useEffect(() => {
    if (!activeConversation) return
    if (!voiceAssistant.lastTranscript) return
    if (voiceTranscriptRef.last === voiceAssistant.lastTranscript) return
    voiceTranscriptRef.last = voiceAssistant.lastTranscript
    ConversationWorkspaceService.setDraft(activeConversation.id, voiceAssistant.lastTranscript)
    ConversationWorkspaceService.sendMessage(activeConversation.id)
    voiceAssistant.resetTranscripts()
    refresh()
  }, [voiceAssistant.lastTranscript])

  // Derniere reponse assistant pour lecture vocale.
  const lastAssistantMessage = activeConversation
    ? [...activeConversation.messages].reverse().find((message) => message.role === 'assistant' && message.status === 'completed')
    : undefined

  const speakLastResponse = () => {
    if (!lastAssistantMessage) return
    voiceAssistant.speak(lastAssistantMessage.content)
  }

  const send = () => {
    if (!activeConversation) return
    ConversationWorkspaceService.sendMessage(activeConversation.id)
    refresh()
  }

  const onAttach = (file: File) => {
    if (!activeConversation) return
    ConversationWorkspaceService.addAttachment(activeConversation.id, file)
    refresh()
  }

  return (
    <div className="space-y-6">
      <Section title="Conversation Tabs" description="Multi onglets avec état indépendant, provider et modèle par conversation.">
        <div className="flex flex-wrap items-center gap-2">
          {store.openConversationIds.length === 0 ? <span className="text-sm text-[var(--srg-text-muted)]">No open tabs</span> : null}
          {store.openConversationIds.map((convId) => {
            const conv = allConversations.find((item) => item.id === convId)
            if (!conv) return null
            const active = store.activeConversationId === conv.id
            return (
              <div key={conv.id} className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs ${active ? 'border-[var(--srg-color-primary-400)] bg-[var(--srg-surface)]' : 'border-[var(--srg-border)] bg-[var(--srg-surface-strong)]'}`}>
                <button type="button" onClick={() => { ConversationWorkspaceService.setActiveConversation(conv.id); refresh() }} className="font-semibold text-[var(--srg-text-title)]">
                  {conv.title}
                </button>
                <button type="button" aria-label="Close tab" onClick={() => { ConversationWorkspaceService.closeConversationTab(conv.id); refresh() }} className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-[var(--srg-text-muted)]">
                  ×
                </button>
              </div>
            )
          })}
          <button
            type="button"
            onClick={() => {
              ConversationWorkspaceService.createConversation({ title: 'Untitled Chat' })
              refresh()
            }}
            className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 text-xs font-semibold text-white"
          >
            + New Tab
          </button>
        </div>
      </Section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_minmax(620px,1.5fr)_0.95fr]">
        <section className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Conversation List</h3>
            <button type="button" onClick={() => { ConversationWorkspaceService.createConversation({ title: 'Workspace Conversation' }); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-xs font-semibold">
              New
            </button>
          </div>

          <div className="grid gap-2">
            <input
              aria-label="Conversation Search"
              value={filters.text}
              onChange={(event) => setFilters((current) => ({ ...current, text: event.target.value }))}
              placeholder="Conversation Search"
              className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={filters.provider} onChange={(event) => setFilters((current) => ({ ...current, provider: event.target.value }))} placeholder="Provider" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm" />
              <input value={filters.model} onChange={(event) => setFilters((current) => ({ ...current, model: event.target.value }))} placeholder="Model" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm" />
              <input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm" />
              <input value={filters.tag} onChange={(event) => setFilters((current) => ({ ...current, tag: event.target.value }))} placeholder="Tag" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm" />
              <input type="number" min={0} value={Number.isFinite(filters.costMax) ? filters.costMax : ''} onChange={(event) => setFilters((current) => ({ ...current, costMax: event.target.value ? Number(event.target.value) : Number.POSITIVE_INFINITY }))} placeholder="Max Cost" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm">
                <input type="checkbox" checked={filters.favoritesOnly} onChange={(event) => setFilters((current) => ({ ...current, favoritesOnly: event.target.checked }))} />
                Favorites
              </label>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {conversations.length === 0 ? (
              <EmptyState
                eyebrow="Conversations"
                illustration={<span aria-hidden>◌</span>}
                title="No conversation"
                description="Create your first conversation to start AI daily work."
              />
            ) : null}
            {conversations.map((conversation) => {
              const stats = ConversationWorkspaceService.getStatistics(conversation)
              const active = activeConversation?.id === conversation.id
              return (
                <article key={conversation.id} className={`rounded-2xl border p-4 ${active ? 'border-[var(--srg-color-primary-400)] bg-[var(--srg-surface)]' : 'border-[var(--srg-border)] bg-[var(--srg-surface-strong)]'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button type="button" onClick={() => { ConversationWorkspaceService.openConversationTab(conversation.id); refresh() }} className="text-left font-semibold text-[var(--srg-text-title)]">
                      {conversation.title}
                    </button>
                    <span className="rounded-full bg-[var(--srg-surface)] px-2 py-1 text-xs text-[var(--srg-text-muted)]">{conversation.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--srg-text-muted)]">{conversation.provider} • {conversation.model} • {stats.totalTokens} tokens</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => { ConversationWorkspaceService.toggleFavorite(conversation.id); refresh() }} className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-xs">{conversation.favorite ? 'Unfavorite' : 'Favorite'}</button>
                    <button type="button" onClick={() => { ConversationWorkspaceService.togglePinned(conversation.id); refresh() }} className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-xs">{conversation.pinned ? 'Unpin' : 'Pin'}</button>
                    <button type="button" onClick={() => { ConversationWorkspaceService.archiveConversation(conversation.id); refresh() }} className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-xs">Archive</button>
                    <button type="button" onClick={() => { ConversationWorkspaceService.duplicateConversation(conversation.id); refresh() }} className="rounded-xl border border-[var(--srg-border)] px-2 py-1 text-xs">Duplicate</button>
                    <button type="button" onClick={() => { ConversationWorkspaceService.deleteConversation(conversation.id); refresh() }} className="rounded-xl border border-[rgba(223,78,78,0.24)] px-2 py-1 text-xs text-[#9b2f2f]">Delete</button>
                  </div>
                  <label className="mt-3 inline-flex items-center gap-2 text-xs text-[var(--srg-text-muted)]">
                    <input
                      type="checkbox"
                      checked={compareIds.includes(conversation.id)}
                      onChange={(event) => {
                        setCompareIds((current) => {
                          if (event.target.checked) return [...current.filter((item) => item !== conversation.id), conversation.id].slice(-2)
                          return current.filter((item) => item !== conversation.id)
                        })
                      }}
                    />
                    Compare
                  </label>
                </article>
              )
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Conversation Header</h3>
              <p className="text-sm text-[var(--srg-text-muted)]">Conversation Provider / Model / Status / Cost / Tokens / Latency</p>
            </div>
            {activeConversation ? (
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => { ConversationWorkspaceService.retryLastAssistant(activeConversation.id); refresh() }} className="rounded-2xl border border-[var(--srg-border)] px-3 py-2 text-xs font-semibold">Retry</button>
                <button type="button" onClick={() => { ConversationWorkspaceService.stopConversation(activeConversation.id); refresh() }} className="rounded-2xl border border-[var(--srg-border)] px-3 py-2 text-xs font-semibold">Stop</button>
                <button type="button" onClick={() => { ConversationWorkspaceService.resumeConversation(activeConversation.id); refresh() }} className="rounded-2xl border border-[var(--srg-border)] px-3 py-2 text-xs font-semibold">Resume</button>
                <button type="button" onClick={() => { ConversationWorkspaceService.reconnectConversation(activeConversation.id); refresh() }} className="rounded-2xl border border-[var(--srg-border)] px-3 py-2 text-xs font-semibold">Reconnect</button>
                <button type="button" onClick={() => { ConversationWorkspaceService.forkConversation(activeConversation.id); refresh() }} className="rounded-2xl border border-[var(--srg-border)] px-3 py-2 text-xs font-semibold">Fork</button>
              </div>
            ) : null}
          </div>

          {!activeConversation ? (
            <EmptyState eyebrow="Conversation" illustration={<span aria-hidden>✦</span>} title="No active conversation" description="Open or create a conversation first." />
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <select value={activeConversation.provider} onChange={(event) => { ConversationWorkspaceService.setProviderModel(activeConversation.id, event.target.value, activeConversation.model); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm">
                  {providerCatalog.map((provider) => (
                    <option key={provider.id} value={provider.label}>{provider.label}</option>
                  ))}
                </select>
                <input value={activeConversation.model} onChange={(event) => { ConversationWorkspaceService.setProviderModel(activeConversation.id, activeConversation.provider, event.target.value); refresh() }} placeholder="Model" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm" />
                <input value={newTag} onChange={(event) => setNewTag(event.target.value)} placeholder="Conversation Tags" className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm" />
                <button type="button" onClick={() => { ConversationWorkspaceService.addTag(activeConversation.id, newTag); setNewTag(''); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm font-semibold">Add Tag</button>
                <button type="button" onClick={() => { ConversationWorkspaceService.createVersion(activeConversation.id, 'Manual snapshot'); refresh() }} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm font-semibold">Conversation Versions</button>
                <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-xs text-[var(--srg-text-muted)]">
                  Stream {activeConversation.streaming.progress}% • {activeConversation.streaming.deliveredChunks}/{activeConversation.streaming.totalChunks} chunks
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Conversation Messages</h4>
                  <div className="mt-3 max-h-[420px] space-y-3 overflow-auto pr-2">
                    {activeConversation.messages.length === 0 ? (
                      <p className="text-sm text-[var(--srg-text-muted)]">Start with Conversation Composer.</p>
                    ) : null}
                    {activeConversation.messages.map((message) => (
                      <article key={message.id} className={`rounded-2xl border border-[var(--srg-border)] p-4 ${roleTone(message.role)}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--srg-text-muted)]">
                          <span className="font-semibold text-[var(--srg-text-title)]">{message.role}</span>
                          <span>{message.status}</span>
                          <span>{message.provider} • {message.model}</span>
                          <span>{message.tokens} tokens • ${message.cost.toFixed(6)} • {message.latencyMs} ms</span>
                        </div>
                        <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-[var(--srg-text-title)]">{message.content}</pre>
                        <p className="mt-2 text-xs text-[var(--srg-text-muted)]">{messagePreview(message)}</p>
                        {message.attachments.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1 text-xs text-[var(--srg-text-muted)]">
                                <p>{previewLabel(attachment.kind)} • {attachment.name}</p>
                                <p>MIME: {attachment.mimeType || 'n/a'} • {formatBytes(attachment.size)}</p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--srg-color-primary-500)]">Conversation Composer</h4>
                  <textarea
                    aria-label="Conversation composer"
                    value={activeConversation.draft}
                    onChange={(event) => { ConversationWorkspaceService.setDraft(activeConversation.id, event.target.value); refresh() }}
                    onKeyDown={(event) => {
                      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                        event.preventDefault()
                        send()
                      }
                    }}
                    placeholder="Type your message (Ctrl/Cmd + Enter to send)"
                    className="mt-3 min-h-36 w-full rounded-[1.5rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => { ConversationWorkspaceService.undoDraft(activeConversation.id); refresh() }} className="rounded-2xl border border-[var(--srg-border)] px-3 py-2 text-xs">Undo</button>
                    <button type="button" onClick={() => { ConversationWorkspaceService.redoDraft(activeConversation.id); refresh() }} className="rounded-2xl border border-[var(--srg-border)] px-3 py-2 text-xs">Redo</button>
                    <button type="button" onClick={send} className="rounded-2xl bg-[var(--srg-color-primary-500)] px-3 py-2 text-xs font-semibold text-white">Send</button>
                    <button
                      type="button"
                      onClick={() => {
                        if (voiceAssistant.isListening) {
                          voiceAssistant.stopListening()
                        } else if (voiceAssistant.isSpeaking) {
                          voiceAssistant.stopSpeaking()
                        } else {
                          voiceAssistant.startListening()
                        }
                      }}
                      aria-label="Ask SRG vocal"
                      aria-pressed={voiceAssistant.isListening}
                      title={voiceAssistant.recognitionAvailable ? 'Dicter un message' : 'Reconnaissance vocale non disponible sur ce navigateur'}
                      className={`rounded-2xl px-3 py-2 text-xs font-semibold ${voiceAssistant.isListening ? 'bg-[var(--srg-color-primary-500)] text-white' : 'border border-[var(--srg-border)]'}`}
                    >
                      {voiceAssistant.isListening ? '🔴 Ecoute...' : voiceAssistant.isProcessing ? '⏳ Traitement...' : voiceAssistant.isSpeaking ? '🔊 SRG repond...' : '🎙️ Voix'}
                    </button>
                    <button
                      type="button"
                      onClick={speakLastResponse}
                      disabled={!lastAssistantMessage || !voiceAssistant.synthesisAvailable}
                      title={voiceAssistant.synthesisAvailable ? 'Lire la derniere reponse' : 'Voix non disponible sur cet appareil/navigateur'}
                      className="rounded-2xl border border-[var(--srg-border)] px-3 py-2 text-xs disabled:opacity-40"
                    >
                      🔊 Lire la reponse
                    </button>
                    <button type="button" onClick={() => { ConversationWorkspaceService.setDraft(activeConversation.id, `${activeConversation.draft}\nContinue.`); ConversationWorkspaceService.sendMessage(activeConversation.id); refresh() }} className="rounded-2xl border border-[var(--srg-border)] px-3 py-2 text-xs">Continue</button>
                    <button type="button" onClick={() => { ConversationWorkspaceService.retryLastAssistant(activeConversation.id); refresh() }} className="rounded-2xl border border-[var(--srg-border)] px-3 py-2 text-xs">Regenerate</button>
                    <label className="rounded-2xl border border-[var(--srg-border)] px-3 py-2 text-xs">
                      Attachments
                      <input type="file" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onAttach(file); event.target.value = '' }} />
                    </label>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-xs text-[var(--srg-text-muted)]">
                    <span className="font-semibold text-[var(--srg-text-title)]">Reponse vocale</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={voiceAssistant.voiceResponseEnabled}
                      onClick={() => voiceAssistant.setVoiceResponseEnabled(!voiceAssistant.voiceResponseEnabled)}
                      className={`rounded-full px-3 py-1 font-semibold ${voiceAssistant.voiceResponseEnabled ? 'bg-[var(--srg-color-primary-500)] text-white' : 'border border-[var(--srg-border)]'}`}
                    >
                      {voiceAssistant.voiceResponseEnabled ? 'ON' : 'OFF'}
                    </button>
                    <span>
                      {voiceAssistant.synthesisAvailable ? 'Voix disponible' : 'Voix non disponible sur cet appareil/navigateur'}
                    </span>
                    {voiceAssistant.isSpeaking ? (
                      <>
                        <button type="button" onClick={voiceAssistant.stopSpeaking} className="rounded-xl border border-[var(--srg-border)] px-2 py-1">Couper</button>
                        <button type="button" onClick={voiceAssistant.pauseSpeaking} className="rounded-xl border border-[var(--srg-border)] px-2 py-1">Pause</button>
                        <button type="button" onClick={voiceAssistant.resumeSpeaking} className="rounded-xl border border-[var(--srg-border)] px-2 py-1">Reprendre</button>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-3 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3 text-xs text-[var(--srg-text-muted)]">
                    <p className="font-semibold text-[var(--srg-text-title)]">Conversation Attachments / Variables</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeConversation.draftAttachments.length === 0 ? <span>No attachment</span> : activeConversation.draftAttachments.map((attachment) => (
                        <button key={attachment.id} type="button" onClick={() => { ConversationWorkspaceService.removeAttachment(activeConversation.id, attachment.id); refresh() }} className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1">
                          {attachment.name} ({formatBytes(attachment.size)})
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <input placeholder="Variable name" onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          const target = event.target as HTMLInputElement
                          const name = target.value.trim()
                          if (name) {
                            ConversationWorkspaceService.setVariable(activeConversation.id, name, '')
                            refresh()
                            target.value = ''
                          }
                        }
                      }} className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1 text-xs" />
                      <span className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1">{Object.keys(activeConversation.draftVariables).length} variable(s)</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="space-y-4 rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
          <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Conversation Metadata / Statistics / Timeline</h3>

          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
            <p className="font-semibold text-[var(--srg-text-title)]">Workspace Summary</p>
            <p className="mt-2 text-[var(--srg-text-muted)]">Active: {globalSummary.active} • Archived: {globalSummary.archived}</p>
            <p className="text-[var(--srg-text-muted)]">Tokens: {globalSummary.totalTokens} • Cost: ${globalSummary.totalCost.toFixed(6)} • Avg Latency: {globalSummary.averageLatencyMs} ms</p>
          </div>

          {activeConversation && selectedStats ? (
            <>
              <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
                <p className="font-semibold text-[var(--srg-text-title)]">Conversation Metadata</p>
                <p className="mt-2 text-[var(--srg-text-muted)]">Provider: {activeConversation.provider} • Model: {activeConversation.model}</p>
                <p className="text-[var(--srg-text-muted)]">SDK: {activeConversation.sdkVersion} • Quota: {activeConversation.quota}</p>
                <p className="text-[var(--srg-text-muted)]">Wallet: {activeConversation.wallet} • Credits: {activeConversation.credits} • Subscription: {activeConversation.subscription}</p>
                <p className="text-[var(--srg-text-muted)]">Status: {activeConversation.status} • Health: {activeConversation.health} • Latency: {activeConversation.latencyMs} ms</p>
                <p className="text-[var(--srg-text-muted)]">Capabilities: {Object.entries(activeConversation.capabilities).filter(([, enabled]) => enabled).map(([key]) => key).join(', ')}</p>
                <p className="text-[var(--srg-text-muted)]">Collections: {collectionNames(activeConversation, store.collections)}</p>
                <p className="text-[var(--srg-text-muted)]">Streaming lifecycle: {activeConversation.streaming.active ? 'active' : 'idle'} • paused: {String(activeConversation.streaming.paused)} • reconnect: {activeConversation.streaming.reconnectAttempts}</p>
              </div>

              <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
                <p className="font-semibold text-[var(--srg-text-title)]">Conversation Statistics</p>
                <p className="mt-2 text-[var(--srg-text-muted)]">User: {selectedStats.userMessages} • Assistant: {selectedStats.assistantMessages}</p>
                <p className="text-[var(--srg-text-muted)]">Tokens: {selectedStats.totalTokens} • Cost: ${selectedStats.totalCost.toFixed(6)} • Avg latency: {selectedStats.averageLatencyMs} ms</p>
              </div>

              <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
                <p className="font-semibold text-[var(--srg-text-title)]">Conversation Export / Share / Publish</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['markdown', 'json', 'pdf', 'html', 'txt'].map((format) => (
                    <button key={format} type="button" onClick={() => ConversationWorkspaceService.exportConversation(activeConversation.id, format as 'markdown' | 'json' | 'pdf' | 'html' | 'txt')} className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1 text-xs">
                      {format.toUpperCase()}
                    </button>
                  ))}
                  <button type="button" onClick={() => { ConversationWorkspaceService.togglePublished(activeConversation.id); refresh() }} className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1 text-xs">{activeConversation.published ? 'Unpublish' : 'Publish'}</button>
                  <button type="button" onClick={() => { ConversationWorkspaceService.createShareLink(activeConversation.id); refresh() }} className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1 text-xs">Share</button>
                </div>
                {activeConversation.sharedLink ? <p className="mt-2 break-all text-xs text-[var(--srg-text-muted)]">{activeConversation.sharedLink}</p> : null}
              </div>

              <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
                <p className="font-semibold text-[var(--srg-text-title)]">Conversation Comments / Reviews</p>
                <textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder="Commentaire (mentions @user)" className="mt-2 min-h-20 w-full rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-xs" />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => { if (commentBody.trim()) { ConversationWorkspaceService.addComment(activeConversation.id, actorName, commentBody.trim()); setCommentBody(''); refresh() } }} className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1 text-xs">Comment</button>
                  <select value={reviewScore} onChange={(event) => setReviewScore(Number(event.target.value))} className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1 text-xs">
                    {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                  <input value={reviewBody} onChange={(event) => setReviewBody(event.target.value)} placeholder="Review" className="flex-1 rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1 text-xs" />
                  <button type="button" onClick={() => { if (reviewBody.trim()) { ConversationWorkspaceService.addReview(activeConversation.id, actorName, reviewScore, reviewBody.trim()); setReviewBody(''); refresh() } }} className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1 text-xs">Review</button>
                </div>
                <div className="mt-2 space-y-1 text-xs text-[var(--srg-text-muted)]">
                  {activeConversation.comments.slice(0, 3).map((comment) => <p key={comment.id}>{comment.author}: {comment.body}</p>)}
                  {activeConversation.reviews.slice(0, 3).map((review) => <p key={review.id}>{review.author}: {review.score}/5 {review.comment}</p>)}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
                <p className="font-semibold text-[var(--srg-text-title)]">Conversation Timeline / Activity / Diagnostics / Observability</p>
                <div className="mt-2 space-y-2 text-xs text-[var(--srg-text-muted)]">
                  {activeConversation.timeline.slice(0, 5).map((event) => <p key={event.id}>{event.createdAt} • {event.type} • {event.message}</p>)}
                  {activeConversation.diagnostics.slice(0, 5).map((diag) => <p key={diag.id}>{diag.createdAt} • {diag.category} • {diag.message}</p>)}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
                <p className="font-semibold text-[var(--srg-text-title)]">Lifecycle & Charts</p>
                <p className="mt-2 text-[var(--srg-text-muted)]">running {globalSummary.lifecycle.running} • completed {globalSummary.lifecycle.completed} • cancelled {globalSummary.lifecycle.cancelled} • failed {globalSummary.lifecycle.failed}</p>
                <p className="text-[var(--srg-text-muted)]">avg stream progress {globalSummary.lifecycle.avgStreamProgress}%</p>
                <p className="mt-2 text-xs text-[var(--srg-text-muted)]">Tokens {sparkline(globalSummary.charts.tokens)}</p>
                <p className="text-xs text-[var(--srg-text-muted)]">Costs {sparkline(globalSummary.charts.costs)}</p>
                <p className="text-xs text-[var(--srg-text-muted)]">Latency {sparkline(globalSummary.charts.latencies)}</p>
              </div>
            </>
          ) : null}

          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
            <p className="font-semibold text-[var(--srg-text-title)]">Conversation Compare / Diff</p>
            {compared.length === 2 ? <pre className="mt-2 whitespace-pre-wrap break-words rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 text-xs">{ConversationWorkspaceService.compare(compared[0].id, compared[1].id)}</pre> : <p className="mt-2 text-xs text-[var(--srg-text-muted)]">Select two conversations from list to compare.</p>}
          </div>

          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
            <p className="font-semibold text-[var(--srg-text-title)]">Conversation Provider Marketplace</p>
            <p className="mt-2 text-xs text-[var(--srg-text-muted)]">Top Providers: {globalSummary.topProviders.map((item) => `${item.provider} (${item.count})`).join(', ') || 'n/a'}</p>
            <p className="text-xs text-[var(--srg-text-muted)]">Top Models: {globalSummary.topModels.map((item) => `${item.model} (${item.count})`).join(', ') || 'n/a'}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link to="/providers" className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1 text-xs text-[var(--srg-text-title)]">Provider Workspace</Link>
              <Link to="/history" className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1 text-xs text-[var(--srg-text-title)]">Conversation History</Link>
              <Link to="/dashboard" className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1 text-xs text-[var(--srg-text-title)]">Dashboard</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4 text-sm">
            <p className="font-semibold text-[var(--srg-text-title)]">Message Roles Coverage</p>
            <p className="mt-2 text-xs text-[var(--srg-text-muted)]">{messageRoleOrder.join(', ')}</p>
          </div>
        </section>
      </div>
    </div>
  )
}
