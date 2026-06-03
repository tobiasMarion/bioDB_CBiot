import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/authentication.guard'
import type { User } from '../auth/types/user.type'
import { RoomsService } from './rooms.service';
import { CreateRoomDTO } from './dto/CreateRoom';
import { UpdateRoomDTO } from './dto/UpdateRoom';

@Controller()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('rooms/new')
  @Auth()
  @ApiOperation({ summary: 'Create new room' })
  @ApiBody({ type: CreateRoomDTO })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Conflict - Room creation failed' })
  async sendRoom(@Body() body: CreateRoomDTO, @CurrentUser() user: User) {
    return this.roomsService.create(body, user);
  }

  @Get('rooms')
  @Auth()
  @ApiOperation({ summary: 'Find all active rooms (admin only)' })
  @ApiResponse({ status: 200, description: 'Authorized access' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllRooms(@CurrentUser() user: User) {
    return this.roomsService.findAllRooms(user);
  }

  @Get('rooms/:id')
  @Auth()
  @ApiOperation({ summary: 'Find room by id' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Room found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async getRoomById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.roomsService.findRoomById(id, user);
  }

  @Patch('rooms/:id')
  @Auth()
  @ApiOperation({ summary: 'Update room' })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async updateRoom(@Param('id') id: string, @Body() data: UpdateRoomDTO, @CurrentUser() user: User) {
    return this.roomsService.update(id, data, user);
  }
  
  @Delete('rooms/:id')
  @Auth()
  @ApiOperation({ summary: 'Archive room' })
  @ApiResponse({ status: 200, description: 'Room archived successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async archiveRoom(@Param('id') id: string, @CurrentUser() user: User) {
    return this.roomsService.archive(id, user);
  }
}
