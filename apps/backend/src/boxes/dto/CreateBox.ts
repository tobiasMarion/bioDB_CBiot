import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class CreateBoxDTO {
  @ApiProperty({ example: "Felipe Rossoni's Box" })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  label!: string
}
