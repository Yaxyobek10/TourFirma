import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleActiveDto {
  @ApiProperty({ example: true, description: 'Tour active holatini o\'zgartirish' })
  @IsBoolean()
  isActive: boolean;
}
