import { bootstrapAuth } from '@/lib/auth/bootstrap-auth'
import { authStore } from '@/lib/auth/store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    await bootstrapAuth()

    const user = authStore.getUser()

    if (user) {
      throw redirect({ to: '/app' })
    }

    throw redirect({ to: '/login' })
  }
})
