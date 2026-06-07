import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator'

export class CreateTubeDTO {
  @ApiPropertyOptional({ example: '2027-12-31' })
  @IsOptional()
  @IsDateString()
  expirationDate?: string

  @ApiPropertyOptional({ example: 7, description: 'Days before expiration to send a notification' })
  @IsOptional()
  @IsInt()
  @Min(1)
  daysBeforeNotification?: number
}
