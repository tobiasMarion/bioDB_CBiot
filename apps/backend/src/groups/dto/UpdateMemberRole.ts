import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { GroupRole } from '../../common/prisma/generated/enums'

export class UpdateMemberRoleDTO {
  @ApiProperty({ enum: GroupRole, example: GroupRole.MANAGER })
  @IsEnum(GroupRole)
  role!: GroupRole
}
