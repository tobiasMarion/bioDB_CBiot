import { apiClient } from './api-client'
import type { TubeResponse } from './get-sample-tubes'

export function checkoutTube(tubeId: string) {
  return apiClient.post(`tubes/${tubeId}/checkout`).json<TubeResponse>()
}
