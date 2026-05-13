import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class CheckinTubeDTO {
  @ApiProperty({ example: 'box-uuid' })
  @IsUUID()
  boxId!: string

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  row!: number

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  col!: number

  @ApiPropertyOptional({ example: 'Used for PCR experiment' })
  @IsOptional()
  @IsString()
  notes?: string
}
