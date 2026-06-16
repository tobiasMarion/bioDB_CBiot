import { createHash } from 'node:crypto'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import * as jwt from 'jsonwebtoken'
import { LoginDto } from './dto/login.dto'

// Proof-of-concept auth: replaces the external portal that issues JWTs.
// Ported from apps/auth-mock — the id is a deterministic SHA256 of the email
// (matching the AuthGuard's externalAuthId lookup and the seed's AUTH_IDS).
const SECRET = process.env.JWT_SECRET || 'dev-secret'

type TokenPayload = {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

const mockUsers: Record<string, { name: string; isAdmin: boolean }> = {
  'admin@example.com': { name: 'Administrador Exemplo', isAdmin: true },
  'tobias@example.com': { name: 'Tobias Cadoná Marion', isAdmin: false },
  'felipe@example.com': { name: 'Felipe', isAdmin: false },
  'joao@example.com': { name: 'João', isAdmin: false },
  'rafael@example.com': { name: 'Rafael', isAdmin: false },
  'pietro@example.com': { name: 'Pietro', isAdmin: false },
  'jonas@example.com': { name: 'Jonas Martelo', isAdmin: false }
}

function generateUserId(email: string) {
  return createHash('sha256').update(`${email}`).digest('hex')
}

function getUserFromEmail(email: string): Omit<TokenPayload, 'id'> {
  const normalizedEmail = email.toLowerCase().trim()
  const mockUser = mockUsers[normalizedEmail]

  if (mockUser) {
    return { name: mockUser.name, email, isAdmin: mockUser.isAdmin }
  }

  return { name: email.split('@')[0], email, isAdmin: false }
}

@ApiTags('Auth')
@Controller('auth')
export class AuthMockController {
  @Post('login')
  @ApiOperation({
    summary: 'Mock login — issues a JWT (proof of concept, replaces external auth)'
  })
  @ApiResponse({
    status: 200,
    description: 'JWT and user profile',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '258d8dc916db8cea2cafb6c3cd0cb0246efe061421dbd83ec3a350428cabda4f',
          name: 'Administrador Exemplo',
          email: 'admin@example.com',
          isAdmin: true
        }
      }
    }
  })
  login(@Body() { email }: LoginDto) {
    const user: TokenPayload = {
      id: generateUserId(email),
      ...getUserFromEmail(email)
    }

    const token = jwt.sign(user, SECRET, { expiresIn: '12h' })

    return { token, user }
  }
}
