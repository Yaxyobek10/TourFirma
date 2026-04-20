import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Tour } from './entities/tour.entity';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { UpdateTourAdminDto } from './dto/update-tour-admin.dto';
import { TourFirmaProfile } from '../tourfirma/entities/tourfirma.entity';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepo: Repository<Tour>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /** TOUR CREATE */
async create(tourData: CreateTourDto, userId: number) {
  const profileRepo = this.dataSource.getRepository(TourFirmaProfile);
  const profile = await profileRepo.findOne({
    where: { user: { id: userId } },
    relations: ['user'],
  });
  if (!profile) {
    throw new BadRequestException(
      'Tourfirma profile not found. Please create your profile first.');
  }
  if (!profile.isVerified) {
    throw new ForbiddenException(
      'Your tourfirma profile is not verified yet. You cannot create tours until admin verifies your profile.');
  }
  const now = new Date();
  if (new Date(tourData.startDate) < now) {
    throw new BadRequestException('Start date cannot be in the past.');
  }
  if (new Date(tourData.startDate) >= new Date(tourData.endDate)) {
    throw new BadRequestException('Start date must be earlier than end date.');
  }
  if (tourData.price <= 0) {
    throw new BadRequestException('Price must be greater than 0.');
  }
  if (!tourData.currency) {
    throw new BadRequestException('Currency is required.');
  }
  const availableSlots =
    tourData.availableSlots && tourData.availableSlots > 0
      ? tourData.availableSlots
      : tourData.maxPeople;
  if (availableSlots > tourData.maxPeople) {
    throw new BadRequestException(
      'Available slots cannot exceed maximum people limit.');
  }
  try {
    const newTour = this.tourRepo.create({
      ...tourData,
      availableSlots,
      tourFirma: profile,
      isActive: availableSlots > 0,
    });
    return await this.tourRepo.save(newTour);
  } catch (error) {
    console.error('Error creating tour:', error);
    throw new InternalServerErrorException('Failed to create tour.');
  }
}



  /** GET ALL ACTIVE TOURS */
async findAll({
  page = 1,
  limit = 10,
  title,
  isMyTours,
  userId,
}: {
  page?: number;
  limit?: number;
  title?: string;
  isMyTours?: string;
  userId?: number;
}) {
  const query = this.tourRepo
    .createQueryBuilder('tour')
    .leftJoinAndSelect('tour.tourFirma', 'tourFirma')
    .where('tour.isActive = :active', { active: true });
  if (isMyTours === 'true' && userId) {
    query.andWhere('tourFirma.userId = :userId', { userId });
  }
  if (title) {
    query.andWhere('LOWER(tour.title) LIKE LOWER(:title)', {
      title: `%${title}%`,
    });
  }
  const skip = (page - 1) * limit;
  query.skip(skip).take(limit);
  const [data, total] = await query.getManyAndCount();
  return {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
    data,
  };
}




  /** GET ONE TOUR */
  async findOne(id: number) {
    const tour = await this.tourRepo.findOne({
      where: { id },
      relations: ['tourFirma'],
      withDeleted: true,
    });
    if (!tour) throw new NotFoundException(`Tour with ID ${id} not found`);
    return tour;
  }



  /** GET INACTIVE TOURS (for admin dashboard) */
  async findPending() {
    return await this.tourRepo.find({
      where: { isActive: false },
      relations: ['tourFirma'],
    });
  }



  async update(id: number, dto: UpdateTourDto, userId: number) {
    const tour = await this.findOne(id);
    if (tour.tourFirma.user.id !== userId) {
      throw new ForbiddenException('You can only update your own tours.');
    }
    Object.assign(tour, dto);
    if (dto.availableSlots !== undefined) {
      tour.isActive = tour.availableSlots > 0;
    }
    return await this.tourRepo.save(tour);
  }





  async remove(id: number, userId: number) {
    const tour = await this.findOne(id);
    if (tour.tourFirma.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own tours.');
    }
    await this.tourRepo.softRemove(tour);
    return { message: 'Tour deleted successfully (soft deleted)' };
  }





  async restore(id: number, userId: number) {
    const tour = await this.findOne(id);
    if (tour.tourFirma.user.id !== userId) {
      throw new ForbiddenException('You can only restore your own tours.');
    }
    await this.tourRepo.restore(id);
    return this.findOne(id);
  }





  async toggleActive(id: number, isActive: boolean) {
    const tour = await this.findOne(id);
    tour.isActive = isActive;
    await this.tourRepo.save(tour);
    return this.findOne(id);
  }






  async adminUpdateTour(id: number, dto: UpdateTourAdminDto) {
    const tour = await this.findOne(id);
    if (dto.maxPeople !== undefined) {
      if (dto.maxPeople <= 0) {
        throw new BadRequestException('maxPeople must be greater than 0');
      }
      tour.maxPeople = dto.maxPeople;
      if (tour.availableSlots > dto.maxPeople) {
        tour.availableSlots = dto.maxPeople;
      }
    }
    if (dto.availableSlots !== undefined) {
      if (dto.availableSlots > tour.maxPeople) {
        throw new BadRequestException(
          'availableSlots cannot exceed maxPeople');
      }
      tour.availableSlots = dto.availableSlots;
    }
    if (dto.isActive !== undefined) {
      tour.isActive = dto.isActive;
    } else {
      tour.isActive = tour.availableSlots > 0;
    }
    return this.tourRepo.save(tour);
  }
}


