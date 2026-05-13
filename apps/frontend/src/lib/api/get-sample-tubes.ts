import type { Tube } from '@/components/tube/tube-data'
import { apiClient } from './api-client'

export type { Tube }

export function getSampleTubes(sampleId: string) {
  return apiClient.get(`samples/${sampleId}/tubes`).json<Tube[]>()
}
