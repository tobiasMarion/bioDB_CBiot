import { bootstrapAuth } from '@/lib/auth/bootstrap-auth'
import { authStore } from '@/lib/auth/store'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app/admin')({
  beforeLoad: async () => {
    await bootstrapAuth()

    const user = authStore.getUser()

    if (!user || !user.isAdmin) {
      throw redirect({ to: '/app' })
    }
  },
  component: () => <Outlet />
})
