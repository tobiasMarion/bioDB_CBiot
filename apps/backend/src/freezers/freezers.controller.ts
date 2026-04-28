import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/auth.guard'
import type { User } from '../auth/types/user.type'
import { FreezersService } from './freezers.service'
import { CreateFreezerDTO } from './dto/CreateFreezer'

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
  async sendExample(@Body() body: CreateFreezerDTO, @CurrentUser() user: User) {
    return this.freezersService.create(body, user)
  }
}
