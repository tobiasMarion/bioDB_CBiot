import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsString, IsUUID } from 'class-validator'
import { GroupRole } from '../../common/prisma/generated/enums'

export class SendInviteDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsUUID()
  invitedUserId!: string

  @ApiProperty({ enum: GroupRole, example: GroupRole.RESEARCHER })
  @IsEnum(GroupRole)
  role!: GroupRole
}
