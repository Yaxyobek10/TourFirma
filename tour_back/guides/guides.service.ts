import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Guide } from './entities/guide.entity';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { GuideFilterDto } from './dto/filter.dto';

@Injectable()
export class GuidesService {
  constructor(
    @InjectRepository(Guide)
    private readonly guideRepository: Repository<Guide>,
    private readonly dataSource: DataSource,
  ) {}

buildGuideEntity(data: CreateGuideDto & { userId: number }) {
  if (!data.userId) throw new BadRequestException('userId is required');
  if (data.availableSeats !== undefined && data.availableSeats < 0) {
    throw new BadRequestException('availableSeats cannot be negative');
  }
  return this.guideRepository.create({
    bio: '',
    schedule: '',
    rating: 0,
    ratingCount: 0,
    availableSeats: data.availableSeats ?? 0, 
    ...data,
    user: { id: data.userId } as any,
    tourFirma: data.tourFirmaId ? ({ id: data.tourFirmaId } as any) : null,
  });
}



  
  



  async createTransactional(
    manager: EntityManager,
    data: CreateGuideDto & { userId: number }) {
    const guide = this.buildGuideEntity(data);
    return await manager.save(guide);
  }






async findAll(filter?: GuideFilterDto) {
  const qb = this.guideRepository
    .createQueryBuilder('guide')
    .leftJoinAndSelect('guide.user', 'user')
    .leftJoinAndSelect('guide.tourFirma', 'firma')
    .where('1=1');

  // 🔹 Filterlar
  if (filter?.q) {
    qb.andWhere('LOWER(guide.name) LIKE :q', { q: `%${filter.q.toLowerCase()}%` });
  }
  if (filter?.city) {
    qb.andWhere('LOWER(guide.city) LIKE :city', { city: `%${filter.city.toLowerCase()}%` });
  }
  if (filter?.languages?.length) {
    qb.andWhere('guide.languages && :langs', { langs: filter.languages });
  }
  if (filter?.minPrice) {
    qb.andWhere('guide.price >= :minPrice', { minPrice: filter.minPrice });
  }
  if (filter?.maxPrice) {
    qb.andWhere('guide.price <= :maxPrice', { maxPrice: filter.maxPrice });
  }
  if (filter?.minRating) {
    qb.andWhere('guide.rating >= :minRating', { minRating: filter.minRating });
  }

  // 🔹 Sortlash
  if (filter?.sortBy === 'rating') {
    qb.orderBy('guide.rating', 'DESC')
      .addOrderBy('guide.createdAt', 'DESC'); // reyting teng bo'lsa yangi qo'shilgan birinchi
  } else if (filter?.sortBy === 'experience') {
    qb.orderBy('guide.experienceYears', 'DESC')
      .addOrderBy('guide.createdAt', 'DESC');
  } else {
    qb.orderBy('guide.createdAt', 'DESC'); // default
  }

  // 🔹 Pagination
  const page = filter?.page ?? 1;
  const limit = filter?.limit ?? 10;
  qb.skip((page - 1) * limit).take(limit);

  const [items, total] = await qb.getManyAndCount();

  // 🔹 Foydalanuvchiga yuboriladigan xavfsiz ma'lumot
  const safeData = items.map((g) => ({
    id: g.id,
    name: g.name,
    city: g.city,
    avatarUrl: g.avatarUrl,
    bio: g.bio,
    price: Number(g.price),
    rating: Number(g.rating),
    experienceYears: g.experienceYears,
    languages: g.languages,
    travelMode: g.travelMode,
    availableSeats: g.availableSeats,
    priceType: g.priceType,
  }));

  return {
    data: safeData,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}












async findOne(id: number) {
  const guide = await this.guideRepository.findOne({
    where: { id },
    relations: ['user', 'tourFirma'],
  });
  if (!guide) throw new NotFoundException('Guide not found');
  return {
    id: guide.id,
    name: guide.name,
    city: guide.city,
    bio: guide.bio,
    avatarUrl: guide.avatarUrl,
    price: Number(guide.price),
    rating: Number(guide.rating),
    experienceYears: guide.experienceYears,
    languages: guide.languages,
    travelMode: guide.travelMode,
    availableSeats: guide.availableSeats,
    priceType: guide.priceType,
    tourFirma: guide.tourFirma
      ? { id: guide.tourFirma.id, name: guide.tourFirma.companyName }
      : undefined,
  };
}





  async update(id: number, data: UpdateGuideDto) {
    const guide = await this.findOne(id);
    Object.assign(guide, data);
    return await this.guideRepository.save(guide);
  }





  async remove(id: number) {
    const guide = await this.findOne(id);
    return await this.guideRepository.softRemove(guide);
  }




  async restore(id: number) {
    const res = await this.guideRepository.restore(id);
    if (!res.affected) throw new NotFoundException('Guide not found');
    return this.findOne(id);
  }





  async decreaseSeats(guideId: number, count: number) {
    const guide = await this.guideRepository.findOne({ where: { id: guideId } });
    if (!guide) throw new NotFoundException('Guide not found');

    if (guide.availableSeats < count) {
      throw new BadRequestException('Not enough seats available');
    }
    guide.availableSeats -= count;
    await this.guideRepository.save(guide);
    return guide;
  }

  




  async increaseSeats(guideId: number, count: number) {
    const guide = await this.guideRepository.findOne({ where: { id: guideId } });
    if (!guide) throw new NotFoundException('Guide not found');

    guide.availableSeats += count;
    await this.guideRepository.save(guide);

    return guide;
  }
}



  
