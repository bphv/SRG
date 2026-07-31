import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/observability')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/observability"!</div>
}
