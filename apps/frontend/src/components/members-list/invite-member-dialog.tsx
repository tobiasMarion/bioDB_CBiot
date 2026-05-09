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
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getAllUsers } from '@/lib/api/get-all-users'
import { sendGroupInvite } from '@/lib/api/send-invite'
import type { Role } from '@/lib/api/types/role'
import type { User } from '@/lib/api/types/user'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { ROLE_META, RoleBadge } from './role-meta'

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  invitableRoles: Role[]
  existingMemberIds: string[]
}

export function InviteMemberDialog({
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

  const availableUsers = users.filter(u => !existingMemberIds.includes(u.id))
  const selectedUser = users.find(u => u.id === selectedUserId) ?? null

  const { mutate: invite, isPending: isInviting } = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      sendGroupInvite({ groupId, userId, role }),
    onSuccess: () => {
      setErrorMessage(null)
      setSelectedUserId('')
      setSelectedRole('')
      queryClient.invalidateQueries({ queryKey: ['group-invites-pending', groupId] })
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] })
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
            <DialogDescription className='leading-snug'>
              Send an invite to add a new member to this group.
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-4 py-6'>
            <div className='grid gap-2.5'>
              <Label className='text-sm font-medium'>User</Label>
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
                    <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
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
                        {availableUsers.map(user => (
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
                                'mr-2 size-4',
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

            <div className='grid gap-2.5'>
              <Label className='text-sm font-medium'>Role</Label>
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
                    <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
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
                        {invitableRoles.map(role => {
                          const { label, className } = ROLE_META[role]
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
                                  'size-4',
                                  selectedRole === role ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <span className={`font-medium ${className}`}>{label}</span>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {errorMessage && (
              <p className='mt-1 text-[13px] font-medium leading-none text-destructive'>
                {errorMessage}
              </p>
            )}
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
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
                  <Loader2 className='mr-2 size-4 animate-spin' />
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
