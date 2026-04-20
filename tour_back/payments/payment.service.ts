import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { UserRole } from '../common/enum/user-role.enum';
import { BookingHistory } from '../bookings/entities/booking-history.entity';
import { BookingAction } from '../common/enum/booking-action.enum';
import { PaymeService } from '../common/gateways/payme.service';
import { ClickService } from '../common/gateways/click.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(BookingHistory)
    private readonly bookingHistoryRepo: Repository<BookingHistory>,
    private readonly paymeService: PaymeService,
    private readonly clickService: ClickService,
    private readonly configService: ConfigService
  ) {}



  /**
   * 💰 Yangi payment yaratish
   */
async create(dto: CreatePaymentDto, userId: number) {
  return this.paymentRepo.manager.transaction(async (manager) => {
    const booking = await manager
      .createQueryBuilder(Booking, 'booking')
      .where('booking.id = :id', { id: dto.bookingId })
      .setLock('pessimistic_write')
      .getOne();
    if (!booking) throw new NotFoundException('Booking not found');
    const bookingWithUser = await manager.findOne(Booking, {
      where: { id: booking.id },
      relations: ['user'],
    });
    if (!bookingWithUser || bookingWithUser.user.id !== userId) {
      throw new BadRequestException('You cannot pay for someone else booking');
    }
    const totalPrice = Number(bookingWithUser.totalPrice) || 0;
    const alreadyPaid = Number(bookingWithUser.paidAmount ?? 0);
    const remaining = totalPrice - alreadyPaid;
    if (remaining <= 0) {
      throw new BadRequestException({
        message: 'Booking is already fully paid',
        totalPrice,
        alreadyPaid,
        remaining: 0,
      });
    }
    const existingPayments = await manager.count(Payment, {
      where: { booking: { id: booking.id } },
    });
    const minPercent = Number(this.configService.get('MIN_PAYMENT_PERCENT') ?? 30);
    const minRequired = (totalPrice * minPercent) / 100;
    const minRemaining = Math.max(minRequired - alreadyPaid, 0);
    if (existingPayments === 0 && alreadyPaid === 0 && dto.amount < minRequired) {
      throw new BadRequestException({
        message: `You must pay at least ${minPercent}% of the total price on your first payment`,
        minRequired,
        totalPrice,
        alreadyPaid,
        remaining,
      });
    }
    if (dto.amount <= 0) {
      throw new BadRequestException({
        message: 'Payment amount must be greater than 0',
        minRequired: existingPayments === 0 ? minRequired : 0,
        totalPrice,
        alreadyPaid,
        remaining,
      });
    }
    if (dto.amount > remaining) {
      throw new BadRequestException({
        message: 'Payment amount exceeds remaining balance',
        maxAllowed: remaining,
        totalPrice,
        alreadyPaid,
        remaining,
      });
    }
    if (
      (dto.method === PaymentMethod.CARD || dto.method === PaymentMethod.ONLINE) &&
      (!dto.transactionId || dto.transactionId.trim() === '')
    ) {
      throw new BadRequestException({
        message: 'transactionId is required for card or online payments',
      });
    }
    let gatewayResponse: { redirectUrl?: string } | undefined;
    if (dto.method === PaymentMethod.ONLINE) {
      const gateway = this.configService.get<'click' | 'payme'>('PAYMENT_GATEWAY');
      if (gateway === 'payme') {
        gatewayResponse = await this.paymeService.createTransaction(dto.amount, dto.bookingId);
      } else if (gateway === 'click') {
        gatewayResponse = await this.clickService.createTransaction(dto.amount, dto.bookingId);
      }
    }
    const payment = manager.create(Payment, {
      ...dto,
      booking: bookingWithUser,
      status: PaymentStatus.PENDING,
    });
    await manager.save(payment);
    bookingWithUser.paidAmount = alreadyPaid + dto.amount;
    await manager.save(bookingWithUser);
    const history = manager.create(BookingHistory, {
      booking: bookingWithUser,
      action: BookingAction.PAYMENT_CREATED,
      description: `Payment #${payment.id} created (${dto.method}) for amount ${dto.amount}`,
      performedByUserId: userId,
    });
    await manager.save(history);
    return {
      message: 'Payment created successfully',
      payment,
      redirectUrl: gatewayResponse?.redirectUrl,
      alreadyPaid: bookingWithUser.paidAmount,
      remainingAfterThisPayment: remaining - dto.amount,
      totalPrice,
      minRequired: Math.max(minRemaining, 0),
    };
  });
}














  /**
   * ✅ Paymentni tasdiqlash
   */
