import { apiClient } from './api-client'

export type Action = 'accept' | 'reject'

export interface AnswerInvite {
  inviteId: string
  action: Action
}

export function answerInvite({ inviteId, action }: AnswerInvite) {
  return apiClient.post(`invites/${inviteId}/${action}`)
}
