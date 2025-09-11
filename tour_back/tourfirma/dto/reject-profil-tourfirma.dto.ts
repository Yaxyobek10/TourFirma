import { IsNotEmpty, IsString } from 'class-validator';

export class RejectProfileDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
