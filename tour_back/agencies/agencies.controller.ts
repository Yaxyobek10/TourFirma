import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AgenciesService } from './agencies.service';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';

@ApiTags('CaseLink Agencies')
@ApiBearerAuth()
@Controller('agencies')
@UseGuards(JwtAuthGuard)
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Post()
  create(@Body() dto: CreateAgencyDto, @Req() req) {
    return this.agenciesService.create(dto, req.user.id);
  }

  @Get('me')
  getMine(@Req() req) {
    return this.agenciesService.getMine(req.user.id);
  }

  @Patch('me')
  updateMine(@Body() dto: UpdateAgencyDto, @Req() req) {
    return this.agenciesService.updateMine(req.user.id, dto);
  }
}
