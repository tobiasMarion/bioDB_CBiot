import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Auth, CurrentUser } from '../auth/auth.guard'
import { CreateExampleDTO } from './dto/CreateExample'
import { ExampleService } from './example.service'

@ApiTags('example')
@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @ApiOperation({ summary: 'Create example data' })
  @ApiBody({ type: CreateExampleDTO })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async sendExample(@Body() body: CreateExampleDTO) {
    return this.exampleService.create(body)
  }

  @Get()
  @ApiOperation({ summary: 'Get example data' })
  @ApiResponse({
    status: 200,
    description: 'Example response',
    schema: {
      example: [
        {
          id: 1,
          email: 'user@email.com',
          name: 'example',
          age: 25,
          description: 'Optional description',
          createdAt: '2026-04-25T00:00:00.000Z',
          updatedAt: '2026-04-25T00:00:00.000Z'
        }
      ]
    }
  })
  async getExample() {
    return this.exampleService.findAll()
  }

  @Get('protected')
  @Auth()
  @ApiOperation({ summary: 'Get protected example data' })
  @ApiResponse({ status: 200, description: 'Authorized access' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProtectedExample(@CurrentUser() user: { id: string }) {
    return {
      message: 'You are authenticated!',
      user
    }
  }
}
