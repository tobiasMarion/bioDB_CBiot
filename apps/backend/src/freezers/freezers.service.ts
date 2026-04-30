import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { AuthorizationService } from '../auth/authorization.service'
import type { User } from '../auth/types/user.type'
import { Prisma } from '../common/prisma/generated/client'
import { PrismaService } from '../common/prisma/prisma.service'
import { FreezerStatusDTO } from './dto/ArchiveFreezer'
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
        data: { ...data, createdBy: user.id }
      })

      await this.prisma.auditLog.create({
        data: {
          entityType: 'FREEZER',
          entityId: newFreezer.id,
          performedBy: user.id,
          action: 'CREATE',
          changes: newFreezer
        }
      })

      return newFreezer
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException('User didnt follow orders')
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
          locationDescription: true,
          createdBy: true
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch all freezers')
    }
  }

  async findFreezerById(id: string, user: User) {
    const freezerById = await this.prisma.freezer.findUnique({
      where: { id }
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

  async update(id: string, data: UpdateFreezerDTO, user: User) {
    await this.auth.assert({ user, permission: 'UPDATE_FREEZER' })

    try {
      const updatedFreezer = await this.prisma.freezer.update({
        where: { id },
        data: data
      })

      await this.prisma.auditLog.create({
        data: {
          entityType: 'FREEZER',
          entityId: updatedFreezer.id,
          performedBy: user.id,
          action: 'UPDATE',
          changes: updatedFreezer
        }
      })

      return updatedFreezer
    } catch (error) {
      throw new InternalServerErrorException('Failed to update freezer')
    }
  }

  async updateFreezerStatus(id: string, data: FreezerStatusDTO, user: User) {
    await this.auth.assert({ user, permission: 'UPDATE_FREEZER' })

    const freezerData = {
      isArchived: data.isArchived,
      archivedAt: data.isArchived ? new Date() : null
    }

    try {
      if (data.isArchived === true) {
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
      }

      const updatedFreezerStatus = await this.prisma.freezer.update({
        where: { id },
        data: freezerData
      })

      await this.prisma.auditLog.create({
        data: {
          entityType: 'FREEZER',
          entityId: updatedFreezerStatus.id,
          performedBy: user.id,
          action: 'UPDATE',
          changes: updatedFreezerStatus
        }
      })

      return updatedFreezerStatus
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException('Failed to update freezer')
    }
  }
}
