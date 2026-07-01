import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Agency } from '../../agencies/entities/agency.entity';
import { CaselinkPackage } from '../../caselink-packages/entities/caselink-package.entity';
import { TrackingLink } from '../../caselink-packages/entities/tracking-link.entity';
import { User } from '../../users/entities/user.entity';

export enum LeadStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  WON = 'won',
  LOST = 'lost',
}

export enum LeadIntent {
  INQUIRY = 'inquiry',
  BOOKING = 'booking',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ nullable: true })
  source?: string;

  @Column({ type: 'enum', enum: LeadIntent, default: LeadIntent.INQUIRY })
  intent: LeadIntent;

  @Column({ type: 'int', nullable: true })
  pax?: number;

  @Column({ type: 'date', nullable: true })
  preferredDate?: string;

  @Column({ nullable: true })
  preferredContact?: string;

  @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.NEW })
  status: LeadStatus;

  @ManyToOne(() => Agency, (agency) => agency.leads, { eager: true, onDelete: 'CASCADE' })
  agency: Agency;

  @ManyToOne(() => CaselinkPackage, (pkg) => pkg.leads, { eager: true, onDelete: 'CASCADE' })
  package: CaselinkPackage;

  @ManyToOne(() => TrackingLink, { nullable: true, onDelete: 'SET NULL' })
  trackingLink?: TrackingLink;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  assignedTo?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
