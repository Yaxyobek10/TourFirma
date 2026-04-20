import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tourist } from './entities/tourist.entity';
import { TouristsService } from './tourist.service';
import { TouristsController } from './tourist.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tourist])],
  controllers: [TouristsController],
  providers: [TouristsService],
  exports: [TouristsService], 
})
export class TouristsModule {}
