import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  ONLINE = 'online',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}
@Entity('payments')
@Index(['gateway', 'transactionId'], { unique: true }) // gateway + transactionId kombinatsiyasi unique bo'ladi
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Booking, (booking) => booking.id, {
    nullable: false,
    onDelete: 'NO ACTION', // ❗ To'lovlar hech qachon o'chmasligi uchun CASCADE emas
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'UZS' })
  currency: string; // ❗ Multi-currency qo'llab-quvvatlash uchun qo'shildi

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gateway?: string; // payme, click, stripe ...

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionId?: string;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt?: Date; // isRefunded o'rniga faqat status=REFUNDED + refundedAt ishlatamiz

  @Column({ nullable: true })
  createdByUserId?: number; // kim yaratganini saqlash

  @Column({ nullable: true })
  confirmedByUserId?: number; // kim tasdiqlaganini saqlash

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date; // Soft delete qo'shildi
}
