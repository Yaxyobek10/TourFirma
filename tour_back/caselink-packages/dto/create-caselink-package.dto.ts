import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { Currency } from '../../common/enum/currency.enum';

export class CreateCaselinkPackageDto {
  @ApiProperty({ example: 'Antalya Rixos 5 nights' })
  @IsString()
  @MaxLength(180)
  title: string;

  @ApiPropertyOptional({ example: 'Family package with hotel, flight and transfer' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1200 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: Currency, example: Currency.USD })
  @IsEnum(Currency)
  currency: Currency;

  @ApiPropertyOptional({ example: '2026-08-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-06' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/antalya.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'antalya-rixos-5n' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug?: string;
}
