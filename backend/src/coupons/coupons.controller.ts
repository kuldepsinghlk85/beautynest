import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponTrackingService } from './coupon-tracking.service';

@Controller('coupons')
export class CouponsController {
  constructor(
    private couponService: CouponService,
    private couponTrackingService: CouponTrackingService,
  ) {}

  @Get()
  getAllCoupons() {
    return this.couponService.getAllCoupons();
  }

  @Get('analytics')
  getCouponAnalytics() {
    return this.couponTrackingService.getAnalytics();
  }

  @Get(':code')
  getCouponByCode(@Param('code') code: string) {
    return this.couponService.getCouponByCode(code);
  }

  @Get(':code/usage')
  getUsageByCoupon(@Param('code') code: string) {
    return this.couponTrackingService.getUsageByCoupon(code);
  }

  @Post()
  createCoupon(@Body() body: any) {
    return this.couponService.createCoupon(body);
  }

  @Post('validate')
  validateCoupon(@Body() body: { code: string; orderAmount: number; userId?: string }) {
    return this.couponService.validateAndApply(body.code, body.orderAmount, body.userId);
  }

  @Post('record-usage')
  recordUsage(@Body() body: any) {
    return this.couponTrackingService.recordUsage(body);
  }

  @Put(':id')
  updateCoupon(@Param('id') id: string, @Body() body: any) {
    return this.couponService.updateCoupon(id, body);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.couponService.toggleActive(id);
  }

  @Delete(':id')
  deleteCoupon(@Param('id') id: string) {
    return this.couponService.deleteCoupon(id);
  }
}
