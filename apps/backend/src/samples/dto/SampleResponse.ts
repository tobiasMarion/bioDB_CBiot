export interface SampleResponse {
  id: string
  name: string
  type: string
  originOrganism: string
  sourceLab: string
  groupId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  creator: {
    name: string
    email: string
  }
}

export interface SamplesStatsResponse {
  totalSamples: number
  samplesLastMonth: number
  totalTubes: number
  boxesWithTubes: number
  expiringSoon: number
  differentOrganisms: number
}
