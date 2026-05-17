import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateTubeDTO {
  @ApiPropertyOptional({ example: 'Slightly turbid — monitor on next use.' })
  @IsOptional()
  @IsString()
  notes?: string
}
