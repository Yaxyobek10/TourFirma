import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tour } from '../../tours/entities/tour.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { UserRole } from '../../common/enum/user-role.enum';
import { Exclude } from 'class-transformer';
import { Tourist } from '../../tourist-profiles/entities/tourist.entity';
import { Agency } from '../../agencies/entities/agency.entity';


@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Exclude()
  @Column({ select: false, nullable: true })
  password?: string;

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

  @Exclude()
  @Column({ select: false, type: 'text', nullable: true })
  refreshToken?: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Tourist, (tourist) => tourist.user)
  @JoinColumn()
  tourists: Tourist[];
  @ManyToOne(() => Agency, (agency) => agency.users, { nullable: true, onDelete: 'SET NULL' })
  agency?: Agency;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}


