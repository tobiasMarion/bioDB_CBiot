import type { TubeAttribute } from '@/components/tube/tube-data'
import { apiClient } from './api-client'

export function updateTubeAttribute(tubeId: string, key: string, value: string) {
  return apiClient
    .patch(`tubes/${tubeId}/attributes/${key}`, { json: { value } })
    .json<TubeAttribute>()
}
