import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateRoomDTO {
  @ApiProperty({ example: '215' })
  @IsNotEmpty()
  number!: number

  @ApiProperty({ example: '43421' })
  @IsNotEmpty()
  building!: number

  @ApiProperty({ example: '2' })
  @IsNotEmpty()
  floor!: number
}
