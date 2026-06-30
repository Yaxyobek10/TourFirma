import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Agency } from '../../agencies/entities/agency.entity';
import { User } from '../../users/entities/user.entity';
import { PackageBlock } from './package-block.entity';
import { TrackingLink } from './tracking-link.entity';
import { LinkClick } from './link-click.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Currency } from '../../common/enum/currency.enum';

export enum PackageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('caselink_packages')
export class CaselinkPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 180 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.UZS })
  currency: Currency;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ nullable: true })
  coverImage?: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ type: 'enum', enum: PackageStatus, default: PackageStatus.DRAFT })
  status: PackageStatus;

  @Column({ type: 'int', default: 0 })
  clickCount: number;

  @Column({ type: 'int', default: 0 })
  leadCount: number;

  @ManyToOne(() => Agency, (agency) => agency.packages, { eager: true, onDelete: 'CASCADE' })
  agency: Agency;

  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: 'SET NULL' })
  agent?: User;

  @OneToMany(() => PackageBlock, (block) => block.package, { cascade: true })
  blocks: PackageBlock[];

  @OneToMany(() => TrackingLink, (link) => link.package)
  trackingLinks: TrackingLink[];

  @OneToMany(() => LinkClick, (click) => click.package)
  clicks: LinkClick[];

  @OneToMany(() => Lead, (lead) => lead.package)
  leads: Lead[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
