import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/use-page-title'
import { getGroups } from '@/lib/api/get-groups'
import { authStore } from '@/lib/auth/store'
import { useQuery } from '@tanstack/react-query'
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { Plus, ShieldAlert, Users } from 'lucide-react'

export const Route = createFileRoute('/app/')({
  component: AppIndex
})

function AppIndex() {
  usePageTitle('Home')
  const user = authStore.getUser()
  const isAdmin = user?.isAdmin ?? false

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups
  })

  if (isLoading) return null

  if (groups && groups.length > 0) {
    const firstGroup = groups[0].id
    return <Navigate to='/app/$groupId/samples' params={{ groupId: firstGroup }} />
  }

  return (
    <div className='flex h-[80vh] flex-col items-center justify-center text-center gap-4'>
      <div className='bg-muted rounded-full p-6'>
        {isAdmin ? (
          <Users className='h-12 w-12 text-muted-foreground' />
        ) : (
          <ShieldAlert className='h-12 w-12 text-muted-foreground' />
        )}
      </div>
      <div>
        <h2 className='text-2xl font-bold'>{isAdmin ? 'No groups found' : 'Access restricted'}</h2>
        <p className='text-muted-foreground'>
          {isAdmin
            ? 'You are not a member of any group. Create one to start.'
            : 'You don’t have access to any groups. Please contact an admin for an invite.'}
        </p>
      </div>

      {isAdmin && (
        <Button className='mt-2 gap-2'>
          <Plus className='h-4 w-4' />
          Create your first group
        </Button>
      )}
    </div>
  )
}
