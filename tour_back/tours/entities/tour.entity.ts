import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { TourFirmaProfile } from '../../tourfirma/entities/tourfirma-entity';
import { TourImage } from '../../config/tour-images/tour-images.entity/tour.image.entity';
import { Booking } from 'tour_back/bookings/entities/booking.entity';

export enum TourCurrency {
  UZS = 'UZS',
  USD = 'USD',
  EUR = 'EUR',
}

@Entity('tours')
export class Tour {
  @PrimaryGeneratedColumn()
  id: number;

  
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'enum', enum: TourCurrency, default: TourCurrency.UZS })
  currency: TourCurrency; // 💰 Pul birligi qo'shildi

  @Column()
  duration: string; // Masalan: "3 days / 2 nights"

  @Column({ type: 'date', nullable: false })
  startDate: Date;

  @Column({ type: 'date', nullable: false })
  endDate: Date;

  @Column('simple-array', { nullable: true })
  services?: string[]; // ["transfer", "hotel", "guide"]

  @Column({ nullable: true })
  coverImage?: string;

  @Column({ type: 'int', default: 0 })
  availableSlots: number;

  @Column({ type: 'int', default: 0 })
  maxPeople: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number; // Keyinchalik reviewlar asosida

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => TourFirmaProfile, (firma) => firma.tours, {
    nullable: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tour_firma_id' })
  tourFirma: TourFirmaProfile;

  @OneToMany(() => Booking, (booking) => booking.tour)
  bookings: Booking[];

  @OneToMany(() => TourImage, (image) => image.tour, { cascade: true })
  images: TourImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
