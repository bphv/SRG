import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/administration')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/administration"!</div>
}
