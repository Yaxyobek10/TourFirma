import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CaselinkPackage } from './caselink-package.entity';

export enum PackageBlockType {
  HOTEL = 'hotel',
  FLIGHT = 'flight',
  YOUTUBE = 'youtube',
  GALLERY = 'gallery',
  MAP = 'map',
  DOCUMENT = 'document',
  LINK = 'link',
  INCLUDED = 'included',
  PROGRAM = 'program',
  NOTE = 'note',
  REVIEWS = 'reviews',
}

@Entity('package_blocks')
export class PackageBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: PackageBlockType })
  type: PackageBlockType;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ default: true })
  visibleToClient: boolean;

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {} })
  preview: Record<string, unknown>;

  @ManyToOne(() => CaselinkPackage, (pkg) => pkg.blocks, { onDelete: 'CASCADE' })
  package: CaselinkPackage;
}
