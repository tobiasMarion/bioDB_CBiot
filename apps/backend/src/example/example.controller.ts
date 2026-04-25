import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { SendExampleDto } from './dto/SendExample'

@ApiTags('example')
@Controller('example')
export class ExampleController {
  @Post()
  @ApiOperation({ summary: 'Create example data' })
  @ApiBody({ type: SendExampleDto })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async sendExample(@Body() body: SendExampleDto) {
    return body
  }

  @Get()
  @ApiOperation({ summary: 'Get example data' })
  @ApiResponse({
    status: 200,
    description: 'Example response',
    schema: {
      example: {
        name: 'example',
        attribute: 123
      }
    }
  })
  async getExample() {
    return { name: 'example', attribute: 123 }
  }
}
