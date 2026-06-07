import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsUUID } from 'class-validator'
import { SamplePermission } from '../../../common/prisma/generated/enums'

export class CreateShareRequestDto {
  @ApiProperty({
    description: 'ID of the group that will receive access to the sample',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsUUID()
  targetGroupId!: string

  @ApiProperty({
    description: 'Permission level granted to the target group',
    enum: SamplePermission,
    example: SamplePermission.VIEW
  })
  @IsEnum(SamplePermission)
  permission!: SamplePermission
}
