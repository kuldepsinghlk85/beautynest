import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface CouponItem {
  id: string;
  code: string;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  minBookingValue: number;
  maxUsageLimit: number;
  perUserUsageLimit: number;
  expiryDate: string;
  applicableCategory?: string;
  applicableServices?: string[];
  applicablePackages?: string[];
  description: string;
  totalUsed: number;
  isActive: boolean;
  createdAt: string;
}

export interface CouponUsageRecord {
  id: string;
  couponId: string;
  couponCode: string;
  customerId: string;
  customerName: string;
  bookingId: string;
  discountGiven: number;
  orderValue: number;
  usedAt: string;
}

@Injectable()
export class CouponService {
  private couponsStore: CouponItem[] = [
    {
      id: 'cp-1',
      code: 'VARANASI50',
      discountType: 'FIXED',
      discountValue: 50,
      minBookingValue: 499,
      maxUsageLimit: 1000,
      perUserUsageLimit: 2,
      expiryDate: '2026-12-31',
      applicableCategory: 'All Services',
      description: 'Special doorstep discount for all Varanasi female residents.',
      totalUsed: 642,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'cp-2',
      code: 'GLOW30',
      discountType: 'PERCENTAGE',
      discountValue: 30,
      minBookingValue: 899,
      maxUsageLimit: 800,
      perUserUsageLimit: 1,
      expiryDate: '2026-11-30',
      applicableCategory: 'Facial & Cleanup',
      description: '30% discount on all Facials, Cleanups and Skin Rituals.',
      totalUsed: 428,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'cp-3',
      code: 'BRIDAL1000',
      discountType: 'FIXED',
      discountValue: 1000,
      minBookingValue: 2499,
      maxUsageLimit: 500,
      perUserUsageLimit: 1,
      expiryDate: '2026-12-31',
      applicableCategory: 'Bridal & Packages',
      description: 'Grand festive & pre-wedding discount on all Bridal & Pre-Bridal packages.',
      totalUsed: 185,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'cp-4',
      code: 'FESTIVE25',
      discountType: 'PERCENTAGE',
      discountValue: 25,
      minBookingValue: 799,
      maxUsageLimit: 600,
      perUserUsageLimit: 2,
      expiryDate: '2026-10-31',
      applicableCategory: 'All Services',
      description: 'Kashi festive season pamper coupon for hair spa, waxing & mani-pedi.',
      totalUsed: 290,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  constructor(private prisma: PrismaService) {}

  async getAllCoupons() {
    return this.couponsStore;
  }

  async getCouponByCode(code: string) {
    const coupon = this.couponsStore.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
    if (!coupon) throw new NotFoundException(`Coupon with code ${code} not found`);
    return coupon;
  }

  async createCoupon(data: {
    code: string;
    discountType: 'FIXED' | 'PERCENTAGE';
    discountValue: number;
    minBookingValue?: number;
    maxUsageLimit?: number;
    perUserUsageLimit?: number;
    expiryDate: string;
    applicableCategory?: string;
    applicableServices?: string[];
    applicablePackages?: string[];
    description?: string;
  }) {
    const existing = this.couponsStore.find((c) => c.code.toUpperCase() === data.code.toUpperCase().trim());
    if (existing) throw new BadRequestException(`Coupon code '${data.code}' already exists`);

    const newCoupon: CouponItem = {
      id: `cp-${Date.now()}`,
      code: data.code.toUpperCase().trim(),
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      minBookingValue: data.minBookingValue ? Number(data.minBookingValue) : 499,
      maxUsageLimit: data.maxUsageLimit ? Number(data.maxUsageLimit) : 500,
      perUserUsageLimit: data.perUserUsageLimit ? Number(data.perUserUsageLimit) : 1,
      expiryDate: data.expiryDate,
      applicableCategory: data.applicableCategory || 'All Services',
      applicableServices: data.applicableServices || [],
      applicablePackages: data.applicablePackages || [],
      description: data.description || `Special discount code ${data.code}`,
      totalUsed: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.couponsStore.unshift(newCoupon);
    return newCoupon;
  }

  async updateCoupon(id: string, data: Partial<CouponItem>) {
    const index = this.couponsStore.findIndex((c) => c.id === id);
    if (index === -1) throw new NotFoundException(`Coupon with ID ${id} not found`);

    this.couponsStore[index] = {
      ...this.couponsStore[index],
      ...data,
      code: data.code ? data.code.toUpperCase().trim() : this.couponsStore[index].code,
      discountValue: data.discountValue !== undefined ? Number(data.discountValue) : this.couponsStore[index].discountValue,
      minBookingValue: data.minBookingValue !== undefined ? Number(data.minBookingValue) : this.couponsStore[index].minBookingValue,
    };
    return this.couponsStore[index];
  }

  async toggleActive(id: string) {
    const coupon = this.couponsStore.find((c) => c.id === id);
    if (!coupon) throw new NotFoundException(`Coupon with ID ${id} not found`);
    coupon.isActive = !coupon.isActive;
    return coupon;
  }

  async deleteCoupon(id: string) {
    const index = this.couponsStore.findIndex((c) => c.id === id);
    if (index === -1) throw new NotFoundException(`Coupon with ID ${id} not found`);
    const deleted = this.couponsStore.splice(index, 1);
    return { success: true, message: `Coupon ${id} deleted`, deleted: deleted[0] };
  }

  async validateAndApply(code: string, orderAmount: number, userId?: string) {
    const coupon = this.couponsStore.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Coupon code is invalid or inactive');
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      throw new BadRequestException('Coupon code has expired');
    }

    if (coupon.totalUsed >= coupon.maxUsageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (orderAmount < coupon.minBookingValue) {
      throw new BadRequestException(`Minimum booking value for '${coupon.code}' is ₹${coupon.minBookingValue}`);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round(orderAmount * (coupon.discountValue / 100));
    } else {
      discountAmount = Math.min(coupon.discountValue, orderAmount);
    }

    return {
      valid: true,
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount),
    };
  }

  incrementUsage(code: string) {
    const coupon = this.couponsStore.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
    if (coupon) {
      coupon.totalUsed += 1;
    }
  }
}
