import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class CreateFreezerDTO {
  @ApiProperty({ example: 'My Freezer', minLength: 1 })
  @IsString()
  @MinLength(1)
  name!: string

  @ApiProperty({ example: 'Building A, Room 301', minLength: 1 })
  @IsString()
  @MinLength(1)
  locationDescription!: string
}
