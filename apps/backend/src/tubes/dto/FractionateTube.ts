import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Max, Min } from 'class-validator'

export class FractionateTubeDTO {
  @ApiProperty({ example: 2, description: 'Number of fractions to create' })
  @IsInt()
  @Min(1)
  @Max(50)
  quantity!: number
}
