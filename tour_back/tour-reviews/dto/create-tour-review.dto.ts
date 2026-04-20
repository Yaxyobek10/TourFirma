import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateTourReviewDto {
  @ApiProperty({ example: 5, description: '1 dan 5 gacha baho' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Juda ajoyib sayohat edi!', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: 12, description: 'Tour ID' })
  @IsInt()
  tourId: number;
}
