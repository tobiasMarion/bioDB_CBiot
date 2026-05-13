import { apiClient } from './api-client'

export function deleteTubeAttribute(tubeId: string, key: string) {
  return apiClient.delete(`tubes/${tubeId}/attributes/${key}`)
}
