import { apiClient } from './api-client'
import type { TubeAttributeResponse } from './get-sample-tubes'

export type AddTubeAttributePayload = {
  key: string
  value: string
  type: 'string' | 'number' | 'date' | 'boolean'
  minRequiredRoleToEdit: 'RESEARCHER' | 'MANAGER' | 'LEADER'
}

export function addTubeAttribute(tubeId: string, data: AddTubeAttributePayload) {
  return apiClient.post(`tubes/${tubeId}/attributes`, { json: data }).json<TubeAttributeResponse>()
}
