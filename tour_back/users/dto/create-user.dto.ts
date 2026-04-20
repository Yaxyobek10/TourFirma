import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MinLength,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '../../common/enum/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: "Foydalanuvchining to'liq ismi",
    example: 'Ali Valiyev',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Foydalanuvchining email manzili (login uchun ishlatiladi)',
    example: 'ali.valiyev@example.com',
    required: false,
  })
  @ValidateIf((o) => !o.phone) // email bo'lmasa phone bo'lishi kerak
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Foydalanuvchining telefon raqami (login uchun ishlatiladi)',
    example: '+998901234567',
    required: false,
  })
  @ValidateIf((o) => !o.email) // phone bo'lmasa email bo'lishi kerak
  @IsNotEmpty()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Foydalanuvchining paroli (kamida 6 ta belgidan iborat bo‘lishi kerak)',
    example: 'strongPass123',
    minLength: 6,
  })
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Foydalanuvchining profil rasmi URL manzili',
    example: 'https://example.com/uploads/avatar.jpg',
    required: false,
  })
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({
    description: 'Foydalanuvchi roli',
    example: UserRole.TOURIST,
    enum: UserRole,
    required: false,
    default: UserRole.TOURIST,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.TOURIST;
}
