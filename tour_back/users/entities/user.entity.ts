import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Tour } from '../../tours/entities/tour.entity';
import { Booking } from 'tour_back/bookings/entities/booking.entity';

export enum UserRole {
  ADMIN = 'admin',
  TOURIST = 'tourist',
  TOURFIRMA = 'tourfirma',
  GUIDE = 'guide',
  RENT_CAR = 'rent_car',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.TOURIST })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Tour, (tour) => tour.tourFirma, { cascade: true })
  tours: Tour[];


  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
