import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decarator';
import { UserRole } from '../users/entities/user.entity';
import { TourFirmaService } from './tourfirma.service';
import { CreateTourFirmaDto } from './dto/create-tourfirma.dto';
import { UpdateTourFirmaDto } from './dto/update-tourfirma.dto';
import { RejectProfileDto } from './dto/reject-profil-tourfirma.dto';
import { CustomCacheInterceptor } from '../common/cache/cache';
import { Throttle } from '@nestjs/throttler';

@ApiTags('tour-firma')
@ApiBearerAuth()
@Controller('tour-firma')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TourFirmaController {
  constructor(private readonly service: TourFirmaService) {}

  // TOURFIRMA ROUTES
  @Get('me')
  @Roles(UserRole.TOURFIRMA)
  getMyProfile(@Req() req) {
    return this.service.getByUserId(req.user.id);
  }

  @Post()
  @Roles(UserRole.TOURFIRMA)
  createProfile(@Body() dto: CreateTourFirmaDto, @Req() req) {
    return this.service.createProfile(dto, req.user.id);
  }

  @Patch()
  @Roles(UserRole.TOURFIRMA)
  updateProfile(@Body() dto: UpdateTourFirmaDto, @Req() req) {
    return this.service.updateProfile(dto, req.user.id);
  }




  @Get()
  @Roles(UserRole.ADMIN)
  @Throttle({throttle: {limit: 100, ttl: 60},
})
  @UseInterceptors(CustomCacheInterceptor)
  getAllProfiles(@Query() query: any) {
    return this.service.findAll(query);
  }



  @Patch(':id/verify')
  @Roles(UserRole.ADMIN)
  verifyProfile(@Param('id', ParseIntPipe) id: number) {
    return this.service.verifyProfile(id);
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN)
  @ApiBody({ type: RejectProfileDto })
  rejectProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectProfileDto,
  ) {
    return this.service.rejectProfile(id, dto.reason);
  }
}
