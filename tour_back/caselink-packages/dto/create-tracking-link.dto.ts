import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LinkSource } from '../entities/tracking-link.entity';

export class CreateTrackingLinkDto {
  @ApiProperty({ enum: LinkSource, example: LinkSource.INSTAGRAM })
  @IsEnum(LinkSource)
  source: LinkSource;

  @ApiPropertyOptional({ example: 'instagram bio June campaign' })
  @IsOptional()
  @IsString()
  label?: string;
}
