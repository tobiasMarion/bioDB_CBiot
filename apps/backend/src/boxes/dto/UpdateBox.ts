import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateBoxDTO {
  @ApiPropertyOptional({ example: "Felipe Rossoni's Box" })
  @IsString()
  @IsOptional()
  @MinLength(1)
  label?: string
}
