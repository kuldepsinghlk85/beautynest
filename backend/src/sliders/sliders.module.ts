import { Module } from '@nestjs/common';
import { SliderService } from './slider.service';
import { SlidersController } from './sliders.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [SlidersController],
  providers: [SliderService],
  exports: [SliderService],
})
export class SlidersModule {}
