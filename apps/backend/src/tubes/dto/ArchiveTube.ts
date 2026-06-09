import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class ArchiveTubeDTO {
  @ApiProperty({ example: 'Material expirado, contaminação detectada.' })
  @IsString()
  @IsNotEmpty()
  reasonForArchiving!: string
}
