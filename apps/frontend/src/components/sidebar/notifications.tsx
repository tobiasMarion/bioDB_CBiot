import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, Bell, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { getMyInvites, type GroupInvite } from '@/lib/api/get-my-invites'
import { answerInvite } from '@/lib/api/answer-invite'

export function Notifications() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: invitesResponse, isLoading } = useQuery({
    queryKey: ['group-invites'],
    queryFn: getMyInvites
  })

  const invites = invitesResponse || []

  const { mutate: respond, isPending: isResponding } = useMutation({
    mutationFn: (variables: { inviteId: string; action: 'accept' | 'reject'; groupId: string }) =>
      answerInvite({ inviteId: variables.inviteId, action: variables.action }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-invites'] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })

      if (variables.action === 'accept') {
        navigate({
          to: '/app/$groupId/samples',
          params: { groupId: variables.groupId }
        })
      }
    }
  })

  if (!isLoading && invites.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative h-8 w-8 hover:bg-sidebar-accent shrink-0 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0'
          onClick={e => e.stopPropagation()}
        >
          <Bell className='h-4 w-4 text-muted-foreground' />
          {invites.length > 0 && (
            <span className='absolute right-2 top-2 flex h-1.5 w-1.5 rounded-full bg-destructive shadow-[0_0_0_2px_hsl(var(--sidebar-background))]' />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='min-w-56 rounded-lg' side='right' align='end' sideOffset={4}>
        <DropdownMenuLabel className='p-0 font-normal'>
          <div className='px-1 py-1.5'>
            <span className='text-xs text-muted-foreground'>Invites</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {isLoading ? (
          <div className='flex justify-center py-4'>
            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground/50' />
          </div>
        ) : (
          invites.map((invite: GroupInvite, index: number) => (
            <div key={invite.id}>
              <div className='flex items-center gap-2 px-1 py-1'>
                <div className='grid flex-1 text-left text-sm leading-tight px-1'>
                  <span className='truncate font-medium'>{invite.group.name}</span>
                  <span className='truncate text-xs text-muted-foreground'>
                    from {invite.sender.name}
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-7 w-7 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10'
                    disabled={isResponding}
                    onClick={() =>
                      respond({ inviteId: invite.id, action: 'accept', groupId: invite.groupId })
                    }
                  >
                    <Check className='h-3.5 w-3.5' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                    disabled={isResponding}
                    onClick={() =>
                      respond({ inviteId: invite.id, action: 'reject', groupId: invite.groupId })
                    }
                  >
                    <X className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>
              {index < invites.length - 1 && <DropdownMenuSeparator />}
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
