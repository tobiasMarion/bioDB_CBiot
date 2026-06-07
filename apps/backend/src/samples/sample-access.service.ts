import { Injectable } from '@nestjs/common'
import { AuthorizationService } from '../auth/authorization.service'
import type { User } from '../auth/types/user.type'
import { GroupRole } from '../common/prisma/generated/enums'
import { PrismaService } from '../common/prisma/prisma.service'

export type SampleAccess = {
  canView: boolean
  canEdit: boolean
  /**
   * Role to use for role-gated decisions on the sample and its tubes (e.g. minimum role
   * required to edit a tube attribute): the user's role in whichever group is the actual
   * basis of their access — the owning group when they're a member there, otherwise the
   * target group of an active SampleShare grant. `null` when the user has no access.
   */
  effectiveRole: GroupRole | null
}

@Injectable()
export class SampleAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthorizationService
  ) {}

  /**
   * Resolves what a user can do with a sample, accounting for cross-group SampleShare grants:
   * group members get access (and edit rights) per their role; members of a group holding an
   * active share grant get access per the granted permission (VIEW or EDIT), evaluated against
   * their role in that target group.
   */
  async resolveSampleAccess(
    sample: { id: string; groupId: string },
    user: User
  ): Promise<SampleAccess> {
    if (user.isAdmin) {
      return { canView: true, canEdit: true, effectiveRole: GroupRole.LEADER }
    }

    const ownerRole = await this.getActiveRole(sample.groupId, user)

    if (ownerRole) {
      const canEdit = await this.auth.can({
        user,
        permission: 'UPDATE_SAMPLE',
        groupId: sample.groupId
      })
      return { canView: true, canEdit, effectiveRole: ownerRole }
    }

    const memberships = await this.prisma.groupMembership.findMany({
      where: { userId: user.id, isArchived: false, group: { isArchived: false } },
      select: { groupId: true, role: true }
    })

    if (memberships.length === 0) {
      return { canView: false, canEdit: false, effectiveRole: null }
    }

    const share = await this.prisma.sampleShare.findFirst({
      where: {
        sampleId: sample.id,
        isArchived: false,
        targetGroupId: { in: memberships.map(m => m.groupId) }
      },
      select: { permission: true, targetGroupId: true }
    })

    if (!share) {
      return { canView: false, canEdit: false, effectiveRole: null }
    }

    const targetRole = memberships.find(m => m.groupId === share.targetGroupId)?.role ?? null

    const canEdit =
      share.permission === 'EDIT' &&
      (await this.auth.can({ user, permission: 'UPDATE_SAMPLE', groupId: share.targetGroupId }))

    return { canView: true, canEdit, effectiveRole: targetRole }
  }

  private async getActiveRole(groupId: string, user: User): Promise<GroupRole | null> {
    const membership = await this.prisma.groupMembership.findUnique({
      where: { userId_groupId: { userId: user.id, groupId } },
      select: { role: true, isArchived: true, group: { select: { isArchived: true } } }
    })

    if (!membership || membership.isArchived || membership.group.isArchived) return null
    return membership.role
  }
}
