import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, Min } from 'class-validator';
import { PackageBlockType } from '../entities/package-block.entity';

export class CreatePackageBlockDto {
  @ApiProperty({ enum: PackageBlockType, example: PackageBlockType.HOTEL })
  @IsEnum(PackageBlockType)
  type: PackageBlockType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  visibleToClient?: boolean;

  @ApiProperty({ example: { url: 'https://booking.com/hotel', nights: 5 } })
  @IsObject()
  data: Record<string, unknown>;

  @ApiPropertyOptional({ example: { title: 'Rixos Premium', rating: 9.2 } })
  @IsOptional()
  @IsObject()
  preview?: Record<string, unknown>;
}
