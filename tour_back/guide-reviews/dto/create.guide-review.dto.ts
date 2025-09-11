import { IsInt, IsOptional, IsString, Max, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGuideReviewDto {
  @ApiProperty({ example: 4, description: 'Rating from 1 to 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Very knowledgeable and friendly guide!',
    required: false,
    description: 'Optional comment, max 500 characters',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  comment?: string;
}

