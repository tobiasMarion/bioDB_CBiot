import { apiClient } from './api-client'
import type { Group } from './get-groups'

export interface CreateGroupProps {
  name: string
}

export function createNewGroup({ name }: CreateGroupProps) {
  return apiClient.post('groups', { json: { name } }).json<Group>()
}
