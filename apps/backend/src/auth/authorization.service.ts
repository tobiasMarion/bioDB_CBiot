import { ForbiddenException, Injectable } from '@nestjs/common'
import { GroupRole } from '../common/prisma/generated/enums'
import { PrismaService } from '../common/prisma/prisma.service'
import type { User } from './types/user.type'

export type AdminOnlyPermission =
  | 'PROMOTE_ADMIN'
  | 'CREATE_GROUP'
  | 'INVITE_ANY_GROUP'
  | 'ASSIGN_LEADER'
  | 'CREATE_FREEZER'
  | 'UPDATE_FREEZER'
  | 'VIEW_ALL_SAMPLES'
  | 'VIEW_REPORTS'

export type StandardGroupPermission =
  | 'VIEW_GROUP'
  | 'UPDATE_GROUP'
  | 'DELETE_GROUP'
  | 'SHARE_SAMPLE'
  | 'CREATE_SAMPLE'
  | 'UPDATE_SAMPLE'
  | 'DELETE_SAMPLE'
  | 'CREATE_TUBE'
  | 'CREATE_BOX'
  | 'MANAGE_STORAGE'

export type ManageMembershipPermission = 'MANAGE_MEMBERSHIP_ROLE'

export type Permission = AdminOnlyPermission | StandardGroupPermission | ManageMembershipPermission

export type AssertParams =
  | {
      user: User
      permission: AdminOnlyPermission
      message?: string
    }
  | {
      user: User
      permission: StandardGroupPermission
      groupId: string
      message?: string
    }
  | {
      user: User
      permission: ManageMembershipPermission
      groupId: string
      targetRoles: GroupRole[]
      message?: string
    }

export type CanParams =
  | {
      user: User
      permission: AdminOnlyPermission
    }
  | {
      user: User
      permission: StandardGroupPermission
      groupId: string
    }
  | {
      user: User
      permission: ManageMembershipPermission
      groupId: string
      targetRoles: GroupRole[]
    }

// RESEARCHER < MANAGER < LEADER
export const ROLE_LEVEL: Record<GroupRole, number> = {
  [GroupRole.RESEARCHER]: 1,
  [GroupRole.MANAGER]: 2,
  [GroupRole.LEADER]: 3
}

const REQUIRED_ROLE: Record<StandardGroupPermission, GroupRole> = {
  VIEW_GROUP: GroupRole.RESEARCHER,
  UPDATE_GROUP: GroupRole.LEADER,
  DELETE_GROUP: GroupRole.LEADER,

  SHARE_SAMPLE: GroupRole.MANAGER,

  CREATE_SAMPLE: GroupRole.RESEARCHER,
  UPDATE_SAMPLE: GroupRole.RESEARCHER,
  DELETE_SAMPLE: GroupRole.MANAGER,

  CREATE_TUBE: GroupRole.RESEARCHER,
  CREATE_BOX: GroupRole.RESEARCHER,

  MANAGE_STORAGE: GroupRole.MANAGER
}

const ADMIN_PERMISSIONS = new Set<AdminOnlyPermission>([
  'PROMOTE_ADMIN',
  'CREATE_GROUP',
  'INVITE_ANY_GROUP',
  'ASSIGN_LEADER',
  'CREATE_FREEZER',
  'UPDATE_FREEZER',
  'VIEW_ALL_SAMPLES',
  'VIEW_REPORTS'
])

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async assert(params: AssertParams): Promise<void> {
    const allowed = await this.can(params)

    if (!allowed) {
      throw new ForbiddenException(params.message ?? 'Insufficient permissions')
    }
  }

  async can(params: CanParams): Promise<boolean> {
    const { user, permission } = params

    if (ADMIN_PERMISSIONS.has(permission as AdminOnlyPermission)) {
      return user.isAdmin
    }

    if (user.isAdmin) {
      return true
    }

    const { groupId } = params as { groupId: string }

    const membership = await this.prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId: user.id, groupId } },
      select: { role: true, isArchived: true, group: { select: { isArchived: true } } }
    })

    if (!membership || membership.isArchived || membership.group.isArchived) {
      return false
    }

    const currentLevel = ROLE_LEVEL[membership.role]

    if (permission === 'MANAGE_MEMBERSHIP_ROLE') {
      const { targetRoles } = params as { targetRoles: GroupRole[] }

      if (!targetRoles || targetRoles.length === 0) {
        return false
      }

      for (const targetRole of targetRoles) {
        if (currentLevel <= ROLE_LEVEL[targetRole]) {
          return false
        }
      }

      return true
    }

    const requiredRole = REQUIRED_ROLE[permission as StandardGroupPermission]

    return currentLevel >= ROLE_LEVEL[requiredRole]
  }
}
