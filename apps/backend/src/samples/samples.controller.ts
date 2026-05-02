import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
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
  @ApiOperation({ summary: 'Create a new sample' })
  async create(
    @Param('groupId') groupId: string,
    @Body() createSampleDto: CreateSampleDTO,
    @CurrentUser() user: User
  ) {
    return this.samplesService.create(createSampleDto, groupId, user)
  }

  @Get('groups/:groupId/samples')
  @Auth()
  @ApiOperation({ summary: 'List all samples' })
  async findAll(@Param('groupId') groupId: string) {
    return this.samplesService.findAllByGroup(groupId)
  }

  @Delete('samples/:id')
  @Auth()
  @ApiOperation({ summary: 'Archive a sample' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.samplesService.archive(id, user)
  }

  @Patch('samples/:id')
  @Auth()
  @ApiOperation({ summary: 'Update sample' })
  async update(
    @Param('id') id: string,
    @Body() updateSampleDto: UpdateSampleDTO,
    @CurrentUser() user: User
  ) {
    return this.samplesService.update(id, updateSampleDto, user)
  }
}
