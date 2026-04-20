import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../common/enum/user-role.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BookingStatus } from './entities/booking.entity';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Roles(UserRole.TOURIST, UserRole.GUIDE)
  create(@Body() dto: CreateBookingDto, @Req() req) {
    return this.bookingService.create(dto, req.user.id);
  }

@Get('all')
@Roles(UserRole.ADMIN, UserRole.TOURFIRMA, UserRole.GUIDE)
@ApiQuery({ name: 'status', required: false, example: 'confirmed', description: 'Booking holati (pending, confirmed, canceled)' })
findAllBookings(
  @Query('page') page = 1,
  @Query('limit') limit = 10,
  @Query('status') status?: string,
  @Query('fromDate') fromDate?: string,
  @Query('toDate') toDate?: string,
) {
  return this.bookingService.findAllBookings({
    page: Number(page),
    limit: Number(limit),
    status: status ? status.toLowerCase() as BookingStatus : undefined,
    fromDate,
    toDate,
  });
}








  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.bookingService.findOne(id, req.user.id);
  }





 @Get(':bookingId/history')
  @Roles(UserRole.TOURIST, UserRole.ADMIN, UserRole.GUIDE)
  @ApiOperation({ summary: 'Booking tarixini olish (timeline)' })
  @ApiResponse({
    status: 200,
    description: 'Booking tarixidagi o\'zgarishlar tartib bilan qaytariladi',
  })
  async getHistory(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Req() req,
  ) {
    return this.bookingService.getHistory(bookingId, req.user);
  }



 
  @Patch(':id')
  update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateBookingDto,
  @Req() req,
    ) {
  const isAdmin = req.user.role === UserRole.ADMIN;
  return this.bookingService.update(id, dto, req.user.id, isAdmin);
   }
  



  @Delete(':id/cancel')
  @Roles(UserRole.TOURIST)
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.bookingService.cancel(id, req.user.id);
  }
}
