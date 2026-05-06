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
    <div className='flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors'>
      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground'>
        {getInitials(member.user.name)}
      </div>

      <div className='grid flex-1 min-w-0 text-sm leading-tight'>
        <span className='truncate font-medium'>{member.user.name}</span>
        <span className='truncate text-xs text-muted-foreground'>{member.user.email}</span>
      </div>

      <div className='flex items-center gap-1'>
        {canEdit ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={isPending}
              className='flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <RoleBadge role={member.role} />
              <ChevronDown className='h-3 w-3 text-muted-foreground ml-0.5' />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='min-w-36 rounded-lg' sideOffset={4}>
              {assignableRoles.map(role => {
                const { label, icon: Icon, className } = ROLE_META[role]
                return (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => onRoleChange(member.userId, role)}
                    className='gap-2'
                  >
                    <Icon className={`h-3.5 w-3.5 ${className}`} />
                    {label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className='px-2 py-1'>
            <RoleBadge role={member.role} />
          </div>
        )}

        {canRemove && (
          <Button
            size='icon'
            variant='ghost'
            className='h-7 w-7 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10'
            disabled={isPending}
            onClick={() => onRemove(member)}
          >
            <UserMinus className='h-3.5 w-3.5' />
          </Button>
        )}
      </div>
    </div>
  )
}
