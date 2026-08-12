import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/category/$categorySlug/$subcategorySlug')({
  component: CategorySubcategoryRedirect,
})

function CategorySubcategoryRedirect() {
  const navigate = useNavigate()
  const { categorySlug, subcategorySlug } = Route.useParams()

  useEffect(() => {
    navigate({
      to: '/conversation/$categorySlug/$subcategorySlug',
      params: { categorySlug, subcategorySlug },
      replace: true,
    })
  }, [categorySlug, subcategorySlug, navigate])

  return null
}
