import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/auth.guard'
import { GroupsService } from './groups.service'
import { CreateGroupDTO } from './dto/CreateGroup'
import type { User } from '../auth/types/user.type'

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post('new')
  @Auth()
  @ApiOperation({ summary: 'Create new group' })
  @ApiBody({ type: CreateGroupDTO })
  @ApiResponse({
    status: 201,
    description: 'Created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Administradores',
        createdBy: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2026-04-27T10:00:00.000Z',
        isArchived: false,
        archivedAt: null
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async sendGroup(@Body() body: CreateGroupDTO, @CurrentUser() user: User) {
    return this.groupsService.create(body, user)
  }

  @Get('memberships')
  @Auth()
  @ApiOperation({ summary: "Find all user's memberships and roles" })
  @ApiResponse({
    status: 200,
    description: 'Authorized access',
    schema: {
      example: [
        {
          id: 'clq123abc0001xyz',
          groupId: 'clq456def0002xyz',
          role: 'ADMIN',
          joinedAt: '2026-04-25T10:00:00.000Z',
          group: {
            name: 'Desenvolvedores Frontend'
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMemberships(@CurrentUser() user: User) {
    return this.groupsService.findUserMemberships(user)
  }
}
