import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { auditCreate, auditDelete, auditUpdate } from '../auth/audit.utils'
import { AuthorizationService, ROLE_LEVEL } from '../auth/authorization.service'
import type { User } from '../auth/types/user.type'
import { GroupRole } from '../common/prisma/generated/enums'
import { PrismaService } from '../common/prisma/prisma.service'
import { AddAttributeDTO } from './dto/AddAttribute'
import { CheckinTubeDTO } from './dto/CheckinTube'
import { CreateTubeDTO } from './dto/CreateTube'
import { UpdateAttributeDTO } from './dto/UpdateAttribute'
import { UpdateTubeDTO } from './dto/UpdateTube'

const tubeSelect = {
  id: true,
  sampleId: true,
  expirationDate: true,
  notes: true,
  boxId: true,
  row: true,
  column: true,
  checkedOutBy: true,
  checkedOutAt: true,
  checkedOutUser: { select: { id: true, name: true } },
  box: {
    select: {
      id: true,
      label: true,
      freezer: {
        select: {
          id: true,
          name: true,
          room: { select: { id: true, number: true, building: true, floor: true } }
        }
      }
    }
  },
  attributes: {
    where: { isArchived: false },
    select: {
      id: true,
      key: true,
      value: true,
      type: true,
      minRequiredRoleToEdit: true
    },
    orderBy: { createdAt: 'asc' as const }
  }
}

function deriveStatus(tube: {
  checkedOutAt: Date | null
  boxId: string | null
}): 'checked_out' | 'in_storage' | 'unplaced' {
  if (tube.checkedOutAt) return 'checked_out'
  if (tube.boxId) return 'in_storage'
  return 'unplaced'
}

function formatTube(tube: Awaited<ReturnType<TubesService['findRawTube']>>) {
  const { checkedOutBy, checkedOutAt, checkedOutUser, ...rest } = tube
  return {
    ...rest,
    status: deriveStatus(tube),
    checkedOut:
      checkedOutAt && checkedOutUser
        ? { by: checkedOutUser, at: checkedOutAt.toISOString() }
        : null
  }
}

