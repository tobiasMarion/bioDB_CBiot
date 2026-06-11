import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateBoxDTO {
  @ApiProperty({ example: "Felipe Rossoni's Box" })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  label!: string

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  groupId?: string
}
