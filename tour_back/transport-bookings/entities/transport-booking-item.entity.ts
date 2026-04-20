import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Transport } from '../../transports/entities/transport.entity';
import { TransportBooking } from './transport-booking.entity';

@Entity('transport_booking_items')
export class TransportBookingItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TransportBooking, booking => booking.items, { onDelete: 'CASCADE' })
  booking: TransportBooking;

  @ManyToOne(() => Transport, { eager: true })
  transport: Transport;

  @Column({ type: 'int' })
  quantity: number; // har bir transportdan nechta olingan

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number; // shu transport uchun hisoblangan narx
}
