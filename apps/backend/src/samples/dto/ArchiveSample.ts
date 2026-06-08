import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class ArchiveSampleDTO {
  @ApiProperty({ example: 'Amostra degradada, material insuficiente para análise.' })
  @IsString()
  @IsNotEmpty()
  reasonForArchiving: string
}
