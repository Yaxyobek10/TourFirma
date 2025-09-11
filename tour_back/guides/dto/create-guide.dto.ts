import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsPositive, MinLength, IsUrl } from 'class-validator';

export class CreateGuideDto {
  @ApiProperty({ example: 'Ali Valiyev', description: 'Gidning to\'liq ismi' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '10 yillik tajribaga ega professional gid', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 100, description: 'Soatlik narx ($)' })
  @IsNumber()
  @IsPositive()
  price: number;

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
}
