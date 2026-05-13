import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class UpdateAttributeDTO {
  @ApiProperty({ example: '300' })
  @IsString()
  value!: string
}
