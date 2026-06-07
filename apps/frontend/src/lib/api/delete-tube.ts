import { apiClient } from './api-client'
import type { Tube } from './get-sample-tubes'

export function deleteTube(tubeId: string) {
  return apiClient.delete(`tubes/${tubeId}`).json<Tube>()
}
