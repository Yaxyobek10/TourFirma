import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingHistory } from '../bookings/entities/booking-history.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decarator';
import { UserRole } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Booking History')
@ApiBearerAuth()
@Controller('booking-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class BookingHistoryController {
  constructor(
    @InjectRepository(BookingHistory)
    private readonly historyRepo: Repository<BookingHistory>,
  ) {}

  @Get()
  async findAll() {
    return this.historyRepo.find({ order: { changedAt: 'DESC' } });
  }

  @Get(':bookingId')
  @ApiParam({ name: 'bookingId', type: Number })
  async findByBookingId(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.historyRepo.find({
      where: { bookingId },
      order: { changedAt: 'DESC' },
    });
  }
}
