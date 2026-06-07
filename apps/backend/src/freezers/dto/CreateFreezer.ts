import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID, MinLength } from 'class-validator'

export class CreateFreezerDTO {
  @ApiProperty({ example: 'My Freezer', minLength: 3 })
  @IsString()
  @MinLength(3)
  name!: string

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  roomId!: string
}
