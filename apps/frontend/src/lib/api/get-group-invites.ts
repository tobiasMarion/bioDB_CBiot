import { apiClient } from './api-client'
import type { Role } from './types/role'

export interface PendingGroupInvite {
  id: string
  groupId: string
  invitedUserId: string
  invitedBy: string
  role: Role
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  invitedUser: {
    id: string
    name: string
    email: string
  }
  sender: {
    id: string
    name: string
    email: string
  }
}

export function getGroupInvites(groupId: string) {
  return apiClient.get(`groups/${groupId}/invites`).json<PendingGroupInvite[]>()
}
