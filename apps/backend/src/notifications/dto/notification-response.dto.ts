import type { GroupRole, InviteStatus, SamplePermission } from '../../common/prisma/generated/enums'

export type GroupInviteNotification = {
  type: 'GROUP_INVITE'
  id: string
  groupId: string
  groupName: string
  role: GroupRole
  senderName: string
  createdAt: Date
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
  createdAt: Date
}

export type TubeExpirationNotification = {
  type: 'TUBE_EXPIRATION'
  id: string
  tubeId: string
  sampleId: string
  sampleName: string
  groupId: string
  expirationDate: Date
  createdAt: Date
}

export type NotificationResponse =
  | GroupInviteNotification
  | SampleShareRequestNotification
  | TubeExpirationNotification
