import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tour } from '../../tours/entities/tour.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { UserRole } from '../../common/enum/user-role.enum';
import { Exclude } from 'class-transformer';
import { Tourist } from '../../tourist-profiles/entities/tourist.entity';


@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;


  @Exclude()
  @Column({ select: false })
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

  @Exclude()
  @Column({ select: false, type: 'text', nullable: true })
  refreshToken?: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Tourist, (tourist) => tourist.user)
  @JoinColumn()
  tourists: Tourist[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
