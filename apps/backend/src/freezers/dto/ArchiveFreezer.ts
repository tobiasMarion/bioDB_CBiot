import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class FreezerStatusDTO {
  @ApiProperty({
    example: true,
    description: 'Indicates whether the freezer should be archived'
  })
  @IsBoolean()
  isArchived!: boolean
}
