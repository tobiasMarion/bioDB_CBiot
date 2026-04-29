import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse} from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/auth.guard'
import type { User } from '../auth/types/user.type'
import { FreezersService } from './freezers.service'
import { CreateFreezerDTO } from './dto/CreateFreezer'
import { UpdateFreezerDTO } from './dto/UpdateFreezer'
import { FreezerStatusDTO } from './dto/ArchiveFreezer'

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
        archived: false,
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
        createdBy: '123e4567-e89b-12d3-a456-426614174000',
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMemberships(){
    return this.freezersService.findAllFreezers()
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
        createdBy: '123e4567-e89b-12d3-a456-426614174000',
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Freezer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFreezerById(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.freezersService.findFreezerById(id)
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update freezer '})
  @ApiResponse({
    status: 200,
    description: 'Freezer updated successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Haier Biomedical DW-86L',
        locationDescription: 'Prédio A, 3º andar, sala 304',
        createdBy: '123e4567-e89b-12d3-a456-426614174000',
        archived: false,
        archivedAt: null
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  async updateFreezer(
    @Param('id') id: string,
    @Body() data: UpdateFreezerDTO,
    @CurrentUser() user: User
  ) {
    return this.freezersService.update(id, data, user)
  }

  @Patch(':id/archived')
  @Auth()
  @ApiOperation({ summary: 'Update freezer status'})
  @ApiResponse({
    status: 200,
    description: 'Freezer archived option updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  async updateArchivedFreezer(
    @Param('id') id: string,
    @Body() data: FreezerStatusDTO,
    @CurrentUser() user: User
  ) {
    return this.freezersService.updateFreezerStatus(id, data, user)
  }
}
