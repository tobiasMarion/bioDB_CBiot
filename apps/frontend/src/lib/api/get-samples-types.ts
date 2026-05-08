import { apiClient } from './api-client'

export function getSamplesTypes(groupId: string) {
  return apiClient.get(`groups/${groupId}/samples/types`).json<string[]>()
}
