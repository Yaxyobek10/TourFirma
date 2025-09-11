import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany
} from 'typeorm';
import { TransportBookingItem } from './transport-booking.Item.entity';
import { User } from '../../users/entities/user.entity';
import { TourFirmaProfile } from '../../tourfirma/entities/tourfirma-entity';
import { Transport } from '../../transports/entities/transport-entity';

@Entity('transport_bookings')
export class TransportBooking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pickupLocation: string;

  @Column()
  dropoffLocation: string;

  @Column({ type: 'date' })
  pickupDate: string;

  @Column()
  pickupTime: string;

  @Column({ type: 'date' })
  dropoffDate: string;

  @Column()
  dropoffTime: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  rentalPrice: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  addonPrice: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  vat: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'enum', enum: ['UZS', 'USD', 'EUR'], default: 'USD' })
  currency: string;

  @Column({ type: 'simple-array', nullable: true })
  addons?: string[];

  @OneToMany(() => TransportBookingItem, item => item.booking, { cascade: true, eager: true })
  items: TransportBookingItem[];

  @ManyToOne(() => User, { nullable: false, eager: true })
  user: User;

  @ManyToOne(() => TourFirmaProfile, { nullable: true, eager: true })
  tourFirma: TourFirmaProfile;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
