import { apiClient } from './api-client'

export type GroupMembership = {
  id: string
  role: string
  joinedAt: string
}

export type GroupDetails = {
  id: string
  name: string
  createdBy: string
  createdAt: string
  membership: GroupMembership | null
}

export function getGroupDetails(groupId: string) {
  return apiClient.get(`groups/${groupId}`).json<GroupDetails>()
}
