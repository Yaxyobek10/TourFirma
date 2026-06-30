import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enum/user-role.enum';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}




  @Post()
  @ApiOperation({ summary: '💰 Create a new payment for a booking' })
  @ApiResponse({ status: 201, description: '✅ Payment created successfully' })
  create(@Body() dto: CreatePaymentDto, @Req() req) {
    return this.paymentService.create(dto, req.user.id);
  }




  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '✅ Confirm a payment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
 confirmPayment(@Param('id', ParseIntPipe) id: number, @Req() req) {
  return this.paymentService.confirmPayment(id, req.user);
}




  @Patch(':id/refund')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '↩️ Refund a payment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
refundPayment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.paymentService.refundPayment(id, req.user);
  }





  @Patch(':id')
  @ApiOperation({
    summary: '✏️ Update payment details (User can change method before confirmation)',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentDto,
    @Req() req,
  ) {
    return this.paymentService.update(id, dto, req.user.id);
  }






  @Get()
  @ApiOperation({ summary: '📜 Get all payments for logged-in user' })
  findAll(@Req() req) {
    return this.paymentService.findAll(req.user);
  }





 @Get('booking/:id/history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all payments for a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID', type: Number })
  @ApiResponse({ status: 200, description: 'Payment history returned successfully' })
  async getHistory(@Param('id') id: number, @Req() req) {
    return this.paymentService.getPaymentHistory(+id, req.user);
  }


  @Get(':id')
  @ApiOperation({ summary: '🔍 Get a single payment by ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.paymentService.findOne(id, req.user);
  }





  


  
}







