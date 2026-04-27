import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateGroupDTO } from './dto/CreateGroup';
import { Prisma } from '../common/prisma/generated/client';

@Injectable()
export class GroupsService {
    constructor(private readonly prisma: PrismaService) {}
    
      async create(data: CreateGroupDTO, user: {id: string, isAdmin: boolean}) {
        if(!user.isAdmin){
            throw new ForbiddenException('User is not an admin')
        }
        try {
          return await this.prisma.group.create({
            data: {...data, createdBy: user.id}
          })
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            throw new ConflictException('User didnt follow orders')
          }
          throw error
        }
      }
}
