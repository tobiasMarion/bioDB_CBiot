import { apiClient } from './api-client'
import type { SamplePermission } from './get-notifications'

export interface CreateShareRequest {
  sampleId: string
  targetGroupId: string
  permission: SamplePermission
}

export function createShareRequest({ sampleId, targetGroupId, permission }: CreateShareRequest) {
  return apiClient
    .post(`samples/${sampleId}/share-requests`, { json: { targetGroupId, permission } })
    .json()
}
