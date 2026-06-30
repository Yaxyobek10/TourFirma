import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency } from './entities/agency.entity';
import { User } from '../users/entities/user.entity';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';

@Injectable()
export class AgenciesService {
  constructor(
    @InjectRepository(Agency)
    private readonly agencyRepo: Repository<Agency>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateAgencyDto, userId: number) {
    const exists = await this.agencyRepo.findOne({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('Agency slug already exists');

    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['agency'] });
    if (!user) throw new NotFoundException('User not found');
    if (user.agency) throw new ConflictException('User already belongs to an agency');

    const agency = this.agencyRepo.create({ ...dto, owner: user });
    const saved = await this.agencyRepo.save(agency);
    user.agency = saved;
    await this.userRepo.save(user);
    return saved;
  }

  async getMine(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['agency'] });
    if (!user?.agency) throw new NotFoundException('Agency not found for current user');
    return this.agencyRepo.findOne({ where: { id: user.agency.id }, relations: ['users'] });
  }

  async updateMine(userId: number, dto: UpdateAgencyDto) {
    const agency = await this.getMine(userId);
    if (!agency) throw new NotFoundException('Agency not found');
    if (dto.slug && dto.slug !== agency.slug) {
      const exists = await this.agencyRepo.findOne({ where: { slug: dto.slug } });
      if (exists) throw new ConflictException('Agency slug already exists');
    }
    Object.assign(agency, dto);
    return this.agencyRepo.save(agency);
  }

  async requireAgency(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['agency'] });
    if (!user?.agency) throw new ForbiddenException('Create or join an agency first');
    return user.agency;
  }
}
