import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Length,
  IsArray,
  IsUrl,
} from 'class-validator';

export class CreateGuideReviewDto {
  @ApiProperty({ example: 4, description: 'Reyting (1 dan 5 gacha)' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: "Ajoyib gid, juda ko'p narsani o'rgandik!",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  comment?: string;

  @ApiProperty({ example: 'Ajoyib tajriba!', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  title?: string;

  @ApiProperty({
    example: ['https://example.com/review1.jpg'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];
}
