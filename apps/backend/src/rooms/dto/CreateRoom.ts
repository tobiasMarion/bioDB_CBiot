import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRoomDTO {
  @ApiProperty({ example: '215' })
  @IsString()
  @IsNotEmpty()
  number!: string

  @ApiProperty({ example: '43421' })
  @IsString()
  @IsNotEmpty()
  building!: string

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsNotEmpty()
  floor!: number
}
