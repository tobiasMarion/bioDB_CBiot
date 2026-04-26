import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import type { Request } from 'express'
import { PrismaService } from '../common/prisma/prisma.service'
import * as jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-secret'

type JwtPayload = {
  sub: string
  email: string
  isAdmin: boolean
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    name: string
    email: string
    isAdmin: boolean
  }
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
      where: { externalAuthId: payload.sub },
      update: { email: payload.email },
      create: {
        externalAuthId: payload.sub,
        email: payload.email,
        name: payload.email,
        isAdmin: payload.isAdmin ?? false
      }
    })

    request.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: payload.isAdmin
    }

    return true
  }
}

export const Auth = () => UseGuards(AuthGuard)

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedRequest['user'] | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    if (!request.user) return null
    return data ? request.user[data] : request.user
  }
)
