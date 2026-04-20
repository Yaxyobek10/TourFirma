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
import { TourFirmaProfile } from '../../tourfirma/entities/tourfirma.entity';
import { TourImage } from '../../config/tour-images/entities/tour-image.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Currency } from '../../common/enum/currency.enum';
import { TourType } from '../../common/enum/tour-type.enum';
import { TourReview } from '../../tour-reviews/entity/tour-review.entity';


@Entity('tours')
export class Tour {
  @PrimaryGeneratedColumn()
  id: number;


  
  @Column({ length: 255 })
  title: string;

  @Column({ length: 100, nullable: true })
  fromLocation: string;

  @Column({ length: 100, nullable: true })
  toLocation: string;


  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.UZS })
  currency: Currency; 

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


  @Column({ type: 'enum', enum: TourType, default: TourType.ECO, nullable: false})
  tourType: TourType;


  @OneToMany(() => TourReview, (review) => review.tour)
  reviews: TourReview[];


  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number; 


  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  totalRating: number;


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


