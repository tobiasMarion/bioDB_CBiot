import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class UpdateTubeDTO {
  @ApiPropertyOptional({ example: 'Slightly turbid — monitor on next use.' })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiPropertyOptional({ example: 7, description: 'Days before expiration to send a notification' })
  @IsOptional()
  @IsInt()
  @Min(1)
  daysBeforeNotification?: number
}
