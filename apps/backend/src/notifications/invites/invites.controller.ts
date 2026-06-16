import { Controller, Get, Param, Post } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { Auth, CurrentUser } from '../../auth/authentication.guard'
import type { User } from '../../auth/types/user.type'
import { InvitesService } from './invites.service'

@ApiTags('Invites')
@Controller()
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Get('my/invites')
  @Auth()
  @ApiOperation({
    summary: 'List pending group invites for the logged-in user',
    description:
      'Returns all pending group membership invites addressed to the authenticated user. Only PENDING invites from non-archived groups are returned.'
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token.',
    schema: { example: { statusCode: 401, message: 'Missing Authorization header' } }
  })
  @ApiResponse({
    status: 200,
    description: 'Pending invites retrieved successfully. Returns an empty array if none exist.',
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
          group: { name: 'Genomics Lab' },
          sender: { name: 'Tobias Marion', email: 'tobias@example.com' }
        }
      ]
    }
  })
  async getMyInvites(@CurrentUser() user: User) {
    return this.invitesService.getMyInvites(user)
  }

  @Post('invites/:inviteId/accept')
  @Auth()
  @ApiOperation({
    summary: 'Accept a group invite',
    description:
      "Accepts a pending group membership invite. Creates or restores the user's membership in the group with the role specified in the invite. Only the invited user can accept their own invite."
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token.',
    schema: { example: { statusCode: 401, message: 'Missing Authorization header' } }
  })
  @ApiNotFoundResponse({
    description:
      'Invite not found, already archived, or does not belong to the authenticated user.',
    schema: { example: { statusCode: 404, message: 'Invite not found' } }
  })
  @ApiBadRequestResponse({
    description:
      'Invite is no longer pending (already accepted or rejected), or the target group is archived.',
    schema: {
      example: { statusCode: 400, message: 'Invite is no longer pending' }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Invite accepted successfully. The user is now a member of the group.',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440000',
        groupId: '550e8400-e29b-41d4-a716-446655440000',
        invitedUserId: '987e6543-e21b-34d5-c654-426614174000',
        invitedBy: '123e4567-e89b-12d3-a456-426614174000',
        role: 'RESEARCHER',
        status: 'ACCEPTED',
        createdAt: '2026-05-01T10:00:00.000Z'
      }
    }
  })
  async acceptInvite(@Param('inviteId') inviteId: string, @CurrentUser() user: User) {
    return this.invitesService.acceptInvite(inviteId, user)
  }

  @Post('invites/:inviteId/reject')
  @Auth()
  @ApiOperation({
    summary: 'Reject a group invite',
    description:
      'Rejects a pending group membership invite. The invite status is updated to REJECTED and no membership is created. Only the invited user can reject their own invite.'
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token.',
    schema: { example: { statusCode: 401, message: 'Missing Authorization header' } }
  })
  @ApiNotFoundResponse({
    description:
      'Invite not found, already archived, or does not belong to the authenticated user.',
    schema: { example: { statusCode: 404, message: 'Invite not found' } }
  })
  @ApiBadRequestResponse({
    description:
      'Invite is no longer pending (already accepted or rejected), or the target group is archived.',
    schema: {
      example: { statusCode: 400, message: 'Invite is no longer pending' }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Invite rejected successfully.',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440000',
        groupId: '550e8400-e29b-41d4-a716-446655440000',
        invitedUserId: '987e6543-e21b-34d5-c654-426614174000',
        invitedBy: '123e4567-e89b-12d3-a456-426614174000',
        role: 'RESEARCHER',
        status: 'REJECTED',
        createdAt: '2026-05-01T10:00:00.000Z'
      }
    }
  })
  async rejectInvite(@Param('inviteId') inviteId: string, @CurrentUser() user: User) {
    return this.invitesService.rejectInvite(inviteId, user)
  }
}
