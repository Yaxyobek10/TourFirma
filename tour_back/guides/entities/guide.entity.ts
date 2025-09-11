import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { GuideReview } from '../../guide-reviews/entities/review.entity';

@Entity({ name: 'guides' })
export class Guide {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true, default: '' })
  bio: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => (v ? parseFloat(v) : 0),
    },
  })
  price: number;

  @Column({ type: 'text', nullable: true, default: '' })
  schedule: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => GuideReview, (review) => review.guide, {
    cascade: ['remove'],
  })
  reviews: GuideReview[];

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    nullable: false,
    transformer: {
      to: (v: number) => v,
      from: (v: string) => (v ? parseFloat(v) : 0),
    },
  })
  rating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;
}

