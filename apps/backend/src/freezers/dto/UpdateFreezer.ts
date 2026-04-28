import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateFreezerDTO {
  @ApiProperty({ example: 'My Freezer', minLength: 3 })
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Building A, Room 301', minLength: 3 })
  @IsString()
  @MinLength(3)
  @IsOptional()
  locationDescription?: string;
}