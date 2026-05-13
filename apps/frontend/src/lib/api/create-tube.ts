import { apiClient } from './api-client'
import type { TubeResponse } from './get-sample-tubes'

export type CreateTubePayload = {
  expirationDate?: string | null
}

export function createTube(sampleId: string, data: CreateTubePayload) {
  return apiClient.post(`samples/${sampleId}/tubes`, { json: data }).json<TubeResponse>()
}
