import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Tour } from '../../../tours/entities/tour.entity';

@Entity('tour_images')
export class TourImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tour, (tour) => tour.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tour_id' })
  tour: Tour;

  @Column()
  url: string;

  @Column({ default: false })
  isMain: boolean;

  @Column({ type: 'int', nullable: true })
  order?: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;




}


