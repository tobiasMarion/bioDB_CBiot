import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
  UseGuards,
  createParamDecorator
} from '@nestjs/common'
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

    const authHeader = request.headers.authorization
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header')
    }

    const [, token] = authHeader.split(' ')
    if (!token) {
      throw new UnauthorizedException('Missing token')
    }

    let payload: JwtPayload
    try {
      payload = jwt.verify(token, SECRET) as JwtPayload
    } catch {
      throw new UnauthorizedException('Invalid token')
    }

    const user = await this.prisma.user.upsert({
      where: { externalAuthId: payload.id },
      update: { email: payload.email },
      create: {
        externalAuthId: payload.id,
        email: payload.email,
        name: payload.email,
        isAdmin: payload.isAdmin ?? false
      }
    })

    request.user = user

    return true
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
