import { Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth, CurrentUser } from '../../auth/authentication.guard'
import type { User } from '../../auth/types/user.type'
import { InvitesService } from './invites.service'

@ApiTags('Invites')
@Controller()
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Get('my/invites')
  @Auth()
  @ApiOperation({ summary: 'List pending invites for the logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'List of pending invites',
    schema: {
      example: [
        {
          id: '660e8400-e29b-41d4-a716-446655440000',
          groupId: '550e8400-e29b-41d4-a716-446655440000',
          invitedUserId: '987e6543-e21b-34d5-c654-426614174000',
          invitedBy: '123e4567-e89b-12d3-a456-426614174000',
          role: 'RESEARCHER',
          status: 'PENDING',
          createdAt: '2026-05-01T10:00:00.000Z',
          isArchived: false,
          archivedAt: null,
          group: {
            name: 'My New Group'
          },
          sender: {
            name: 'Admin Name',
            email: 'admin@test.com'
          }
        }
      ]
    }
  })
  async getMyInvites(@CurrentUser() user: User) {
    return this.invitesService.getMyInvites(user)
  }

  @Post('invites/:inviteId/accept')
  @Auth()
  @ApiOperation({ summary: 'Accept a group invite' })
  @ApiResponse({
    status: 200,
    description: 'Invite accepted',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440000',
        status: 'ACCEPTED'
      }
    }
  })
  async acceptInvite(@Param('inviteId') inviteId: string, @CurrentUser() user: User) {
    return this.invitesService.acceptInvite(inviteId, user)
  }

  @Post('invites/:inviteId/reject')
  @Auth()
  @ApiOperation({ summary: 'Reject a group invite' })
  @ApiResponse({
    status: 200,
    description: 'Invite rejected',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440000',
        status: 'REJECTED'
      }
    }
  })
  async rejectInvite(@Param('inviteId') inviteId: string, @CurrentUser() user: User) {
    return this.invitesService.rejectInvite(inviteId, user)
  }
}
