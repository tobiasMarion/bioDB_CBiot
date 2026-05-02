import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { Auth, CurrentUser } from './authentication.guard'
import type { User } from './types/user.type'

@ApiTags('Users')
@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @Auth()
  @ApiOperation({ summary: `Get authenticated user's profile` })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john.doe@test.com',
        isAdmin: false
      }
    }
  })
  async me(@CurrentUser() { id, name, email, isAdmin }: User) {
    return { id, name, email, isAdmin }
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List all system users' })
  @ApiResponse({
    status: 200,
    description: 'List of all registered users',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Doe',
          email: 'john.doe@test.com',
          isAdmin: false
        },
        {
          id: '987e6543-e21b-34d5-c654-426614174000',
          name: 'Jane Smith',
          email: 'jane.smith@test.com',
          isAdmin: true
        }
      ]
    }
  })
  getUsers(@CurrentUser() _: User) {
    return this.authService.findAllUsers()
  }
}
