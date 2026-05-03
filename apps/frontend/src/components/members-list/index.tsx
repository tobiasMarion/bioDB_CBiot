import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { PendingGroupInvite } from '@/lib/api/get-group-invites'
import type { GroupMember } from '@/lib/api/get-group-members'
import { removeMember } from '@/lib/api/remove-member'
import { updateMemberRole } from '@/lib/api/update-member-role'
import { getGroupInvites } from '@/lib/api/get-group-invites'
import { getGroupMembers } from '@/lib/api/get-group-members'
import type { Role } from '@/lib/api/types/role'
import { authStore } from '@/lib/auth/store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import {
  canManageMember,
  getAssignableRoles,
  getInvitableRoles,
  getViewerRank
} from './permissionts'
import { MemberRow } from './member-row'
import { PendingInviteRow } from './pending-invite-row'
import { InviteMemberDialog } from './invite-member-dialog'
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
          {[...Array(3)].map((_, i) => (
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
          {members.map(member => (
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
              <div className='flex items-center gap-3 px-2 py-2 mt-1'>
                <Separator className='flex-1' />
                <span className='text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50 shrink-0'>
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
