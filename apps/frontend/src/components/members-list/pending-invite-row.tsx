import type { PendingGroupInvite } from '@/lib/api/get-group-invites'
import { Clock } from 'lucide-react'
import { getInitials, RoleBadge } from './role-meta'

export function PendingInviteRow({ invite }: { invite: PendingGroupInvite }) {
  return (
    <div className='flex items-center gap-3 px-2 py-2 rounded-lg opacity-60'>
      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 text-xs font-medium text-muted-foreground'>
        {getInitials(invite.invitedUser.name)}
      </div>

      <div className='grid flex-1 min-w-0 text-sm leading-tight'>
        <span className='truncate font-medium'>{invite.invitedUser.name}</span>
        <span className='truncate text-xs text-muted-foreground'>{invite.invitedUser.email}</span>
      </div>

      <div className='flex items-center gap-1.5 px-2 py-1'>
        <RoleBadge role={invite.role} />
        <Clock className='h-3 w-3 text-muted-foreground/50 ml-1' />
      </div>
    </div>
  )
}
