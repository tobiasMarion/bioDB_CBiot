import { MembersList } from '@/components/members-list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/$groupId/members')({
  component: RouteComponent
})

function RouteComponent() {
  return <MembersList />
}
