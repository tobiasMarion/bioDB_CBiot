import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/authentication.guard'
import type { User } from '../auth/types/user.type'
import { CreateFreezerDTO } from './dto/CreateFreezer'
import { UpdateFreezerDTO } from './dto/UpdateFreezer'
import { FreezersService } from './freezers.service'

@Controller('freezers')
export class FreezersController {
  constructor(private readonly freezersService: FreezersService) {}

  @Post('new')
  @Auth()
  @ApiOperation({ summary: 'Create new freezer' })
  @ApiBody({ type: CreateFreezerDTO })
  @ApiResponse({
    status: 201,
    description: 'Created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Haier Biomedical DW-86L',
        locationDescription: 'Prédio A, 3º andar, sala 304',
        createdBy: '123e4567-e89b-12d3-a456-426614174000',
        isArchived: false,
        archivedAt: null
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async sendFreezer(@Body() body: CreateFreezerDTO, @CurrentUser() user: User) {
    return this.freezersService.create(body, user)
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Find all active freezers' })
  @ApiResponse({
    status: 200,
    description: 'Authorized access',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Haier Biomedical DW-86L',
        locationDescription: 'Prédio A, 3º andar, sala 304',
        createdBy: '123e4567-e89b-12d3-a456-426614174000'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllFreezers(@CurrentUser() user: User) {
    return this.freezersService.findAllFreezers(user)
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Find freezer by id' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Freezer found',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Haier Biomedical DW-86L',
        locationDescription: 'Prédio A, 3º andar, sala 304',
        createdBy: '123e4567-e89b-12d3-a456-426614174000'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Freezer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFreezerById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.freezersService.findFreezerById(id, user)
  }

  @Get(':id/samples')
  @Auth()
  @ApiOperation({ summary: 'Find all samples from a freezer' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Freezer samples found'
  })
  @ApiResponse({ status: 404, description: 'Freezer samples not found' })
  async getTubesFreezer(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.freezersService.findTubesFreezer(id, user)
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update freezer' })
  @ApiResponse({
    status: 200,
    description: 'Freezer updated successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Haier Biomedical DW-86L',
        locationDescription: 'Prédio A, 3º andar, sala 304',
        createdBy: '123e4567-e89b-12d3-a456-426614174000',
        isArchived: false,
        archivedAt: null
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body'
  })
  async updateFreezer(
    @Param('id') id: string,
    @Body() data: UpdateFreezerDTO,
    @CurrentUser() user: User
  ) {
    return this.freezersService.update(id, data, user)
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Archive freezer' })
  @ApiResponse({
    status: 200,
    description: 'Freezer archived successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot archive freezer containing active tubes'
  })
  async archiveFreezer(@Param('id') id: string, @CurrentUser() user: User) {
    return this.freezersService.archive(id, user)
  }
}
