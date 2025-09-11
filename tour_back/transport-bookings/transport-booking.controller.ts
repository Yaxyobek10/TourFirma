import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TransportBookingService } from './transport-booking.service';
import { CreateTransportBookingDto } from './dto/create-transport-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decarator';
import { UserRole } from '../users/entities/user.entity';
import { ApiBearerAuth, ApiTags, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Transport Bookings')
@ApiBearerAuth()
@Controller('transport-bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransportBookingController {
  constructor(private readonly bookingService: TransportBookingService) {}

  

  /** CREATE BOOKING (Tourist Only) */
  @Post()
  @Roles(UserRole.TOURIST)
  @ApiBody({ type: CreateTransportBookingDto })
  async create(@Body() dto: CreateTransportBookingDto, @Req() req) {
    return this.bookingService.create(req.user.id, dto);
  }




  /** GET ALL BOOKINGS OF CURRENT USER */
  @Get()
  @Roles(UserRole.TOURIST || UserRole.TOURFIRMA)
  async findAll(@Req() req) {
    return this.bookingService.findAll(req.user.id);
  }




  /** GET ONE BOOKING BY ID (ONLY OWNER) */
  @Get(':id')
  @Roles(UserRole.TOURIST  || UserRole.TOURFIRMA)
  @ApiParam({ name: 'id', type: Number, description: 'Booking ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.bookingService.findOne(id, req.user.id);
  }




  /** DELETE BOOKING (ONLY OWNER) */
  @Delete(':id')
  @Roles(UserRole.TOURFIRMA)
  @ApiParam({ name: 'id', type: Number, description: 'Booking ID' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.bookingService.remove(id, req.user.id);
  }
}
