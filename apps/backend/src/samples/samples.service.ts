import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { auditCreate, auditDelete, auditUpdate } from '../auth/audit.utils'
import { AuthorizationService } from '../auth/authorization.service'
import type { User } from '../auth/types/user.type'
import { Prisma } from '../common/prisma/generated/client'
import { PrismaService } from '../common/prisma/prisma.service'
import { CreateSampleDTO } from './dto/CreateSample'
import { UpdateSampleDTO } from './dto/UpdateSample'

const sampleSelect = {
  id: true,
  name: true,
  type: true,
  originOrganism: true,
  sourceLab: true,
  groupId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  creator: {
    select: { id: true, name: true, email: true }
  }
}

@Injectable()
export class SamplesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthorizationService
  ) {}

  async create(data: CreateSampleDTO, groupId: string, user: User) {
    await this.auth.assert({
      user,
      permission: 'CREATE_SAMPLE',
      groupId: groupId
    })

    try {
      return await this.prisma.$transaction(async tx => {
        const newSample = await tx.sample.create({
          data: {
            name: data.name,
            type: data.type,
            originOrganism: data.originOrganism,
            sourceLab: data.sourceLab,
            groupId: groupId,
            createdBy: user.id
          },
          select: sampleSelect
        })

        await tx.auditLog.create({
          data: auditCreate({
            entityType: 'SAMPLE',
            entityId: newSample.id,
            performedBy: user.id,
            current: newSample
          })
        })

        return newSample
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException(`Group with ID ${groupId} not found`)
        }
      }
      throw new InternalServerErrorException('Error creating sample')
    }
  }

  async findAllByGroup(groupId: string, user: User) {
    await this.auth.assert({ user, permission: 'VIEW_GROUP', groupId })

    return this.prisma.sample.findMany({
      where: {
        groupId: groupId,
        isArchived: false
      },
      orderBy: { createdAt: 'desc' },
      select: sampleSelect
    })
  }

  async archive(id: string, user: User) {
    const sample = await this.prisma.sample.findUnique({
      where: { id },
      select: { groupId: true }
    })

    if (!sample) throw new NotFoundException('Sample not found')

    await this.auth.assert({
      user,
      permission: 'DELETE_SAMPLE',
      groupId: sample.groupId
    })

    return await this.prisma.$transaction(async tx => {
      const archivedSample = await tx.sample.update({
        where: { id },
        data: {
          isArchived: true,
          archivedAt: new Date()
        },
        select: sampleSelect
      })

      await tx.auditLog.create({
        data: auditDelete({
          entityType: 'SAMPLE',
          entityId: id,
          performedBy: user.id,
          previous: sample
        })
      })

      return archivedSample
    })
  }

  async getStats(groupId: string, user: User) {
    await this.auth.assert({ user, permission: 'VIEW_GROUP', groupId })

    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      totalSamples,
      samplesLastMonth,
      totalTubes,
      boxesWithTubes,
      expiringSoon,
      differentOrganisms
    ] = await Promise.all([
      this.prisma.sample.count({
        where: { groupId, isArchived: false }
      }),
      this.prisma.sample.count({
        where: {
          groupId,
          isArchived: false,
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      this.prisma.tube.count({
        where: {
          sample: { groupId },
          isArchived: false
        }
      }),
      this.prisma.box.count({
        where: {
          freezer: { isArchived: false },
          tubes: { some: { isArchived: false, sample: { groupId } } }
        }
      }),
      this.prisma.tube.count({
        where: {
          sample: { groupId },
          isArchived: false,
          expirationDate: {
            lte: thirtyDaysFromNow,
            gte: new Date()
          }
        }
      }),
      this.prisma.sample.groupBy({
        by: ['originOrganism'],
        where: { groupId, isArchived: false, originOrganism: { not: '' } },
        _count: { originOrganism: true }
      })
    ])

    return {
      totalSamples,
      samplesLastMonth,
      totalTubes,
      boxesWithTubes,
      expiringSoon,
      differentOrganisms: differentOrganisms.length
    }
  }

  async update(id: string, data: UpdateSampleDTO, user: User) {
    const currentSample = await this.prisma.sample.findUnique({
      where: { id }
    })

    if (!currentSample) throw new NotFoundException('Sample not found')

    await this.auth.assert({
      user,
      permission: 'UPDATE_SAMPLE',
      groupId: currentSample.groupId
    })

    try {
      return await this.prisma.$transaction(async tx => {
        const updatedSample = await tx.sample.update({
          where: { id },
          data: {
            name: data.name,
            type: data.type,
            originOrganism: data.originOrganism,
            sourceLab: data.sourceLab
          },
          select: sampleSelect
        })

        const fullUpdatedSample = await tx.sample.findUnique({ where: { id } })
        if (!fullUpdatedSample) throw new NotFoundException('Sample not found')

        await tx.auditLog.create({
          data: auditUpdate({
            entityType: 'SAMPLE',
            entityId: id,
            performedBy: user.id,
            previous: currentSample,
            current: fullUpdatedSample
          })
        })

        return updatedSample
      })
    } catch (error) {
      throw new InternalServerErrorException('Error updating sample')
    }
  }
}
