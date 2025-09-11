import { IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class UpdateTourAdminDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPeople?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  availableSlots?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
