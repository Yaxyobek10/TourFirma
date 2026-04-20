import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingHistory } from './entities/booking-history.entity';
import { BookingAction } from '../common/enum/booking-action.enum';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Tour } from '../tours/entities/tour.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRole } from '../common/enum/user-role.enum';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Tour)
    private readonly tourRepo: Repository<Tour>,
    @InjectRepository(BookingHistory)
    private readonly historyRepo: Repository<BookingHistory>,
    private readonly dataSource: DataSource,
  ) {}





async create(dto: CreateBookingDto, userId: number) {
  return this.dataSource.transaction(async (manager) => {
    const tour = await manager
      .createQueryBuilder(Tour, 'tour')
      .where('tour.id = :id', { id: dto.tourId })



      
      .setLock('pessimistic_write')
      .getOne();
    if (!tour) {
      throw new NotFoundException('Tour not found');
    }
    if (dto.peopleCount > tour.availableSlots) {
      throw new ForbiddenException('Not enough slots available');
    }
    if (dto.peopleCount > tour.maxPeople) {
      throw new BadRequestException('People count exceeds maximum capacity');
    }
    const totalPrice = Number(tour.price) * dto.peopleCount;
    tour.availableSlots -= dto.peopleCount;
    if (tour.availableSlots <= 0) {
      tour.isActive = false;
    }
    await manager.save(tour);
    const booking = manager.create(Booking, {
      user: { id: userId },
      tour,
      peopleCount: dto.peopleCount,
      totalPrice,
      paidAmount: 0,
      status: BookingStatus.PENDING,
    });
    const savedBooking = await manager.save(booking);
    await manager.save(BookingHistory, {
      bookingId: savedBooking.id,
      changedBy: userId,
      action: BookingAction.CREATED,
      oldValue: null,
      newValue: {
        peopleCount: dto.peopleCount,
        totalPrice,
        paidAmount: 0,
        status: BookingStatus.PENDING,
      },
    });
    return {
      ...savedBooking,
      remainingAmount: Number(totalPrice), 
    };
  });
}







async findAllBookings(query?: {
  status?: BookingStatus;
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
}) {
  const page = Number(query?.page) || 1;
  const limit = Math.min(Number(query?.limit) || 10, 50);
  const skip = (page - 1) * limit;

  const qb = this.bookingRepo
    .createQueryBuilder('booking')
    .leftJoinAndSelect('booking.tour', 'tour')
    .leftJoinAndSelect('booking.user', 'user')
    .leftJoinAndSelect('tour.tourFirma', 'tourFirma')
    .orderBy('booking.createdAt', 'DESC')
    .skip(skip)
    .take(limit);
  if (query?.status) {
    qb.andWhere('booking.status = :status', { status: query.status });
  }
  if (query?.fromDate && query?.toDate) {
    qb.andWhere('booking.createdAt BETWEEN :from AND :to', {
      from: new Date(query.fromDate),
      to: new Date(query.toDate),
    });
  }

  const [bookings, total] = await qb.getManyAndCount();

  const data = bookings.map((b) => ({
    id: b.id,
    status: b.status,
    peopleCount: b.peopleCount,
    totalPrice: Number(b.totalPrice),
    paidAmount: Number(b.paidAmount),
    remainingAmount: Number(b.totalPrice) - Number(b.paidAmount),
    createdAt: b.createdAt,

    tour: b.tour
      ? {
          id: b.tour.id,
          title: b.tour.title,
          description: b.tour.description,
          duration: b.tour.duration,
          startDate: b.tour.startDate,
          endDate: b.tour.endDate,
          price: Number(b.tour.price),
          currency: b.tour.currency,
          availableSlots: b.tour.availableSlots,
          maxPeople: b.tour.maxPeople,
          rating: Number(b.tour.rating),
          isActive: b.tour.isActive,
          coverImage: b.tour.coverImage,
          tourFirma: b.tour.tourFirma
            ? {
                id: b.tour.tourFirma.id,
                companyName: b.tour.tourFirma.companyName,
                phoneNumber: b.tour.tourFirma.phoneNumber,
              }
            : null,
        }
      : null,
    user: b.user
      ? {
          id: b.user.id,
          fullName: `${b.user.name}`,
          email: b.user.email,
        }
      : null,
  }));
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}










  async findOne(id: number, userId: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['tour', 'user'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }








 async getHistory(bookingId: number, user: { id: number; role: UserRole }) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['user'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have access to this history');
    }
    const histories = await this.historyRepo.find({
      where: { bookingId },
      order: { changedAt: 'ASC' },
    });
    return histories.map((h) => ({
      id: h.id,
      action: h.action,
      changedBy: h.changedBy,
      changedAt: h.changedAt,
      message: this.formatHistoryMessage(h),
      oldValue: h.oldValue,
      newValue: h.newValue,
    }));
  }
  private formatHistoryMessage(h: BookingHistory): string {
    switch (h.action) {
      case 'CREATED':
        return 'Booking yaratildi';
      case 'CONFIRMED':
        return 'Booking tasdiqlandi';
      case 'CANCELED':
        return 'Booking bekor qilindi';
      case 'UPDATED':
        return 'Booking ma\'lumotlari yangilandi';
      case 'AUTO_CANCELLED':
        return 'To\'lov kechiktirilgani uchun avtomatik bekor qilindi';
      default:
        return `Holat o\'zgardi: ${h.action}`;
    }
  }




