import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaselinkPackage } from './entities/caselink-package.entity';
import { PackageBlock } from './entities/package-block.entity';
import { TrackingLink } from './entities/tracking-link.entity';
import { LinkClick } from './entities/link-click.entity';
import { User } from '../users/entities/user.entity';
import { CaselinkPackagesController } from './caselink-packages.controller';
import { PublicPackagesController } from './public-packages.controller';
import { CaselinkPackagesService } from './caselink-packages.service';

@Module({
  imports: [TypeOrmModule.forFeature([CaselinkPackage, PackageBlock, TrackingLink, LinkClick, User])],
  controllers: [CaselinkPackagesController, PublicPackagesController],
  providers: [CaselinkPackagesService],
  exports: [CaselinkPackagesService],
})
export class CaselinkPackagesModule {}
