import { apiClient } from './api-client'
import type { SampleDetail } from './get-sample'

export function archiveSample(id: string) {
  return apiClient.delete(`samples/${id}`).json<SampleDetail>()
}
