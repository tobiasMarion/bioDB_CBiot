import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { answerInvite } from '@/lib/api/answer-invite'
import { type GroupInvite, getMyInvites } from '@/lib/api/get-my-invites'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Bell, Check, Loader2, X } from 'lucide-react'

export function Notifications() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { isMobile } = useSidebar()

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
    <TooltipProvider delayDuration={300}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
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

        <DropdownMenuContent
          className='w-[calc(100vw-2rem)] sm:w-105 rounded-lg'
          side={isMobile ? 'bottom' : 'right'}
          align={isMobile ? 'center' : 'end'}
          sideOffset={4}
        >
          <div className='flex items-center justify-between px-3 py-2.5'>
            <span className='text-sm font-semibold'>Invites</span>
            {!isLoading && invites.length > 0 && (
              <span className='flex h-5 items-center justify-center rounded-full bg-muted px-2 text-[10px] font-medium'>
                {invites.length}
              </span>
            )}
          </div>

          <DropdownMenuSeparator />

          <div className='max-h-75 overflow-y-auto overflow-x-hidden'>
            {isLoading ? (
              <div className='flex h-24 items-center justify-center'>
                <Loader2 className='size-5 animate-spin text-muted-foreground/50' />
              </div>
            ) : (
              <div className='flex flex-col'>
                {invites.map((invite: GroupInvite) => (
                  <div
                    key={invite.id}
                    className='flex items-center justify-between gap-4 p-3 transition-colors hover:bg-muted/50 border-b last:border-b-0 border-border/50'
                  >
                    <div className='flex-1 text-left'>
                      <p className='text-sm text-muted-foreground leading-snug'>
                        You have been invited to{' '}
                        <span className='font-medium text-foreground'>{invite.group.name}</span> as
                        a{' '}
                        <span className='font-medium text-foreground'>
                          {invite.role.toLowerCase()}
                        </span>{' '}
                        by {invite.sender.name}.
                      </p>
                    </div>

                    <div className='flex items-center gap-2 shrink-0'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size='icon'
                            variant='outline'
                            className='size-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/15 hover:border-emerald-500/30'
                            disabled={isResponding}
                            onClick={() =>
                              respond({
                                inviteId: invite.id,
                                action: 'accept',
                                groupId: invite.groupId
                              })
                            }
                          >
                            <Check className='size-4' />
                            <span className='sr-only'>Accept</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side='top'>
                          <p>Accept invite</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size='icon'
                            variant='outline'
                            className='size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/15 hover:border-destructive/30'
                            disabled={isResponding}
                            onClick={() =>
                              respond({
                                inviteId: invite.id,
                                action: 'reject',
                                groupId: invite.groupId
                              })
                            }
                          >
                            <X className='size-4' />
                            <span className='sr-only'>Reject</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side='top'>
                          <p>Reject invite</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
