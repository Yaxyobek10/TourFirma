import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency } from '../agencies/entities/agency.entity';
import { User } from '../users/entities/user.entity';
import { CaselinkPackage, PackageStatus } from './entities/caselink-package.entity';
import { PackageBlock } from './entities/package-block.entity';
import { LinkClick } from './entities/link-click.entity';
import { TrackingLink } from './entities/tracking-link.entity';
import { CreateCaselinkPackageDto } from './dto/create-caselink-package.dto';
import { UpdateCaselinkPackageDto } from './dto/update-caselink-package.dto';
import { CreatePackageBlockDto } from './dto/create-package-block.dto';
import { UpdatePackageBlockDto } from './dto/update-package-block.dto';
import { CreateTrackingLinkDto } from './dto/create-tracking-link.dto';

@Injectable()
export class CaselinkPackagesService {
  constructor(
    @InjectRepository(CaselinkPackage)
    private readonly packageRepo: Repository<CaselinkPackage>,
    @InjectRepository(PackageBlock)
    private readonly blockRepo: Repository<PackageBlock>,
    @InjectRepository(TrackingLink)
    private readonly trackingLinkRepo: Repository<TrackingLink>,
    @InjectRepository(LinkClick)
    private readonly clickRepo: Repository<LinkClick>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateCaselinkPackageDto, userId: number) {
    const user = await this.getUserWithAgency(userId);
    const agency = user.agency;
    const packageCount = await this.packageRepo.count({ where: { agency: { id: agency.id } } });
    if (packageCount >= agency.packageLimit) {
      throw new ForbiddenException('Package limit reached for current agency plan');
    }

    const slug = dto.slug ?? this.slugify(dto.title);
    await this.ensureSlugAvailable(slug);
    const pkg = this.packageRepo.create({
      ...dto,
      slug,
      agency,
      agent: user,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
    return this.packageRepo.save(pkg);
  }

  async findAll(userId: number) {
    const user = await this.getUserWithAgency(userId);
    return this.packageRepo.find({
      where: { agency: { id: user.agency.id } },
      relations: ['blocks', 'trackingLinks'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number) {
    const user = await this.getUserWithAgency(userId);
    const pkg = await this.packageRepo.findOne({
      where: { id },
      relations: ['blocks', 'trackingLinks'],
      order: { blocks: { order: 'ASC' } },
    });
    if (!pkg) throw new NotFoundException('Package not found');
    this.assertSameAgency(pkg.agency.id, user.agency.id);
    return pkg;
  }

  async update(id: number, dto: UpdateCaselinkPackageDto, userId: number) {
    const pkg = await this.findOne(id, userId);
    if (dto.slug && dto.slug !== pkg.slug) await this.ensureSlugAvailable(dto.slug);
    Object.assign(pkg, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : pkg.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : pkg.endDate,
    });
    return this.packageRepo.save(pkg);
  }

  async publish(id: number, userId: number) {
    const pkg = await this.findOne(id, userId);
    if (!pkg.blocks?.length) throw new BadRequestException('Add at least one block before publishing');
    pkg.status = PackageStatus.PUBLISHED;
    return this.packageRepo.save(pkg);
  }

  async addBlock(packageId: number, dto: CreatePackageBlockDto, userId: number) {
    const pkg = await this.findOne(packageId, userId);
    const order = dto.order ?? (pkg.blocks?.length ?? 0) + 1;
    const block = this.blockRepo.create({
      ...dto,
      order,
      visibleToClient: dto.visibleToClient ?? true,
      preview: dto.preview ?? {},
      package: pkg,
    });
    return this.blockRepo.save(block);
  }

  async updateBlock(packageId: number, blockId: number, dto: UpdatePackageBlockDto, userId: number) {
    const pkg = await this.findOne(packageId, userId);
    const block = await this.blockRepo.findOne({ where: { id: blockId }, relations: ['package'] });
    if (!block || block.package.id !== pkg.id) throw new NotFoundException('Block not found');
    Object.assign(block, dto);
    return this.blockRepo.save(block);
  }

  async removeBlock(packageId: number, blockId: number, userId: number) {
    const pkg = await this.findOne(packageId, userId);
    const block = await this.blockRepo.findOne({ where: { id: blockId }, relations: ['package'] });
    if (!block || block.package.id !== pkg.id) throw new NotFoundException('Block not found');
    await this.blockRepo.remove(block);
    return { deleted: true };
  }

  async createTrackingLink(packageId: number, dto: CreateTrackingLinkDto, userId: number) {
    const pkg = await this.findOne(packageId, userId);
    const token = await this.createUniqueToken(pkg.slug, dto.source);
    const link = this.trackingLinkRepo.create({
      ...dto,
      token,
      agency: pkg.agency,
      package: pkg,
    });
    return this.trackingLinkRepo.save(link);
  }

  async getPublicPackage(slug: string) {
    const pkg = await this.packageRepo.findOne({
      where: { slug, status: PackageStatus.PUBLISHED },
      relations: ['blocks'],
      order: { blocks: { order: 'ASC' } },
    });
    if (!pkg) throw new NotFoundException('Published package not found');
    return {
      ...pkg,
      blocks: pkg.blocks.filter((block) => block.visibleToClient),
    };
  }

  async recordClickBySlug(slug: string, source: string | undefined, userAgent: string | undefined, ip: string | undefined) {
    const pkg = await this.packageRepo.findOne({ where: { slug, status: PackageStatus.PUBLISHED } });
    if (!pkg) throw new NotFoundException('Published package not found');
    return this.recordClick(pkg, undefined, source, userAgent, ip);
  }

  async recordClickByToken(token: string, userAgent: string | undefined, ip: string | undefined) {
    const link = await this.trackingLinkRepo.findOne({ where: { token }, relations: ['package'] });
    if (!link) throw new NotFoundException('Tracking link not found');
    return this.recordClick(link.package, link, link.source, userAgent, ip);
  }

  private async recordClick(
    pkg: CaselinkPackage,
    link: TrackingLink | undefined,
    source: string | undefined,
    userAgent: string | undefined,
    ip: string | undefined,
  ) {
    const isBot = this.isSocialBot(userAgent);
    const click = this.clickRepo.create({ package: pkg, trackingLink: link, source, userAgent, ip, isBot });
    await this.clickRepo.save(click);
    if (!isBot) {
      pkg.clickCount += 1;
      await this.packageRepo.save(pkg);
      if (link) {
        link.clickCount += 1;
        await this.trackingLinkRepo.save(link);
      }
    }
    return { packageSlug: pkg.slug, source, isBot };
  }

  private async getUserWithAgency(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['agency'] });
    if (!user?.agency) throw new ForbiddenException('Create or join an agency first');
    return user as User & { agency: Agency };
  }

  private assertSameAgency(packageAgencyId: number, userAgencyId: number) {
    if (packageAgencyId !== userAgencyId) throw new ForbiddenException('Package belongs to another agency');
  }

  private async ensureSlugAvailable(slug: string) {
    const exists = await this.packageRepo.findOne({ where: { slug } });
    if (exists) throw new BadRequestException('Package slug already exists');
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 90);
  }

  private async createUniqueToken(slug: string, source: string) {
    const base = `${slug}-${source}`.slice(0, 48);
    let token = base;
    let index = 1;
    while (await this.trackingLinkRepo.findOne({ where: { token } })) {
      token = `${base}-${index++}`;
    }
    return token;
  }

  private isSocialBot(userAgent?: string) {
    if (!userAgent) return false;
    return /facebookexternalhit|TelegramBot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|Discordbot/i.test(userAgent);
  }
}
