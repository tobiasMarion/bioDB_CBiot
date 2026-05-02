import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { type User, getAllUsers } from '@/lib/api/get-all-users'
import { type PendingGroupInvite, getGroupInvites } from '@/lib/api/get-group-invites'
import { type GroupMember, getGroupMembers } from '@/lib/api/get-group-members'
import { removeMember } from '@/lib/api/remove-member'
import { sendGroupInvite } from '@/lib/api/send-invite'
import type { Role } from '@/lib/api/types/role'
import { updateMemberRole } from '@/lib/api/update-member-role'
import { authStore } from '@/lib/auth/store'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  Clock,
  Crown,
  FlaskConical,
  Loader2,
  Shield,
  UserMinus,
  UserPlus
} from 'lucide-react'
import { useState } from 'react'
import type { ElementType } from 'react'

// ─── Permission helpers ────────────────────────────────────────────────────────

const ROLE_RANK: Record<Role, number> = {
  LEADER: 3,
  MANAGER: 2,
  RESEARCHER: 1
}

const ALL_ROLES: Role[] = ['LEADER', 'MANAGER', 'RESEARCHER']

function getViewerRank(isAdmin: boolean, members: GroupMember[], viewerId: string): number {
  if (isAdmin) return 4
  const self = members.find((m: GroupMember) => m.userId === viewerId)
  return self ? ROLE_RANK[self.role] : 0
}

function getAssignableRoles(viewerRank: number, currentRole: Role): Role[] {
  if (ROLE_RANK[currentRole] >= viewerRank) return []
  return ALL_ROLES.filter((r: Role) => ROLE_RANK[r] < viewerRank && r !== currentRole)
}

function getInvitableRoles(viewerRank: number): Role[] {
  return ALL_ROLES.filter((r: Role) => ROLE_RANK[r] < viewerRank)
}

function canManageMember(viewerRank: number, memberRole: Role): boolean {
  return ROLE_RANK[memberRole] < viewerRank
}

// ─── Role display helpers ──────────────────────────────────────────────────────

interface RoleMeta {
  label: string
  icon: ElementType
  className: string
}

