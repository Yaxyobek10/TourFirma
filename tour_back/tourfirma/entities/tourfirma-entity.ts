import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tour } from '../../tours/entities/tour.entity';
import { Transport } from '../../transports/entities/transport-entity';

@Entity('tour_firma_profiles')
export class TourFirmaProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  licenseNumber?: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @OneToMany(() => Tour, (tour) => tour.tourFirma, { cascade: true })
  tours: Tour[];

  @OneToMany(() => Transport, (transport) => transport.tourFirma, { cascade: true })
  transports: Transport[];


  @OneToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}




