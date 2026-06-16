import type { GroupMember } from '@/lib/api/get-group-members'
import type { Role } from '@/lib/api/types/role'

export const ROLE_RANK: Record<Role, number> = {
  LEADER: 3,
  MANAGER: 2,
  RESEARCHER: 1
}

const ALL_ROLES: Role[] = ['LEADER', 'MANAGER', 'RESEARCHER']

export function getViewerRank(isAdmin: boolean, members: GroupMember[], viewerId: string): number {
  if (isAdmin) return 4
  const self = members.find(m => m.userId === viewerId)
  return self ? ROLE_RANK[self.role] : 0
}

export function getAssignableRoles(viewerRank: number, currentRole: Role): Role[] {
  if (ROLE_RANK[currentRole] >= viewerRank) return []
  return ALL_ROLES.filter(r => ROLE_RANK[r] < viewerRank && r !== currentRole)
}

export function getInvitableRoles(viewerRank: number): Role[] {
  return ALL_ROLES.filter(r => ROLE_RANK[r] < viewerRank)
}

export function canManageMember(viewerRank: number, memberRole: Role): boolean {
  return ROLE_RANK[memberRole] < viewerRank
}
