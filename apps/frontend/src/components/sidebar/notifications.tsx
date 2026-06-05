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
import {
  type AppNotification,
  type GroupInviteNotification,
  type SampleShareRequestNotification,
  type TubeExpirationNotification,
  getNotifications
} from '@/lib/api/get-notifications'
import { respondShareRequest } from '@/lib/api/respond-share-request'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Bell, Check, FlaskConical, Loader2, Timer, X } from 'lucide-react'

export function Notifications() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { isMobile } = useSidebar()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 5 * 60 * 1000
  })

  const { mutate: respondInvite, isPending: isRespondingInvite } = useMutation({
    mutationFn: (vars: { inviteId: string; action: 'accept' | 'reject'; groupId: string }) =>
      answerInvite({ inviteId: vars.inviteId, action: vars.action }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      if (vars.action === 'accept') {
        navigate({ to: '/app/$groupId/samples', params: { groupId: vars.groupId } })
      }
    }
  })

  const { mutate: respondShare, isPending: isRespondingShare } = useMutation({
    mutationFn: (vars: { requestId: string; action: 'accept' | 'reject' }) =>
      respondShareRequest({ requestId: vars.requestId, action: vars.action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const isResponding = isRespondingInvite || isRespondingShare

  if (!isLoading && notifications.length === 0) return null

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
            {notifications.length > 0 && (
              <span className='absolute right-2 top-2 flex h-1.5 w-1.5 rounded-full bg-destructive shadow-[0_0_0_2px_hsl(var(--sidebar-background))]' />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className='w-[calc(100dvw-2rem)] sm:w-105 rounded-lg'
          side={isMobile ? 'bottom' : 'right'}
          align={isMobile ? 'center' : 'end'}
          sideOffset={4}
        >
          <div className='flex items-center justify-between px-3 py-2.5'>
            <span className='text-sm font-semibold'>Notifications</span>
            {!isLoading && notifications.length > 0 && (
              <span className='flex h-5 items-center justify-center rounded-full bg-muted px-2 text-[10px] font-medium'>
                {notifications.length}
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
                {notifications.map((notification: AppNotification) => {
                  if (notification.type === 'GROUP_INVITE') {
                    return (
                      <GroupInviteItem
                        key={notification.id}
                        notification={notification}
                        isResponding={isResponding}
                        onRespond={action =>
                          respondInvite({
                            inviteId: notification.id,
                            action,
                            groupId: notification.groupId
                          })
                        }
                      />
                    )
                  }

                  if (notification.type === 'SAMPLE_SHARE_REQUEST') {
                    return (
                      <ShareRequestItem
                        key={notification.id}
                        notification={notification}
                        isResponding={isResponding}
                        onRespond={action => respondShare({ requestId: notification.id, action })}
                      />
                    )
                  }

                  return (
                    <TubeExpirationItem
                      key={notification.id}
                      notification={notification}
                      onNavigate={() =>
                        navigate({
                          to: '/app/$groupId/samples/$id',
                          params: { groupId: notification.groupId, id: notification.sampleId }
                        })
                      }
                    />
                  )
                })}
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}

function NotificationRow({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-4 p-3 transition-colors hover:bg-muted/50 border-b last:border-b-0 border-border/50'>
      {children}
    </div>
  )
}

function AcceptRejectButtons({
  isResponding,
  onAccept,
  onReject
}: {
  isResponding: boolean
  onAccept: () => void
  onReject: () => void
}) {
  return (
    <div className='flex items-center gap-2 shrink-0'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size='icon'
            variant='outline'
            className='size-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/15 hover:border-emerald-500/30'
            disabled={isResponding}
            onClick={onAccept}
          >
            <Check className='size-4' />
            <span className='sr-only'>Accept</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side='top'>
          <p>Accept</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size='icon'
            variant='outline'
            className='size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/15 hover:border-destructive/30'
            disabled={isResponding}
            onClick={onReject}
          >
            <X className='size-4' />
            <span className='sr-only'>Reject</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side='top'>
          <p>Reject</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

function GroupInviteItem({
  notification,
  isResponding,
  onRespond
}: {
  notification: GroupInviteNotification
  isResponding: boolean
  onRespond: (action: 'accept' | 'reject') => void
}) {
  return (
    <NotificationRow>
      <div className='flex gap-2.5 flex-1 min-w-0'>
        <FlaskConical className='size-4 text-muted-foreground shrink-0 mt-0.5' />
        <p className='text-sm text-muted-foreground leading-snug'>
          You have been invited to{' '}
          <span className='font-medium text-foreground'>{notification.groupName}</span> as a{' '}
          <span className='font-medium text-foreground'>{notification.role.toLowerCase()}</span> by{' '}
          {notification.senderName}.
        </p>
      </div>
      <AcceptRejectButtons
        isResponding={isResponding}
        onAccept={() => onRespond('accept')}
        onReject={() => onRespond('reject')}
      />
    </NotificationRow>
  )
}

function ShareRequestItem({
  notification,
  isResponding,
  onRespond
}: {
  notification: SampleShareRequestNotification
  isResponding: boolean
  onRespond: (action: 'accept' | 'reject') => void
}) {
  const permissionLabel = notification.permission === 'VIEW' ? 'view' : 'view and edit'

  return (
    <NotificationRow>
      <div className='flex gap-2.5 flex-1 min-w-0'>
        <FlaskConical className='size-4 text-muted-foreground shrink-0 mt-0.5' />
        <p className='text-sm text-muted-foreground leading-snug'>
          <span className='font-medium text-foreground'>{notification.requestingGroupName}</span> is
          requesting <span className='font-medium text-foreground'>{permissionLabel}</span> access
          to <span className='font-medium text-foreground'>{notification.sampleName}</span>.
        </p>
      </div>
      <AcceptRejectButtons
        isResponding={isResponding}
        onAccept={() => onRespond('accept')}
        onReject={() => onRespond('reject')}
      />
    </NotificationRow>
  )
}

function TubeExpirationItem({
  notification,
  onNavigate
}: {
  notification: TubeExpirationNotification
  onNavigate: () => void
}) {
  const expiration = new Date(notification.expirationDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiration.setHours(0, 0, 0, 0)
  const daysUntil = Math.floor((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const expirationLabel =
    daysUntil < 0
      ? `Expired ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago`
      : daysUntil === 0
        ? 'Expires today'
        : `Expires in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`

  const isExpired = daysUntil < 0

  return (
    <NotificationRow>
      <div className='flex gap-2.5 flex-1 min-w-0'>
        <Timer
          className={`size-4 shrink-0 mt-0.5 ${isExpired ? 'text-destructive' : 'text-amber-500'}`}
        />
        <p className='text-sm text-muted-foreground leading-snug'>
          Tube from <span className='font-medium text-foreground'>{notification.sampleName}</span>{' '}
          <span className={`font-medium ${isExpired ? 'text-destructive' : 'text-amber-500'}`}>
            {expirationLabel.toLowerCase()}
          </span>
          .
        </p>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size='sm' variant='outline' className='shrink-0 h-8 text-xs' onClick={onNavigate}>
            View
          </Button>
        </TooltipTrigger>
        <TooltipContent side='top'>
          <p>Go to sample to take action</p>
        </TooltipContent>
      </Tooltip>
    </NotificationRow>
  )
}
