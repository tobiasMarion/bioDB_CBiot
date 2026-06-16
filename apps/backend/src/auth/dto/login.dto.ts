import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsString()
  @IsNotEmpty()
  email: string

  @ApiProperty({ example: 'any-password' })
  @IsString()
  @IsNotEmpty()
  password: string
}
