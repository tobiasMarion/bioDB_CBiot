import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/authentication.guard'
import type { User } from '../auth/types/user.type'
import { NotificationsService } from './notifications.service'

@ApiTags('Notifications')
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('notifications/me')
  @Auth()
  @ApiOperation({
    summary: 'List all pending notifications',
    description: `Returns a unified list of all actionable notifications relevant to the authenticated user, sorted by creation date (newest first).

**Notification types returned:**
- \`GROUP_INVITE\` — pending group membership invitations sent to this user
- \`SAMPLE_SHARE_REQUEST\` — pending sample share requests targeting groups where this user is a LEADER
- \`TUBE_EXPIRATION\` — active expiration alerts for tubes where this user is a designated recipient (group leader, admin, or tube creator)

Each notification includes a \`type\` discriminator field so the client can render the appropriate UI.`
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token.',
    schema: {
      example: { statusCode: 401, message: 'Missing Authorization header' }
    }
  })
  @ApiResponse({
    status: 200,
    description:
      'Notifications retrieved successfully. Array may be empty if there are no pending notifications.',
    schema: {
      example: [
        {
          type: 'GROUP_INVITE',
          id: '660e8400-e29b-41d4-a716-446655440000',
          groupId: '550e8400-e29b-41d4-a716-446655440000',
          groupName: 'Genomics Lab',
          role: 'RESEARCHER',
          senderName: 'Tobias Marion',
          createdAt: '2026-06-01T10:00:00.000Z'
        },
        {
          type: 'SAMPLE_SHARE_REQUEST',
          id: '771f9511-f3ac-52e5-b827-557766551111',
          sampleId: 'aabbccdd-1234-5678-abcd-ef1234567890',
          sampleName: 'RNA-seq Extract #42',
          permission: 'VIEW',
          offeringGroupId: '550e8400-e29b-41d4-a716-446655440000',
          offeringGroupName: 'Genomics Lab',
          offeredByName: 'Tobias Marion',
          createdAt: '2026-06-02T14:30:00.000Z'
        },
        {
          type: 'TUBE_EXPIRATION',
          id: '882a0622-a4bd-63f6-c938-668877662222',
          tubeId: 'ccddee00-2345-6789-bcde-f01234567891',
          sampleId: 'aabbccdd-1234-5678-abcd-ef1234567890',
          sampleName: 'RNA-seq Extract #42',
          groupId: '550e8400-e29b-41d4-a716-446655440000',
          expirationDate: '2026-06-10T00:00:00.000Z',
          createdAt: '2026-06-03T07:00:00.000Z'
        }
      ]
    }
  })
  async getMyNotifications(@CurrentUser() user: User) {
    return this.notificationsService.getMyNotifications(user)
  }
}
