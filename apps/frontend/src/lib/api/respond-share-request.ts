import { apiClient } from './api-client'

export type ShareRequestAction = 'accept' | 'reject'

export interface RespondShareRequest {
  requestId: string
  action: ShareRequestAction
}

export function respondShareRequest({ requestId, action }: RespondShareRequest) {
  return apiClient.patch(`share-requests/${requestId}/respond`, { json: { action } }).json()
}
