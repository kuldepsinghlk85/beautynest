import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponTrackingService } from './coupon-tracking.service';
import { CouponsController } from './coupons.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [CouponsController],
  providers: [CouponService, CouponTrackingService],
  exports: [CouponService, CouponTrackingService],
})
export class CouponsModule {}
