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
import { TubeExpirationService } from '../notifications/tube-expiration/tube-expiration.service'
import { SampleAccessService } from '../samples/sample-access.service'
import { AddAttributeDTO } from './dto/AddAttribute'
import { CheckinTubeDTO } from './dto/CheckinTube'
import { CreateTubeDTO } from './dto/CreateTube'
import { FractionateTubeDTO } from './dto/FractionateTube'
import { UpdateAttributeDTO } from './dto/UpdateAttribute'
import { UpdateTubeDTO } from './dto/UpdateTube'

const tubeSelect = {
  id: true,
  sampleId: true,
  expirationDate: true,
  daysBeforeNotification: true,
  notes: true,
  boxId: true,
  row: true,
  column: true,
  checkedOutBy: true,
  checkedOutAt: true,
  reasonForArchiving: true,
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
      checkedOutAt && checkedOutUser ? { by: checkedOutUser, at: checkedOutAt.toISOString() } : null
  }
}

@Injectable()
export class TubesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthorizationService,
    private readonly tubeExpiration: TubeExpirationService,
    private readonly sampleAccess: SampleAccessService
  ) {}

  private async findRawTube(id: string) {
    const tube = await this.prisma.tube.findUnique({
      where: { id, isArchived: false },
      select: tubeSelect
    })
    if (!tube) throw new NotFoundException('Tube not found')
    return tube
  }

  private async getSample(sampleId: string): Promise<{ id: string; groupId: string }> {
    const sample = await this.prisma.sample.findUnique({
      where: { id: sampleId, isArchived: false },
      select: { id: true, groupId: true }
    })
    if (!sample) throw new NotFoundException('Sample not found')
    return sample
  }

  private async getTubeSample(tubeId: string): Promise<{ id: string; groupId: string }> {
    const tube = await this.prisma.tube.findUnique({
      where: { id: tubeId, isArchived: false },
      select: { sample: { select: { id: true, groupId: true } } }
    })
    if (!tube) throw new NotFoundException('Tube not found')
    return tube.sample
  }

  /** Members of the owning group are checked by their role; members of a group holding an
   *  active SampleShare are checked against the granted permission (see SampleAccessService). */
  private async assertCanView(sample: { id: string; groupId: string }, user: User) {
    const access = await this.sampleAccess.resolveSampleAccess(sample, user)
    if (!access.canView) throw new ForbiddenException('Insufficient permissions')
    return access
  }

  private async assertCanEdit(sample: { id: string; groupId: string }, user: User) {
    const access = await this.sampleAccess.resolveSampleAccess(sample, user)
    if (!access.canEdit) throw new ForbiddenException('Insufficient permissions')
    return access
  }

  async create(sampleId: string, data: CreateTubeDTO, user: User) {
    const sample = await this.getSample(sampleId)
    await this.assertCanEdit(sample, user)

    const tube = await this.prisma.$transaction(async tx => {
      const newTube = await tx.tube.create({
        data: {
          sampleId,
          createdBy: user.id,
          expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
          ...(data.daysBeforeNotification !== undefined && {
            daysBeforeNotification: data.daysBeforeNotification
          })
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
    const sample = await this.getTubeSample(tubeId)
    await this.assertCanEdit(sample, user)

    const tube = await this.prisma.tube.update({
      where: { id: tubeId, isArchived: false },
      data: {
        notes: data.notes,
        ...(data.daysBeforeNotification !== undefined && {
          daysBeforeNotification: data.daysBeforeNotification
        })
      },
      select: tubeSelect
    })

    return formatTube(tube)
  }

  async findBySample(sampleId: string, user: User) {
    const sample = await this.getSample(sampleId)
    await this.assertCanView(sample, user)

    const tubes = await this.prisma.tube.findMany({
      where: { sampleId, isArchived: false },
      select: tubeSelect,
      orderBy: { createdAt: 'asc' }
    })

    return tubes.map(formatTube)
  }

  async checkout(tubeId: string, user: User) {
    const sample = await this.getTubeSample(tubeId)
    await this.assertCanEdit(sample, user)

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
    const sample = await this.getTubeSample(tubeId)
    await this.assertCanEdit(sample, user)

    const current = await this.findRawTube(tubeId)

    // Reject if already placed in storage — both checked-out and unplaced tubes are acceptable
    if (current.boxId) throw new ConflictException('Tube is already in storage')

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
          previous: { ...current, experimentNotes: undefined },
          current: { ...updated, experimentNotes: data.notes }
        })
      })

      return updated
    })

    return formatTube(tube)
  }

  async archive(tubeId: string, user: User, reason: string) {
    const sample = await this.getTubeSample(tubeId)
    // Archiving is a storage-management action reserved for the owning group — a share grant
    // (VIEW or EDIT) only covers viewing/editing sample data, not destructive storage operations.
    await this.auth.assert({ user, permission: 'MANAGE_STORAGE', groupId: sample.groupId })

    const tube = await this.prisma.$transaction(async tx => {
      const archived = await tx.tube.update({
        where: { id: tubeId },
        // Free up the storage slot — an archived tube must not keep occupying a box position,
        // otherwise the (boxId, row, column) unique constraint blocks future placements there
        // and the checkin "position occupied" check (which only looks at active tubes) misses it,
        // causing an unhandled unique-constraint error on checkin.
        data: { isArchived: true, archivedAt: new Date(), reasonForArchiving: reason, boxId: null, row: null, column: null },
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

    await this.tubeExpiration.resolveExpirationNotification(tubeId)

    return formatTube(tube)
  }

  async fractionate(tubeId: string, data: FractionateTubeDTO, user: User) {
    const current = await this.findRawTube(tubeId)

    const isCheckedOutByMe =
      current.checkedOutAt && current.checkedOutBy === user.id
    const isUnplaced = !current.checkedOutAt && !current.boxId

    if (!isCheckedOutByMe && !isUnplaced) {
      if (current.checkedOutAt) {
        throw new ForbiddenException(
          'Only the user who checked out this tube can fractionate it'
        )
      }
      throw new ForbiddenException(
        'Cannot fractionate a tube that is in storage. Check it out first or use an unplaced tube.'
      )
    }

    if (isUnplaced) {
      const sample = await this.getTubeSample(tubeId)
      await this.assertCanEdit(sample, user)
    }

    const { quantity } = data

    const newTubes = await this.prisma.$transaction(async tx => {
      const created: Awaited<ReturnType<TubesService['findRawTube']>>[] = []

      for (let i = 0; i < quantity; i++) {
        const newTube = await tx.tube.create({
          data: {
            sampleId: current.sampleId,
            createdBy: user.id,
            expirationDate: current.expirationDate,
            daysBeforeNotification: current.daysBeforeNotification,
            notes: current.notes,
            boxId: null,
            row: null,
            column: null
          },
          select: tubeSelect
        })

        if (current.attributes.length > 0) {
          await tx.tubeAttribute.createMany({
            data: current.attributes.map(attr => ({
              tubeId: newTube.id,
              key: attr.key,
              value: attr.value,
              type: attr.type,
              minRequiredRoleToEdit: attr.minRequiredRoleToEdit,
              createdBy: user.id
            }))
          })
        }

        await tx.auditLog.create({
          data: auditCreate({
            entityType: 'TUBE',
            entityId: newTube.id,
            performedBy: user.id,
            current: newTube
          })
        })

        created.push(newTube)
      }

      return created
    })

    return newTubes.map(formatTube)
  }

  async addAttribute(tubeId: string, data: AddAttributeDTO, user: User) {
    const sample = await this.getTubeSample(tubeId)
    const access = await this.assertCanEdit(sample, user)

    // access.canEdit guarantees effectiveRole is set — it's only null when the user has no access
    if (
      !user.isAdmin &&
      ROLE_LEVEL[access.effectiveRole as GroupRole] < ROLE_LEVEL[data.minRequiredRoleToEdit]
    ) {
      throw new ForbiddenException('Cannot create an attribute with a role higher than your own')
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
    const sample = await this.getTubeSample(tubeId)
    const access = await this.assertCanEdit(sample, user)

    const attr = await this.prisma.tubeAttribute.findUnique({
      where: { tubeId_key: { tubeId, key }, isArchived: false },
      select: { id: true, minRequiredRoleToEdit: true }
    })
    if (!attr) throw new NotFoundException('Attribute not found')

    // access.canEdit guarantees effectiveRole is set — it's only null when the user has no access
    if (
      !user.isAdmin &&
      ROLE_LEVEL[access.effectiveRole as GroupRole] < ROLE_LEVEL[attr.minRequiredRoleToEdit]
    ) {
      throw new ForbiddenException('Insufficient role to edit this attribute')
    }

    return this.prisma.tubeAttribute.update({
      where: { tubeId_key: { tubeId, key } },
      data: { value: data.value },
      select: { id: true, key: true, value: true, type: true, minRequiredRoleToEdit: true }
    })
  }

  async deleteAttribute(tubeId: string, key: string, user: User) {
    const sample = await this.getTubeSample(tubeId)
    const access = await this.assertCanEdit(sample, user)

    const attr = await this.prisma.tubeAttribute.findUnique({
      where: { tubeId_key: { tubeId, key }, isArchived: false },
      select: { id: true, minRequiredRoleToEdit: true }
    })
    if (!attr) throw new NotFoundException('Attribute not found')

    // access.canEdit guarantees effectiveRole is set — it's only null when the user has no access
    if (
      !user.isAdmin &&
      ROLE_LEVEL[access.effectiveRole as GroupRole] < ROLE_LEVEL[attr.minRequiredRoleToEdit]
    ) {
      throw new ForbiddenException('Insufficient role to delete this attribute')
    }

    await this.prisma.tubeAttribute.update({
      where: { tubeId_key: { tubeId, key } },
      data: { isArchived: true, archivedAt: new Date() }
    })
  }
}
