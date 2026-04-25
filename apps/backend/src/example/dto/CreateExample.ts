import { IsEmail, IsInt, IsString, MinLength, Min, Max, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateExampleDTO {
  @ApiProperty({ example: 'user@email.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'John Doe', minLength: 3 })
  @IsString()
  @MinLength(3)
  name!: string

  @ApiProperty({ example: 25, minimum: 0, maximum: 120 })
  @IsInt()
  @Min(0)
  @Max(120)
  age!: number

  @ApiPropertyOptional({ example: 'Optional description' })
  @IsOptional()
  @IsString()
  description?: string
}