const ROLE_META: Record<Role, RoleMeta> = {
  LEADER: { label: 'Leader', icon: Crown, className: 'text-amber-500' },
  MANAGER: { label: 'Manager', icon: Shield, className: 'text-blue-500' },
  RESEARCHER: { label: 'Researcher', icon: FlaskConical, className: 'text-muted-foreground' }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

function RoleBadge({ role }: { role: Role }) {
  const { label, icon: Icon, className } = ROLE_META[role]
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${className}`}>
      <Icon className='h-3 w-3' />
      {label}
    </span>
  )
}

// ─── Remove confirmation dialog ───────────────────────────────────────────────

interface RemoveMemberDialogProps {
  member: GroupMember | null
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

function RemoveMemberDialog({ member, onConfirm, onCancel, isPending }: RemoveMemberDialogProps) {
  return (
    <Dialog
      open={!!member}
      onOpenChange={open => {
        if (!open) onCancel()
      }}
    >
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Remove member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{member?.user.name}</strong> from this group?
            They will need a new invite to rejoin.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='ghost' onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Removing...
              </>
            ) : (
              'Remove'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Invite form ──────────────────────────────────────────────────────────────

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  invitableRoles: Role[]
  existingMemberIds: string[]
}

function InviteMemberDialog({
  open,
  onOpenChange,
  groupId,
  invitableRoles,
  existingMemberIds
}: InviteMemberDialogProps) {
  const queryClient = useQueryClient()
  const [userPopoverOpen, setUserPopoverOpen] = useState(false)
  const [rolePopoverOpen, setRolePopoverOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | ''>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getAllUsers,
    enabled: open
  })

  const availableUsers = users.filter((u: User) => !existingMemberIds.includes(u.id))
  const selectedUser = users.find((u: User) => u.id === selectedUserId) ?? null

  const { mutate: invite, isPending: isInviting } = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      sendGroupInvite({ groupId, userId, role }),
    onSuccess: () => {
      setErrorMessage(null)
      setSelectedUserId('')
      setSelectedRole('')
      queryClient.invalidateQueries({ queryKey: ['group-invites-pending', groupId] })
      onOpenChange(false)
    },
    onError: () => {
      setErrorMessage('Failed to send invite. Please try again.')
    }
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedUserId || !selectedRole) return
    invite({ userId: selectedUserId, role: selectedRole })
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setSelectedUserId('')
      setSelectedRole('')
      setErrorMessage(null)
    }
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
            <DialogDescription>Send an invite to add a new member to this group.</DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-4 py-4'>
            {/* User picker */}
            <div className='grid gap-2'>
              <Label>User</Label>
              <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    aria-expanded={userPopoverOpen}
                    className='w-full justify-between font-normal px-3'
                    disabled={isInviting || isLoadingUsers}
                  >
                    <span className='truncate'>
                      {isLoadingUsers
                        ? 'Loading users...'
                        : selectedUser
                          ? selectedUser.name
                          : 'Select user...'}
                    </span>
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align='start'
                  sideOffset={4}
                  style={{ width: 'var(--radix-popover-trigger-width)' }}
                  className='p-0 border-none'
                >
                  <Command className='w-full border shadow-md'>
                    <CommandInput placeholder='Search user...' className='h-9 w-full' />
                    <CommandList className='max-h-48 overflow-y-auto w-full'>
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        {availableUsers.map((user: User) => (
                          <CommandItem
                            key={user.id}
                            value={`${user.name} ${user.email}`}
                            onSelect={() => {
                              setSelectedUserId(user.id)
                              setUserPopoverOpen(false)
                            }}
                            className='cursor-pointer'
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedUserId === user.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className='flex flex-col overflow-hidden'>
                              <span className='font-medium truncate'>{user.name}</span>
                              <span className='text-xs text-muted-foreground truncate'>
                                {user.email}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Role picker */}
            <div className='grid gap-2'>
              <Label>Role</Label>
              <Popover open={rolePopoverOpen} onOpenChange={setRolePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    aria-expanded={rolePopoverOpen}
                    className='w-full justify-between font-normal px-3'
                    disabled={isInviting}
                  >
                    {selectedRole ? (
                      <RoleBadge role={selectedRole} />
                    ) : (
                      <span className='text-muted-foreground'>Select role...</span>
                    )}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align='start'
                  sideOffset={4}
                  style={{ width: 'var(--radix-popover-trigger-width)' }}
                  className='p-0 border-none'
                >
                  <Command className='w-full border shadow-md'>
                    <CommandList className='w-full'>
                      <CommandGroup>
                        {invitableRoles.map((role: Role) => {
                          const { label, icon: Icon, className } = ROLE_META[role]
                          return (
                            <CommandItem
                              key={role}
                              value={role}
                              onSelect={() => {
                                setSelectedRole(role)
                                setRolePopoverOpen(false)
                              }}
                              className='cursor-pointer gap-2'
                            >
                              <Check
                                className={cn(
                                  'h-4 w-4',
                                  selectedRole === role ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <Icon className={`h-3.5 w-3.5 ${className}`} />
                              {label}
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {errorMessage && <p className='text-sm text-destructive font-medium'>{errorMessage}</p>}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='ghost'
              onClick={() => handleOpenChange(false)}
              disabled={isInviting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={!selectedUserId || !selectedRole || isInviting}>
              {isInviting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Sending...
                </>
              ) : (
                'Send invite'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Member row ────────────────────────────────────────────────────────────────

interface MemberRowProps {
  member: GroupMember
  assignableRoles: Role[]
  canRemove: boolean
  onRoleChange: (userId: string, role: Role) => void
  onRemove: (member: GroupMember) => void
  isPending: boolean
}

function MemberRow({
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
              {assignableRoles.map((role: Role) => {
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

// ─── Pending invite row ────────────────────────────────────────────────────────

function PendingInviteRow({ invite }: { invite: PendingGroupInvite }) {
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

// ─── Main component ────────────────────────────────────────────────────────────

export function MembersList() {
  const { groupId } = useParams({ from: '/app/$groupId' })
  const queryClient = useQueryClient()
  const currentUser = authStore.getUser()
  const isAdmin = currentUser?.isAdmin ?? false
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null)

  const { data: members = [], isLoading: isLoadingMembers } = useQuery<GroupMember[]>({
    queryKey: ['group-members', groupId],
    queryFn: () => getGroupMembers(groupId)
  })

  const { data: pendingInvites = [], isLoading: isLoadingInvites } = useQuery<PendingGroupInvite[]>(
    {
      queryKey: ['group-invites-pending', groupId],
      queryFn: () => getGroupInvites(groupId)
    }
  )

  const { mutate: changeRole, isPending: isChangingRole } = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      updateMemberRole({ groupId, userId, role }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] })
      if (variables.userId === currentUser?.id) {
        queryClient.invalidateQueries({ queryKey: ['groups'] })
      }
    }
  })

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: (userId: string) => removeMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] })
      setMemberToRemove(null)
    }
  })

  const viewerRank = getViewerRank(isAdmin, members, currentUser?.id ?? '')
  const invitableRoles = getInvitableRoles(viewerRank)
  const canInvite = invitableRoles.length > 0
  const existingMemberIds = members.map((m: GroupMember) => m.userId)
  const isLoading = isLoadingMembers || isLoadingInvites
  const isMutating = isChangingRole || isRemoving

  return (
    <div className='flex flex-col gap-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-sm font-semibold'>Members</h2>
          {!isLoading && (
            <p className='text-xs text-muted-foreground'>
              {members.length} {members.length === 1 ? 'member' : 'members'}
              {pendingInvites.length > 0 && ` · ${pendingInvites.length} pending`}
            </p>
          )}
        </div>
        {canInvite && (
          <Button
            size='sm'
            variant='outline'
            className='gap-1.5 h-8 text-xs'
            onClick={() => setInviteDialogOpen(true)}
          >
            <UserPlus className='h-3.5 w-3.5' />
            Invite
          </Button>
        )}
      </div>

      <Separator />

      {/* List */}
      {isLoading ? (
        <div className='flex flex-col gap-1 p-1'>
          {[...Array(3)].map((_: unknown, i: number) => (
            <div key={i} className='flex items-center gap-3 px-2 py-2'>
              <div className='h-8 w-8 rounded-lg bg-muted animate-pulse' />
              <div className='flex-1 space-y-1.5'>
                <div className='h-3 w-32 rounded bg-muted animate-pulse' />
                <div className='h-2.5 w-48 rounded bg-muted animate-pulse' />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex flex-col gap-1 p-1'>
          {members.map((member: GroupMember) => (
            <MemberRow
              key={member.id}
              member={member}
              assignableRoles={getAssignableRoles(viewerRank, member.role)}
              canRemove={canManageMember(viewerRank, member.role)}
              onRoleChange={(userId: string, role: Role) => changeRole({ userId, role })}
              onRemove={setMemberToRemove}
              isPending={isMutating}
            />
          ))}

          {pendingInvites.length > 0 && (
            <>
              <div className='flex items-center gap-3 px-2 py-2 mt-1'>
                <Separator className='flex-1' />
                <span className='text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50 shrink-0'>
                  Pending
                </span>
                <Separator className='flex-1' />
              </div>
              {pendingInvites.map((invite: PendingGroupInvite) => (
                <PendingInviteRow key={invite.id} invite={invite} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Invite dialog */}
      {canInvite && (
        <InviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          groupId={groupId}
          invitableRoles={invitableRoles}
          existingMemberIds={existingMemberIds}
        />
      )}

      {/* Remove confirmation dialog */}
      <RemoveMemberDialog
        member={memberToRemove}
        onConfirm={() => memberToRemove && remove(memberToRemove.userId)}
        onCancel={() => setMemberToRemove(null)}
        isPending={isRemoving}
      />
    </div>
  )
}
