import { apiClient } from './api-client'
import type { SampleDetail } from './get-sample'

export function archiveSample(id: string, reasonForArchiving: string) {
  return apiClient.delete(`samples/${id}`, { json: { reasonForArchiving } }).json<SampleDetail>()
}
