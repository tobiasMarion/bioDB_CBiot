import { apiClient } from './api-client'

export type OccupiedCell = { row: number; col: number }

export function getBoxOccupancy(boxId: string, excludeSampleId: string) {
  return apiClient
    .get(`boxes/${boxId}/occupancy`, { searchParams: { excludeSampleId } })
    .json<OccupiedCell[]>()
}
