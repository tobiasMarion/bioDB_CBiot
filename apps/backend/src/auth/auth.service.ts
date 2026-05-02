import { Injectable } from '@nestjs/common'
import { PrismaService } from '../common/prisma/prisma.service'
import { AuthorizationService } from './authorization.service'
import type { User } from './types/user.type'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthorizationService
  ) {}

  async findAllUsers() {
    return await this.prisma.user.findMany({
      where: { isArchived: false },
      select: { id: true, name: true, email: true, isAdmin: true }
    })
  }
}
