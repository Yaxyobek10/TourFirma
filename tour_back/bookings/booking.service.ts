import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingAction, BookingHistory } from './entities/booking-history.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Tour } from '../tours/entities/tour.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

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









// bu endpoint booking jarayonini korib turishi mumkin admin ruhsat berdimi tastiqlandimi shular uchun ishlaydi
  async getHistory(bookingId: number, userId: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['user'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user.id !== userId) {
      throw new NotFoundException('You are not allowed to view this booking history');
    }
    return this.historyRepo.find({
      where: { bookingId },
      order: { changedAt: 'ASC' },
    });
  }






  async findAll(userId: number) {
    return await this.bookingRepo.find({
      where: { user: { id: userId } },
    });
  }






  async findOne(id: number, userId: number) {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user.id !== userId)
      throw new ForbiddenException('Not your booking');
    return booking;
  }








  async update(
    id: number,
    dto: UpdateBookingDto,
    userId: number,
    isAdmin = false,) {
    const booking = await this.findOne(id, userId);
    const tour = await this.tourRepo.findOne({
      where: { id: booking.tour.id },
    });
    if (!tour) throw new NotFoundException('Tour not found');
    const oldValue = {
      peopleCount: booking.peopleCount,
      status: booking.status,
      paidAmount: booking.paidAmount,
    };
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
      await this.tourRepo.save(tour);
    }
    if (dto.paidAmount !== undefined) booking.paidAmount = dto.paidAmount;
    if (isAdmin && dto.status) booking.status = dto.status;
    const updatedBooking = await this.bookingRepo.save(booking);
    await this.historyRepo.save({
      bookingId: updatedBooking.id,
      changedBy: userId,
      oldValue,
      newValue: {
        peopleCount: updatedBooking.peopleCount,
        status: updatedBooking.status,
        paidAmount: updatedBooking.paidAmount,
      },
    });
    return updatedBooking;
  }










  async cancel(id: number, userId: number) {
    const booking = await this.findOne(id, userId);
    const oldStatus = booking.status;
    booking.status = BookingStatus.CANCELLED;
    booking.tour.availableSlots += booking.peopleCount;
    booking.tour.isActive = booking.tour.availableSlots > 0;
    await this.bookingRepo.save(booking);
    await this.tourRepo.save(booking.tour);
    await this.historyRepo.save({
      bookingId: booking.id,
      changedBy: userId,
      oldValue: { status: oldStatus },
      newValue: { status: BookingStatus.CANCELLED },
    });
    return { message: 'Booking cancelled successfully' };
  }
  @Cron(CronExpression.EVERY_HOUR)
  async autoCancelUnpaidBookings() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const unpaid = await this.bookingRepo.find({
      where: { status: BookingStatus.PENDING, createdAt: LessThan(cutoff) },
      relations: ['tour'],
    });
    for (const booking of unpaid) {
      const oldStatus = booking.status;
      booking.status = BookingStatus.CANCELLED;
      booking.tour.availableSlots += booking.peopleCount;
      booking.tour.isActive = true;
      await this.bookingRepo.save(booking);
      await this.tourRepo.save(booking.tour);
      await this.historyRepo.save({
        bookingId: booking.id,
        changedBy: 0, 
        oldValue: { status: oldStatus },
        newValue: { status: BookingStatus.CANCELLED },
      });
    }
  }
}
