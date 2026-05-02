import { apiClient } from './api-client'

export function removeMember(groupId: string, userId: string) {
  return apiClient.delete(`groups/${groupId}/members/${userId}`).json<{ success: boolean }>()
}
