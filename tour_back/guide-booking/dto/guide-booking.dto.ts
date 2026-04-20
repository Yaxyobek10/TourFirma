import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  Min,
  IsOptional,
  IsString,
  MaxLength,
  IsPositive,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';

export class CreateGuideBookingDto {
  @ApiProperty({
    example: '2025-10-10',
    description: 'Sayohat boshlanish sanasi (YYYY-MM-DD formatda)',
  })
  @IsDateString({}, { message: 'startDate yaroqli sana bo\'lishi kerak' })
  startDate: string;

  @ApiProperty({
    example: '2025-10-15',
    description: 'Sayohat tugash sanasi (YYYY-MM-DD formatda)',
  })
  @IsDateString({}, { message: 'endDate yaroqli sana bo\'lishi kerak' })
  endDate: string;

  @ApiProperty({
    example: 3,
    description: 'Necha kishi uchun bron qilinmoqda',
    minimum: 1,
  })
  @IsInt({ message: 'numberOfPeople butun son bo\'lishi kerak' })
  @Min(1, { message: 'Eng kamida 1 kishi bo\'lishi kerak' })
  numberOfPeople: number;



  @ApiProperty({
    example: 'Shokir',
    description: 'Turistning to\'liq ismi',
  })
  @IsString()
  @IsNotEmpty()
  touristName: string;



  @ApiProperty({
    example: 'shokir@example.com',
    description: 'Turistning email manzili (unique bo\'lishi kerak)',
  })
  @IsEmail()
  touristEmail: string;



  @ApiProperty({
    example: '+998901234567',
    description: 'Turistning telefon raqami',
  })
  @IsString()
  @IsNotEmpty()
  touristPhone: string;




  @ApiProperty({
    example: 'Excursion around the city and historical places',
    description: 'Qo\'shimcha izoh yoki maxsus talablar (ixtiyoriy)',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'comment 500 belgidan oshmasligi kerak' })
  comment?: string;
}
