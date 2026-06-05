import { apiClient } from './api-client'
import type { Role } from './types/role'

export type SamplePermission = 'VIEW' | 'EDIT'

export type GroupInviteNotification = {
  type: 'GROUP_INVITE'
  id: string
  groupId: string
  groupName: string
  role: Role
  senderName: string
  createdAt: string
}

export type SampleShareRequestNotification = {
  type: 'SAMPLE_SHARE_REQUEST'
  id: string
  sampleId: string
  sampleName: string
  permission: SamplePermission
  offeringGroupId: string
  offeringGroupName: string
  offeredByName: string
  createdAt: string
}

export type TubeExpirationNotification = {
  type: 'TUBE_EXPIRATION'
  id: string
  tubeId: string
  sampleId: string
  sampleName: string
  groupId: string
  expirationDate: string
  createdAt: string
}

export type AppNotification =
  | GroupInviteNotification
  | SampleShareRequestNotification
  | TubeExpirationNotification

export async function getNotifications() {
  return await apiClient.get('notifications/me').json<AppNotification[]>()
}
