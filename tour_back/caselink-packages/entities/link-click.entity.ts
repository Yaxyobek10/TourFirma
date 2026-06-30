import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CaselinkPackage } from './caselink-package.entity';
import { TrackingLink } from './tracking-link.entity';

@Entity('link_clicks')
export class LinkClick {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  source?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  ip?: string;

  @Column({ default: false })
  isBot: boolean;

  @ManyToOne(() => CaselinkPackage, (pkg) => pkg.clicks, { onDelete: 'CASCADE' })
  package: CaselinkPackage;

  @ManyToOne(() => TrackingLink, (link) => link.clicks, { nullable: true, onDelete: 'SET NULL' })
  trackingLink?: TrackingLink;

  @CreateDateColumn()
  createdAt: Date;
}
