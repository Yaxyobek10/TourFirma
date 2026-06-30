import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CaselinkPackage } from '../../caselink-packages/entities/caselink-package.entity';
import { Lead } from '../../leads/entities/lead.entity';

export enum AgencyPlan {
  FREE = 'free',
  PRO = 'pro',
  BUSINESS = 'business',
}

@Entity('agencies')
export class Agency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 160 })
  name: string;

  @Column({ unique: true, length: 80 })
  slug: string;

  @Column({ nullable: true })
  logoUrl?: string;

  @Column({ nullable: true })
  accentColor?: string;

  @Column({ nullable: true })
  contactPhone?: string;

  @Column({ nullable: true })
  contactTelegram?: string;

  @Column({ nullable: true })
  customDomain?: string;

  @Column({ type: 'enum', enum: AgencyPlan, default: AgencyPlan.FREE })
  plan: AgencyPlan;

  @Column({ type: 'int', default: 1 })
  agentLimit: number;

  @Column({ type: 'int', default: 10 })
  packageLimit: number;

  @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
  owner?: User;

  @OneToMany(() => User, (user) => user.agency)
  users: User[];

  @OneToMany(() => CaselinkPackage, (pkg) => pkg.agency)
  packages: CaselinkPackage[];

  @OneToMany(() => Lead, (lead) => lead.agency)
  leads: Lead[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
