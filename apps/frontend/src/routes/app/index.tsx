import { createFileRoute, redirect } from '@tanstack/react-router'
import { FolderX } from 'lucide-react'

// TODO: Replace with real service call later
const MOCK_MEMBERSHIPS: any[] = []

export const Route = createFileRoute('/app/')({
  loader: async () => {
    const memberships = MOCK_MEMBERSHIPS

    if (memberships.length > 0) {
      const lastGroupId = localStorage.getItem('last_accessed_group_id')
      let targetGroupId = memberships[0].groupId

      if (lastGroupId && memberships.some((m) => m.groupId === lastGroupId)) {
        targetGroupId = lastGroupId
      } else {
        localStorage.setItem('last_accessed_group_id', targetGroupId)
      }

      throw redirect({
        to: '/app/$groupId/samples',
        params: {
          groupId: targetGroupId
        }
      })
    }

    return { memberships }
  },
  component: RouteComponent
})

function RouteComponent() {
  const { memberships } = Route.useLoaderData()

  if (memberships.length === 0) {
    return (
      <div className='flex h-[80vh] w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center animate-in fade-in-50'>
        <div className='flex h-20 w-20 items-center justify-center rounded-full bg-muted'>
          <FolderX className='h-10 w-10 text-muted-foreground' />
        </div>
        <div className='flex max-w-[420px] flex-col gap-2'>
          <h3 className='text-xl font-semibold tracking-tight'>Nenhum grupo encontrado</h3>
          <p className='text-sm text-muted-foreground'>
            Você ainda não faz parte de nenhum grupo de pesquisa ou laboratório. Por favor, solicite
            a um administrador que adicione sua conta a um grupo para que você possa acessar e
            gerenciar as amostras.
          </p>
        </div>
      </div>
    )
  }

  return null
}

