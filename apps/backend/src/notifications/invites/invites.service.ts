import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { auditCreate, auditUpdate } from '../../auth/audit.utils'
import type { User } from '../../auth/types/user.type'
import { InviteStatus } from '../../common/prisma/generated/enums'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class InvitesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyInvites(user: User) {
    return this.prisma.groupInvite.findMany({
      where: {
        invitedUserId: user.id,
        status: InviteStatus.PENDING,
        isArchived: false,
        group: {
          isArchived: false
        }
      },
      select: {
        id: true,
        groupId: true,
        invitedUserId: true,
        invitedBy: true,
        role: true,
        status: true,
        createdAt: true,
        group: { select: { name: true } },
        sender: { select: { name: true, email: true } }
      }
    })
  }

  async acceptInvite(inviteId: string, user: User) {
    const invite = await this.prisma.groupInvite.findUnique({
      where: { id: inviteId },
      include: { group: { select: { isArchived: true } } }
    })

    if (!invite || invite.isArchived) {
      throw new NotFoundException('Invite not found')
    }

    if (invite.invitedUserId !== user.id) {
      throw new NotFoundException('Invite not found')
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Invite is no longer pending')
    }

    if (invite.group.isArchived) {
      throw new BadRequestException('Cannot accept invite for an archived group')
    }

    return this.prisma.$transaction(async tx => {
      const previousMembership = await tx.groupMembership.findUnique({
        where: { userId_groupId: { userId: user.id, groupId: invite.groupId } }
      })

      const inviteSelect = {
        id: true,
        groupId: true,
        invitedUserId: true,
        invitedBy: true,
        role: true,
        status: true,
        createdAt: true
      }

      const acceptedInvite = await tx.groupInvite.update({
        where: { id: inviteId },
        data: { status: InviteStatus.ACCEPTED },
        select: inviteSelect
      })

      await tx.auditLog.create({
        data: auditUpdate({
          entityType: 'INVITE',
          entityId: invite.id,
          performedBy: user.id,
          previous: invite,
          current: acceptedInvite
        })
      })

      const membership = await tx.groupMembership.upsert({
        where: {
          userId_groupId: {
            userId: user.id,
            groupId: invite.groupId
          }
        },
        update: {
          role: invite.role,
          isArchived: false,
          archivedAt: null
        },
        create: {
          userId: user.id,
          groupId: invite.groupId,
          role: invite.role
        }
      })

      if (previousMembership) {
        await tx.auditLog.create({
          data: auditUpdate({
            entityType: 'MEMBERSHIP',
            entityId: membership.id,
            performedBy: user.id,
            previous: previousMembership,
            current: membership
          })
        })
      } else {
        await tx.auditLog.create({
          data: auditCreate({
            entityType: 'MEMBERSHIP',
            entityId: membership.id,
            performedBy: user.id,
            current: membership
          })
        })
      }

      return acceptedInvite
    })
  }

  async rejectInvite(inviteId: string, user: User) {
    const invite = await this.prisma.groupInvite.findUnique({
      where: { id: inviteId },
      include: { group: { select: { isArchived: true } } }
    })

    if (!invite || invite.isArchived) {
      throw new NotFoundException('Invite not found')
    }

    if (invite.invitedUserId !== user.id) {
      throw new NotFoundException('Invite not found')
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Invite is no longer pending')
    }

    if (invite.group.isArchived) {
      throw new BadRequestException('Cannot reject invite for an archived group')
    }

    const rejectedInvite = await this.prisma.groupInvite.update({
      where: { id: inviteId },
      data: { status: InviteStatus.REJECTED },
      select: {
        id: true,
        groupId: true,
        invitedUserId: true,
        invitedBy: true,
        role: true,
        status: true,
        createdAt: true
      }
    })

    await this.prisma.auditLog.create({
      data: auditUpdate({
        entityType: 'INVITE',
        entityId: invite.id,
        performedBy: user.id,
        previous: invite,
        current: rejectedInvite
      })
    })

    return rejectedInvite
  }
}
