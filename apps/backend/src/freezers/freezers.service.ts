import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import { CreateFreezerDTO } from './dto/CreateFreezer'
import { Prisma, User } from '../common/prisma/generated/client'
import { UpdateFreezerDTO } from './dto/UpdateFreezer'
import { FreezerStatusDTO } from './dto/ArchiveFreezer'

@Injectable()
export class FreezersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateFreezerDTO, user: User) {
    if (!user.isAdmin) {
      throw new ForbiddenException('User is not an admin')
    }
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

  async findAllFreezers() {
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

  async findFreezerById(id: string) {
    const freezerById = await this.prisma.freezer.findUnique({
      where: { id }
    })

    if (!freezerById) {
      throw new NotFoundException('Freezer not found')
    }

    return freezerById
  }

  async findTubesFreezer(id: string) {
    try {
      return this.prisma.tube.findMany({
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
    if (!user.isAdmin) {
      throw new ForbiddenException('User is not an admin')
    }
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
    if (!user.isAdmin) {
      throw new ForbiddenException('User is not an admin')
    }
    const freezerData = {
      isArchived: data.isArchived,
      archivedAt: data.isArchived ? new Date() : null
    }

    try {
      if (data.isArchived === true) {
        // Verifica se existe pelo menos UM tubo ativo neste freezer
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
      throw new InternalServerErrorException('Failed to update freezer')
    }
  }
}
