import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@ApiTags('CaseLink Leads')
@Controller()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('public/packages/:slug/leads')
  createPublicLead(@Param('slug') slug: string, @Body() dto: CreateLeadDto) {
    return this.leadsService.createPublicLead(slug, dto);
  }

  @Get('caselink/leads')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req) {
    return this.leadsService.findMine(req.user.id);
  }

  @Patch('caselink/leads/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateMine(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLeadDto, @Req() req) {
    return this.leadsService.updateMine(id, dto, req.user.id);
  }
}
