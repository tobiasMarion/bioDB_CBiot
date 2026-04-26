import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import type { Request } from 'express'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
  }
}

@Injectable()
class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()

    const authHeader = request.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header')
    }

    const [, token] = authHeader.split(' ')

    if (!token) {
      throw new UnauthorizedException('Missing token')
    }

    const isValid = this.validateTokenWithMockService(token)

    if (!isValid) {
      throw new UnauthorizedException('Invalid token')
    }

    request.user = {
      id: 'mock-user-id'
    }

    return true
  }

  private validateTokenWithMockService(token: string): boolean {
    return true
  }
}

export const Auth = () => UseGuards(AuthGuard)
