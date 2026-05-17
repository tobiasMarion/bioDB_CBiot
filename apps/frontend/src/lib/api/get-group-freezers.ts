import { apiClient } from './api-client'

export type FreezerWithBoxes = {
  id: string
  name: string
  locationDescription: string
  boxes: Array<{ id: string; label: string }>
}

export function getGroupFreezers(groupId: string) {
  return apiClient.get(`groups/${groupId}/freezers`).json<FreezerWithBoxes[]>()
}
