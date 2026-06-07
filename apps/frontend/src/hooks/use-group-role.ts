import type { Role } from '@/components/attributes/types'
import { getGroupMembers } from '@/lib/api/get-group-members'
import { authStore } from '@/lib/auth/store'
import { useQuery } from '@tanstack/react-query'

export function useGroupRole(groupId: string): Role {
  const user = authStore.getUser()

  const { data: members = [] } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => getGroupMembers(groupId),
    enabled: !user?.isAdmin
  })

  if (user?.isAdmin) return 'LEADER'

  const currentMember = members.find(m => m.user.id === user?.id && !m.isArchived)
  return currentMember?.role ?? 'RESEARCHER'
}
