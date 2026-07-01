import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { LeadIntent } from '../entities/lead.entity';

export class CreateLeadDto {
  @ApiPropertyOptional({ example: 'Ali Karimov' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'ali@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Please contact me about this package' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ example: 'instagram' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ enum: LeadIntent, example: LeadIntent.BOOKING })
  @IsOptional()
  @IsEnum(LeadIntent)
  intent?: LeadIntent;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pax?: number;

  @ApiPropertyOptional({ example: '2026-08-20' })
  @IsOptional()
  @IsDateString()
  preferredDate?: string;

  @ApiPropertyOptional({ example: 'telegram' })
  @IsOptional()
  @IsString()
  preferredContact?: string;

  @ApiPropertyOptional({ example: 'antalya-rixos-instagram' })
  @IsOptional()
  @IsString()
  trackingToken?: string;
}
