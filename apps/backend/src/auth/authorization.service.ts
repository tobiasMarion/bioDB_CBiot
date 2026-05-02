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

type BaseParams = {
  user: User
  message?: string
}

export type AdminParams = BaseParams & {
  permission: AdminOnlyPermission
}

export type GroupParams = BaseParams & {
  permission: StandardGroupPermission
  groupId: string
}

export type MembershipParams = BaseParams & {
  permission: ManageMembershipPermission
  groupId: string
  targetRoles: GroupRole[]
}

export type AssertParams = AdminParams | GroupParams | MembershipParams
export type CanParams = AdminParams | GroupParams | MembershipParams

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

function isAdminPermission(permission: Permission): permission is AdminOnlyPermission {
  return ADMIN_PERMISSIONS.has(permission as AdminOnlyPermission)
}

function hasGroupContext(params: CanParams): params is GroupParams | MembershipParams {
  return 'groupId' in params
}

function isMembershipPermission(params: CanParams): params is MembershipParams {
  return params.permission === 'MANAGE_MEMBERSHIP_ROLE'
}

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

    if (isAdminPermission(permission)) {
      return user.isAdmin
    }

    if (user.isAdmin) {
      return true
    }

    if (!hasGroupContext(params)) {
      return false
    }

    const membership = await this.prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: params.groupId
        }
      },
      select: {
        role: true,
        isArchived: true,
        group: {
          select: {
            isArchived: true
          }
        }
      }
    })

    if (!membership) {
      return false
    }

    if (membership.isArchived || membership.group.isArchived) {
      return false
    }

    const currentLevel = ROLE_LEVEL[membership.role]

    if (isMembershipPermission(params)) {
      return this.canManageRoles(currentLevel, params.targetRoles)
    }

    const requiredRole = REQUIRED_ROLE[permission]

    return currentLevel >= ROLE_LEVEL[requiredRole]
  }

  private canManageRoles(currentLevel: number, targetRoles: GroupRole[]): boolean {
    if (targetRoles.length === 0) {
      return false
    }

    for (const role of targetRoles) {
      if (currentLevel <= ROLE_LEVEL[role]) {
        return false
      }
    }

    return true
  }
}
