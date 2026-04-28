import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateFreezerDTO } from './dto/CreateFreezer';
import { Prisma, User } from '../common/prisma/generated/client';

@Injectable()
export class FreezersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateFreezerDTO, user: User){
    if (!user.isAdmin) {
      throw new ForbiddenException('User is not an admin')
    }
    try{
      const newFreezer = await this.prisma.freezer.create({
        data: {...data, createdBy: user.id}
      })

      this.prisma.auditLog.create({
        data: {
          entityType: 'GROUP',
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
}
