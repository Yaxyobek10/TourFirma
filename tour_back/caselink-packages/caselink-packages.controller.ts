import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CaselinkPackagesService } from './caselink-packages.service';
import { CreateCaselinkPackageDto } from './dto/create-caselink-package.dto';
import { UpdateCaselinkPackageDto } from './dto/update-caselink-package.dto';
import { CreatePackageBlockDto } from './dto/create-package-block.dto';
import { UpdatePackageBlockDto } from './dto/update-package-block.dto';
import { CreateTrackingLinkDto } from './dto/create-tracking-link.dto';

@ApiTags('CaseLink Packages')
@ApiBearerAuth()
@Controller('caselink/packages')
@UseGuards(JwtAuthGuard)
export class CaselinkPackagesController {
  constructor(private readonly packagesService: CaselinkPackagesService) {}

  @Post()
  create(@Body() dto: CreateCaselinkPackageDto, @Req() req) {
    return this.packagesService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Req() req) {
    return this.packagesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.packagesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCaselinkPackageDto, @Req() req) {
    return this.packagesService.update(id, dto, req.user.id);
  }

  @Patch(':id/publish')
  publish(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.packagesService.publish(id, req.user.id);
  }

  @Post(':id/blocks')
  addBlock(@Param('id', ParseIntPipe) id: number, @Body() dto: CreatePackageBlockDto, @Req() req) {
    return this.packagesService.addBlock(id, dto, req.user.id);
  }

  @Patch(':id/blocks/:blockId')
  updateBlock(
    @Param('id', ParseIntPipe) id: number,
    @Param('blockId', ParseIntPipe) blockId: number,
    @Body() dto: UpdatePackageBlockDto,
    @Req() req,
  ) {
    return this.packagesService.updateBlock(id, blockId, dto, req.user.id);
  }

  @Delete(':id/blocks/:blockId')
  removeBlock(
    @Param('id', ParseIntPipe) id: number,
    @Param('blockId', ParseIntPipe) blockId: number,
    @Req() req,
  ) {
    return this.packagesService.removeBlock(id, blockId, req.user.id);
  }

  @Post(':id/tracking-links')
  createTrackingLink(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateTrackingLinkDto, @Req() req) {
    return this.packagesService.createTrackingLink(id, dto, req.user.id);
  }
}
