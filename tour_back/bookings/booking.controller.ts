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
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decarator';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Roles(UserRole.TOURIST)
  create(@Body() dto: CreateBookingDto, @Req() req) {
    return this.bookingService.create(dto, req.user.id);
  }

  @Get()
  @Roles(UserRole.TOURIST)
  findAll(@Req() req) {
    return this.bookingService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.bookingService.findOne(id, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get booking history timeline' })
  @ApiResponse({ status: 200, description: 'Returns booking history events in order' })
  async getHistory(@Param('bookingId', ParseIntPipe) bookingId: number, @Req() req) {
    return this.bookingService.getHistory(bookingId, req.user.id);
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
