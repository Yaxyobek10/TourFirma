import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingDto {
  @IsOptional()
  @IsEnum(BookingStatus, {
    message: 'status must be one of: pending, confirmed, cancelled, completed',
  })
  status?: BookingStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  peopleCount?: number;
}




