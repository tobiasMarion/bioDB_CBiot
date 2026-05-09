import type { PendingGroupInvite } from '@/lib/api/get-group-invites'
import { Clock } from 'lucide-react'
import { RoleBadge, getInitials } from './role-meta'

export function PendingInviteRow({ invite }: { invite: PendingGroupInvite }) {
  return (
    <div className='flex items-center justify-between gap-4 p-3 border-b border-border/50 last:border-b-0 opacity-60'>
      <div className='flex items-center gap-3 min-w-0 flex-1'>
        <div className='flex size-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 text-xs font-medium text-muted-foreground'>
          {getInitials(invite.invitedUser.name)}
        </div>

        <div className='grid flex-1 min-w-0 text-left'>
          <span className='truncate text-sm font-medium leading-none text-muted-foreground'>
            {invite.invitedUser.name}
          </span>
          <span className='truncate text-xs text-muted-foreground leading-snug mt-0.5'>
            {invite.invitedUser.email}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-2 shrink-0 h-8 px-2.5'>
        <RoleBadge role={invite.role} className='text-muted-foreground' />
        <Clock className='size-3.5 text-muted-foreground/50 ml-1' />
      </div>
    </div>
  )
}
