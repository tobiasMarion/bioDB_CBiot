import { apiClient } from './api-client'

export type Sample = {
  id: string
  name: string
  type: string
  amountOfTubes: number
  originOrganism: string
  sourceLab: string
  group: {
    id: string
    name: string
  }
  createdBy: string
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    name: string
    email: string
  }
}

export type GetSamplesParams = {
  search?: string
  type?: string
  page?: number
  pageSize?: number
}

export type GetSamplesResponse = {
  samples: Sample[]
  total: number
}

export function getSamples(groupId: string, params?: GetSamplesParams) {
  return apiClient
    .get(`groups/${groupId}/samples`, { searchParams: params })
    .json<GetSamplesResponse>()
}
