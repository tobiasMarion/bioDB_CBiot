import { apiClient } from './api-client'
import type { TubeResponse } from './get-sample-tubes'

export function deleteTube(tubeId: string) {
  return apiClient.delete(`tubes/${tubeId}`).json<TubeResponse>()
}
