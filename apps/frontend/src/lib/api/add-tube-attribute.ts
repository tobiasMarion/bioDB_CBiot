import type { TubeAttribute } from '@/components/tube/tube-data'
import { apiClient } from './api-client'

export type AddTubeAttributePayload = {
  key: string
  value: string
  type: 'string' | 'number' | 'date' | 'boolean'
  minRequiredRoleToEdit: 'RESEARCHER' | 'MANAGER' | 'LEADER'
}

export function addTubeAttribute(tubeId: string, data: AddTubeAttributePayload) {
  return apiClient.post(`tubes/${tubeId}/attributes`, { json: data }).json<TubeAttribute>()
}
