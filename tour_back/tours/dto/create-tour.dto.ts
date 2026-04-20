import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  IsEnum,
  Min,
  ValidateIf,
  Max,
} from 'class-validator';
import { Currency } from '../../common/enum/currency.enum'; 
import { TourType } from '../../common/enum/tour-type.enum';

export class CreateTourDto {
  @ApiProperty({ example: '3 days, 2 nights luxury trip' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Dubai safari, hotel, flight va guide xizmatlari bilan' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1200.0, description: 'Tour narxi (decimal)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ example: 'USD', enum: Currency, description: 'Tour narxi valyutasi' })
  @IsEnum(Currency) 
  currency: Currency;

  @ApiProperty({ example: '3 days / 2 nights' })
  @IsString()
  duration: string;

  @ApiProperty({ example: '2025-10-10' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ example: '2025-10-15' })
  @IsDateString()
  endDate: Date;

  @ApiProperty({ example: ['hotel', 'flight', 'guide'], required: false })
  @IsArray()
  @IsOptional()
  services?: string[];

  @ApiProperty({ example: 'https://cdn.com/dubai-1.jpg', required: false })
  @IsOptional()
  @IsString()
  coverImage?: string;



  @ApiProperty({ example: 30, description: 'Maksimal odam soni' })
  @IsInt()
  @Min(1)
  @Max(1000, { message: 'MaxPeople juda katta bo\'lishi mumkin emas (max 1000).' })
  maxPeople: number;



  @ApiProperty({ example: 30, description: 'Bo\'sh joylar soni' })
  @IsInt()
  @Min(0)
  @ValidateIf((o) => o.availableSlots <= o.maxPeople)
  availableSlots: number;


  @ApiProperty({ example: 'ECO', enum: TourType, description: 'Sayohat turi' })
  @IsEnum(TourType)
  tourType: TourType;


  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  tourFirma?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}




