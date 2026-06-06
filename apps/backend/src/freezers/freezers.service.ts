import {
  BadRequestException,
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
import { CreateFreezerDTO } from './dto/CreateFreezer'
import { UpdateFreezerDTO } from './dto/UpdateFreezer'

@Injectable()
export class FreezersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthorizationService
  ) {}

  async create(data: CreateFreezerDTO, user: User) {
    await this.auth.assert({ user, permission: 'CREATE_FREEZER' })

    try {
      const newFreezer = await this.prisma.freezer.create({
        data: { ...data, createdBy: user.id },
        include: { room: true }   // ← add this
      })

      await this.prisma.auditLog.create({
        data: auditCreate({
          entityType: 'FREEZER',
          entityId: newFreezer.id,
          performedBy: user.id,
          current: newFreezer
        })
      })

      return newFreezer
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException('Room not found')
        }
        throw new ConflictException('Failed to create freezer')
      }
      throw error
    }
  }

  async findAllFreezers(user: User) {
    try {
      return await this.prisma.freezer.findMany({
        where: {
          isArchived: false
        },
        select: {
          id: true,
          name: true,
          roomId: true,
          createdBy: true,
          room: true
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch all freezers')
    }
  }

  async findFreezerById(id: string, user: User) {
    const freezerById = await this.prisma.freezer.findUnique({
      where: { id },
      include: { room: true }
    })

    if (!freezerById) {
      throw new NotFoundException('Freezer not found')
    }

    return freezerById
  }

  async findTubesFreezer(id: string, user: User) {
    await this.auth.assert({ user, permission: 'VIEW_ALL_SAMPLES' })

    try {
      return await this.prisma.tube.findMany({
        where: {
          isArchived: false,
          box: { freezerId: id }
        },
        select: {
          id: true,
          sampleId: true,
          createdBy: true,
          expirationDate: true,
          boxId: true,
          row: true,
          column: true
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch tubes from freezer')
    }
  }

  async findAllWithBoxes(groupId: string, user: User) {
    await this.auth.assert({ user, permission: 'VIEW_GROUP', groupId })

    return this.prisma.freezer.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        name: true,
        room: true,
        boxes: {
          where: { isArchived: false },
          select: { id: true, label: true },
          orderBy: { label: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })
  }

  async getBoxOccupancy(boxId: string, excludeSampleId?: string) {
    const tubes = await this.prisma.tube.findMany({
      where: {
        boxId,
        isArchived: false,
        checkedOutAt: null,
        ...(excludeSampleId ? { sampleId: { not: excludeSampleId } } : {})
      },
      select: { row: true, column: true }
    })

    return tubes
      .filter(t => t.row !== null && t.column !== null)
      .map(t => ({ row: t.row as number, col: t.column as number }))
  }

  async update(id: string, data: UpdateFreezerDTO, user: User) {
    await this.auth.assert({ user, permission: 'UPDATE_FREEZER' })

    const previous = await this.prisma.freezer.findUnique({ where: { id } })
    if (!previous) throw new NotFoundException('Freezer not found')

    try {
      const updatedFreezer = await this.prisma.freezer.update({
        where: { id },
        data: data,
        include: { room: true }
      })

      await this.prisma.auditLog.create({
        data: auditUpdate({
          entityType: 'FREEZER',
          entityId: id,
          performedBy: user.id,
          previous,
          current: updatedFreezer
        })
      })

      return updatedFreezer
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new NotFoundException('Room not found')
      }
      throw new InternalServerErrorException('Failed to update freezer')
    }
  }

  async archive(id: string, user: User) {
    await this.auth.assert({ user, permission: 'UPDATE_FREEZER' })

    const previous = await this.prisma.freezer.findUnique({ where: { id } })
    if (!previous) throw new NotFoundException('Freezer not found')

    try {
      const hasActiveTubes = await this.prisma.tube.findFirst({
        where: {
          isArchived: false,
          box: {
            freezerId: id
          }
        }
      })
      if (hasActiveTubes) {
        throw new BadRequestException('Cannot archive freezer because it contains active tubes')
      }

      const archivedFreezer = await this.prisma.freezer.update({
        where: { id },
        data: {
          isArchived: true,
          archivedAt: new Date()
        }
      })

      if (!previous.isArchived) {
        await this.prisma.auditLog.create({
          data: auditDelete({
            entityType: 'FREEZER',
            entityId: id,
            performedBy: user.id,
            previous
          })
        })
      }

      return archivedFreezer
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException('Failed to archive freezer')
    }
  }
}
