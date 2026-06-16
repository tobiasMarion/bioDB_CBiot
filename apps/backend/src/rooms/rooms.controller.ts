import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/authentication.guard'
import type { User } from '../auth/types/user.type'
import { CreateRoomDTO } from './dto/CreateRoom'
import { UpdateRoomDTO } from './dto/UpdateRoom'
import { RoomsService } from './rooms.service'

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('new')
  @Auth()
  @ApiOperation({ summary: 'Create new room' })
  @ApiBody({ type: CreateRoomDTO })
  @ApiResponse({
    status: 201,
    description: 'Created successfully',
    schema: {
      example: {
        id: '65e6f727-c7ff-4c5c-9592-cbfcb39cc067',
        number: '210',
        building: '43421',
        floor: 2,
        createdBy: '709ef1a9-a2b3-4c8a-a36a-eeb1c6b2367a',
        createdAt: '2026-06-04T13:59:41.589Z',
        updatedAt: '2026-06-04T13:59:41.589Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Conflict - Room creation failed' })
  async sendRoom(@Body() body: CreateRoomDTO, @CurrentUser() user: User) {
    return this.roomsService.create(body, user)
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Find all active rooms (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Authorized access',
    schema: {
      example: [
        {
          id: '65e6f727-c7ff-4c5c-9592-cbfcb39cc067',
          number: '210',
          building: '43421',
          floor: 2,
          createdBy: '709ef1a9-a2b3-4c8a-a36a-eeb1c6b2367a',
          createdAt: '2026-06-04T13:59:41.589Z',
          updatedAt: '2026-06-04T13:59:41.589Z'
        },
        {
          id: '5969c6ec-b783-42a2-8714-7fad314221bc',
          number: '214',
          building: '43421',
          floor: 2,
          createdBy: '0e4a003e-8aa0-4480-beb3-19abe2ca096b',
          createdAt: '2026-06-03T23:25:40.265Z',
          updatedAt: '2026-06-03T23:25:40.265Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllRooms(@CurrentUser() user: User) {
    return this.roomsService.findAllRooms(user)
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Find room by id' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Room found',
    schema: {
      example: {
        id: '5969c6ec-b783-42a2-8714-7fad314221bc',
        number: '214',
        building: '43421',
        floor: 2,
        createdBy: '0e4a003e-8aa0-4480-beb3-19abe2ca096b',
        createdAt: '2026-06-03T23:25:40.265Z',
        updatedAt: '2026-06-03T23:25:40.265Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async getRoomById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.roomsService.findRoomById(id, user)
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update room' })
  @ApiResponse({
    status: 200,
    description: 'Room updated successfully',
    schema: {
      example: {
        id: '5969c6ec-b783-42a2-8714-7fad314221bc',
        number: '216',
        building: '43421',
        floor: 2,
        createdBy: '0e4a003e-8aa0-4480-beb3-19abe2ca096b',
        createdAt: '2026-06-03T23:25:40.265Z',
        updatedAt: '2026-06-04T14:09:24.074Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async updateRoom(
    @Param('id') id: string,
    @Body() data: UpdateRoomDTO,
    @CurrentUser() user: User
  ) {
    return this.roomsService.update(id, data, user)
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Archive room' })
  @ApiResponse({
    status: 200,
    description: 'Room archived successfully',
    schema: {
      example: { success: true }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async archiveRoom(@Param('id') id: string, @CurrentUser() user: User) {
    return this.roomsService.archive(id, user)
  }
}
