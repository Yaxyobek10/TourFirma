import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { GuideReview } from '../../guide-reviews/entities/review.entity';
import { TourFirmaProfile } from '../../tourfirma/entities/tourfirma.entity';
import { TravelMode } from '../../common/enum/travel-mode.enum';
import { PriceType } from '../../common/enum/price-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'guides' })
export class Guide {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true, default: '' })
  bio?: string;

  @Column({
    type: 'decimal',
    precision: 10,  
    scale: 2,
    default: 0,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => (v ? parseFloat(v) : 0),
    },
  })
  price: number;

  @Column({ type: 'text', nullable: true, default: '' })
  schedule?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatarUrl?: string;


  @ApiProperty({ enum: PriceType, default: PriceType.PER_DAY })
  @Column({ type: 'enum', enum: PriceType, default: PriceType.PER_DAY })
  priceType: PriceType;

  @Column({ nullable: true })
  city?: string;

  @Column({ type: 'int', default: 0 })
  experienceYears: number;

  @Column({ type: 'text', array: true, nullable: true })
  languages?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  certifications?: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'jsonb', nullable: true })
  socialLinks?: Record<string, string>;

  @Column({ type: 'date', array: true, nullable: true })
  availableDates?: string[];

  @ManyToOne(() => TourFirmaProfile, (firma) => firma.guides, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  tourFirma?: TourFirmaProfile;

  @Column({ nullable: true })
  tourFirmaId?: number;

  @Column({ type: 'enum', enum: TravelMode, default: TravelMode.WALKING })
  travelMode?: TravelMode;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;



  @OneToMany(() => GuideReview, (review) => review.guide, {
    cascade: ['remove'],
  })
  reviews: GuideReview[];

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => (v ? parseFloat(v) : 0),
    },
  })
  rating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;


  @Column({ type: 'int', default: 0 })
  availableSeats: number

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;


  @Column({ type: 'text', nullable: true })
    description?: string;


  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}






