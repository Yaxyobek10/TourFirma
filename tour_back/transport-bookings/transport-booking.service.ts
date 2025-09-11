import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TransportBooking } from './entities/transport-booking-entity';
import { Transport } from '../transports/entities/transport-entity';
import { User } from '../users/entities/user.entity';
import { TourFirmaProfile } from '../tourfirma/entities/tourfirma-entity';
import { CreateTransportBookingDto } from './dto/create-transport-booking.dto';
import { TransportBookingItem } from './entities/transport-booking.Item.entity';

@Injectable()
export class TransportBookingService {
  constructor(
    @InjectRepository(TransportBooking)
    private readonly bookingRepo: Repository<TransportBooking>,
    @InjectRepository(Transport)
    private readonly transportRepo: Repository<Transport>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TourFirmaProfile)
    private readonly profileRepo: Repository<TourFirmaProfile>,
    @InjectRepository(TransportBookingItem)
    private readonly bookingItemRepo: Repository<TransportBookingItem>,
  ) {}



  /** CREATE BOOKING */
async create(userId: number, dto: CreateTransportBookingDto) {
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');
  const transportIds = dto.transports.map(t => t.transportId);
  const transports = await this.transportRepo.find({
    where: { id: In(transportIds) },
    relations: ['tourFirma'], 
  });
  if (transports.length !== transportIds.length) {
    throw new ForbiddenException('Some transports not found');
  }
  const tourFirma = transports[0]?.tourFirma;
  if (!tourFirma) throw new ForbiddenException('Selected transport has no tourFirma');
  const pickup = new Date(dto.pickupDate);
  const dropoff = new Date(dto.dropoffDate);
  const durationDays = Math.ceil(
    (dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24),);
  if (durationDays <= 0) throw new ForbiddenException('Dropoff must be after pickup');
  let rentalPrice = 0;
  const items = dto.transports.map(itemDto => {
    const transport = transports.find(t => t.id === itemDto.transportId);
    if (!transport) throw new ForbiddenException(`Transport ${itemDto.transportId} not found`);
    const price = transport.getPriceForDate(dto.pickupDate) * itemDto.quantity * durationDays;
    rentalPrice += price;
    return { transport, quantity: itemDto.quantity, price };
  });
  const addonCosts: Record<string, number> = {
    SCDW: 100,
    'Additional driver': 50,
  };
  const addonPrice = dto.addons?.reduce((sum, a) => sum + (addonCosts[a] ?? 0), 0) ?? 0;
  const vat = Math.round((rentalPrice + addonPrice) * 0.05 * 100) / 100;
  const totalPrice = rentalPrice + addonPrice + vat;
  const booking = this.bookingRepo.create({
    user,
    pickupLocation: dto.pickupLocation,
    dropoffLocation: dto.dropoffLocation,
    pickupDate: dto.pickupDate,
    pickupTime: dto.pickupTime,
    dropoffDate: dto.dropoffDate,
    dropoffTime: dto.dropoffTime,
    rentalPrice,
    addonPrice,
    vat,
    totalPrice,
    currency: 'AED',
    addons: dto.addons,
    tourFirma, 
  });
  const savedBooking = await this.bookingRepo.save(booking);
  const bookingItems = items.map(item =>
    this.bookingItemRepo.create({
      booking: savedBooking,
      transport: item.transport,
      quantity: item.quantity,
      price: item.price,
    }),
  );
  await this.bookingItemRepo.save(bookingItems);

  return { ...savedBooking, items: bookingItems };
}





  /** GET ALL BOOKINGS */
  async findAll(userId: number) {
    return this.bookingRepo.find({
      where: { user: { id: userId }, isActive: true },
      relations: ['items', 'items.transport', 'tourFirma'],
    });
  }



  

  /** GET ONE BOOKING */
  async findOne(id: number, userId: number) {
    const booking = await this.bookingRepo.findOne({
      where: { id, user: { id: userId }, isActive: true },
      relations: ['items', 'items.transport', 'tourFirma'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }




  /** CANCEL BOOKING */
  async remove(id: number, userId: number) {
    const booking = await this.findOne(id, userId);
    booking.isActive = false;
    return this.bookingRepo.save(booking);
  }
}


