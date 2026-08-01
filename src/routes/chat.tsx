import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '#/app/components/PageHeader'
import ConversationWorkspace from '#/app/components/conversation/ConversationWorkspace'
import WorkspaceSkeleton from '#/app/components/WorkspaceSkeleton'
import { useConversationWorkspace } from '#/app/hooks/useConversationWorkspace'

export const Route = createFileRoute('/chat')({
  component: ChatRoute,
})

function ChatRoute() {
  const { allConversations } = useConversationWorkspace()

  if (allConversations.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI Workspace" description="Conversation, chat, agents, sessions and observability." />
        <WorkspaceSkeleton variant="dashboard" description="Loading conversation workspace." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="AI Workspace" description="Conversation, chat, agents, sessions and observability." />
      <ConversationWorkspace />
    </div>
  )
}
