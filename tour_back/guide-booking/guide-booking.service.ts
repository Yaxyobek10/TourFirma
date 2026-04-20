import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { GuideBooking } from './entities/guide-booking.entity';
import { BookingStatus } from '../common/enum/booking-status.enum';
import { CreateGuideBookingDto } from './dto/guide-booking.dto';
import { Guide } from '../guides/entities/guide.entity';

@Injectable()
export class GuideBookingsService {
  constructor(
    @InjectRepository(GuideBooking)
    private readonly bookingRepo: Repository<GuideBooking>,
    @InjectRepository(Guide)
    private readonly guideRepo: Repository<Guide>,
  ) {}

  /**
   * ✳️ Yangi bron yaratish
   */
  async create(touristId: number, guideId: number, dto: CreateGuideBookingDto) {
    const guide = await this.guideRepo.findOne({ where: { id: guideId } });
    if (!guide) throw new NotFoundException('Guide not found');

    const { numberOfPeople, startDate, endDate, touristName, touristEmail, touristPhone } = dto;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()))
      throw new BadRequestException('Invalid date format');
    if (end <= start)
      throw new BadRequestException('End date must be after start date');

    // 📅 Gid bandmi yoki yo‘qligini tekshirish
    const isAvailable = await this.checkGuideAvailability(guideId, startDate, endDate);
    if (!isAvailable) throw new BadRequestException('Guide is not available for selected dates');

    if (
      guide.availableSeats !== undefined &&
      guide.availableSeats !== null &&
      numberOfPeople > guide.availableSeats
    ) {
      throw new BadRequestException(
        `Faqat ${guide.availableSeats} ta joy qolgan, siz ${numberOfPeople} kishi uchun bron qila olmaysiz.`,
      );
    }

    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const guidePrice = Number(guide.price);
    if (isNaN(guidePrice) || guidePrice <= 0)
      throw new BadRequestException('Guide price invalid');

    const totalPrice = +(guidePrice * totalDays * numberOfPeople).toFixed(2);
    const platformShare = +(totalPrice * 0.15).toFixed(2);
    const guideShare = +(totalPrice - platformShare).toFixed(2);

    const booking = this.bookingRepo.create({
      guideId,
      touristId,
      touristName,
      touristEmail,
      touristPhone,
      startDate,
      endDate,
      numberOfPeople,
      totalPrice,
      platformShare,
      guideShare,
      isPaid: false,
      status: BookingStatus.PENDING,
    });
    const saved = await this.bookingRepo.save(booking);
    return {
      message: 'Booking created successfully. Please complete 15% platformShare.',
      data: {
        id: saved.id,
        totalDays,
        totalPrice,
        platformShare,
        guideShare,
        status: saved.status,
      },
    };
  }

  /**
   * 💳 To‘lovni tasdiqlash
   */
  async confirmPayment(bookingId: number) {
    return await this.bookingRepo.manager.transaction(async (manager) => {
      const booking: GuideBooking | null = await manager.findOne(GuideBooking, {
        where: { id: bookingId },
        relations: ['guide', 'tourist'],
      });
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.isPaid) throw new BadRequestException('Booking already paid');

      if (booking.numberOfPeople > booking.guide.availableSeats) {
        throw new BadRequestException('Not enough seats left.');
      }

      booking.guide.availableSeats -= booking.numberOfPeople;
      await manager.save(Guide, booking.guide);

      booking.isPaid = true;
      booking.status = BookingStatus.APPROVED;
      await manager.save(GuideBooking, booking);

      return {
        message: 'Payment confirmed ✅',
        data: {
          id: booking.id,
          guideShare: booking.guideShare,
          platformShare: booking.platformShare,
        },
      };
    });
  }

  /**
   * ❌ Bekor qilish
   */
  async cancel(bookingId: number, byGuide = false) {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === BookingStatus.APPROVED)
      throw new BadRequestException('Cannot cancel an approved booking');
    booking.status = BookingStatus.CANCELLED;
    await this.bookingRepo.save(booking);
    return {
      message: `Booking cancelled ${byGuide ? 'by guide' : 'by tourist'}`,
      data: { id: booking.id, status: booking.status },
    };
  }

  /**
   * 🧭 Gid uchun bronlar
   */
  async findAllForGuide(guideId: number) {
    const bookings = await this.bookingRepo.find({
      where: { guideId },
      relations: ['tourist'],
      order: { createdAt: 'DESC' },
    });
    return bookings.map((b) => ({
      id: b.id,
      tourist: {
        id: b.tourist?.id ?? null,
        name: b.touristName,
        email: b.touristEmail,
        phone: b.isPaid ? b.touristPhone : null,
      },
      startDate: b.startDate,
      endDate: b.endDate,
      numberOfPeople: b.numberOfPeople,
      totalPrice: +b.totalPrice,
      status: b.status,
      isPaid: b.isPaid,
    }));
  }

  /**
   * 🧳 Turist uchun bronlar
   */
  async findAllForTourist(touristId: number) {
    const bookings = await this.bookingRepo.find({
      where: { touristId },
      relations: ['guide'],
      order: { createdAt: 'DESC' },
    });

    return bookings.map((b) => ({
      id: b.id,
      guide: {
        id: b.guide.id,
        name: b.guide.name,
        phone: b.isPaid ? b.guide.phone : null,
      },
      startDate: b.startDate,
      endDate: b.endDate,
      totalPrice: +b.totalPrice,
      status: b.status,
      isPaid: b.isPaid,
    }));
  }

  /**
   * 📅 Gidning band va bo‘sh sanalari
   */
  async getGuideCalendar(guideId: number, year: number, month: number) {
    const bookings = await this.bookingRepo.find({
      where: {
        guideId,
        status: BookingStatus.APPROVED,
      },
      select: ['startDate', 'endDate'],
    });
    const daysInMonth = new Date(year, month, 0).getDate();
    const calendar: { date: string; isBooked: boolean }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const isBooked = bookings.some((b) => {
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        return date >= start && date <= end;
      });
      calendar.push({
        date: date.toISOString().split('T')[0],
        isBooked,
      });
    }
    return {
      guideId,
      year,
      month,
      days: calendar,
    };
  }

  /**
   * 🔄 Statusni yangilash
   */
  async updateStatus(id: number, status: BookingStatus) {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    booking.status = status;
    await this.bookingRepo.save(booking);

    return {
      message: `Booking status updated to ${status}`,
      data: { id: booking.id, status: booking.status },
    };
  }

  /**
   * 🔍 Gid bandmi yoki yo‘qligini tekshirish
   */
  async checkGuideAvailability(guideId: number, startDate: string, endDate: string): Promise<boolean> {
    const overlapping = await this.bookingRepo.findOne({
      where: [
        {
          guideId,
          status: BookingStatus.APPROVED,
          startDate: LessThan(endDate),
          endDate: LessThan(startDate),
        },
      ],
    });
    return !overlapping;
  }

  /**
   * 🧾 Bitta bronni olish
   */
  async findOne(id: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['guide', 'tourist'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  /**
   * 🔁 Bronni yangilash (agar to‘lanmagan bo‘lsa)
   */
  async updateBooking(id: number, dto: Partial<CreateGuideBookingDto>) {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.isPaid)
      throw new BadRequestException('Cannot update a paid booking');

    Object.assign(booking, dto);
    return await this.bookingRepo.save(booking);
  }

  /**
   * ⏰ Eskirgan PENDING bronlarni avtomatik bekor qilish
   */
  async autoCancelExpiredBookings() {
    const now = new Date().toISOString();
const expired = await this.bookingRepo.find({
  where: {
    status: BookingStatus.PENDING,
    startDate: LessThan(now),
  },
});
    for (const b of expired) {
      b.status = BookingStatus.CANCELLED;
      await this.bookingRepo.save(b);
    }
    return { cancelledCount: expired.length };
  }




  /**
   * 🧾 Admin uchun barcha bronlar (filter + pagination)
   */
  async findAllAdmin(page = 1, limit = 10, filters?: { status?: BookingStatus; guideId?: number; touristId?: number }) {
    const qb = this.bookingRepo.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.guide', 'guide')
      .leftJoinAndSelect('booking.tourist', 'tourist')
      .orderBy('booking.createdAt', 'DESC');

    if (filters?.status) qb.andWhere('booking.status = :status', { status: filters.status });
    if (filters?.guideId) qb.andWhere('booking.guideId = :guideId', { guideId: filters.guideId });
    if (filters?.touristId) qb.andWhere('booking.touristId = :touristId', { touristId: filters.touristId });

    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

}