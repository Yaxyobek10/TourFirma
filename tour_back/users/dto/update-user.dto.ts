import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../../common/enum/user-role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Foydalanuvchining yangi ismi',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'newemail@example.com',
    description: 'Foydalanuvchining yangi email manzili',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'newpassword123',
    description: 'Yangi parol (kamida 6 ta belgidan iborat bo\'lishi kerak)',
  })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: '+998901234567',
    description: 'Foydalanuvchining yangi telefon raqami',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Foydalanuvchining yangi avatar rasmi URL manzili',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Foydalanuvchi faol yoki faol emasligini belgilaydi',
  })
  @IsOptional()
  isActive?: boolean;



  @IsOptional()
  @IsString()
  refreshToken?: string;

  

  @ApiPropertyOptional({
    example: 'guide',
    enum: UserRole,
    description: 'Foydalanuvchining roli (admin, tourist, tourfirma, guide, rent_car)',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
