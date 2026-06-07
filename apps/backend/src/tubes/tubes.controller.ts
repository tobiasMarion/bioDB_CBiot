import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
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
import { Auth, CurrentUser } from '../auth/authentication.guard'
import type { User } from '../auth/types/user.type'
import { AddAttributeDTO } from './dto/AddAttribute'
import { CheckinTubeDTO } from './dto/CheckinTube'
import { CreateTubeDTO } from './dto/CreateTube'
import { UpdateAttributeDTO } from './dto/UpdateAttribute'
import { UpdateTubeDTO } from './dto/UpdateTube'
import { TubesService } from './tubes.service'

@ApiTags('Tubes')
@Controller()
export class TubesController {
  constructor(private readonly tubesService: TubesService) {}

  @Post('samples/:sampleId/tubes')
  @Auth()
  @ApiOperation({ summary: 'Create a new tube for a sample' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions. Requires RESEARCHER or higher.' })
  @ApiNotFoundResponse({ description: 'Sample not found' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  async create(
    @Param('sampleId') sampleId: string,
    @Body() body: CreateTubeDTO,
    @CurrentUser() user: User
  ) {
    return this.tubesService.create(sampleId, body, user)
  }

  @Get('samples/:sampleId/tubes')
  @Auth()
  @ApiOperation({ summary: 'List all tubes for a sample' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiNotFoundResponse({ description: 'Sample not found' })
  async findBySample(@Param('sampleId') sampleId: string, @CurrentUser() user: User) {
    return this.tubesService.findBySample(sampleId, user)
  }

  @Post('tubes/:id/checkout')
  @Auth()
  @ApiOperation({ summary: 'Check out a tube from storage' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiNotFoundResponse({ description: 'Tube not found' })
  @ApiConflictResponse({ description: 'Tube is already checked out' })
  async checkout(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tubesService.checkout(id, user)
  }

  @Post('tubes/:id/checkin')
  @Auth()
  @ApiOperation({ summary: 'Return a tube to storage' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiNotFoundResponse({ description: 'Tube or box not found' })
  @ApiConflictResponse({ description: 'Tube is not checked out or position is already occupied' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  async checkin(@Param('id') id: string, @Body() body: CheckinTubeDTO, @CurrentUser() user: User) {
    return this.tubesService.checkin(id, body, user)
  }

  @Patch('tubes/:id')
  @Auth()
  @ApiOperation({ summary: 'Update tube fields (notes)' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiNotFoundResponse({ description: 'Tube not found' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  async update(@Param('id') id: string, @Body() body: UpdateTubeDTO, @CurrentUser() user: User) {
    return this.tubesService.update(id, body, user)
  }

  @Delete('tubes/:id')
  @Auth()
  @ApiOperation({ summary: 'Archive a tube' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions. Requires MANAGER or higher.' })
  @ApiNotFoundResponse({ description: 'Tube not found' })
  async archive(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tubesService.archive(id, user)
  }

  @Post('tubes/:id/attributes')
  @Auth()
  @ApiOperation({ summary: 'Add a custom attribute to a tube' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiNotFoundResponse({ description: 'Tube not found' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  async addAttribute(
    @Param('id') id: string,
    @Body() body: AddAttributeDTO,
    @CurrentUser() user: User
  ) {
    return this.tubesService.addAttribute(id, body, user)
  }

  @Patch('tubes/:id/attributes/:key')
  @Auth()
  @ApiOperation({ summary: 'Update the value of a tube attribute' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient role to edit this attribute' })
  @ApiNotFoundResponse({ description: 'Tube or attribute not found' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  async updateAttribute(
    @Param('id') id: string,
    @Param('key') key: string,
    @Body() body: UpdateAttributeDTO,
    @CurrentUser() user: User
  ) {
    return this.tubesService.updateAttribute(id, key, body, user)
  }

  @Delete('tubes/:id/attributes/:key')
  @Auth()
  @ApiOperation({ summary: 'Delete a tube attribute' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid authentication token' })
  @ApiForbiddenResponse({ description: 'Insufficient role to delete this attribute' })
  @ApiNotFoundResponse({ description: 'Tube or attribute not found' })
  async deleteAttribute(
    @Param('id') id: string,
    @Param('key') key: string,
    @CurrentUser() user: User
  ) {
    return this.tubesService.deleteAttribute(id, key, user)
  }
}
