import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Tourist } from './entities/tourist.entity';
import { UpdateTouristDto } from './dto/update-tourist.dto';

@Injectable()
export class TouristsService {
  constructor(
    @InjectRepository(Tourist)
    private readonly touristRepository: Repository<Tourist>,
  ) {}

  buildTouristEntity(data: {
    name: string;
    phone?: string;
    avatarUrl?: string;
    userId: number;
  }): Tourist {
    if (!data.userId) throw new BadRequestException('userId is required');
    if (!data.name) throw new BadRequestException('name is required');

    return this.touristRepository.create({
      name: data.name,
      phone: data.phone ?? '',
      avatarUrl: data.avatarUrl ?? '',
      user: { id: data.userId } as any,
    });
  }

  async createTransactional(manager: EntityManager, data: Tourist) {
    return await manager.save(data);
  }




  async findAll(search?: string, page = 1, limit = 10) {
    const query = this.touristRepository
      .createQueryBuilder('tourist')
      .leftJoinAndSelect('tourist.user', 'user')
      .select([
        'tourist.id',
        'tourist.name',
        'tourist.phone',
        'tourist.avatarUrl',
        'tourist.createdAt',
        'user.id',
        'user.name',
        'user.email',
        'user.role',
      ])
      .orderBy('tourist.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (search && search.trim() !== '') {
      query.andWhere(
        '(tourist.name ILIKE :search OR tourist.phone ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` });
    }
    const [data, total] = await query.getManyAndCount();
    return {
      data,
      total,
      page,
      limit,
    };
  }



  async findByUserId(userId: number): Promise<Tourist> {
    const tourist = await this.touristRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!tourist) throw new NotFoundException('Tourist profile not found');
    return tourist;
  }



  async update(userId: number, data: UpdateTouristDto): Promise<Tourist> {
    const tourist = await this.touristRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!tourist) throw new NotFoundException('Tourist profile not found');
    Object.assign(tourist, data);
    return await this.touristRepository.save(tourist);
  }



  async removeByUserId(userId: number): Promise<void> {
    const tourist = await this.touristRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!tourist) throw new NotFoundException('Tourist profile not found');
    await this.touristRepository.remove(tourist);
  }
}
