import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { GroupMember } from '@/lib/api/get-group-members'
import type { Role } from '@/lib/api/types/role'
import { ChevronDown, UserMinus } from 'lucide-react'
import { ROLE_META, RoleBadge, getInitials } from './role-meta'

interface MemberRowProps {
  member: GroupMember
  assignableRoles: Role[]
  canRemove: boolean
  onRoleChange: (userId: string, role: Role) => void
  onRemove: (member: GroupMember) => void
  isPending: boolean
}

export function MemberRow({
  member,
  assignableRoles,
  canRemove,
  onRoleChange,
  onRemove,
  isPending
}: MemberRowProps) {
  const canEdit = assignableRoles.length > 0

  return (
    <div className='flex items-center justify-between gap-4 p-3 transition-colors hover:bg-muted/50 border-b border-border/50 last:border-b-0'>
      <div className='flex items-center gap-3 min-w-0 flex-1'>
        <div className='flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted text-xs font-medium text-muted-foreground'>
          {getInitials(member.user.name)}
        </div>

        <div className='grid flex-1 min-w-0 text-left'>
          <span className='truncate text-sm font-medium leading-none'>{member.user.name}</span>
          <span className='truncate text-xs text-muted-foreground leading-snug mt-0.5'>
            {member.user.email}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-2 shrink-0'>
        {canEdit ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                disabled={isPending}
                className='h-8 px-2.5 gap-2 font-normal transition-colors focus-visible:ring-0'
              >
                <RoleBadge role={member.role} />
                <ChevronDown className='size-3.5 text-muted-foreground opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-40 rounded-lg' sideOffset={4}>
              {assignableRoles.map(role => {
                const { label, className } = ROLE_META[role]
                return (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => onRoleChange(member.userId, role)}
                    className='gap-2.5 cursor-pointer py-2'
                  >
                    <span className={`font-medium text-sm ${className}`}>{label}</span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className='flex h-8 items-center px-2.5 border border-transparent'>
            <RoleBadge role={member.role} className='text-muted-foreground' />
          </div>
        )}

        {canRemove && (
          <Button
            size='icon'
            variant='ghost'
            className='size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/15'
            disabled={isPending}
            onClick={() => onRemove(member)}
          >
            <UserMinus className='size-4' />
            <span className='sr-only'>Remove member</span>
          </Button>
        )}
      </div>
    </div>
  )
}
