import { apiClient } from './api-client'
import type { Room } from './get-rooms'

export type FreezerWithBoxes = {
  id: string
  name: string
  room: Room
  boxes: Array<{ id: string; label: string }>
}

export function getGroupFreezers(groupId: string) {
  return apiClient.get(`groups/${groupId}/freezers`).json<FreezerWithBoxes[]>()
}
