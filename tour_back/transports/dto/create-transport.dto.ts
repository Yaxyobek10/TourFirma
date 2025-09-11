import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsArray, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { TransportType, TransportCurrency, TransportCategory } from '../entities/transport-entity';

export class CreateTransportDto {
  @ApiProperty({ example: 'Mercedes S-Class 2025' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ enum: TransportType, example: TransportType.BUS })
  @IsEnum(TransportType)
  type: TransportType;

  @ApiProperty({ enum: TransportCategory, example: TransportCategory.LUXURY, required: false })
  @IsEnum(TransportCategory)
  @IsOptional()
  category?: TransportCategory;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: 250.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice: number;

  @ApiProperty({ enum: TransportCurrency, example: TransportCurrency.USD })
  @IsEnum(TransportCurrency)
  currency: TransportCurrency;

  @ApiProperty({
    example: ['2025-10-10', '2025-10-11'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  availableDates?: string[];

  @ApiProperty({
    example: { '2025-10-10': 280.0, '2025-10-11': 300.0 },
    required: false,
    description: 'Sanaga qarab maxsus narxlar',
  })
  @IsOptional()
  specialPrices?: Record<string, number>;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: ['economy', 'family'], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: ['https://example.com/img1.jpg'], required: false })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiProperty({ example: 'Comfortable family bus', required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['AC', 'Bluetooth'], required: false })
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  minRentalDays?: number;

  @ApiProperty({ example: 7, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxRentalDays?: number;

  @ApiProperty({ example: 100, required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  depositAmount?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isActive?: boolean;
}
