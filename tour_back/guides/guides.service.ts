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
  return this.guideRepository.create(Object.assign({
    bio: '',
    schedule: '',
    price: 0,
    rating: 0,
    ratingCount: 0,
  }, data));
}
  
  async create(data: CreateGuideDto & { userId: number }) {
    const guide = this.buildGuideEntity(data);
    return await this.guideRepository.save(guide);
  }


  async createTransactional(
    manager: EntityManager,
    data: CreateGuideDto & { userId: number },
  ) {
    const guide = this.buildGuideEntity(data);
    return await manager.save(guide);
  }
  


  async findAll(filter?: GuideFilterDto) {
    const qb = this.guideRepository.createQueryBuilder('guide')
      .leftJoinAndSelect('guide.user', 'user')
      .where('1=1');
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
    qb.orderBy('guide.createdAt', 'DESC');
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 10;
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    const data = items.map((g) => ({
      ...g,
      price: Number(g.price),
      rating: Number(g.rating),
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

  



  async findOne(id: number) {
    const guide = await this.guideRepository.findOne({
      where: { id },
      relations: ['user'],});
    if (!guide) throw new NotFoundException('Guide not found');
    return {
      ...guide,
      price: Number(guide.price),
      rating: Number(guide.rating),
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
}



