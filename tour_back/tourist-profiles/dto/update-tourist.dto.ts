import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateTouristDto {
  @ApiProperty({ example: 'Ali Valiyev', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '+998901234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'https://cdn.example.com/avatar.png',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({
    example: 'Toshkentdanman, sayohatni yaxshi ko\'raman',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;
}
