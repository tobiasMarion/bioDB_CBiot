import { apiClient } from './api-client'

export interface SampleDetail {
  id: string
  name: string
  type: string
  originOrganism: string
  sourceLab: string
  observations: string
  groupId: string
  group: { id: string; name: string }
  createdBy: string
  creator: { id: string; name: string; email: string }
  createdAt: string
  updatedAt: string
  amountOfTubes: number
  canEdit: boolean
}

export function getSample(id: string) {
  return apiClient.get(`samples/${id}`).json<SampleDetail>()
}
