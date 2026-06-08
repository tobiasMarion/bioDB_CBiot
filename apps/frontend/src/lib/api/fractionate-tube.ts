import { apiClient } from './api-client'
import type { Tube } from './get-sample-tubes'

export function fractionateTube(tubeId: string, quantity: number) {
  return apiClient.post(`tubes/${tubeId}/fractionate`, { json: { quantity } }).json<Tube[]>()
}
