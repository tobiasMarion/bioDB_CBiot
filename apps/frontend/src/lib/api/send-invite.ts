import { apiClient } from './api-client'
import type { Group } from './get-groups'

export type Role = 'LEADER' | 'MANAGER' | 'RESEARCHER'

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
