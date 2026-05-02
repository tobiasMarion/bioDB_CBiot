import { apiClient } from './api-client'
import type { Role } from './types/role'

export interface GroupMember {
  id: string
  userId: string
  groupId: string
  role: Role
  joinedAt: string
  isArchived: boolean
  archivedAt: string | null
  user: {
    id: string
    name: string
    email: string
  }
}

export function getGroupMembers(groupId: string) {
  return apiClient.get(`groups/${groupId}/members`).json<GroupMember[]>()
}
