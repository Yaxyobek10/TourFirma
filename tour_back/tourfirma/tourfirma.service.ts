import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourFirmaProfile } from './entities/tourfirma.entity';
import { CreateTourFirmaDto } from './dto/create-tourfirma.dto';
import { UpdateTourFirmaDto } from './dto/update-tourfirma.dto';
import { getPagination } from '../common/utils/pagination.util';
import { buildFilters } from '../common/utils/query-filter.util';

@Injectable()
export class TourFirmaService {
  constructor(
    @InjectRepository(TourFirmaProfile)
    private readonly profileRepo: Repository<TourFirmaProfile>,
  ) {}


  
  
async findAll(query: any) {
  const { skip, take, page, limit } = getPagination(query);
  const filters = buildFilters(query);
  const qb = this.profileRepo.createQueryBuilder('profile')
    .leftJoin('profile.user', 'user') 
    .addSelect(['user.id', 'user.email', 'user.name'])
    .skip(skip)
    .take(take)
    .orderBy('profile.createdAt', 'DESC');
  if (filters.isVerified !== undefined) {
    qb.andWhere('profile.isVerified = :isVerified', { isVerified: filters.isVerified });
  }
  if (filters.companyName) {
    qb.andWhere('LOWER(profile.companyName) LIKE :companyName', {
      companyName: `%${filters.companyName.toLowerCase()}%`,
    });
  }
  const [data, total] = await qb.getManyAndCount();
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}








  async getByUserId(userId: number) {
    const profile = await this.profileRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new NotFoundException('Tour firma profile not found');
    return profile;
  }

  async createProfile(dto: CreateTourFirmaDto, userId: number) {
    const exists = await this.profileRepo.findOne({ where: { user: { id: userId } } });
    if (exists) throw new ForbiddenException('You already have a profile');
    const profile = this.profileRepo.create({
      ...dto,
      user: { id: userId },
    });
    return this.profileRepo.save(profile);
  }

  async updateProfile(dto: UpdateTourFirmaDto, userId: number) {
    const profile = await this.getByUserId(userId);
    Object.assign(profile, dto);
    return this.profileRepo.save(profile);
  }

  async verifyProfile(id: number) {
    const profile = await this.profileRepo.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Profile not found');
    profile.isVerified = true;
    profile.rejectionReason = undefined;
    return this.profileRepo.save(profile);
  }

  async rejectProfile(id: number, reason: string) {
    const profile = await this.profileRepo.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Profile not found');
    profile.isVerified = false;
    profile.rejectionReason = reason;
    return this.profileRepo.save(profile);
  }
}




