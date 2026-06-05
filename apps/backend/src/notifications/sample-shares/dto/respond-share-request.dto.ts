import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'

export enum ShareRequestAction {
  ACCEPT = 'accept',
  REJECT = 'reject'
}

export class RespondShareRequestDto {
  @ApiProperty({
    description: 'Action to take on the share request',
    enum: ShareRequestAction,
    example: ShareRequestAction.ACCEPT
  })
  @IsEnum(ShareRequestAction)
  action!: ShareRequestAction
}
