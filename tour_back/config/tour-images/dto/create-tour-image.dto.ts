import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateTourImageDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}


