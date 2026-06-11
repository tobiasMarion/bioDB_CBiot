import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { auditCreate, auditDelete, auditUpdate } from '../auth/audit.utils'
import { AuthorizationService } from '../auth/authorization.service'
import type { User } from '../auth/types/user.type'
import { Prisma } from '../common/prisma/generated/client'
import { PrismaService } from '../common/prisma/prisma.service'
import { CreateBoxDTO } from './dto/CreateBox';
import { UpdateBoxDTO } from './dto/UpdateBox';

@Injectable()
export class BoxesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthorizationService
  ) {}

  async create(freezerId: string, data: CreateBoxDTO, user: User) {
    await this.auth.assert({
      user,
      permission: 'CREATE_BOX',
      groupId: data.groupId ?? ''
    })

    try {
      const newBox = await this.prisma.box.create({
        data: {
          freezerId,
          label: data.label,
          createdBy: user.id
        }
      })

      await this.prisma.auditLog.create({
        data: auditCreate({
          entityType: 'BOX',
          entityId: newBox.id,
          performedBy: user.id,
          current: newBox
        })
      })

      return newBox
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A box with this label already exists in this freezer')
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Freezer not found')
        }
      }
      throw new InternalServerErrorException('Error creating box')
    }

  }

  async findByFreezer(freezerId: string) {
    return this.prisma.box.findMany({
      where: {
        freezerId,
        isArchived: false
      },
      select: {
        id: true,
        label: true,
        _count: {
          select: { tubes: true }
        }
      },
      orderBy: { label: 'asc' }
    })
  }

  async update(id: string, dto: UpdateBoxDTO, user: User) {
    await this.auth.assert({
      user,
      permission: 'MANAGE_STORAGE',
      groupId: dto.groupId ?? ''
    })

    const previous = await this.prisma.box.findUnique({ where: { id } })
    if (!previous) throw new NotFoundException('Box not found')

    try {
      const updated = await this.prisma.box.update({
        where: { id },
        data: { label: dto.label }
      })

      await this.prisma.auditLog.create({
        data: auditUpdate({
          entityType: 'BOX',
          entityId: id,
          performedBy: user.id,
          previous,
          current: updated
        })
      })

      return updated
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('A box with this label already exists in this freezer')
      }
      throw new InternalServerErrorException('Failed to update box')
    }
  }

  async archive(id: string, groupId: string, user: User) {
    await this.auth.assert({
      user,
      permission: 'MANAGE_STORAGE',
      groupId
    })

    const previous = await this.prisma.box.findUnique({ where: { id } })
    if (!previous) throw new NotFoundException('Box not found')

    try {
      const hasActiveTubes = await this.prisma.tube.findFirst({
        where: {
          isArchived: false,
          boxId: id
        }
      })
      if (hasActiveTubes) {
        throw new BadRequestException('Cannot archive box because it contains active tubes')
      }

      const archived = await this.prisma.box.update({
        where: { id },
        data: {
          isArchived: true,
          archivedAt: new Date()
        }
      })

      if (!previous.isArchived) {
        await this.prisma.auditLog.create({
          data: auditDelete({
            entityType: 'BOX',
            entityId: id,
            performedBy: user.id,
            previous
          })
        })
      }

      return archived
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      throw new InternalServerErrorException('Failed to archive box')
    }
  }
}
