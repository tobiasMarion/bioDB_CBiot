import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/authentication.guard'
import type { User } from '../auth/types/user.type'
import { BoxesService } from '../boxes/boxes.service'
import { CreateBoxDTO } from '../boxes/dto/CreateBox'
import { CreateFreezerDTO } from './dto/CreateFreezer'
import { UpdateFreezerDTO } from './dto/UpdateFreezer'
import { FreezersService } from './freezers.service'

@Controller()
export class FreezersController {
  constructor(
    private readonly freezersService: FreezersService,
    private readonly boxesService: BoxesService
  ) {}

  @Post('freezers/new')
  @Auth()
  @ApiOperation({ summary: 'Create new freezer' })
  @ApiBody({ type: CreateFreezerDTO })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Conflict - Freezer creation failed' })
  async sendFreezer(@Body() body: CreateFreezerDTO, @CurrentUser() user: User) {
    return this.freezersService.create(body, user)
  }

  @Get('freezers')
  @Auth()
  @ApiOperation({ summary: 'Find all active freezers (admin only)' })
  @ApiResponse({ status: 200, description: 'Authorized access' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllFreezers(@CurrentUser() user: User) {
    return this.freezersService.findAllFreezers(user)
  }

  @Get('groups/:groupId/freezers')
  @Auth()
  @ApiOperation({ summary: 'List all freezers with boxes for a group member' })
  @ApiParam({ name: 'groupId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Freezers with boxes returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this group' })
  async getFreezersForGroup(@Param('groupId') groupId: string, @CurrentUser() user: User) {
    return this.freezersService.findAllWithBoxes(groupId, user)
  }

  @Post('freezers/:freezerId/boxes')
  @Auth()
  @ApiOperation({ summary: 'Create a box in a freezer' })
  @ApiParam({ name: 'freezerId', type: 'string', format: 'uuid' })
  @ApiBody({ type: CreateBoxDTO })
  @ApiResponse({
    status: 201,
    description: 'Box created',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        freezerId: '661e8400-e29b-41d4-a716-446655440001',
        label: 'BOX-A1',
        createdBy: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2026-05-01T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - must be a member of at least one group' })
  @ApiResponse({ status: 404, description: 'Freezer not found' })
  @ApiResponse({ status: 409, description: 'A box with this label already exists in this freezer' })
  async createBox(
    @Param('freezerId', ParseUUIDPipe) freezerId: string,
    @Body() dto: CreateBoxDTO,
    @CurrentUser() user: User
  ) {
    return this.boxesService.create(freezerId, dto, user)
  }

  @Get('freezers/:freezerId/boxes')
  @Auth()
  @ApiOperation({ summary: 'List active boxes from a freezer' })
  @ApiParam({ name: 'freezerId', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Boxes returned',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          label: 'BOX-A1',
          _count: { tubes: 3 }
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBoxesByFreezer(
    @Param('freezerId', ParseUUIDPipe) freezerId: string
  ) {
    return this.boxesService.findByFreezer(freezerId)
  }

  @Get('boxes/:boxId/occupancy')
  @Auth()
  @ApiOperation({ summary: 'Get occupied positions in a box' })
  @ApiParam({ name: 'boxId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of occupied { row, col } positions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBoxOccupancy(
    @Param('boxId') boxId: string,
    @Query('excludeSampleId') excludeSampleId?: string
  ) {
    return this.freezersService.getBoxOccupancy(boxId, excludeSampleId)
  }

  @Get('freezers/:id')
  @Auth()
  @ApiOperation({ summary: 'Find freezer by id' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Freezer found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Freezer not found' })
  async getFreezerById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.freezersService.findFreezerById(id, user)
  }

  @Get('freezers/:id/samples')
  @Auth()
  @ApiOperation({ summary: 'Find all tubes from a freezer' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Tubes found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async getTubesFreezer(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.freezersService.findTubesFreezer(id, user)
  }

  @Patch('freezers/:id')
  @Auth()
  @ApiOperation({ summary: 'Update freezer' })
  @ApiResponse({ status: 200, description: 'Freezer updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Freezer not found' })
  async updateFreezer(
    @Param('id') id: string,
    @Body() data: UpdateFreezerDTO,
    @CurrentUser() user: User
  ) {
    return this.freezersService.update(id, data, user)
  }

  @Delete('freezers/:id')
  @Auth()
  @ApiOperation({ summary: 'Archive freezer' })
  @ApiResponse({ status: 200, description: 'Freezer archived successfully' })
  @ApiResponse({ status: 400, description: 'Cannot archive freezer containing active tubes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Freezer not found' })
  async archiveFreezer(@Param('id') id: string, @CurrentUser() user: User) {
    return this.freezersService.archive(id, user)
  }
}
