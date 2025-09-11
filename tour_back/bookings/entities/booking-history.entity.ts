import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Booking } from "./booking.entity";

export enum BookingAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  PAYMENT_CREATED = 'PAYMENT_CREATED',
}

@Entity('booking_history')
export class BookingHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column()
  bookingId: number;

  @Column()
  changedBy: number; 

  @Column({ type: 'varchar', nullable: false, default: 'AUTO_CANCELLED' })
  action: string;


  @Column({ type: 'json', nullable: true })
  oldValue: any;

  @Column({ type: 'json', nullable: true })
  newValue: any;

  @CreateDateColumn()
  changedAt: Date;
}
