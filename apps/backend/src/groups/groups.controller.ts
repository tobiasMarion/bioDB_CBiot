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
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async sendExample(@Body() body: CreateGroupDTO, @CurrentUser() user: User) {
    return this.groupsService.create(body, user)
  }

  @Get('memberships')
  @Auth()
  @ApiOperation({ summary: 'Find all user\'s memberships and roles' })
  @ApiResponse({ status: 200, description: 'Authorized access' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMemberships(@CurrentUser() user: User ){
    return this.groupsService.findUserMemberships(user)
  }
}
