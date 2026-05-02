import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateSampleDTO {
  @ApiProperty({ example: 'Bacterial Culture' })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ example: 'DNA Extraction' })
  @IsString()
  @IsNotEmpty()
  type!: string

  @ApiProperty({ example: 'Escherichia coli' })
  @IsString()
  @IsNotEmpty()
  originOrganism!: string

  @ApiProperty({ example: 'Microbiology Research Lab' })
  @IsString()
  @IsNotEmpty()
  sourceLab!: string
}
