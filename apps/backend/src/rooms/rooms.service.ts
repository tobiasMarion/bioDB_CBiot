import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AuthorizationService } from '../auth/authorization.service';
import { Prisma } from '../common/prisma/generated/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoomDTO } from './dto/CreateRoom';
import { UpdateRoomDTO } from './dto/UpdateRoom';
import { User } from '../common/prisma/generated/client';
import { auditCreate, auditDelete, auditUpdate } from '../auth/audit.utils'

@Injectable()
export class RoomsService {
  constructor(
      private readonly prisma: PrismaService,
      private readonly auth: AuthorizationService
    ) {}

  async create(data: CreateRoomDTO, user: User) {
    await this.auth.assert({
      user,
      permission: 'CREATE_ROOM'
    })

    try {
          const newRoom = await this.prisma.room.create({
            data: {
              number: data.number,
              building: data.building,
              floor: data.floor,
              createdBy: user.id
          }})
    
            await this.prisma.auditLog.create({
              data: auditCreate({
                entityType: 'ROOM',
                entityId: newRoom.id,
                performedBy: user.id,
                current: { number: data.number, building: data.building, floor: data.floor }
              })
            })
    
            return newRoom
          
        } catch (error) {
          throw new InternalServerErrorException('Error creating room')
        }
  }

  async findAll(user: User) {
    try {
      return await this.prisma.room.findMany({
        where: { isArchived: false },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch all rooms')
    }
  }

  async findRoomById(id: string, user: User) {
    const room = await this.prisma.room.findUnique({ where: { id } })
    if (!room) throw new NotFoundException('Room not found')
    return room
  }

  async update(id: string, data: UpdateRoomDTO, user: User) {
    await this.auth.assert({ user, permission: 'UPDATE_ROOM' })

    const previous = await this.prisma.room.findUnique({ where: { id } })
    if (!previous) throw new NotFoundException('Room not found')

    try {
      const updatedRoom = await this.prisma.room.update({
        where: { id },
        data
      })

      await this.prisma.auditLog.create({
        data: auditUpdate({
          entityType: 'ROOM',
          entityId: id,
          performedBy: user.id,
          previous,
          current: updatedRoom
        })
      })

      return updatedRoom
    } catch (error) {
      throw new InternalServerErrorException('Failed to update room')
    }
  }

  async archive(id: string, user: User) {
    await this.auth.assert({ user, permission: 'UPDATE_ROOM' })

    const previous = await this.prisma.room.findUnique({ where: { id } })
    if (!previous) throw new NotFoundException('Room not found')

    try {
      const archivedRoom = await this.prisma.room.update({
        where: { id },
        data: {
          isArchived: true,
          archivedAt: new Date()
        }
      })

      if (!previous.isArchived) {
        await this.prisma.auditLog.create({
          data: auditDelete({
            entityType: 'ROOM',
            entityId: id,
            performedBy: user.id,
            previous
          })
        })
      }

      return archivedRoom
    } catch (error) {
      throw new InternalServerErrorException('Failed to archive room')
    }
  }
}
