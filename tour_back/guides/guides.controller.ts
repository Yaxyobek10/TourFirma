import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { GuidesService } from './guides.service';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { GuideFilterDto } from './dto/filter.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Guides')
@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  
  @Get()
  findAll(@Query() filter: GuideFilterDto) {
    return this.guidesService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guidesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateGuideDto) {
    return this.guidesService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guidesService.remove(+id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.guidesService.restore(+id);
  }
}
