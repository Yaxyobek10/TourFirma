import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Agency } from '../../agencies/entities/agency.entity';
import { CaselinkPackage } from './caselink-package.entity';
import { LinkClick } from './link-click.entity';

export enum LinkSource {
  INSTAGRAM = 'instagram',
  TELEGRAM = 'telegram',
  FACEBOOK = 'facebook',
  CUSTOM = 'custom',
}

@Entity('tracking_links')
export class TrackingLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: LinkSource, default: LinkSource.CUSTOM })
  source: LinkSource;

  @Column({ nullable: true })
  label?: string;

  @Column({ unique: true, length: 64 })
  token: string;

  @Column({ type: 'int', default: 0 })
  clickCount: number;

  @ManyToOne(() => Agency, { eager: true, onDelete: 'CASCADE' })
  agency: Agency;

  @ManyToOne(() => CaselinkPackage, (pkg) => pkg.trackingLinks, { eager: true, onDelete: 'CASCADE' })
  package: CaselinkPackage;

  @OneToMany(() => LinkClick, (click) => click.trackingLink)
  clicks: LinkClick[];

  @CreateDateColumn()
  createdAt: Date;
}
