import { apiClient } from './api-client'

export type SamplesStats = {
  totalSamples: number
  samplesLastMonth: number
  totalTubes: number
  boxesWithTubes: number
  expiringSoon: number
  differentOrganisms: number
}

export function getSamplesStats(groupId: string) {
  return apiClient.get(`groups/${groupId}/samples/stats`).json<SamplesStats>()
}
