import { apiClient } from './api-client'
import type { Group } from './get-groups'
import type { Role } from './types/role'

export interface SendGroupInvite {
  groupId: string
  userId: string
  role: Role
}

export function sendGroupInvite({ groupId, userId, role }: SendGroupInvite) {
  return apiClient
    .post(`groups/${groupId}/invites`, { json: { role, invitedUserId: userId } })
    .json<Group>()
}
