import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Guide } from '../../guides/entities/guide.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'guide_reviews' })
export class GuideReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', width: 1 })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ManyToOne(() => Guide, (guide) => guide.reviews, { onDelete: 'CASCADE' })
  guide: Guide;

  @Column()
  guideId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
