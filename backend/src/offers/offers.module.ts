import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OffersController } from './offers.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [OffersController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OffersModule {}
