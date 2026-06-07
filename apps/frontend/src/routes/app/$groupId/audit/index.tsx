import { AuditTable } from '@/components/audit-table'
import { getGroupMembers } from '@/lib/api/get-group-members'
import { queryClient } from '@/lib/api/query-client'
import { authStore } from '@/lib/auth/store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app/$groupId/audit/')({
  beforeLoad: async ({ params }) => {
    const user = authStore.getUser()
    if (user?.isAdmin) return

    const members = await queryClient.ensureQueryData({
      queryKey: ['group-members', params.groupId],
      queryFn: () => getGroupMembers(params.groupId)
    })

    const isLeader = members.some(
      m => m.userId === user?.id && m.role === 'LEADER' && !m.isArchived
    )

    if (!isLeader) {
      throw redirect({ to: '/app/$groupId/samples', params: { groupId: params.groupId } })
    }
  },
  component: RouteComponent
})

function RouteComponent() {
  const { groupId } = Route.useParams()

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-2xl font-semibold'>Audit Logs</h1>
      <AuditTable groupId={groupId} />
    </div>
  )
}
