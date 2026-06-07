import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/$groupId/')({
  component: RouteComponent
})

function RouteComponent() {
  const { groupId } = Route.useParams()

  return <Navigate to='/app/$groupId/samples' params={{ groupId }} />
}
