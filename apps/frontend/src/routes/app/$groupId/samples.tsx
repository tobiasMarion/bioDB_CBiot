import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/$groupId/samples')({
  component: RouteComponent
})

function RouteComponent() {
  const { groupId } = Route.useParams()
  return <div>Samples for group: {groupId}</div>
}
