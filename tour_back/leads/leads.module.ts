import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './entities/lead.entity';
import { CaselinkPackage } from '../caselink-packages/entities/caselink-package.entity';
import { TrackingLink } from '../caselink-packages/entities/tracking-link.entity';
import { User } from '../users/entities/user.entity';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, CaselinkPackage, TrackingLink, User])],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
