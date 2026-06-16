import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/authentication.guard'
import type { User } from '../auth/types/user.type'
import { BoxesService } from './boxes.service'
import { UpdateBoxDTO } from './dto/UpdateBox'

@Controller('boxes')
@Auth()
export class BoxesController {
  constructor(private readonly boxesService: BoxesService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update a box label' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateBoxDTO })
  @ApiResponse({
    status: 200,
    description: 'Box updated',
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
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  @ApiResponse({ status: 404, description: 'Box not found' })
  @ApiResponse({ status: 409, description: 'Label already exists in this freezer' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBoxDTO,
    @CurrentUser() user: User
  ) {
    return this.boxesService.update(id, dto, user)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a box' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Box deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot archive box containing active tubes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  @ApiResponse({ status: 404, description: 'Box not found' })
  @ApiResponse({ status: 409, description: 'Box is already archived' })
  async archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ) {
    return this.boxesService.archive(id, user)
  }
}
