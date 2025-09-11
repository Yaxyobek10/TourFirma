import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsDateString } from 'class-validator';

export class UpdateTransportBookingDto {
  @ApiProperty({ type: [Number], required: false })
  @IsArray()
  @IsOptional()
  transportIds?: number[];

  @ApiProperty({ type: String, required: false })
  @IsDateString()
  @IsOptional()
  date?: string;
}
