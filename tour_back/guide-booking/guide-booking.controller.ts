import {
  Controller,
  Post,
  Param,
  Body,
  Req,
  Get,
  Patch,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { GuideBookingsService } from './guide-booking.service';
import { CreateGuideBookingDto } from './dto/guide-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../common/enum/user-role.enum';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import { BookingStatus } from '../common/enum/booking-status.enum';

@ApiTags('Guide Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('guides/:guideId/bookings')
export class GuideBookingsController {
  constructor(private readonly guideBookingsService: GuideBookingsService) {}

  /**
   * 🧾 Turist gidni bron qiladi
   */
  @Roles(UserRole.TOURIST, UserRole.GUIDE)
  @Post()
  @ApiOperation({ summary: 'Tourist creates a booking for a guide' })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully, awaiting 15% payment',
  })
  async create(
    @Param('guideId', ParseIntPipe) guideId: number,
    @Body() dto: CreateGuideBookingDto,
    @Req() req: any,
  ) {
    return this.guideBookingsService.create(req.user.id, guideId, dto);
  }

  /**
   * 💳 To‘lovni tasdiqlash (avtomatik APPROVED)
   */
  @Roles(UserRole.TOURIST, UserRole.GUIDE)
  @Patch(':id/pay')
  @ApiOperation({ summary: 'Confirm payment for booking (auto-approve)' })
  @ApiParam({ name: 'id', type: Number, description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Payment confirmed' })
  async confirmPayment(@Param('id', ParseIntPipe) id: number) {
    return this.guideBookingsService.confirmPayment(id);
  }

  /**
   * 🧭 Gid o‘z bronlarini ko‘radi
   */
  @Roles(UserRole.GUIDE)
  @Get('/my')
  @ApiOperation({ summary: 'List of guide bookings' })
  async myBookings(@Req() req: any) {
    return this.guideBookingsService.findAllForGuide(req.user.id);
  }







  @Roles(UserRole.GUIDE, UserRole.ADMIN)
  @Get('guide/:id/calendar')
  async getGuideCalendar(
  @Param('id') guideId: number,
  @Query('year') year: number,
  @Query('month') month: number,
) {
  const y = year || new Date().getFullYear();
  const m = month || new Date().getMonth() + 1;
  return this.guideBookingsService.getGuideCalendar(guideId, y, m);
}











  /**
   * 🧳 Turist o‘zining bron tarixini ko‘radi
   */
  @Roles(UserRole.TOURIST, UserRole.GUIDE)
  @Get('/history')
  @ApiOperation({ summary: 'List of tourist bookings' })
  async touristBookings(@Req() req: any) {
    return this.guideBookingsService.findAllForTourist(req.user.id);
  }

  /**
   * 🔄 Booking statusini yangilash (gid yoki admin)
   */
  @Roles(UserRole.GUIDE, UserRole.ADMIN)
  @Patch(':id/status/:status')
  @ApiOperation({ summary: 'Update booking status (guide/admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'status', enum: BookingStatus })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('status') status: BookingStatus,
  ) {
    return this.guideBookingsService.updateStatus(id, status);
  }

  /**
   * ❌ Bronni bekor qilish (turist yoki gid tomonidan)
   */
  @Roles(UserRole.TOURIST, UserRole.GUIDE)
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking (by tourist or guide)' })
  async cancelBooking(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.guideBookingsService.cancel(id, req.user.role === UserRole.GUIDE);
  }
}
