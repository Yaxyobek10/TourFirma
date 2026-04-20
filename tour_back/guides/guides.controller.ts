import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { GuidesService } from './guides.service';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { GuideFilterDto } from './dto/filter.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../common/enum/user-role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Guides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

 
  /**
   * 🔍 Gidlarni filtrlab olish
   */
@Get()
@ApiOperation({
  summary: 'Get all guides (with filters like city, language, price, rating, sorting)',
})
@ApiQuery({ name: 'city', required: false })
@ApiQuery({ name: 'languages', required: false, type: [String] })
@ApiQuery({ name: 'minPrice', required: false, type: Number })
@ApiQuery({ name: 'maxPrice', required: false, type: Number })
@ApiQuery({ name: 'minRating', required: false, type: Number })
@ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort by "rating" or "experience"' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
@ApiResponse({
  status: 200,
  description: 'List of filtered guides with pagination info',
})
findAll(@Query() filter: GuideFilterDto) {
  return this.guidesService.findAll(filter);
}


  /**
   * 🔎 Bitta gidni ID bo‘yicha olish
   */
  @Roles(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST)
  @Get(':id')
  @ApiOperation({ summary: 'Get guide by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Guide ID' })
  @ApiResponse({ status: 200, description: 'Guide details' })
  @ApiResponse({ status: 404, description: 'Guide not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.guidesService.findOne(id);
  }

  /**
   * ✏️ Gid ma’lumotlarini yangilash
   */
  @Roles(UserRole.ADMIN, UserRole.GUIDE)
  @Patch(':id')
  @ApiOperation({ summary: 'Update guide information' })
  @ApiParam({ name: 'id', type: Number, description: 'Guide ID' })
  @ApiResponse({ status: 200, description: 'Guide updated successfully' })
  @ApiResponse({ status: 404, description: 'Guide not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateGuideDto) {
    return this.guidesService.update(id, data);
  }

  /**
   * 🗑️ Gidni o‘chirish (soft delete)
   */
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a guide (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Guide ID' })
  @ApiResponse({ status: 200, description: 'Guide deleted successfully' })
  @ApiResponse({ status: 404, description: 'Guide not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.guidesService.remove(id);
  }

  /**
   * 🔁 O‘chirilgan gidni tiklash
   */
  @Roles(UserRole.ADMIN)
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted guide (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Guide ID' })
  @ApiResponse({ status: 200, description: 'Guide restored successfully' })
  @ApiResponse({ status: 404, description: 'Guide not found' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.guidesService.restore(id);
  }
}
