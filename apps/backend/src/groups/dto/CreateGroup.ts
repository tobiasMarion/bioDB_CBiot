import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class CreateGroupDTO {
  @ApiProperty({ example: 'My Group', minLength: 1 })
  @IsString()
  @MinLength(1)
  name!: string
}
