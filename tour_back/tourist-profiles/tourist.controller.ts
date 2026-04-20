import { Controller, Get, Param, Patch, Body, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TouristsService } from './tourist.service';
import { UpdateTouristDto } from './dto/update-tourist.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../common/enum/user-role.enum';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tourists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tourists')
export class TouristsController {
  constructor(private readonly touristsService: TouristsService) {}



  
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TOURIST,  UserRole.GUIDE)
  @ApiOperation({ summary: 'Barcha turistlarni olish (qidiruv va sahifalash bilan)' })
  @ApiQuery({ name: 'search', required: false, description: 'Qidiruv so\'zi (ism, telefon yoki email bo\'yicha)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Sahifa raqami' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Har sahifadagi yozuvlar soni' })
  async findAll(@Query('search') search?: string, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.touristsService.findAll(search, Number(page), Number(limit));
  }


  @Get('me')
  @Roles(UserRole.TOURIST, UserRole.ADMIN, UserRole.GUIDE)
  @ApiOperation({ summary: 'Hozirgi foydalanuvchining turist profilini olish' })
  async getMyProfile(@Req() req) {
    return this.touristsService.findByUserId(req.user.id);
  }

  @Patch('me')
  @Roles(UserRole.TOURIST, UserRole.ADMIN, UserRole.GUIDE)
  @ApiOperation({ summary: 'O\'z turist profilini tahrirlash' })
  async updateMyProfile(@Req() req, @Body() data: UpdateTouristDto) {
    return this.touristsService.update(req.user.id, data);
  }

  @Delete('me')
  @Roles(UserRole.TOURIST, UserRole.ADMIN, UserRole.GUIDE)
  @ApiOperation({ summary: 'O\'z turist profilini o\'chirish' })
  async removeMyProfile(@Req() req) {
    return this.touristsService.removeByUserId(req.user.id); 
  }
}
