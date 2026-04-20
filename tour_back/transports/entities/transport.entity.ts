import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Index,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TransportBooking } from '../../transport-bookings/entities/transport-booking.entity';
import { TourFirmaProfile } from '../../tourfirma/entities/tourfirma.entity';
import { TransportBookingItem } from '../../transport-bookings/entities/transport-booking-item.entity';
import { TransportType } from '../../common/enum/transport-type.enum';
import { TransportCategory } from '../../common/enum/transport-category.enum';
import { TransportCurrency } from '../../common/enum/transport-currency.enum';





@Entity('transports')
@Check(`"capacity" > 0`)
export class Transport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'enum', enum: TransportType })
  @Index()
  type: TransportType;

  @Column({ type: 'enum', enum: TransportCategory, nullable: true })
  @Index()
  category?: TransportCategory;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  @Index()
  basePrice: number;

  @Column({
    type: 'enum',
    enum: TransportCurrency,
    default: TransportCurrency.UZS,
  })
  @Index()
  currency: TransportCurrency;

  @Column({ type: 'jsonb', nullable: true })
  specialPrices?: Record<string, number>;

  /** Total available units of this transport */
  @Column({ type: 'int', default: 1 })
  quantity: number;

  /** Optional dynamic field: will be set in service */
  availableQuantity?: number;

  @Column({ type: 'date', array: true, nullable: true })
  @Index()
  availableDates?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  images?: string[];

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', array: true, nullable: true })
  features?: string[];
  

  @Column({ type: 'text', array: true, nullable: true })
  @Index()
  tags?: string[];

  @Column({ type: 'int', default: 1 })
  minRentalDays: number;

  @Column({ type: 'int', nullable: true })
  maxRentalDays?: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  depositAmount?: number;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  
  @OneToMany(() => TransportBookingItem, (item) => item.transport, {
  cascade: true,
   })
  bookingItems: TransportBookingItem[];




  @ManyToOne(() => TourFirmaProfile, (firma) => firma.transports, { onDelete: 'CASCADE' })
  tourFirma: TourFirmaProfile;


  getPriceForDate(date?: string): number {
    if (!date) return Number(this.basePrice);
    return this.specialPrices?.[date] ?? Number(this.basePrice);
  }

  getDiscount(date?: string): number {
    if (!date || !this.specialPrices?.[date]) return 0;
    const base = Number(this.basePrice);
    const special = Number(this.specialPrices[date]);
    return special < base ? Math.round(((base - special) / base) * 100) : 0;
  }

  isDateAvailable(date: string): boolean {
    return !this.availableDates || this.availableDates.includes(date);
  }

  getAvailableDatesInRange(from: string, to: string): string[] {
    if (!this.availableDates?.length) return [];
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return this.availableDates.filter((d) => {
      const current = new Date(d);
      return current >= fromDate && current <= toDate;
    });
  }

  getFormattedPrice(date?: string): string {
    const price = this.getPriceForDate(date);
    return `${price.toLocaleString()} ${this.currency}`;
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
export { TransportCategory, TransportCurrency };