async update(
    id: number,
    dto: UpdateBookingDto,
    userId: number,
    isAdmin = false,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id },
        relations: ['tour', 'user'],
      });
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.user.id !== userId && !isAdmin)
        throw new ForbiddenException('Access denied');

      const tour = booking.tour;
      const oldValue = {
        peopleCount: booking.peopleCount,
        status: booking.status,
        paidAmount: booking.paidAmount,
      };

      // Agar odamlar soni o‘zgargan bo‘lsa
      if (dto.peopleCount && dto.peopleCount !== booking.peopleCount) {
        const diff = dto.peopleCount - booking.peopleCount;

        if (dto.peopleCount > tour.maxPeople)
          throw new BadRequestException('People count exceeds max capacity');

        if (diff > 0) {
          if (tour.availableSlots < diff)
            throw new BadRequestException('Not enough slots available');
          tour.availableSlots -= diff;
        } else {
          tour.availableSlots += Math.abs(diff);
        }

        tour.isActive = tour.availableSlots > 0;
        booking.peopleCount = dto.peopleCount;
        await manager.save(tour);
      }

      if (dto.paidAmount !== undefined) booking.paidAmount = dto.paidAmount;
      if (isAdmin && dto.status) booking.status = dto.status;

      const updated = await manager.save(booking);

      await manager.save(BookingHistory, {
        bookingId: updated.id,
        changedBy: userId,
        action: BookingAction.UPDATED,
        oldValue,
        newValue: {
          peopleCount: updated.peopleCount,
          status: updated.status,
          paidAmount: updated.paidAmount,
        },
      });

      return updated;
    });
  }





  // ================= CANCEL BOOKING ==================
  async cancel(id: number, userId: number) {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id },
        relations: ['tour', 'user'],
      });
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.user.id !== userId)
        throw new ForbiddenException('Not your booking');

      const oldStatus = booking.status;
      booking.status = BookingStatus.CANCELLED;
      booking.tour.availableSlots += booking.peopleCount;
      booking.tour.isActive = booking.tour.availableSlots > 0;

      await manager.save(booking);
      await manager.save(booking.tour);
      await manager.save(BookingHistory, {
        bookingId: booking.id,
        changedBy: userId,
        action: BookingAction.CANCELLED,
        oldValue: { status: oldStatus },
        newValue: { status: BookingStatus.CANCELLED },
      });

      return { message: 'Booking cancelled successfully' };
    });
  }

  // ================= AUTO CANCEL UNPAID ==================
  @Cron(CronExpression.EVERY_HOUR)
  async autoCancelUnpaidBookings() {
    return this.dataSource.transaction(async (manager) => {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 soat
      const unpaid = await manager.find(Booking, {
        where: { status: BookingStatus.PENDING, createdAt: LessThan(cutoff) },
        relations: ['tour'],
      });

      for (const booking of unpaid) {
        const oldStatus = booking.status;
        booking.status = BookingStatus.CANCELLED;
        booking.tour.availableSlots += booking.peopleCount;
        booking.tour.isActive = true;

        await manager.save(booking);
        await manager.save(booking.tour);
        await manager.save(BookingHistory, {
          bookingId: booking.id,
          changedBy: 0, // avtomatik tizim tomonidan
          action: BookingAction.CANCELLED,
          oldValue: { status: oldStatus },
          newValue: { status: BookingStatus.CANCELLED },
        });
      }
    });
  }
  }

