import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateTourFirmaDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;
}


