import { apiClient } from './api-client'
import type { GroupMember } from './get-group-members'
import type { Role } from './types/role'

export interface UpdateMemberRoleParams {
  groupId: string
  userId: string
  role: Role
}

export function updateMemberRole({ groupId, userId, role }: UpdateMemberRoleParams) {
  return apiClient
    .patch(`groups/${groupId}/members/${userId}`, { json: { role } })
    .json<GroupMember>()
}
