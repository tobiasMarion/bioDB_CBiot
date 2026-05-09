import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/authentication.guard'
import type { User } from '../auth/types/user.type'
import { CreateSampleDTO } from './dto/CreateSample'
import { UpdateSampleDTO } from './dto/UpdateSample'
import { SamplesService } from './samples.service'

@ApiTags('Samples')
@Controller()
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  @Post('groups/:groupId/samples')
  @Auth()
  @ApiOperation({
    summary: 'Create a new sample',
    description: 'Creates a new sample in the specified group. Requires RESEARCHER role or higher.'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Requires RESEARCHER role or higher in the group.'
  })
  @ApiNotFoundResponse({ description: 'Group not found' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiResponse({
    status: 201,
    description: 'Sample created successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Sample 001',
        type: 'DNA',
        originOrganism: 'Homo sapiens',
        sourceLab: 'Lab A',
        groupId: 'g12345678-1234-1234-1234-123456789012',
        createdBy: 'u12345678-1234-1234-1234-123456789012',
        createdAt: '2026-05-07T12:00:00.000Z',
        updatedAt: '2026-05-07T12:00:00.000Z',
        creator: {
          id: 'u12345678-1234-1234-1234-123456789012',
          name: 'John Doe',
          email: 'john@example.com'
        }
      }
    }
  })
  async create(
    @Param('groupId') groupId: string,
    @Body() createSampleDto: CreateSampleDTO,
    @CurrentUser() user: User
  ) {
    return this.samplesService.create(createSampleDto, groupId, user)
  }

  @Get('groups/:groupId/samples')
  @Auth()
  @ApiOperation({
    summary: 'List all samples',
    description: 'Returns all non-archived samples for a group. Requires RESEARCHER role or higher.'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Requires RESEARCHER role or higher in the group.'
  })
  @ApiResponse({
    status: 200,
    description: 'Samples retrieved successfully',
    schema: {
      example: [
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: 'Sample 001',
          type: 'DNA',
          originOrganism: 'Homo sapiens',
          sourceLab: 'Lab A',
          group: {
            id: 'uuid-group-owner',
            name: 'Genetics Lab'
          },
          createdBy: 'u12345678-1234-1234-1234-123456789012',
          createdAt: '2026-05-07T12:00:00.000Z',
          updatedAt: '2026-05-07T12:00:00.000Z',
          creator: {
            id: 'u12345678-1234-1234-1234-123456789012',
            name: 'John Doe',
            email: 'john@example.com'
          },
          amountOfTubes: 4
        }
      ]
    }
  })
  async findAll(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
    @Query('search') search?: string,
    @Query('types') types?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize?: number,
    @Query('sortBy') sortBy?: 'name' | 'type' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    const typesArray = types ? types.split(',').filter(Boolean) : undefined
    return this.samplesService.findAllByGroup(groupId, user, {
      search,
      types: typesArray,
      page,
      pageSize,
      sortBy,
      sortOrder
    })
  }

  @Get('groups/:groupId/samples/stats')
  @Auth()
  @ApiOperation({
    summary: 'Get samples statistics',
    description:
      'Returns aggregated statistics for samples in a group including total counts, expiration data, and organism diversity. Requires RESEARCHER role or higher.'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Requires RESEARCHER role or higher in the group.'
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        totalSamples: 1247,
        samplesLastMonth: 24,
        totalTubes: 3891,
        boxesWithTubes: 38,
        expiringSoon: 12,
        differentOrganisms: 7
      }
    }
  })
  async getStats(@Param('groupId') groupId: string, @CurrentUser() user: User) {
    return this.samplesService.getStats(groupId, user)
  }

  @Delete('samples/:id')
  @Auth()
  @ApiOperation({
    summary: 'Archive a sample',
    description: 'Archives (soft deletes) a sample. Requires MANAGER role or higher in the group.'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Requires MANAGER role or higher in the group.'
  })
  @ApiNotFoundResponse({ description: 'Sample not found' })
  @ApiResponse({
    status: 200,
    description: 'Sample archived successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Sample 001',
        type: 'DNA',
        originOrganism: 'Homo sapiens',
        sourceLab: 'Lab A',
        groupId: 'g12345678-1234-1234-1234-123456789012',
        createdBy: 'u12345678-1234-1234-1234-123456789012',
        createdAt: '2026-05-01T12:00:00.000Z',
        updatedAt: '2026-05-07T12:00:00.000Z',
        creator: {
          id: 'u12345678-1234-1234-1234-123456789012',
          name: 'John Doe',
          email: 'john@example.com'
        }
      }
    }
  })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.samplesService.archive(id, user)
  }

  @Get('groups/:groupId/samples/types')
  @Auth()
  @ApiOperation({
    summary: 'Get available sample types',
    description: 'Returns all unique sample types for a group. Requires RESEARCHER role or higher.'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Requires RESEARCHER role or higher in the group.'
  })
  @ApiResponse({
    status: 200,
    description: 'Types retrieved successfully',
    schema: {
      example: ['DNA', 'RNA', 'Protein', 'Cell Line']
    }
  })
  async getAvailableTypes(@Param('groupId') groupId: string, @CurrentUser() user: User) {
    return this.samplesService.getAvailableTypes(groupId, user)
  }

  @Patch('samples/:id')
  @Auth()
  @ApiOperation({
    summary: 'Update a sample',
    description: 'Updates an existing sample. Requires RESEARCHER role or higher in the group.'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions. Requires RESEARCHER role or higher in the group.'
  })
  @ApiNotFoundResponse({ description: 'Sample not found' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiResponse({
    status: 200,
    description: 'Sample updated successfully',
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Sample 001 Updated',
        type: 'RNA',
        originOrganism: 'Mus musculus',
        sourceLab: 'Lab B',
        groupId: 'g12345678-1234-1234-1234-123456789012',
        createdBy: 'u12345678-1234-1234-1234-123456789012',
        createdAt: '2026-05-01T12:00:00.000Z',
        updatedAt: '2026-05-07T14:30:00.000Z',
        creator: {
          id: 'u12345678-1234-1234-1234-123456789012',
          name: 'John Doe',
          email: 'john@example.com'
        }
      }
    }
  })
  async update(
    @Param('id') id: string,
    @Body() updateSampleDto: UpdateSampleDTO,
    @CurrentUser() user: User
  ) {
    return this.samplesService.update(id, updateSampleDto, user)
  }
}
