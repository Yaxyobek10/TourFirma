import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 4.5, description: '1 dan 5 gacha yangi baho' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: 'Sayohat juda yoqdi, lekin transport kechikdi', description: 'Foydalanuvchi izohi' })
  @IsOptional()
  @IsString()
  comment?: string;
}
