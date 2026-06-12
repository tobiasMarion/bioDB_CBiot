import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'
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
  @ApiResponse({ status: 200, description: 'Box updated' })
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
  @ApiQuery({ name: 'groupId', type: 'string', format: 'uuid', required: false })
  @ApiResponse({ status: 200, description: 'Box archived' })
  async archive(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('groupId') groupId: string | undefined,
    @CurrentUser() user: User
  ) {
    return this.boxesService.archive(id, groupId, user)
  }
}
