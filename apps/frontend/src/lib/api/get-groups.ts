import { apiClient } from './api-client'

export type Group = {
  id: string
  name: string
  createdBy: string
  createdAt: string
  role: string
  amountOfMembers: number
}

export function getGroups() {
  return apiClient.get('groups').json<Group[]>()
}
