import { apiClient } from './api-client'
import type { Tube } from './get-sample-tubes'

export type CreateTubePayload = {
  expirationDate?: string | null
  daysBeforeNotification?: number
}

export function createTube(sampleId: string, data: CreateTubePayload) {
  return apiClient.post(`samples/${sampleId}/tubes`, { json: data }).json<Tube>()
}
