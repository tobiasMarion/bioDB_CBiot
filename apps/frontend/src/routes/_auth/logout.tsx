import { queryClient } from '@/lib/api/query-client'
import { authService } from '@/lib/auth/service'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/logout')({
  beforeLoad: async () => {
    queryClient.clear()
    await authService.logout()

    throw redirect({
      to: '/login'
    })
  }
})
