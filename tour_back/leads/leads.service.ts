import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CaselinkPackage, PackageStatus } from '../caselink-packages/entities/caselink-package.entity';
import { TrackingLink } from '../caselink-packages/entities/tracking-link.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(CaselinkPackage)
    private readonly packageRepo: Repository<CaselinkPackage>,
    @InjectRepository(TrackingLink)
    private readonly trackingLinkRepo: Repository<TrackingLink>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createPublicLead(packageSlug: string, dto: CreateLeadDto) {
    const pkg = await this.packageRepo.findOne({
      where: { slug: packageSlug, status: PackageStatus.PUBLISHED },
      relations: ['agency'],
    });
    if (!pkg) throw new NotFoundException('Published package not found');

    const foundTrackingLink = dto.trackingToken
      ? await this.trackingLinkRepo.findOne({ where: { token: dto.trackingToken } })
      : undefined;
    const trackingLink = foundTrackingLink ?? undefined;

    const lead = this.leadRepo.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      message: dto.message,
      source: dto.source ?? trackingLink?.source,
      trackingLink,
      package: pkg,
      agency: pkg.agency,
      assignedTo: pkg.agent,
    });
    const saved = await this.leadRepo.save(lead);
    pkg.leadCount += 1;
    await this.packageRepo.save(pkg);
    return saved;
  }

  async findMine(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['agency'] });
    if (!user?.agency) throw new ForbiddenException('Create or join an agency first');
    return this.leadRepo.find({
      where: { agency: { id: user.agency.id } },
      relations: ['package', 'assignedTo'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateMine(id: number, dto: UpdateLeadDto, userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['agency'] });
    if (!user?.agency) throw new ForbiddenException('Create or join an agency first');
    const lead = await this.leadRepo.findOne({ where: { id }, relations: ['agency'] });
    if (!lead) throw new NotFoundException('Lead not found');
    if (lead.agency.id !== user.agency.id) throw new ForbiddenException('Lead belongs to another agency');
    Object.assign(lead, dto);
    return this.leadRepo.save(lead);
  }
}

