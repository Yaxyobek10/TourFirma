import { Module } from '@nestjs/common';
import { TourFirmaService } from './tourfirma.service';
import { TourFirmaController } from './tourfirma.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourFirmaProfile } from './entities/tourfirma-entity';




@Module({
  imports: [TypeOrmModule.forFeature([TourFirmaProfile])],
  controllers: [TourFirmaController],
  providers: [TourFirmaService],
  exports: [TourFirmaService],
})
export class TourFirmaModule {}