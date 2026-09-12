import { Injectable } from '@nestjs/common';
import { CouponService, CouponUsageRecord } from './coupon.service';
import { PrismaService } from '../common/prisma.service';

export interface CouponAnalyticsSummary {
  totalCouponsCreated: number;
  totalUsed: number;
  remainingUsage: number;
  revenueGenerated: number;
  totalDiscountDistributed: number;
  usageHistory: CouponUsageRecord[];
}

@Injectable()
export class CouponTrackingService {
  private usageHistoryStore: CouponUsageRecord[] = [
    {
      id: 'usg-1',
      couponId: 'cp-1',
      couponCode: 'VARANASI50',
      customerId: 'cust-101',
      customerName: 'Pooja Sharma',
      bookingId: 'BK-69006',
      discountGiven: 50,
      orderValue: 1499,
      usedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'usg-2',
      couponId: 'cp-2',
      couponCode: 'GLOW30',
      customerId: 'cust-102',
      customerName: 'Anjali Srivastava',
      bookingId: 'BK-69008',
      discountGiven: 360,
      orderValue: 1200,
      usedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'usg-3',
      couponId: 'cp-3',
      couponCode: 'BRIDAL1000',
      customerId: 'cust-103',
      customerName: 'Neha Mishra',
      bookingId: 'BK-69010',
      discountGiven: 1000,
      orderValue: 4500,
      usedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'usg-4',
      couponId: 'cp-4',
      couponCode: 'FESTIVE25',
      customerId: 'cust-104',
      customerName: 'Swati Tripathi',
      bookingId: 'BK-69011',
      discountGiven: 225,
      orderValue: 900,
      usedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];

  constructor(
    private prisma: PrismaService,
    private couponService: CouponService,
  ) {}

  async recordUsage(record: {
    couponId: string;
    couponCode: string;
    customerId: string;
    customerName: string;
    bookingId: string;
    discountGiven: number;
    orderValue: number;
  }) {
    const newUsage: CouponUsageRecord = {
      id: `usg-${Date.now()}`,
      couponId: record.couponId,
      couponCode: record.couponCode,
      customerId: record.customerId,
      customerName: record.customerName,
      bookingId: record.bookingId,
      discountGiven: record.discountGiven,
      orderValue: record.orderValue,
      usedAt: new Date().toISOString(),
    };

    this.usageHistoryStore.unshift(newUsage);
    this.couponService.incrementUsage(record.couponCode);
    return newUsage;
  }

  async getAnalytics(): Promise<CouponAnalyticsSummary> {
    const allCoupons = await this.couponService.getAllCoupons();
    const totalCouponsCreated = allCoupons.length;
    const totalUsed = allCoupons.reduce((sum, c) => sum + c.totalUsed, 0);
    const totalMaxLimit = allCoupons.reduce((sum, c) => sum + c.maxUsageLimit, 0);
    const remainingUsage = Math.max(0, totalMaxLimit - totalUsed);

    // Calculated from recorded history + standard multiplier for legacy records
    const historyRevenue = this.usageHistoryStore.reduce((sum, u) => sum + u.orderValue, 0);
    const revenueGenerated = historyRevenue + totalUsed * 1250; // average booking order value
    const totalDiscountDistributed = this.usageHistoryStore.reduce((sum, u) => sum + u.discountGiven, 0);

    return {
      totalCouponsCreated,
      totalUsed,
      remainingUsage,
      revenueGenerated,
      totalDiscountDistributed,
      usageHistory: this.usageHistoryStore,
    };
  }

  async getUsageByCoupon(couponCode: string) {
    return this.usageHistoryStore.filter(
      (u) => u.couponCode.toUpperCase() === couponCode.toUpperCase().trim()
    );
  }
}
