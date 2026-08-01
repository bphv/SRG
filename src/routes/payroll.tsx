import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/payroll')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/payroll"!</div>
}
