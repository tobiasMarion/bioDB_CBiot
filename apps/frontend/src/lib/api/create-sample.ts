import { apiClient } from './api-client'
import type { Sample } from './get-samples'

export type CreateSamplePayload = {
  name: string
  type: string
  originOrganism: string
  sourceLab: string
  observations?: string
}

export function createSample(groupId: string, data: CreateSamplePayload) {
  return apiClient.post(`groups/${groupId}/samples`, { json: data }).json<Sample>()
}
