import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { auditCreate, auditDelete, auditUpdate } from '../auth/audit.utils'
import { AuthorizationService } from '../auth/authorization.service'
import type { User } from '../auth/types/user.type'
import { GroupMembership, GroupRole, Prisma } from '../common/prisma/generated/client'
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
      return await this.prisma.$transaction(async tx => {
        const newGroup = await tx.group.create({
          data: { ...data, createdBy: user.id }
        })

        await tx.auditLog.create({
          data: auditCreate({
            entityType: 'GROUP',
            entityId: newGroup.id,
            performedBy: user.id,
            current: newGroup
          })
        })

        return newGroup
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException('Failed to create group')
      }
      throw error
    }
  }

  async findAll(user: User) {
    const groups = await this.prisma.group.findMany({
      where: {
        isArchived: false,
        ...(!user.isAdmin && {
          memberships: { some: { userId: user.id, isArchived: false } }
        })
      },
      include: {
        _count: { select: { memberships: { where: { isArchived: false } } } },
        memberships: {
          where: { userId: user.id, isArchived: false },
          select: { role: true }
        }
      }
    })

    return groups.map(({ memberships, _count, ...group }) => ({
      ...group,
      amountOfMembers: _count?.memberships || 0,
      role: memberships[0]?.role ?? null
    }))
  }

  async findById(id: string, user: User) {
    await this.auth.assert({ user, permission: 'VIEW_GROUP', groupId: id })

    const group = await this.prisma.group.findUnique({
      where: { id, isArchived: false }
    })

    if (!group) throw new NotFoundException('Group not found')

    const membership = await this.prisma.groupMembership.findFirst({
      where: { groupId: id, userId: user.id, isArchived: false }
    })

    return {
      id: group.id,
      name: group.name,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
      membership: membership
        ? {
            id: membership.id,
            role: membership.role,
            joinedAt: membership.joinedAt
          }
        : null
    }
  }

  async archive(id: string, user: User) {
    await this.auth.assert({ user, permission: 'DELETE_GROUP', groupId: id })

    const previous = await this.prisma.group.findUnique({ where: { id } })
    if (!previous || previous.isArchived) throw new NotFoundException('Group not found')

    await this.prisma.$transaction(async tx => {
      await tx.group.update({
        where: { id },
        data: { isArchived: true, archivedAt: new Date() }
      })

      await tx.auditLog.create({
        data: auditDelete({
          entityType: 'GROUP',
          entityId: id,
          performedBy: user.id,
          previous
        })
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
      targetRoles: [membership.role, data.role as GroupRole],
      message: 'You can only manage users with a role strictly below yours'
    })

    const previous = membership
    const updated = await this.prisma.groupMembership.update({
      where: { id: membership.id },
      data: { role: data.role as GroupRole }
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

    const role = data.role as GroupRole

    await this.auth.assert({
      user: currentUser,
      permission: 'MANAGE_MEMBERSHIP_ROLE',
      groupId,
      targetRoles: [role],
      message: 'You can only invite users to a role strictly below yours'
    })

    const existingMembership = await this.prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId: data.invitedUserId, groupId } }
    })

    if (existingMembership && !existingMembership.isArchived) {
      throw new ConflictException('User is already a member of this group')
    }

    // Se o convidado for o próprio usuário, adiciona direto
    if (data.invitedUserId === currentUser.id) {
      return this.handleSelfJoin(groupId, role, currentUser, existingMembership)
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
          role
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

      return { type: 'invite', data: invite }
    })
  }

  private async handleSelfJoin(
    groupId: string,
    role: GroupRole,
    currentUser: User,
    existingMembership: GroupMembership | null
  ) {
    return this.prisma.$transaction(async tx => {
      const membership = existingMembership?.isArchived
        ? await tx.groupMembership.update({
            where: { id: existingMembership.id },
            data: {
              isArchived: false,
              archivedAt: null,
              role
            }
          })
        : await tx.groupMembership.create({
            data: {
              groupId,
              userId: currentUser.id,
              role
            }
          })

      await tx.auditLog.create({
        data: auditCreate({
          entityType: 'MEMBERSHIP',
          entityId: membership.id,
          performedBy: currentUser.id,
          current: membership
        })
      })

      return { type: 'membership', data: membership }
    })
  }

  async getGroupInvites(groupId: string, user: User) {
    await this.auth.assert({ user, groupId: groupId, permission: 'VIEW_PENDING_INVITES' })

    return this.prisma.groupInvite.findMany({
      where: { groupId, status: 'PENDING', isArchived: false },
      select: {
        id: true,
        groupId: true,
        invitedUserId: true,
        invitedBy: true,
        role: true,
        status: true,
        createdAt: true,
        invitedUser: { select: { id: true, name: true, email: true } },
        sender: { select: { id: true, name: true, email: true } }
      }
    })
  }
}
