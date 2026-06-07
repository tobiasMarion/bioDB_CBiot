import { apiClient } from './api-client'
import type { Tube } from './get-sample-tubes'

export function checkoutTube(tubeId: string) {
  return apiClient.post(`tubes/${tubeId}/checkout`).json<Tube>()
}
