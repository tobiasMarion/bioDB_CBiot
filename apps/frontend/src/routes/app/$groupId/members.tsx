import { MembersList } from '@/components/members-list'
import { usePageTitle } from '@/hooks/use-page-title'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/$groupId/members')({
  component: RouteComponent
})

function RouteComponent() {
  usePageTitle('Members')
  return <MembersList />
}
