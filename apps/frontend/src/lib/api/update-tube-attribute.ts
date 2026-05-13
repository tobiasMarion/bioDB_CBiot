import { apiClient } from './api-client'
import type { TubeAttributeResponse } from './get-sample-tubes'

export function updateTubeAttribute(tubeId: string, key: string, value: string) {
  return apiClient
    .patch(`tubes/${tubeId}/attributes/${key}`, { json: { value } })
    .json<TubeAttributeResponse>()
}
