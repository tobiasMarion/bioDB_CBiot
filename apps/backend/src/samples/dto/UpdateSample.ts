import { ApiPropertyOptional } from '@nestjs/swagger'
import { PartialType } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { CreateSampleDTO } from './CreateSample'

export class UpdateSampleDTO extends PartialType(CreateSampleDTO) {
  @ApiPropertyOptional({ example: 'Used in PCR experiment on 2026-05-13.' })
  @IsOptional()
  @IsString()
  observations?: string
}
