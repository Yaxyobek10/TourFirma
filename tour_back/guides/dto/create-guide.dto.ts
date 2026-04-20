import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  MinLength,
  IsUrl,
  IsArray,
  IsInt,
  IsObject,
  Min,
  IsEnum,
} from 'class-validator';
import { PriceType } from '../../common/enum/price-type.enum';
import { TravelMode } from '../../common/enum/travel-mode.enum';

export class CreateGuideDto {
  @ApiProperty({ example: 'Ali Valiyev', description: 'Gidning to‘liq ismi' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '10 yillik tajribaga ega professional gid', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 100, description: 'Kunlik narx ($)', required: false })
  @IsOptional() // 🔸 optional — ro‘yxatdan o‘tishda bo‘lmasligi mumkin
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiProperty({ example: 'Mon-Fri 9:00-18:00', required: false })
  @IsOptional()
  @IsString()
  schedule?: string;

  @ApiProperty({ example: '+998901234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({ example: 'Samarqand', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 5, description: 'Ish tajribasi (yil)', required: false })
  @IsOptional()
  @IsInt()
  experienceYears?: number;

  @ApiProperty({ example: ['uz', 'en', 'ru'], required: false })
  @IsOptional()
  @IsArray()
  languages?: string[];

  @ApiProperty({
    example: 15,
    description: 'Bir vaqtda maksimal odamlar soni (optional)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  availableSeats?: number;


  @ApiProperty({ enum: TravelMode, example: TravelMode.WALKING })
  @IsOptional()
  @IsEnum(TravelMode)
  travelMode?: TravelMode;

  @ApiProperty({ example: ['Certified Tour Guide', 'History Expert'], required: false })
  @IsOptional()
  @IsArray()
  certifications?: string[];

  @ApiProperty({ example: 'Registon maydoni', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    enum: PriceType,
    default: PriceType.PER_DAY,
    description: 'Narx turi (soatlik, kunlik yoki tur bo\'yicha)',
  })
  @IsEnum(PriceType, { message: 'priceType qiymati noto\'g\'ri' })
  @IsOptional() 
  priceType?: PriceType;


  @ApiProperty({
    example: { instagram: 'https://instagram.com/ali', telegram: '@aligide' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;

  @ApiProperty({ example: ['2025-10-10', '2025-10-12'], required: false })
  @IsOptional()
  @IsArray()
  availableDates?: string[];

  @ApiProperty({ example: 1, description: 'Gid tegishli firma IDsi', required: false })
  @IsOptional()
  @IsInt()
  tourFirmaId?: number;
}





