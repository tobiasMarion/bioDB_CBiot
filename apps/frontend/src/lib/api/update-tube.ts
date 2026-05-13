import type { Tube } from '@/components/tube/tube-data'
import { apiClient } from './api-client'

export type UpdateTubePayload = {
  notes?: string
}

export function updateTube(tubeId: string, data: UpdateTubePayload) {
  return apiClient.patch(`tubes/${tubeId}`, { json: data }).json<Tube>()
}