async confirmPayment(paymentId: number, currentUser: { id: number; role: UserRole }) {
  return this.paymentRepo.manager.transaction(async (manager) => {
    const payment = await manager.findOne(Payment, {
      where: { id: paymentId },
      relations: ['booking', 'booking.tour', 'booking.tour.tourFirma', 'booking.tour.tourFirma.user'],
      lock: { mode: 'pessimistic_write' },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (currentUser.role === UserRole.TOURFIRMA) {
      if (payment.booking.tour.tourFirma.user.id !== currentUser.id) {
        throw new ForbiddenException('Sizga tegishli bo\'lmagan to\'lovni tasdiqlay olmaysiz');
      }
    }
    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Payment already confirmed');
    }
    payment.status = PaymentStatus.PAID;
    await manager.save(payment);
    payment.booking.paidAmount += Number(payment.amount);
    if (payment.booking.paidAmount >= payment.booking.totalPrice) {
      payment.booking.status = BookingStatus.CONFIRMED;
    }
    await manager.save(payment.booking);
    const history = manager.create(BookingHistory, {
      bookingId: payment.booking.id,
      changedBy: currentUser.id,
      action: BookingAction.PAYMENT_CONFIRMED,
      oldValue: { status: BookingStatus.PENDING },
      newValue: { status: payment.booking.status },
    });
    await manager.save(history);
    return payment;
  });
}










  /**
   * 🔄 Paymentni refund qilish (Admin only) tolovni qaytarish uchun agar sayohat bekor boladigan bolsa buni faqat admin qiladi
   */
async refundPayment(paymentId: number, currentUser: { id: number; role: UserRole }) {
  return this.paymentRepo.manager.transaction(async (manager) => {
    const payment = await manager.findOne(Payment, {
      where: { id: paymentId },
      relations: ['booking'],
      lock: { mode: 'pessimistic_write' },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Only paid payments can be refunded');
    }
    payment.status = PaymentStatus.REFUNDED;
    payment.refundedAt = new Date();
    await manager.save(payment);
    const oldStatus = payment.booking.status;
    payment.booking.paidAmount -= Number(payment.amount);
    if (payment.booking.paidAmount < 0) payment.booking.paidAmount = 0;
    if (payment.booking.paidAmount === 0) {
      payment.booking.status = BookingStatus.PENDING;
    }
    await manager.save(payment.booking);
    const history = manager.create(BookingHistory, {
      bookingId: payment.booking.id,
      changedBy: currentUser.id,
      action: BookingAction.PAYMENT_REFUNDED,
      oldValue: { status: oldStatus },
      newValue: { status: payment.booking.status },
    });
    await manager.save(history);
    return {
      message: 'Payment refunded successfully',
      payment,
    };
  });
}







  /**
   * 🏁 Bookingni to‘liq to‘langan deb belgilash (helper)
   */
  async markAsFullyPaid(bookingId: number) {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    booking.paidAmount = booking.totalPrice;
    booking.status = BookingStatus.CONFIRMED;
    return this.bookingRepo.save(booking);
  }





  /**
   * ✏️ Payment update (faqat status PENDING bo‘lsa)
   */
  async update(paymentId: number, dto: UpdatePaymentDto, userId: number) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['booking', 'booking.user'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.booking.user.id !== userId) {
      throw new BadRequestException('Not your payment');
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Cannot update a confirmed payment');
    }
    Object.assign(payment, dto);
    return this.paymentRepo.save(payment);
  }






  /**
   * 📜 Paymentlarni ko‘rish
   */
async findAll(currentUser: { id: number; role: UserRole }) {
  const where: any = {};
  if (currentUser.role === UserRole.TOURFIRMA) {
    where.booking = {
      tour: { tourFirma: { user: { id: currentUser.id } } },
    };
  } else {
    where.booking = {
      user: { id: currentUser.id },
    };
  }
  return this.paymentRepo.find({
    where,
    relations: ['booking', 'booking.tour'],
    order: { createdAt: 'DESC' },
  });
}





  /**
   * 🔍 Bitta paymentni topish
   */
  async findOne(paymentId: number, currentUser: { id: number; role: UserRole }) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['booking', 'booking.user', 'booking.tour', 'booking.tour.tourFirma', 'booking.tour.tourFirma.user'],
    });

    if (!payment) throw new NotFoundException('Payment not found');

    if (currentUser.role === UserRole.TOURFIRMA) {
      if (payment.booking.tour.tourFirma.user.id !== currentUser.id) {
        throw new ForbiddenException('Sizga tegishli bo\'lmagan to\'lovni ko\'ra olmaysiz');
      }
    } else if (payment.booking.user.id !== currentUser.id) {
      throw new BadRequestException('Not your payment');
    }
    return payment;
  }




 async getPaymentHistory(bookingId: number, currentUser: { id: number; role: UserRole }) {
  const booking = await this.bookingRepo.findOne({
    where: { id: bookingId },
    relations: ['user', 'tour', 'tour.tourFirma', 'tour.tourFirma.user'],
  });
  if (!booking) {
    throw new NotFoundException('Booking not found');
  }
  if (currentUser.role === UserRole.TOURIST && booking.user.id !== currentUser.id) {
    throw new ForbiddenException('You can only see payment history for your own bookings.');
  }
  if (currentUser.role === UserRole.TOURFIRMA && booking.tour.tourFirma.user.id !== currentUser.id) {
    throw new ForbiddenException('This booking does not apply to your tour.');
  }
  return this.paymentRepo.find({
    where: { booking: { id: bookingId } },
    relations: ['booking', 'booking.user'],
    order: { createdAt: 'DESC' },
  });
}

}

