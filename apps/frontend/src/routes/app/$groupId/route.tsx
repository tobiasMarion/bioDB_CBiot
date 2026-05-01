import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { getGroups, type Group } from '@/lib/api/get-groups'
import { queryClient } from '@/lib/api/query-client'

export const Route = createFileRoute('/app/$groupId')({
  beforeLoad: async ({ params }) => {
    const groups = await queryClient.ensureQueryData({
      queryKey: ['groups'],
      queryFn: getGroups
    })

    const isMember = groups.some((group: Group) => group.id === params.groupId)

    if (!isMember) {
      localStorage.removeItem('lastAccessedGroup')
      throw redirect({ to: '/app' })
    }
  },
  component: () => <Outlet />
})
