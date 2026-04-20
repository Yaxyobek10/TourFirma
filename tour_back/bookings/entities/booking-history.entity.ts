import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Booking } from "./booking.entity";

@Entity('booking_history')
export class BookingHistory {
  @PrimaryGeneratedColumn()
  id: number;


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
