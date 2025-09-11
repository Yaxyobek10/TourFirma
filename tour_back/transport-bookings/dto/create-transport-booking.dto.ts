import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsDateString,
  IsString,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class TransportBookingItemDto {
  @ApiProperty({ description: 'Transport ID', example: 1 })
  @IsInt()
  @Min(1)
  transportId: number;

  @ApiProperty({ description: 'Nechta olingani', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateTransportBookingDto {
  @ApiProperty({
    type: [TransportBookingItemDto],
    description: 'Tanlangan transportlar va ularning soni',
    example: [
      { transportId: 1, quantity: 2 },
      { transportId: 2, quantity: 1 },
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TransportBookingItemDto)
  transports: TransportBookingItemDto[];

  @ApiProperty({ description: 'Pickup sanasi (YYYY-MM-DD)', example: '2025-09-11' })
  @IsDateString()
  pickupDate: string;

  @ApiProperty({ description: 'Pickup vaqti (HH:mm)', example: '10:30' })
  @IsString()
  pickupTime: string;

  @ApiProperty({ description: 'Dropoff sanasi (YYYY-MM-DD)', example: '2025-09-16' })
  @IsDateString()
  dropoffDate: string;

  @ApiProperty({ description: 'Dropoff vaqti (HH:mm)', example: '10:30' })
  @IsString()
  dropoffTime: string;

  @ApiProperty({ description: 'Pickup location', example: 'Deira' })
  @IsString()
  pickupLocation: string;

  @ApiProperty({ description: 'Dropoff location', example: 'JAFZA' })
  @IsString()
  dropoffLocation: string;

  @ApiProperty({
    type: [String],
    required: false,
    description: "Qo'shimcha opsiyalar (addons)",
    example: ['additional_driver', 'SCDW'],
  })
  @IsArray()
  @IsOptional()
  addons?: string[];
}
