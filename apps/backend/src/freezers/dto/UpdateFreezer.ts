import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator'

export class UpdateFreezerDTO {
  @ApiProperty({ example: 'My Freezer', minLength: 3 })
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  roomId?: string
}
