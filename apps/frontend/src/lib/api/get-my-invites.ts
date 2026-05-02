import { apiClient } from './api-client'

export type Action = 'accept' | 'reject'

export interface GroupInvite {
  id: string
  groupId: string
  invitedUserId: string
  invitedBy: string
  role: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  isArchived: boolean
  archivedAt: string | null
  group: {
    name: string
  }
  sender: {
    name: string
    email: string
  }
}

export async function getMyInvites() {
  return await apiClient.get('my/invites').json<GroupInvite[]>()
}
