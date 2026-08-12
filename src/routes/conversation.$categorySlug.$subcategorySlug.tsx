import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { getCategoryBySlug, getSubcategoryBySlug } from '#/app/navigation/categoryCatalog'
import { ConversationWorkspaceService } from '#/app/services/ConversationWorkspaceService'

export const Route = createFileRoute('/conversation/$categorySlug/$subcategorySlug')({
  component: ContextualConversationRedirect,
})

function ContextualConversationRedirect() {
  const navigate = useNavigate()
  const { categorySlug, subcategorySlug } = Route.useParams()

  useEffect(() => {
    const category = getCategoryBySlug(categorySlug)
    const subcategory = getSubcategoryBySlug(categorySlug, subcategorySlug)

    if (category && subcategory) {
      const title = `${category.name} · ${subcategory.label}`
      const existing = ConversationWorkspaceService
        .listConversations()
        .find((conversation) => conversation.title === title)

      const context = {
        categorySlug,
        subcategorySlug,
        categoryLabel: category.name,
        subcategoryLabel: subcategory.label,
      }

      if (existing) {
        ConversationWorkspaceService.setActiveConversation(existing.id)
        ConversationWorkspaceService.setConversationContext(existing.id, context)
      } else {
        ConversationWorkspaceService.createConversation({ title, context })
      }
    }

    navigate({
      to: '/chat',
      replace: true,
      search: {
        categorySlug,
        subcategorySlug,
        categoryLabel: category?.name,
        subcategoryLabel: subcategory?.label,
      },
    })
  }, [categorySlug, subcategorySlug, navigate])

  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-zinc-700" aria-label="Ouverture conversation contextualisee">
      <p className="text-sm">Ouverture de la conversation Ask SRG...</p>
    </main>
  )
}
