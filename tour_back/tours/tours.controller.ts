import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiParam, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { UpdateTourAdminDto } from './dto/update-tour-admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enum/user-role.enum';

@ApiTags('Tours')
@ApiBearerAuth()
@Controller('tours')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

 @Get()
  @Roles(UserRole.GUIDE, UserRole.TOURFIRMA)
  @ApiOperation({ summary: 'Get all tours (with optional filters)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'title', required: false, example: 'Dubai' })
  @ApiQuery({ name: 'isMyTours', required: false, example: 'true' })
  getAllTours(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('title') title?: string,
    @Query('isMyTours') isMyTours?: string,
  ) {
    const userId = req.user?.id;
    return this.toursService.findAll({ page, limit, title, isMyTours, userId });
  }


  @Get('pending')
  @Roles(UserRole.GUIDE, UserRole.TOURFIRMA)
  getPendingTours() {
    return this.toursService.findPending();
  }


  @Get(':id')
  @ApiParam({ name: 'id', type: Number, example: 1 })
  getOneTour(@Param('id', ParseIntPipe) id: number) {
    return this.toursService.findOne(id);
  }


  
  @Post()
  @Roles(UserRole.GUIDE, UserRole.TOURFIRMA)
  @ApiBody({ type: CreateTourDto })
  createTour(@Body() body: CreateTourDto, @Req() req) {
    return this.toursService.create(body, req.user.id);
  }


  @Patch(':id')
  @Roles(UserRole.TOURFIRMA)
  @ApiParam({ name: 'id', type: Number, example: 1 })
  updateTour(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTourDto,
    @Req() req,
  ) {
    return this.toursService.update(id, body, req.user.id);
  }


  @Delete(':id')
  @Roles(UserRole.TOURFIRMA)
  @ApiParam({ name: 'id', type: Number, example: 1 })
  deleteTour(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.toursService.remove(id, req.user.id);
  }


  @Patch(':id/restore')
  @Roles(UserRole.TOURFIRMA)
  @ApiParam({ name: 'id', type: Number, example: 1 })
  restoreTour(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.toursService.restore(id, req.user.id);
  }


  @Patch(':id/admin-update')
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateTourAdminDto })
  adminUpdateTour(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTourAdminDto) {
    return this.toursService.adminUpdateTour(id, body);
  }


@Patch(':id/toggle')
@Roles(UserRole.ADMIN)
@ApiParam({ name: 'id', type: Number, example: 1 })
@ApiBody({ schema: { example: { isActive: true } } })
toggleTourActive(
  @Param('id', ParseIntPipe) id: number,
  @Body('isActive') isActive: boolean,
) {
  return this.toursService.toggleActive(id, isActive);
}

}




