import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { PendingGroupInvite } from '@/lib/api/get-group-invites'
import { getGroupInvites } from '@/lib/api/get-group-invites'
import type { GroupMember } from '@/lib/api/get-group-members'
import { getGroupMembers } from '@/lib/api/get-group-members'
import { removeMember } from '@/lib/api/remove-member'
import type { Role } from '@/lib/api/types/role'
import { updateMemberRole } from '@/lib/api/update-member-role'
import { authStore } from '@/lib/auth/store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { InviteMemberDialog } from './invite-member-dialog'
import { MemberRow } from './member-row'
import { PendingInviteRow } from './pending-invite-row'
import {
  ROLE_RANK,
  canManageMember,
  getAssignableRoles,
  getInvitableRoles,
  getViewerRank
} from './permissionts'
import { RemoveMemberDialog } from './remove-member-dialog'

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

  const viewerRank = isLoadingMembers ? -1 : getViewerRank(isAdmin, members, currentUser?.id ?? '')
  const invitableRoles = getInvitableRoles(viewerRank)
  const canInvite = invitableRoles.length > 0
  const existingMemberIds = members.map(m => m.userId)
  const isLoading = isLoadingMembers || isLoadingInvites
  const isMutating = isChangingRole || isRemoving

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const rankDiff = ROLE_RANK[b.role] - ROLE_RANK[a.role]
      if (rankDiff !== 0) return rankDiff
      return a.user.name.localeCompare(b.user.name)
    })
  }, [members])

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4'>
        <div className='grid gap-1.5'>
          <div className='flex items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight text-foreground'>Group Members</h2>
            {!isLoading && (
              <div className='flex items-center gap-1.5 mt-1'>
                <span className='flex h-6 items-center justify-center rounded-full bg-muted px-2.5 text-xs font-medium text-foreground'>
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </span>
                {pendingInvites.length > 0 && (
                  <span className='flex h-6 items-center justify-center rounded-full border border-dashed px-2.5 text-xs font-medium text-muted-foreground'>
                    {pendingInvites.length} pending
                  </span>
                )}
              </div>
            )}
          </div>
          <p className='text-sm text-muted-foreground'>
            Manage team access, assign roles, and send invitations.
          </p>
        </div>

        {canInvite && (
          <Button
            size='sm'
            variant='outline'
            className='h-9 gap-2 shrink-0 mt-1 sm:mt-0'
            onClick={() => setInviteDialogOpen(true)}
          >
            <UserPlus className='size-4' />
            Invite member
          </Button>
        )}
      </div>

      <Separator />

      {isLoading ? (
        <div className='flex flex-col'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='flex items-center gap-3 p-3'>
              <div className='h-8 w-8 rounded-lg bg-muted animate-pulse' />
              <div className='flex-1 space-y-1.5'>
                <div className='h-3 w-32 rounded bg-muted animate-pulse' />
                <div className='h-2.5 w-48 rounded bg-muted animate-pulse' />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex flex-col'>
          {sortedMembers.map(member => (
            <MemberRow
              key={member.id}
              member={member}
              assignableRoles={getAssignableRoles(viewerRank, member.role)}
              canRemove={canManageMember(viewerRank, member.role)}
              onRoleChange={(userId, role) => changeRole({ userId, role })}
              onRemove={setMemberToRemove}
              isPending={isMutating}
            />
          ))}

          {pendingInvites.length > 0 && (
            <>
              <div className='flex items-center gap-3 p-3 mt-1'>
                <Separator className='flex-1' />
                <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 shrink-0'>
                  Pending
                </span>
                <Separator className='flex-1' />
              </div>
              {pendingInvites.map(invite => (
                <PendingInviteRow key={invite.id} invite={invite} />
              ))}
            </>
          )}
        </div>
      )}

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        groupId={groupId}
        invitableRoles={invitableRoles}
        existingMemberIds={existingMemberIds}
      />

      <RemoveMemberDialog
        member={memberToRemove}
        onConfirm={() => memberToRemove && remove(memberToRemove.userId)}
        onCancel={() => setMemberToRemove(null)}
        isPending={isRemoving}
      />
    </div>
  )
}
