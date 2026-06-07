import { Injectable } from '@nestjs/common'
import type { User } from '../auth/types/user.type'
import { GroupRole, InviteStatus } from '../common/prisma/generated/enums'
import { PrismaService } from '../common/prisma/prisma.service'
import type { NotificationResponse } from './dto/notification-response.dto'

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyNotifications(user: User): Promise<NotificationResponse[]> {
    const shareResponderGroupIds = await this.getShareResponderGroupIds(user.id)

    const [invites, shareRequests, expirationNotifications] = await Promise.all([
      this.fetchGroupInvites(user.id),
      this.fetchShareRequests(shareResponderGroupIds),
      this.fetchTubeExpirationNotifications(user.id)
    ])

    const notifications: NotificationResponse[] = [
      ...invites,
      ...shareRequests,
      ...expirationNotifications
    ]

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  private async getShareResponderGroupIds(userId: string): Promise<string[]> {
    const memberships = await this.prisma.groupMembership.findMany({
      where: {
        userId,
        role: { in: [GroupRole.LEADER, GroupRole.MANAGER] },
        isArchived: false
      },
      select: { groupId: true }
    })
    return memberships.map(m => m.groupId)
  }

  private async fetchGroupInvites(userId: string) {
    const invites = await this.prisma.groupInvite.findMany({
      where: {
        invitedUserId: userId,
        status: InviteStatus.PENDING,
        isArchived: false,
        group: { isArchived: false }
      },
      include: {
        group: { select: { name: true } },
        sender: { select: { name: true } }
      }
    })

    return invites.map(invite => ({
      type: 'GROUP_INVITE' as const,
      id: invite.id,
      groupId: invite.groupId,
      groupName: invite.group.name,
      role: invite.role,
      senderName: invite.sender.name,
      createdAt: invite.createdAt
    }))
  }

  private async fetchShareRequests(leaderGroupIds: string[]) {
    if (leaderGroupIds.length === 0) return []

    const requests = await this.prisma.sampleShareRequest.findMany({
      where: {
        targetGroupId: { in: leaderGroupIds },
        status: InviteStatus.PENDING,
        isArchived: false,
        sample: { isArchived: false }
      },
      include: {
        sample: {
          select: {
            id: true,
            name: true,
            group: { select: { id: true, name: true } }
          }
        },
        requester: { select: { name: true } }
      }
    })

    return requests.map(req => ({
      type: 'SAMPLE_SHARE_REQUEST' as const,
      id: req.id,
      sampleId: req.sample.id,
      sampleName: req.sample.name,
      permission: req.permission,
      offeringGroupId: req.sample.group.id,
      offeringGroupName: req.sample.group.name,
      offeredByName: req.requester.name,
      createdAt: req.createdAt
    }))
  }

  private async fetchTubeExpirationNotifications(userId: string) {
    const notifications = await this.prisma.tubeExpirationNotification.findMany({
      where: {
        isResolved: false,
        recipients: { some: { userId } },
        tube: { isArchived: false }
      },
      include: {
        tube: {
          include: {
            sample: { select: { id: true, name: true, groupId: true } }
          }
        }
      }
    })

    return notifications
      .filter(n => n.tube.expirationDate !== null)
      .map(n => ({
        type: 'TUBE_EXPIRATION' as const,
        id: n.id,
        tubeId: n.tubeId,
        sampleId: n.tube.sample.id,
        sampleName: n.tube.sample.name,
        groupId: n.tube.sample.groupId,
        expirationDate: n.tube.expirationDate as Date,
        createdAt: n.createdAt
      }))
  }
}
