import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { auditCreate, auditNotify, auditUpdate } from '../../auth/audit.utils'
import { AuthorizationService } from '../../auth/authorization.service'
import type { User } from '../../auth/types/user.type'
import { GroupRole, InviteStatus } from '../../common/prisma/generated/enums'
import { PrismaService } from '../../common/prisma/prisma.service'
import type { CreateShareRequestDto } from './dto/create-share-request.dto'
import { ShareRequestAction } from './dto/respond-share-request.dto'

@Injectable()
export class SampleSharesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthorizationService
  ) {}

  async createShareRequest(sampleId: string, dto: CreateShareRequestDto, user: User) {
    const sample = await this.prisma.sample.findUnique({
      where: { id: sampleId, isArchived: false }
    })

    if (!sample) {
      throw new NotFoundException('Sample not found')
    }

    await this.auth.assert({
      user,
      permission: 'SHARE_SAMPLE',
      groupId: sample.groupId
    })

    if (sample.groupId === dto.targetGroupId) {
      throw new BadRequestException('Cannot share a sample with its own group')
    }

    const targetGroup = await this.prisma.group.findUnique({
      where: { id: dto.targetGroupId, isArchived: false }
    })

    if (!targetGroup) {
      throw new NotFoundException('Target group not found')
    }

    const existing = await this.prisma.sampleShareRequest.findUnique({
      where: { sampleId_targetGroupId: { sampleId, targetGroupId: dto.targetGroupId } }
    })

    if (existing && !existing.isArchived && existing.status === InviteStatus.PENDING) {
      throw new ConflictException(
        'A pending share request already exists for this sample and group'
      )
    }

    const respondersOfTargetGroup = await this.prisma.groupMembership.findMany({
      where: {
        groupId: dto.targetGroupId,
        role: { in: [GroupRole.MANAGER, GroupRole.LEADER] },
        isArchived: false
      },
      select: { userId: true }
    })
    const responderIds = respondersOfTargetGroup.map(m => m.userId)

    return this.prisma.$transaction(async tx => {
      const shareRequestSelect = {
        id: true,
        sampleId: true,
        targetGroupId: true,
        permission: true,
        requestedBy: true,
        status: true,
        respondedAt: true,
        createdAt: true,
        sample: { select: { name: true } },
        group: { select: { name: true } }
      }

      const shareRequest = await tx.sampleShareRequest.upsert({
        where: { sampleId_targetGroupId: { sampleId, targetGroupId: dto.targetGroupId } },
        update: {
          permission: dto.permission,
          requestedBy: user.id,
          status: InviteStatus.PENDING,
          respondedAt: null,
          isArchived: false,
          archivedAt: null
        },
        create: {
          sampleId,
          targetGroupId: dto.targetGroupId,
          permission: dto.permission,
          requestedBy: user.id
        },
        select: shareRequestSelect
      })

      await tx.auditLog.create({
        data: auditCreate({
          entityType: 'SHARE',
          entityId: shareRequest.id,
          performedBy: user.id,
          current: {
            sampleId,
            targetGroupId: dto.targetGroupId,
            permission: dto.permission,
            status: InviteStatus.PENDING
          }
        })
      })

      await tx.auditLog.create({
        data: auditNotify({
          entityType: 'SHARE',
          entityId: shareRequest.id,
          message: `Share request for sample "${shareRequest.sample.name}" sent to group "${shareRequest.group.name}"`,
          recipientIds: responderIds
        })
      })

      return shareRequest
    })
  }

  async getShareTargets(sampleId: string, user: User) {
    const sample = await this.prisma.sample.findUnique({
      where: { id: sampleId, isArchived: false }
    })

    if (!sample) {
      throw new NotFoundException('Sample not found')
    }

    await this.auth.assert({
      user,
      permission: 'SHARE_SAMPLE',
      groupId: sample.groupId
    })

    return this.prisma.group.findMany({
      where: { isArchived: false, id: { not: sample.groupId } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  }

  async respondToShareRequest(requestId: string, action: ShareRequestAction, user: User) {
    const request = await this.prisma.sampleShareRequest.findUnique({
      where: { id: requestId },
      include: {
        sample: { select: { id: true, name: true, isArchived: true } },
        group: { select: { id: true, name: true, isArchived: true } }
      }
    })

    if (!request || request.isArchived) {
      throw new NotFoundException('Share request not found')
    }

    if (request.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Share request is no longer pending')
    }

    if (request.sample.isArchived) {
      throw new BadRequestException('Sample is archived')
    }

    if (request.group.isArchived) {
      throw new BadRequestException('Target group is archived')
    }

    const canRespond = await this.auth.can({
      user,
      permission: 'SHARE_SAMPLE',
      groupId: request.targetGroupId
    })

    if (!canRespond) {
      throw new ForbiddenException(
        'Only a manager or leader of the target group can respond to this request'
      )
    }

    const newStatus =
      action === ShareRequestAction.ACCEPT ? InviteStatus.ACCEPTED : InviteStatus.REJECTED

    return this.prisma.$transaction(async tx => {
      const updated = await tx.sampleShareRequest.update({
        where: { id: requestId },
        data: { status: newStatus, respondedAt: new Date() },
        select: {
          id: true,
          sampleId: true,
          targetGroupId: true,
          permission: true,
          requestedBy: true,
          status: true,
          respondedAt: true,
          createdAt: true,
          sample: { select: { name: true } },
          group: { select: { name: true } }
        }
      })

      await tx.auditLog.create({
        data: auditUpdate({
          entityType: 'SHARE',
          entityId: requestId,
          performedBy: user.id,
          previous: { status: InviteStatus.PENDING },
          current: { status: newStatus }
        })
      })

      if (action === ShareRequestAction.ACCEPT) {
        await tx.sampleShare.upsert({
          where: {
            sampleId_targetGroupId: {
              sampleId: request.sampleId,
              targetGroupId: request.targetGroupId
            }
          },
          update: {
            permission: request.permission,
            sharedBy: user.id,
            isArchived: false,
            archivedAt: null
          },
          create: {
            sampleId: request.sampleId,
            targetGroupId: request.targetGroupId,
            permission: request.permission,
            sharedBy: user.id
          }
        })
      }

      return updated
    })
  }
}
