import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Guide } from '../../guides/entities/guide.entity';
import { User } from '../../users/entities/user.entity';
import { BookingStatus } from '../../common/enum/booking-status.enum';

@Entity({ name: 'guide_bookings' })
export class GuideBooking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Guide, { onDelete: 'CASCADE' })
  guide: Guide;

  @Column()
  guideId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  tourist: User;

  @Column()
  touristId: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'int', default: 1 })
  numberOfPeople: number;


  @Column({ nullable: true })
  touristName: string;

  @Column({ nullable: true })
  touristEmail: string;

  @Column({ nullable: true })
  touristPhone: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platformShare: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  guideShare: number;


  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
