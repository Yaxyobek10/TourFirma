import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, Min, IsInt } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';
import { Currency } from '../../common/enum/currency.enum';




export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'Tour ID (booking qaysi tour uchun)' })
  @IsNumber()
  @Min(1)
  tourId: number;

  @ApiProperty({ example: 2, description: 'Necha kishi uchun booking qilinadi' })
  @IsInt()
  @Min(1)
  peopleCount: number;

  @ApiProperty({
    example: 'USD',
    enum: Currency,
    description: 'Booking valyutasi (agar tanlanmasa, Tour valyutasi olinadi)',
    required: false,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;
}

export class UpdateBookingDto {
  @ApiProperty({ example: 'confirmed', enum: BookingStatus, required: false })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({ example: 300, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;
}
