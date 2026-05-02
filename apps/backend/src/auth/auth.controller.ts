import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth, CurrentUser } from './authentication.guard'
import { AuthService } from './auth.service'
import type { User } from './types/user.type'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
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
          email: 'john.doe@test.com'
        },
        {
          id: '987e6543-e21b-34d5-c654-426614174000',
          name: 'Jane Smith',
          email: 'jane.smith@test.com'
        }
      ]
    }
  })
  getUsers(@CurrentUser() _: User) {
    return this.authService.findAllUsers()
  }
}
