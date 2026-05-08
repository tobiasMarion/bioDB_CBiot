import { bootstrapAuth } from '@/lib/auth/bootstrap-auth'
import { authStore } from '@/lib/auth/store'
import { getGroups } from '@/lib/api/get-groups'
import { queryClient } from '@/lib/api/query-client'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    await bootstrapAuth()

    const user = authStore.getUser()

    if (!user) {
      throw redirect({ to: '/login' })
    }

    const lastGroupId = localStorage.getItem('lastAccessedGroup')
    if (lastGroupId) {
      throw redirect({ to: '/app/$groupId/samples', params: { groupId: lastGroupId } })
    }

    const groups = await queryClient.ensureQueryData({
      queryKey: ['groups'],
      queryFn: getGroups
    })

    if (groups?.length > 0) {
      throw redirect({ to: '/app/$groupId/samples', params: { groupId: groups[0].id } })
    }

    throw redirect({ to: '/app' })
  }
})
