import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Tour } from '../../tours/entities/tour.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tour_reviews')
export class TourReview {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tour, (tour) => tour.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tour_id' })
  tour: Tour;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number; 

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;
}
