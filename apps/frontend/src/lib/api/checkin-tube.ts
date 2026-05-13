import { apiClient } from './api-client'
import type { TubeResponse } from './get-sample-tubes'

export type CheckinTubePayload = {
  boxId: string
  row: number
  col: number
  notes?: string
}

export function checkinTube(tubeId: string, data: CheckinTubePayload) {
  return apiClient.post(`tubes/${tubeId}/checkin`, { json: data }).json<TubeResponse>()
}
