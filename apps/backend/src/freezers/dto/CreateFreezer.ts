import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class CreateFreezerDTO {
  @ApiProperty({ example: 'My Freezer', minLength: 3 })
  @IsString()
  @MinLength(3)
  name!: string

  @ApiProperty({ example: 'Building A, Room 301', minLength: 3 })
  @IsString()
  @MinLength(3)
  locationDescription!: string
}
