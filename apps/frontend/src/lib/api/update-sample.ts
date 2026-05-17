import { apiClient } from './api-client'
import type { SampleDetail } from './get-sample'

export type UpdateSamplePayload = {
  name?: string
  type?: string
  originOrganism?: string
  sourceLab?: string
  observations?: string
}

export function updateSample(id: string, data: UpdateSamplePayload) {
  return apiClient.patch(`samples/${id}`, { json: data }).json<SampleDetail>()
}
