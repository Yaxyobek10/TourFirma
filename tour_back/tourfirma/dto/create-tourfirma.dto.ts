import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsEmail,
  IsDecimal,
  IsPhoneNumber,
} from 'class-validator';

export class CreateTourFirmaDto {
  @ApiProperty({
    example: 'Silk Road Adventures',
    description: 'Tur firmalarning rasmiy nomi',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    example: 'Toshkent sh., Amir Temur ko\'chasi 45A',
    description: 'Tur firmalarning manzili (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'https://silkroad.uz',
    description: 'Tur firmalarning rasmiy veb-sayti (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Tur firmalarning telefon raqami (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber('UZ')
  phoneNumber?: string;

  @ApiProperty({
    example: 'https://example.com/uploads/logo.png',
    description: 'Tur firmalarning logotipi URL manzili (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({
    example: 'info@silkroad.uz',
    description: 'Tur firmalarning elektron pochta manzili (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'LIC-2025-12345',
    description: 'Tur firmalarning litsenziya raqami (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({
    example: 'https://instagram.com/silkroadtravel',
    description: 'Instagram sahifa havolasi (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiProperty({
    example: 'https://t.me/silkroadtravel',
    description: 'Telegram sahifa havolasi (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  telegram?: string;

  @ApiProperty({
    example: 'https://facebook.com/silkroadtravel',
    description: 'Facebook sahifa havolasi (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiProperty({
    example: 'Biz O\'zbekistonning eng yaxshi sayohat yo\'nalishlarini taklif qilamiz.',
    description: 'Tur firmalarning qisqacha tavsifi (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 41.311081,
    description: 'Tur firmalarning joylashuvi bo\'yicha kenglik (latitude)',
    required: false,
  })
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    example: 69.240562,
    description: 'Tur firmalarning joylashuvi bo\'yicha uzunlik (longitude)',
    required: false,
  })
  @IsOptional()
  longitude?: number;
}
