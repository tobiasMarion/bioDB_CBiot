import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsIn, IsNotEmpty, IsString } from 'class-validator'
import { GroupRole } from '../../common/prisma/generated/enums'

export class AddAttributeDTO {
  @ApiProperty({ example: 'volume_ul' })
  @IsString()
  @IsNotEmpty()
  key!: string

  @ApiProperty({ example: '250' })
  @IsString()
  value!: string

  @ApiProperty({ enum: ['string', 'number', 'date', 'boolean'], example: 'number' })
  @IsIn(['string', 'number', 'date', 'boolean'])
  type!: string

  @ApiProperty({ enum: GroupRole, example: GroupRole.RESEARCHER })
  @IsEnum(GroupRole)
  minRequiredRoleToEdit!: GroupRole
}
