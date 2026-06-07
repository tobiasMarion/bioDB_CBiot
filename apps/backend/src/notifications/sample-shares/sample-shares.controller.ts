import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { Auth, CurrentUser } from '../../auth/authentication.guard'
import type { User } from '../../auth/types/user.type'
import { CreateShareRequestDto } from './dto/create-share-request.dto'
import { RespondShareRequestDto } from './dto/respond-share-request.dto'
import { SampleSharesService } from './sample-shares.service'

@ApiTags('Sample Shares')
@Controller()
export class SampleSharesController {
  constructor(private readonly sampleSharesService: SampleSharesService) {}

  @Get('samples/:sampleId/share-targets')
  @Auth()
  @ApiOperation({
    summary: 'List groups eligible to receive a share request for this sample',
    description: `Returns the active groups other than the sample's own group, for use when picking a target in the share dialog.

**Authorization:** only a MANAGER or LEADER of the group that owns the sample can list targets. Membership in the target group is **not** required to send a share request — only its leaders need to approve it.`
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token.',
    schema: { example: { statusCode: 401, message: 'Missing Authorization header' } }
  })
  @ApiForbiddenResponse({
    description: "The authenticated user is not a MANAGER or LEADER of the sample's group.",
    schema: { example: { statusCode: 403, message: 'Insufficient permissions' } }
  })
  @ApiNotFoundResponse({
    description: 'Sample not found (or archived).',
    schema: { example: { statusCode: 404, message: 'Sample not found' } }
  })
  @ApiResponse({
    status: 200,
    description: 'List of groups eligible as share targets.',
    schema: {
      example: [{ id: '550e8400-e29b-41d4-a716-446655440001', name: 'Microbiology Lab' }]
    }
  })
  async getShareTargets(@Param('sampleId') sampleId: string, @CurrentUser() user: User) {
    return this.sampleSharesService.getShareTargets(sampleId, user)
  }

  @Post('samples/:sampleId/share-requests')
  @Auth()
  @ApiOperation({
    summary: 'Request to share a sample with another group',
    description: `Creates a pending share request that notifies all leaders of the target group.

**Authorization:** only a MANAGER or LEADER of the group that owns the sample can initiate this request.

**Business rules:**
- The target group must be different from the sample's own group
- Only one PENDING request can exist per sample + target group pair. If a previous request was accepted or rejected it can be re-sent.
- On creation, a notification is pushed to all LEADER members of the target group via \`GET /notifications/me\`.`
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token.',
    schema: { example: { statusCode: 401, message: 'Missing Authorization header' } }
  })
  @ApiForbiddenResponse({
    description: "The authenticated user is not a MANAGER or LEADER of the sample's group.",
    schema: { example: { statusCode: 403, message: 'Insufficient permissions' } }
  })
  @ApiNotFoundResponse({
    description: 'Sample or target group not found (or archived).',
    schema: { example: { statusCode: 404, message: 'Sample not found' } }
  })
  @ApiBadRequestResponse({
    description: "Target group is the same as the sample's own group.",
    schema: { example: { statusCode: 400, message: 'Cannot share a sample with its own group' } }
  })
  @ApiConflictResponse({
    description: 'A PENDING share request already exists for this sample and target group.',
    schema: {
      example: {
        statusCode: 409,
        message: 'A pending share request already exists for this sample and group'
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Share request created successfully. Target group leaders are notified.',
    schema: {
      example: {
        id: '771f9511-f3ac-52e5-b827-557766551111',
        sampleId: 'aabbccdd-1234-5678-abcd-ef1234567890',
        targetGroupId: '550e8400-e29b-41d4-a716-446655440001',
        permission: 'VIEW',
        requestedBy: 'u12345678-1234-1234-1234-123456789012',
        status: 'PENDING',
        respondedAt: null,
        createdAt: '2026-06-05T10:00:00.000Z',
        isArchived: false,
        archivedAt: null,
        sample: { name: 'RNA-seq Extract #42' },
        group: { name: 'Microbiology Lab' }
      }
    }
  })
  async createShareRequest(
    @Param('sampleId') sampleId: string,
    @Body() dto: CreateShareRequestDto,
    @CurrentUser() user: User
  ) {
    return this.sampleSharesService.createShareRequest(sampleId, dto, user)
  }

  @Patch('share-requests/:requestId/respond')
  @Auth()
  @ApiOperation({
    summary: 'Accept or reject a sample share request',
    description: `Allows a LEADER of the target group to accept or reject a pending share request.

**Authorization:** only a LEADER of the target group specified in the request can respond.

**Business rules:**
- Only PENDING requests can be responded to.
- On **accept**: a \`SampleShare\` record is created (or restored), granting all members of the target group access to the sample with the specified permission level. The share request notification disappears for all leaders of the target group.
- On **reject**: no share is created. The notification disappears for all leaders of the target group. The originating group may re-send the request in the future.`
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token.',
    schema: { example: { statusCode: 401, message: 'Missing Authorization header' } }
  })
  @ApiForbiddenResponse({
    description: 'The authenticated user is not a LEADER of the target group.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Only a leader of the target group can respond to this request'
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Share request not found or already archived.',
    schema: { example: { statusCode: 404, message: 'Share request not found' } }
  })
  @ApiBadRequestResponse({
    description: 'Share request is no longer pending, or the sample/group is archived.',
    schema: { example: { statusCode: 400, message: 'Share request is no longer pending' } }
  })
  @ApiResponse({
    status: 200,
    description: 'Share request responded to successfully.',
    schema: {
      example: {
        id: '771f9511-f3ac-52e5-b827-557766551111',
        sampleId: 'aabbccdd-1234-5678-abcd-ef1234567890',
        targetGroupId: '550e8400-e29b-41d4-a716-446655440001',
        permission: 'VIEW',
        requestedBy: 'u12345678-1234-1234-1234-123456789012',
        status: 'ACCEPTED',
        respondedAt: '2026-06-05T14:30:00.000Z',
        createdAt: '2026-06-05T10:00:00.000Z',
        isArchived: false,
        archivedAt: null,
        sample: { name: 'RNA-seq Extract #42' },
        group: { name: 'Microbiology Lab' }
      }
    }
  })
  async respondToShareRequest(
    @Param('requestId') requestId: string,
    @Body() dto: RespondShareRequestDto,
    @CurrentUser() user: User
  ) {
    return this.sampleSharesService.respondToShareRequest(requestId, dto.action, user)
  }
}
