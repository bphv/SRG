import { useMemo, useState } from 'react'
import { ConversationWorkspaceService } from '#/app/services/ConversationWorkspaceService'
import type { ConversationSearchFilters } from '#/app/services/ConversationWorkspaceService'

function defaultFilters(): ConversationSearchFilters {
  return {
    text: '',
    provider: '',
    model: '',
    date: '',
    tokensMin: 0,
    costMax: Number.POSITIVE_INFINITY,
    tag: '',
    favoritesOnly: false,
    collectionId: '',
  }
}

export function useConversationWorkspace() {
  const [tick, setTick] = useState(0)
  const [filters, setFilters] = useState<ConversationSearchFilters>(defaultFilters)

  const refresh = () => setTick((value) => value + 1)

  const store = useMemo(() => ConversationWorkspaceService.getStore(), [tick])
  const conversations = useMemo(() => ConversationWorkspaceService.search(filters), [tick, filters])
  const allConversations = useMemo(() => ConversationWorkspaceService.listConversations(), [tick])
  const activeConversation = useMemo(() => ConversationWorkspaceService.getActiveConversation(), [tick])
  const globalSummary = useMemo(() => ConversationWorkspaceService.getGlobalSummary(), [tick])

  return {
    tick,
    store,
    conversations,
    allConversations,
    activeConversation,
    globalSummary,
    filters,
    setFilters,
    refresh,
  }
}