@Injectable()
export class TubesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthorizationService
  ) {}

  private async findRawTube(id: string) {
    const tube = await this.prisma.tube.findUnique({
      where: { id, isArchived: false },
      select: tubeSelect
    })
    if (!tube) throw new NotFoundException('Tube not found')
    return tube
  }

  private async getSampleGroupId(sampleId: string): Promise<string> {
    const sample = await this.prisma.sample.findUnique({
      where: { id: sampleId, isArchived: false },
      select: { groupId: true }
    })
    if (!sample) throw new NotFoundException('Sample not found')
    return sample.groupId
  }

  private async getTubeGroupId(tubeId: string): Promise<string> {
    const tube = await this.prisma.tube.findUnique({
      where: { id: tubeId, isArchived: false },
      select: { sample: { select: { groupId: true } } }
    })
    if (!tube) throw new NotFoundException('Tube not found')
    return tube.sample.groupId
  }

  async create(sampleId: string, data: CreateTubeDTO, user: User) {
    const groupId = await this.getSampleGroupId(sampleId)
    await this.auth.assert({ user, permission: 'CREATE_TUBE', groupId })

    const tube = await this.prisma.$transaction(async tx => {
      const newTube = await tx.tube.create({
        data: {
          sampleId,
          createdBy: user.id,
          expirationDate: data.expirationDate ? new Date(data.expirationDate) : null
        },
        select: tubeSelect
      })

      await tx.auditLog.create({
        data: auditCreate({
          entityType: 'TUBE',
          entityId: newTube.id,
          performedBy: user.id,
          current: newTube
        })
      })

      return newTube
    })

    return formatTube(tube)
  }

  async update(tubeId: string, data: UpdateTubeDTO, user: User) {
    const groupId = await this.getTubeGroupId(tubeId)
    await this.auth.assert({ user, permission: 'VIEW_GROUP', groupId })

    const tube = await this.prisma.tube.update({
      where: { id: tubeId, isArchived: false },
      data: { notes: data.notes },
      select: tubeSelect
    })

    return formatTube(tube)
  }

  async findBySample(sampleId: string, user: User) {
    const groupId = await this.getSampleGroupId(sampleId)
    await this.auth.assert({ user, permission: 'VIEW_GROUP', groupId })

    const tubes = await this.prisma.tube.findMany({
      where: { sampleId, isArchived: false },
      select: tubeSelect,
      orderBy: { createdAt: 'asc' }
    })

    return tubes.map(formatTube)
  }

  async checkout(tubeId: string, user: User) {
    const groupId = await this.getTubeGroupId(tubeId)
    await this.auth.assert({ user, permission: 'VIEW_GROUP', groupId })

    const current = await this.findRawTube(tubeId)
    if (current.checkedOutAt) throw new ConflictException('Tube is already checked out')

    const tube = await this.prisma.$transaction(async tx => {
      const updated = await tx.tube.update({
        where: { id: tubeId },
        data: {
          checkedOutBy: user.id,
          checkedOutAt: new Date(),
          boxId: null,
          row: null,
          column: null
        },
        select: tubeSelect
      })

      await tx.tubeEvent.create({
        data: {
          tubeId,
          performedBy: user.id,
          fromBoxId: current.boxId,
          fromRow: current.row,
          fromColumn: current.column
        }
      })

      await tx.auditLog.create({
        data: auditUpdate({
          entityType: 'TUBE',
          entityId: tubeId,
          performedBy: user.id,
          previous: current,
          current: updated
        })
      })

      return updated
    })

    return formatTube(tube)
  }

  async checkin(tubeId: string, data: CheckinTubeDTO, user: User) {
    const groupId = await this.getTubeGroupId(tubeId)
    await this.auth.assert({ user, permission: 'VIEW_GROUP', groupId })

    const current = await this.findRawTube(tubeId)
    if (!current.checkedOutAt) throw new ConflictException('Tube is not checked out')

    const box = await this.prisma.box.findUnique({
      where: { id: data.boxId, isArchived: false },
      select: { id: true }
    })
    if (!box) throw new NotFoundException('Box not found')

    const occupied = await this.prisma.tube.findFirst({
      where: { boxId: data.boxId, row: data.row, column: data.col, isArchived: false }
    })
    if (occupied) throw new ConflictException('Position is already occupied')

    const tube = await this.prisma.$transaction(async tx => {
      const updated = await tx.tube.update({
        where: { id: tubeId },
        data: {
          checkedOutBy: null,
          checkedOutAt: null,
          boxId: data.boxId,
          row: data.row,
          column: data.col
        },
        select: tubeSelect
      })

      await tx.tubeEvent.create({
        data: {
          tubeId,
          performedBy: user.id,
          toBoxId: data.boxId,
          toRow: data.row,
          toColumn: data.col,
          notes: data.notes
        }
      })

      await tx.auditLog.create({
        data: auditUpdate({
          entityType: 'TUBE',
          entityId: tubeId,
          performedBy: user.id,
          previous: current,
          current: updated
        })
      })

      return updated
    })

    return formatTube(tube)
  }

  async archive(tubeId: string, user: User) {
    const groupId = await this.getTubeGroupId(tubeId)
    await this.auth.assert({ user, permission: 'MANAGE_STORAGE', groupId })

    const tube = await this.prisma.$transaction(async tx => {
      const archived = await tx.tube.update({
        where: { id: tubeId },
        data: { isArchived: true, archivedAt: new Date() },
        select: tubeSelect
      })

      await tx.auditLog.create({
        data: auditDelete({
          entityType: 'TUBE',
          entityId: tubeId,
          performedBy: user.id,
          previous: archived
        })
      })

      return archived
    })

    return formatTube(tube)
  }

  async addAttribute(tubeId: string, data: AddAttributeDTO, user: User) {
    const groupId = await this.getTubeGroupId(tubeId)
    await this.auth.assert({ user, permission: 'CREATE_TUBE', groupId })

    if (!user.isAdmin) {
      const membership = await this.prisma.groupMembership.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
        select: { role: true }
      })
      if (!membership) throw new ForbiddenException('Not a member of this group')
      if (ROLE_LEVEL[membership.role] < ROLE_LEVEL[data.minRequiredRoleToEdit]) {
        throw new ForbiddenException(
          'Cannot create an attribute with a role higher than your own'
        )
      }
    }

    const attr = await this.prisma.tubeAttribute.create({
      data: {
        tubeId,
        key: data.key,
        value: data.value,
        type: data.type,
        minRequiredRoleToEdit: data.minRequiredRoleToEdit,
        createdBy: user.id
      },
      select: { id: true, key: true, value: true, type: true, minRequiredRoleToEdit: true }
    })

    return attr
  }

  async updateAttribute(tubeId: string, key: string, data: UpdateAttributeDTO, user: User) {
    const groupId = await this.getTubeGroupId(tubeId)

    const attr = await this.prisma.tubeAttribute.findUnique({
      where: { tubeId_key: { tubeId, key }, isArchived: false },
      select: { id: true, minRequiredRoleToEdit: true }
    })
    if (!attr) throw new NotFoundException('Attribute not found')

    if (!user.isAdmin) {
      const membership = await this.prisma.groupMembership.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
        select: { role: true }
      })
      if (!membership || ROLE_LEVEL[membership.role] < ROLE_LEVEL[attr.minRequiredRoleToEdit]) {
        throw new ForbiddenException('Insufficient role to edit this attribute')
      }
    }

    return this.prisma.tubeAttribute.update({
      where: { tubeId_key: { tubeId, key } },
      data: { value: data.value },
      select: { id: true, key: true, value: true, type: true, minRequiredRoleToEdit: true }
    })
  }

  async deleteAttribute(tubeId: string, key: string, user: User) {
    const groupId = await this.getTubeGroupId(tubeId)

    const attr = await this.prisma.tubeAttribute.findUnique({
      where: { tubeId_key: { tubeId, key }, isArchived: false },
      select: { id: true, minRequiredRoleToEdit: true }
    })
    if (!attr) throw new NotFoundException('Attribute not found')

    if (!user.isAdmin) {
      const membership = await this.prisma.groupMembership.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
        select: { role: true }
      })
      if (!membership || ROLE_LEVEL[membership.role] < ROLE_LEVEL[attr.minRequiredRoleToEdit]) {
        throw new ForbiddenException('Insufficient role to delete this attribute')
      }
    }

    await this.prisma.tubeAttribute.update({
      where: { tubeId_key: { tubeId, key } },
      data: { isArchived: true, archivedAt: new Date() }
    })
  }
}
