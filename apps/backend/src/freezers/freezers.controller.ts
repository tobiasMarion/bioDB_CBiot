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
import { CreateFreezerDTO } from './dto/CreateFreezer'
import { UpdateFreezerDTO } from './dto/UpdateFreezer'
import { FreezersService } from './freezers.service'

@Controller()
export class FreezersController {
  constructor(private readonly freezersService: FreezersService) {}

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
