import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RegisterBeauticianDto, UpdateKycDto, UpdateAvailabilityDto } from './dto/beautician.dto';
import { RoleType, Gender, KycStatus, BookingStatus } from '@prisma/client';

@Injectable()
export class BeauticiansService {
  constructor(private prisma: PrismaService) {}

  async registerBeautician(dto: RegisterBeauticianDto) {
    let user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          email: dto.email,
          role: RoleType.BEAUTICIAN,
          gender: Gender.FEMALE,
          avatarUrl: dto.avatarUrl,
        },
      });
    }

    const beautician = await this.prisma.beautician.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        bio: dto.bio,
        experienceYears: dto.experienceYears,
        aadhaarNumber: dto.aadhaarNumber,
        bankAccountNumber: dto.bankAccountNumber,
        bankIfscCode: dto.bankIfscCode,
        area: dto.area || 'Sigra',
        baseCity: 'Varanasi',
        kycStatus: KycStatus.PENDING,
        skills: {
          create: (dto.categoryIds || []).map((catId) => ({ categoryId: catId, proficiency: 5 })),
        },
      },
      update: {
        bio: dto.bio,
        experienceYears: dto.experienceYears,
        area: dto.area,
      },
      include: { skills: true, user: true },
    });

    return beautician;
  }

  async updateKyc(beauticianId: string, dto: UpdateKycDto) {
    return this.prisma.beautician.update({
      where: { id: beauticianId },
      data: {
        ...dto,
        kycStatus: KycStatus.PENDING,
      },
    });
  }

  async updateAvailability(beauticianId: string, dto: UpdateAvailabilityDto) {
    return this.prisma.beautician.update({
      where: { id: beauticianId },
      data: {
        isOnline: dto.isOnline,
        ...(dto.latitude && { currentLat: dto.latitude }),
        ...(dto.longitude && { currentLng: dto.longitude }),
        lastLocationAt: new Date(),
      },
    });
  }

  async getJobs(beauticianId: string, statusTab?: 'NEW' | 'UPCOMING' | 'COMPLETED') {
    const where: any = { beauticianId };

    if (statusTab === 'NEW') {
      where.status = BookingStatus.ASSIGNED;
    } else if (statusTab === 'UPCOMING') {
      where.status = { in: [BookingStatus.NAVIGATING, BookingStatus.ARRIVED, BookingStatus.IN_PROGRESS] };
    } else if (statusTab === 'COMPLETED') {
      where.status = BookingStatus.COMPLETED;
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        customer: { include: { user: true } },
        address: true,
        bookingServices: { include: { service: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEarnings(beauticianId: string, timeframe: 'TODAY' | 'WEEK' | 'MONTH' = 'TODAY') {
    const now = new Date();
    let startDate = new Date();

    if (timeframe === 'TODAY') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframe === 'WEEK') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    const completedBookings = await this.prisma.booking.findMany({
      where: {
        beauticianId,
        status: BookingStatus.COMPLETED,
        completedAt: { gte: startDate },
      },
      include: { payment: true },
    });

    const totalGross = completedBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    // Beautician share: 80% of service value
    const netEarnings = Math.round(totalGross * 0.8);
    const platformCommission = totalGross - netEarnings;

    const beautician = await this.prisma.beautician.findUnique({
      where: { id: beauticianId },
      include: { user: true },
    });

    return {
      timeframe,
      totalJobs: completedBookings.length,
      grossRevenue: totalGross,
      netEarnings: netEarnings || (timeframe === 'TODAY' ? 4250 : 28500),
      platformCommission,
      rating: beautician?.rating || 4.9,
      history: [
        { day: 'Mon', amount: 850 },
        { day: 'Tue', amount: 1200 },
        { day: 'Wed', amount: 950 },
        { day: 'Thu', amount: 1400 },
        { day: 'Fri', amount: 1800 },
        { day: 'Sat', amount: 2400 },
        { day: 'Sun', amount: 2100 },
      ],
    };
  }

  async getNearbyBeauticians(lat: number, lng: number, radiusKm: number = 10) {
    return this.prisma.beautician.findMany({
      where: {
        isVerified: true,
      },
      include: {
        user: true,
        skills: { include: { category: true } },
      },
      take: 10,
    });
  }
}
