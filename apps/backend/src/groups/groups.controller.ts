import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/authentication.guard'
import type { User } from '../auth/types/user.type'
import { CreateGroupDTO } from './dto/CreateGroup'
import { SendInviteDTO } from './dto/SendInvite'
import { UpdateMemberRoleDTO } from './dto/UpdateMemberRole'
import { GroupsService } from './groups.service'

@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create new group' })
  @ApiBody({ type: CreateGroupDTO })
  @ApiResponse({
    status: 201,
    description: 'Created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'My New Group',
        createdBy: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2026-05-01T10:00:00.000Z',
        isArchived: false,
        archivedAt: null
      }
    }
  })
  async createGroup(@Body() body: CreateGroupDTO, @CurrentUser() user: User) {
    return this.groupsService.create(body, user)
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List all groups' })
  @ApiResponse({
    status: 200,
    description: 'List of groups',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'My New Group',
          createdBy: '123e4567-e89b-12d3-a456-426614174000',
          createdAt: '2026-05-01T10:00:00.000Z',
          isArchived: false,
          archivedAt: null,
          role: 'LEADER',
          _count: {
            memberships: 5
          }
        }
      ]
    }
  })
  async getGroups(@CurrentUser() user: User) {
    return this.groupsService.findAll(user)
  }

  @Get('memberships')
  @Auth()
  @ApiOperation({ summary: "Find all user's memberships and roles" })
  @ApiResponse({
    status: 200,
    description: 'Get visible groups',
    schema: {
      example: [
        {
          id: '990e8400-e29b-41d4-a716-446655440000',
          groupId: '550e8400-e29b-41d4-a716-446655440000',
          role: 'LEADER',
          joinedAt: '2026-05-01T10:00:00.000Z',
          group: {
            name: 'Desenvolvedores'
          }
        }
      ]
    }
  })
  async getMemberships(@CurrentUser() user: User) {
    return this.groupsService.findUserMemberships(user)
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get group details' })
  @ApiResponse({
    status: 200,
    description: 'Group details',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'My New Group',
        createdBy: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2026-05-01T10:00:00.000Z',
        isArchived: false,
        archivedAt: null,
        memberships: [
          {
            id: '990e8400-e29b-41d4-a716-446655440000',
            userId: '123e4567-e89b-12d3-a456-426614174000',
            groupId: '550e8400-e29b-41d4-a716-446655440000',
            role: 'LEADER',
            joinedAt: '2026-05-01T10:00:00.000Z',
            isArchived: false,
            archivedAt: null,
            user: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Admin Name',
              email: 'admin@test.com'
            }
          }
        ]
      }
    }
  })
  async getGroup(@Param('id') id: string, @CurrentUser() user: User) {
    return this.groupsService.findById(id, user)
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Archive group' })
  @ApiResponse({
    status: 200,
    description: 'Group archived',
    schema: {
      example: { success: true }
    }
  })
  async archiveGroup(@Param('id') id: string, @CurrentUser() user: User) {
    return this.groupsService.archive(id, user)
  }

  @Get(':id/members')
  @Auth()
  @ApiOperation({ summary: 'List group members' })
  @ApiResponse({
    status: 200,
    description: 'List of members',
    schema: {
      example: [
        {
          id: '990e8400-e29b-41d4-a716-446655440000',
          userId: '123e4567-e89b-12d3-a456-426614174000',
          groupId: '550e8400-e29b-41d4-a716-446655440000',
          role: 'LEADER',
          joinedAt: '2026-05-01T10:00:00.000Z',
          isArchived: false,
          archivedAt: null,
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Admin Name',
            email: 'admin@test.com'
          }
        }
      ]
    }
  })
  async getMembers(@Param('id') id: string, @CurrentUser() user: User) {
    return this.groupsService.getMembers(id, user)
  }

  @Patch(':id/members/:userId')
  @Auth()
  @ApiOperation({ summary: 'Change member role' })
  @ApiBody({ type: UpdateMemberRoleDTO })
  @ApiResponse({
    status: 200,
    description: 'Member role updated',
    schema: {
      example: {
        id: '990e8400-e29b-41d4-a716-446655440000',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        groupId: '550e8400-e29b-41d4-a716-446655440000',
        role: 'MANAGER',
        joinedAt: '2026-05-01T10:00:00.000Z',
        isArchived: false,
        archivedAt: null
      }
    }
  })
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() body: UpdateMemberRoleDTO,
    @CurrentUser() currentUser: User
  ) {
    return this.groupsService.updateMemberRole(id, userId, body, currentUser)
  }

  @Delete(':id/members/:userId')
  @Auth()
  @ApiOperation({ summary: 'Remove member from group' })
  @ApiResponse({
    status: 200,
    description: 'Member removed',
    schema: {
      example: { success: true }
    }
  })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() currentUser: User
  ) {
    return this.groupsService.removeMember(id, userId, currentUser)
  }

  @Post(':id/invites')
  @Auth()
  @ApiOperation({ summary: 'Send an invite to a user' })
  @ApiBody({ type: SendInviteDTO })
  @ApiResponse({
    status: 201,
    description: 'Invite sent',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440000',
        groupId: '550e8400-e29b-41d4-a716-446655440000',
        invitedUserId: '987e6543-e21b-34d5-c654-426614174000',
        invitedBy: '123e4567-e89b-12d3-a456-426614174000',
        role: 'RESEARCHER',
        status: 'PENDING',
        createdAt: '2026-05-01T10:00:00.000Z',
        isArchived: false,
        archivedAt: null
      }
    }
  })
  async sendInvite(
    @Param('id') id: string,
    @Body() body: SendInviteDTO,
    @CurrentUser() currentUser: User
  ) {
    return this.groupsService.sendInvite(id, body, currentUser)
  }
}
