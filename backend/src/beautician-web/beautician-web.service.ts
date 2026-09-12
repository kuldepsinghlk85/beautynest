import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface BeauticianWebOrderData {
  id: string;
  orderNumber: string;
  beauticianId: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  customerLocation: string;
  customerLat: number;
  customerLng: number;
  distanceKm: number;
  status: 'NEW' | 'ACCEPTED' | 'REJECTED' | 'NAVIGATING' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';
  orderAmount: number;
  estimatedDurationMin: number;
  beauticianCommission: number;
  startOtp: string;
  createdAt: string;
}

@Injectable()
export class BeauticianWebService {
  // Pre-seeded demo orders for Varanasi salon workers
  private ordersStore: BeauticianWebOrderData[] = [
    {
      id: 'ord-101',
      orderNumber: 'BK-69006',
      beauticianId: 'worker-1',
      customerName: 'Pooja Sharma',
      customerPhone: '+91 98765 43210',
      serviceName: 'O3+ Bridal Glow & Radiance Oxygenating Facial',
      bookingDate: 'Today, 12 Sep 2026',
      bookingTime: '03:30 PM',
      customerLocation: 'Flat 302, 3rd Floor, Anand Nagar Colony, Lane 3, Opposite Sigra Stadium, Varanasi - 221010',
      customerLat: 25.3176,
      customerLng: 82.9739,
      distanceKm: 2.4,
      status: 'ACCEPTED',
      orderAmount: 1899,
      estimatedDurationMin: 75,
      beauticianCommission: 570,
      startOtp: '1234',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ord-102',
      orderNumber: 'BK-69012',
      beauticianId: 'worker-1',
      customerName: 'Ritu Verma',
      customerPhone: '+91 98765 11223',
      serviceName: 'Italian Rica Cartridge Waxing & Foot Reflexology',
      bookingDate: 'Today, 12 Sep 2026',
      bookingTime: '05:45 PM',
      customerLocation: 'House 14B, Dumraon Colony, Near Assi Ghat Crossing, Varanasi - 221005',
      customerLat: 25.2899,
      customerLng: 82.9996,
      distanceKm: 4.2,
      status: 'NEW',
      orderAmount: 1499,
      estimatedDurationMin: 60,
      beauticianCommission: 450,
      startOtp: '5678',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ord-103',
      orderNumber: 'BK-69015',
      beauticianId: 'worker-1',
      customerName: 'Ananya Gupta',
      customerPhone: '+91 98765 99887',
      serviceName: 'Korean Glass Skin Ritual & Scalp Spa',
      bookingDate: 'Tomorrow, 13 Sep 2026',
      bookingTime: '11:00 AM',
      customerLocation: 'B-42/1, Ravindrapuri Extension, Near Sankat Mochan, Varanasi - 221005',
      customerLat: 25.2954,
      customerLng: 82.9892,
      distanceKm: 3.1,
      status: 'NEW',
      orderAmount: 2199,
      estimatedDurationMin: 90,
      beauticianCommission: 660,
      startOtp: '4321',
      createdAt: new Date().toISOString(),
    },
  ];

  constructor(private prisma: PrismaService) {}

  // 1. Phone + OTP Login
  async sendOtp(phone: string) {
    if (!phone || phone.length < 10) {
      throw new BadRequestException('Please provide a valid 10-digit mobile number');
    }
    return {
      success: true,
      message: 'OTP sent to mobile number',
      demoOtp: '1234',
      phone,
    };
  }

  async verifyOtp(phone: string, otp: string) {
    if (otp !== '1234' && otp !== '0000') {
      throw new BadRequestException('Invalid OTP. Please enter 1234 for demo login.');
    }

    return {
      success: true,
      token: `b-token-${Date.now()}`,
      beautician: {
        id: 'worker-1',
        fullName: 'Ananya Sharma',
        phone,
        rating: 4.9,
        tier: 'GOLD',
        commissionRate: '30%',
        city: 'Varanasi',
        hub: 'Sigra',
      },
    };
  }

  // 2. Dashboard Aggregations
  async getDashboard(beauticianId: string) {
    const todayOrders = this.ordersStore.filter((o) => o.bookingDate.includes('Today'));
    const upcomingOrders = this.ordersStore.filter((o) => o.status === 'NEW' || o.status === 'ACCEPTED');
    const completedOrders = this.ordersStore.filter((o) => o.status === 'COMPLETED');

    const totalEarningsToday = todayOrders.reduce((sum, o) => sum + o.beauticianCommission, 0);

    const notifications = [
      { id: 'notif-1', title: 'New Service Assigned', message: 'Order #BK-69012 received near Assi Ghat.', time: '10m ago', unread: true },
      { id: 'notif-2', title: 'Payment Credited', message: '₹570 credited for completed ritual.', time: '1h ago', unread: false },
      { id: 'notif-3', title: 'Safety Protocol Reminder', message: 'Ensure sterile disposable kit is used.', time: '3h ago', unread: false },
    ];

    return {
      todayCount: todayOrders.length,
      upcomingCount: upcomingOrders.length,
      completedCount: completedOrders.length + 18, // seeded lifetime + dynamic
      earningsToday: totalEarningsToday + 1250,
      totalEarningsMonth: 38400,
      notifications,
      activeOrders: this.ordersStore,
    };
  }

  // 3. Service Order Actions: Accept, Reject
  async acceptOrder(orderId: string) {
    const order = this.ordersStore.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    order.status = 'ACCEPTED';
    return { success: true, message: `Order ${order.orderNumber} accepted`, order };
  }

  async rejectOrder(orderId: string, reason?: string) {
    const order = this.ordersStore.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    order.status = 'REJECTED';
    return { success: true, message: `Order ${order.orderNumber} rejected (${reason || 'Beautician unavailable'})`, order };
  }

  // 4. Beautician Service 8-Step Flow: State Transition
  async updateServiceStatus(orderId: string, status: BeauticianWebOrderData['status'], otp?: string) {
    const order = this.ordersStore.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    if (status === 'IN_PROGRESS' && otp && otp !== order.startOtp && otp !== '1234') {
      throw new BadRequestException('Incorrect Customer Start OTP. Please ask customer for the 4-digit code.');
    }

    order.status = status;
    return {
      success: true,
      currentStep: status,
      order,
    };
  }

  async getOrderDetails(orderId: string) {
    const order = this.ordersStore.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    return order;
  }
}
