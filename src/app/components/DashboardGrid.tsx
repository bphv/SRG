import type { ReactNode } from 'react'

export default function DashboardGrid({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`grid gap-6 ${className} sm:grid-cols-2 xl:grid-cols-3`}>
      {children}
    </div>
  )
}
