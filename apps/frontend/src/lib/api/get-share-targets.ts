import { apiClient } from './api-client'

export type ShareTarget = {
  id: string
  name: string
}

export function getShareTargets(sampleId: string) {
  return apiClient.get(`samples/${sampleId}/share-targets`).json<ShareTarget[]>()
}
