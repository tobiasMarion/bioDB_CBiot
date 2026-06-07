import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app/$groupId/samples/new')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/app/$groupId/samples',
      params,
      search: { create: true }
    })
  }
})
