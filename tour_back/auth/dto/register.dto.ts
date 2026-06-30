import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../../common/enum/user-role.enum';



export class RegisterDto {
  @ApiProperty({
    example: 'Ali Valiyev',
    description: "Foydalanuvchining to'liq ismi",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'ali.valiyev@example.com',
    description: "Foydalanuvchining email manzili (unique bo'lishi kerak)",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'secret123',
    description: 'Parol (kamida 6 ta belgidan iborat bo\'lishi kerak)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
  @ApiProperty({
    example: UserRole.OWNER,
    description: 'Public register paytida role tizim tomonidan avtomatik beriladi',
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    example: '+998901234567',
    description: 'Foydalanuvchining telefon raqami (ixtiyoriy)',
    required: false,
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'https://example.com/uploads/avatar.jpg',
    description: 'Foydalanuvchining avatar rasmi URL manzili (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

