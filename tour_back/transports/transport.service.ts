import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindManyOptions, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Transport, TransportCategory } from './entities/transport.entity';
import { CreateTransportDto } from './dto/create-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';
import { TourFirmaProfile } from '../tourfirma/entities/tourfirma.entity';
import { TransportBookingItem } from '../transport-bookings/entities/transport-booking-item.entity';

@Injectable()
export class TransportService {
  constructor(
    @InjectRepository(Transport)
    private readonly transportRepo: Repository<Transport>,
    @InjectRepository(TourFirmaProfile)
    private readonly profileRepo: Repository<TourFirmaProfile>,
    @InjectRepository(TransportBookingItem)
    private readonly bookingItemRepo: Repository<TransportBookingItem>,
  ) {}

  /** CREATE TRANSPORT */
  async create(dto: CreateTransportDto, userId: number): Promise<Transport> {
    const profile = await this.profileRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new ForbiddenException('Tour firma profile not found');
    if (!profile.isVerified) throw new ForbiddenException('Your profile is not verified yet');

    const transport = this.transportRepo.create({ ...dto, tourFirma: profile });
    return this.transportRepo.save(transport);
  }





  
  async findAll(
    userId: number,
    filters?: {
      type?: string;
      category?: TransportCategory;
      isActive?: boolean;
      tags?: string[];
      minPrice?: number;
      maxPrice?: number;
    },
    date?: string,
    pagination?: { skip?: number; take?: number },
  ): Promise<Transport[]> {
    const profile = await this.profileRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new ForbiddenException('Tour firma profile not found');
    const where: any = { tourFirma: { id: profile.id } };
    if (filters) {
      if (filters.type) where.type = filters.type;
      if (filters.category) where.category = filters.category;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
      if (filters.minPrice !== undefined) where.basePrice = MoreThanOrEqual(filters.minPrice);
      if (filters.maxPrice !== undefined) where.basePrice = LessThanOrEqual(filters.maxPrice);
      if (filters.tags?.length) where.tags = In(filters.tags);
    }
    const options: FindManyOptions<Transport> = {
      where,
      skip: pagination?.skip,
      take: pagination?.take,
      order: { basePrice: 'ASC' },
    };
    const transports = await this.transportRepo.find(options);
    for (const t of transports) {
      if (date) {
        const bookedItems = await this.bookingItemRepo.find({
          where: { transport: { id: t.id } },
          relations: ['booking'],
        });
        const bookedCount = bookedItems.filter(
          (i) => i.booking.isActive && (i.booking.pickupDate === date || i.booking.dropoffDate === date),
        ).reduce((sum, i) => sum + i.quantity, 0);
        t.availableQuantity = t.quantity - bookedCount;
      } else {
        t.availableQuantity = t.quantity;
      }
    }
    return transports;
  }







  /** FIND ONE TRANSPORT by id */
  async findOne(id: number, userId: number, date?: string): Promise<Transport> {
    const profile = await this.profileRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new ForbiddenException('Tour firma profile not found');
    const transport = await this.transportRepo.findOne({
      where: { id, tourFirma: { id: profile.id } },
    });
    if (!transport) throw new NotFoundException('Transport not found or not yours');
    if (date) {
      const bookedItems = await this.bookingItemRepo.find({
        where: { transport: { id: transport.id } },
        relations: ['booking'],
      });
      const bookedCount = bookedItems.filter(
        (i) => i.booking.isActive && (i.booking.pickupDate === date || i.booking.dropoffDate === date),
      ).reduce((sum, i) => sum + i.quantity, 0);
      transport.availableQuantity = transport.quantity - bookedCount;
    } else {
      transport.availableQuantity = transport.quantity;
    }
    return transport;
  }







  /** UPDATE TRANSPORT */
  async update(id: number, dto: UpdateTransportDto, userId: number): Promise<Transport> {
    const transport = await this.findOne(id, userId);
    Object.assign(transport, dto);
    return this.transportRepo.save(transport);
  }








  /** SOFT DELETE */
  async remove(id: number, userId: number): Promise<void> {
    const transport = await this.findOne(id, userId);
    transport.deletedAt = new Date();
    await this.transportRepo.save(transport);
  }
}






