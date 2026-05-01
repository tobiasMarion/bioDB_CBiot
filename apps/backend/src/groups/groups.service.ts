import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { auditCreate, auditDelete, auditUpdate } from '../auth/audit.utils'
import { AuthorizationService } from '../auth/authorization.service'
import type { User } from '../auth/types/user.type'
import { Prisma } from '../common/prisma/generated/client'
import { PrismaService } from '../common/prisma/prisma.service'
import { CreateGroupDTO } from './dto/CreateGroup'
import { SendInviteDTO } from './dto/SendInvite'
import { UpdateMemberRoleDTO } from './dto/UpdateMemberRole'

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthorizationService
  ) {}

  async create(data: CreateGroupDTO, user: User) {
    await this.auth.assert({ user, permission: 'CREATE_GROUP' })

    try {
      const newGroup = await this.prisma.group.create({
        data: { ...data, createdBy: user.id }
      })

      await this.prisma.auditLog.create({
        data: auditCreate({
          entityType: 'GROUP',
          entityId: newGroup.id,
          performedBy: user.id,
          current: newGroup
        })
      })

      return newGroup
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException('Failed to create group')
      }
      throw error
    }
  }

  async findAll(user: User) {
    if (user.isAdmin) {
      return this.prisma.group.findMany({
        where: { isArchived: false },
        include: { _count: { select: { memberships: { where: { isArchived: false } } } } }
      })
    }
    return this.prisma.group.findMany({
      where: {
        isArchived: false,
        memberships: {
          some: { userId: user.id, isArchived: false }
        }
      },
      include: { _count: { select: { memberships: { where: { isArchived: false } } } } }
    })
  }

  async findById(id: string, user: User) {
    await this.auth.assert({ user, permission: 'VIEW_GROUP', groupId: id })

    const group = await this.prisma.group.findUnique({
      where: { id, isArchived: false },
      include: {
        memberships: {
          where: { isArchived: false },
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    })

    if (!group) throw new NotFoundException('Group not found')
    return group
  }

  async archive(id: string, user: User) {
    await this.auth.assert({ user, permission: 'DELETE_GROUP', groupId: id })

    const previous = await this.prisma.group.findUnique({ where: { id } })
    if (!previous || previous.isArchived) throw new NotFoundException('Group not found')

    const archived = await this.prisma.group.update({
      where: { id },
      data: { isArchived: true, archivedAt: new Date() }
    })

    await this.prisma.auditLog.create({
      data: auditDelete({
        entityType: 'GROUP',
        entityId: id,
        performedBy: user.id,
        previous
      })
    })

    return { success: true }
  }

  async findUserMemberships(user: User) {
    try {
      return await this.prisma.groupMembership.findMany({
        where: {
          userId: user.id,
          isArchived: false,
          group: { isArchived: false }
        },
        select: {
          id: true,
          groupId: true,
          role: true,
          joinedAt: true,
          group: {
            select: {
              name: true
            }
          }
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user memberships')
    }
  }

  async getMembers(groupId: string, user: User) {
    await this.auth.assert({ user, permission: 'VIEW_GROUP', groupId })

    return this.prisma.groupMembership.findMany({
      where: { groupId, isArchived: false },
      include: { user: { select: { id: true, name: true, email: true } } }
    })
  }

  async updateMemberRole(
    groupId: string,
    userId: string,
    data: UpdateMemberRoleDTO,
    currentUser: User
  ) {
    const membership = await this.prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId, groupId } }
    })

    if (!membership || membership.isArchived) {
      throw new NotFoundException('Member not found in group')
    }

    if (membership.role === data.role) {
      return membership
    }

    await this.auth.assert({
      user: currentUser,
      permission: 'MANAGE_MEMBERSHIP_ROLE',
      groupId,
      targetRoles: [membership.role, data.role],
      message: 'You can only manage users with a role strictly below yours'
    })

    const previous = membership
    const updated = await this.prisma.groupMembership.update({
      where: { id: membership.id },
      data: { role: data.role }
    })

    await this.prisma.auditLog.create({
      data: auditUpdate({
        entityType: 'MEMBERSHIP',
        entityId: updated.id,
        performedBy: currentUser.id,
        previous,
        current: updated
      })
    })

    return updated
  }

  async removeMember(groupId: string, userId: string, currentUser: User) {
    const membership = await this.prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId, groupId } }
    })

    if (!membership || membership.isArchived) {
      throw new NotFoundException('Member not found in group')
    }

    await this.auth.assert({
      user: currentUser,
      permission: 'MANAGE_MEMBERSHIP_ROLE',
      groupId,
      targetRoles: [membership.role],
      message: 'You can only remove users with a role strictly below yours'
    })

    const removed = await this.prisma.groupMembership.update({
      where: { id: membership.id },
      data: { isArchived: true, archivedAt: new Date() }
    })

    await this.prisma.auditLog.create({
      data: auditDelete({
        entityType: 'MEMBERSHIP',
        entityId: removed.id,
        performedBy: currentUser.id,
        previous: membership
      })
    })

    return { success: true }
  }

  async sendInvite(groupId: string, data: SendInviteDTO, currentUser: User) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: data.invitedUserId }
    })

    if (!userExists || userExists.isArchived) {
      throw new NotFoundException('Invited user not found')
    }

    await this.auth.assert({
      user: currentUser,
      permission: 'MANAGE_MEMBERSHIP_ROLE',
      groupId,
      targetRoles: [data.role],
      message: 'You can only invite users to a role strictly below yours'
    })

    const existingMembership = await this.prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId: data.invitedUserId, groupId } }
    })

    if (existingMembership && !existingMembership.isArchived) {
      throw new ConflictException('User is already a member of this group')
    }

    const existingInvite = await this.prisma.groupInvite.findFirst({
      where: {
        groupId,
        invitedUserId: data.invitedUserId,
        status: 'PENDING',
        isArchived: false
      }
    })

    if (existingInvite) {
      throw new ConflictException('A pending invite already exists for this user')
    }

    return this.prisma.$transaction(async tx => {
      const invite = await tx.groupInvite.create({
        data: {
          groupId,
          invitedUserId: data.invitedUserId,
          invitedBy: currentUser.id,
          role: data.role
        }
      })

      await tx.auditLog.create({
        data: auditCreate({
          entityType: 'INVITE',
          entityId: invite.id,
          performedBy: currentUser.id,
          current: invite
        })
      })

      return invite
    })
  }
}
