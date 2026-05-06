import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
  UseGuards,
  createParamDecorator
} from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import type { Request } from 'express'
import * as jwt from 'jsonwebtoken'
import { PrismaService } from '../common/prisma/prisma.service'
import type { User } from './types/user.type'

const SECRET = process.env.JWT_SECRET || 'dev-secret'

type JwtPayload = {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

export interface AuthenticatedRequest extends Request {
  user?: User
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    request.user = await this.resolveUser(this.extractToken(request))
    return true
  }

  private extractToken(request: AuthenticatedRequest): string {
    const authHeader = request.headers.authorization
    if (!authHeader) throw new UnauthorizedException('Missing Authorization header')

    const [, token] = authHeader.split(' ')
    if (!token) throw new UnauthorizedException('Missing token')

    return token
  }

  private verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, SECRET) as JwtPayload
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }

  private async resolveUser(token: string): Promise<User> {
    const payload = this.verifyToken(token)

    try {
      return await this.prisma.user.upsert({
        where: { externalAuthId: payload.id },
        update: {
          email: payload.email,
          name: payload.name,
          isAdmin: payload.isAdmin
        },
        create: {
          externalAuthId: payload.id,
          email: payload.email,
          name: payload.name,
          isAdmin: payload.isAdmin ?? false
        }
      })
    } catch (err) {
      return this.handleUpsertError(err, payload.id)
    }
  }

  private async handleUpsertError(err: unknown, externalAuthId: string): Promise<User> {
    const isUniqueConstraintViolation =
      err instanceof PrismaClientKnownRequestError && err.code === 'P2002'

    if (!isUniqueConstraintViolation) throw err

    const user = await this.prisma.user.findUnique({ where: { externalAuthId } })
    if (!user) throw new UnauthorizedException('User not found after conflict')

    return user
  }
}

export const Auth = () => UseGuards(AuthGuard)

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    if (!request.user) return null
    return data ? request.user[data] : request.user
  }
)
