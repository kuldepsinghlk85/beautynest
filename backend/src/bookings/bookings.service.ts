import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AssignmentService } from './assignment.service';
import { CreateBookingDto, CancelBookingDto, RescheduleBookingDto, VerifyStartOtpDto } from './dto/booking.dto';
import { BookingStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private assignmentService: AssignmentService,
  ) {}

  async createBooking(customerId: string, dto: CreateBookingDto) {
    const address = await this.prisma.address.findUnique({
      where: { id: dto.addressId },
    });
    if (!address) {
      throw new NotFoundException('Selected delivery address not found');
    }

    // Retrieve services and calculate pricing
    const serviceIds = dto.items.map((i) => i.serviceId);
    const services = await this.prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    if (services.length === 0) {
      throw new BadRequestException('At least one valid service must be selected');
    }

    let subTotal = 0;
    const bookingItemsData = dto.items.map((item) => {
      const s = services.find((srv) => srv.id === item.serviceId);
      const unitPrice = Number(s?.price || 0);
      const totalPrice = unitPrice * item.quantity;
      subTotal += totalPrice;
      return {
        serviceId: item.serviceId,
        unitPrice,
        quantity: item.quantity,
        totalPrice,
      };
    });

    // Handle coupon code discount
    let discountAmount = 0;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive && subTotal >= Number(coupon.minOrderValue)) {
        if (coupon.discountPercent) {
          discountAmount = (subTotal * coupon.discountPercent) / 100;
          if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
            discountAmount = Number(coupon.maxDiscount);
          }
        } else if (coupon.discountAmount) {
          discountAmount = Number(coupon.discountAmount);
        }
      }
    }

    const taxAmount = Math.round((subTotal - discountAmount) * 0.05); // 5% GST on salon services
    const totalAmount = Math.max(0, subTotal - discountAmount + taxAmount);

    // Auto-assignment or preferred beautician
    let assignedBeauticianId = dto.preferredBeauticianId;
    let matchInfo: any = null;

    if (!assignedBeauticianId) {
      const categoryIds = services.map((s) => s.categoryId);
      const candidates = await this.assignmentService.findBestBeauticians(
        address.latitude,
        address.longitude,
        categoryIds,
        15, // up to 15km fallback
      );

      if (candidates.length > 0) {
        assignedBeauticianId = candidates[0].beautician.id;
        matchInfo = {
          beauticianName: candidates[0].beautician.user.fullName,
          score: candidates[0].score,
          distanceKm: candidates[0].distanceKm,
        };
      }
    }

    // Generate unique Booking ID (e.g. BK-6887)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `BK-${randomSuffix}`;

    // 4-digit service start verification OTP
    const serviceStartOtp = String(Math.floor(1000 + Math.random() * 9000));

    const booking = await this.prisma.booking.create({
      data: {
        bookingNumber,
        customerId,
        beauticianId: assignedBeauticianId,
        addressId: dto.addressId,
        status: assignedBeauticianId ? BookingStatus.ASSIGNED : BookingStatus.PENDING,
        scheduledDate: new Date(dto.scheduledDate),
        scheduledTimeSlot: dto.scheduledTimeSlot,
        serviceStartOtp,
        subTotal,
        discountAmount,
        taxAmount,
        totalAmount,
        specialNotes: dto.specialNotes,
        bookingServices: {
          create: bookingItemsData,
        },
        payment: {
          create: {
            amount: totalAmount,
            method: PaymentMethod.RAZORPAY_UPI,
            status: PaymentStatus.CAPTURED, // simulated success for instant demo
            paidAt: new Date(),
          },
        },
        statusLogs: {
          create: [
            {
              status: BookingStatus.PENDING,
              note: 'Booking placed by customer',
            },
            ...(assignedBeauticianId
              ? [
                  {
                    status: BookingStatus.ASSIGNED,
                    note: matchInfo
                      ? `Auto-assigned to ${matchInfo.beauticianName} (Score: ${matchInfo.score}%)`
                      : 'Assigned to selected beautician',
                  },
                ]
              : []),
          ],
        },
      },
      include: {
        bookingServices: { include: { service: true } },
        beautician: { include: { user: true } },
        address: true,
        payment: true,
      },
    });

    return {
      success: true,
      message: 'Booking created successfully',
      booking,
      matchInfo,
    };
  }

  async getCustomerBookings(customerId: string, status?: string) {
    const where: any = { customerId };
    if (status === 'UPCOMING') {
      where.status = { in: [BookingStatus.PENDING, BookingStatus.ASSIGNED, BookingStatus.NAVIGATING, BookingStatus.ARRIVED, BookingStatus.IN_PROGRESS] };
    } else if (status === 'COMPLETED') {
      where.status = BookingStatus.COMPLETED;
    } else if (status === 'CANCELLED') {
      where.status = BookingStatus.CANCELLED;
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        bookingServices: { include: { service: true } },
        beautician: { include: { user: true } },
        address: true,
        payment: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBookingById(id: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
      include: {
        bookingServices: { include: { service: true } },
        beautician: { include: { user: true } },
        customer: { include: { user: true } },
        address: true,
        payment: true,
        statusLogs: { orderBy: { createdAt: 'asc' } },
        review: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    return booking;
  }

  async cancelBooking(id: string, dto: CancelBookingDto, cancelledBy: string) {
    const booking = await this.getBookingById(id);
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking cannot be cancelled in its current status');
    }

    return this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED,
        cancellationReason: dto.reason,
        cancelledAt: new Date(),
        statusLogs: {
          create: {
            status: BookingStatus.CANCELLED,
            note: `Cancelled by ${cancelledBy}: ${dto.reason}`,
          },
        },
      },
    });
  }

  async rescheduleBooking(id: string, dto: RescheduleBookingDto) {
    const booking = await this.getBookingById(id);
    return this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        scheduledDate: new Date(dto.newDate),
        scheduledTimeSlot: dto.newTimeSlot,
        statusLogs: {
          create: {
            status: booking.status,
            note: `Rescheduled to ${dto.newDate} (${dto.newTimeSlot})`,
          },
        },
      },
    });
  }

  // Beautician Workflow Transitions
  async updateBookingStep(id: string, beauticianId: string, step: BookingStatus) {
    const booking = await this.getBookingById(id);
    if (booking.beauticianId !== beauticianId) {
      throw new BadRequestException('You are not assigned to this booking');
    }

    const updateData: any = { status: step };
    if (step === BookingStatus.IN_PROGRESS) updateData.startedAt = new Date();
    if (step === BookingStatus.COMPLETED) updateData.completedAt = new Date();

    return this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        ...updateData,
        statusLogs: {
          create: {
            status: step,
            note: `Status updated to ${step} by beautician`,
          },
        },
      },
    });
  }

  async startServiceWithOtp(id: string, beauticianId: string, dto: VerifyStartOtpDto) {
    const booking = await this.getBookingById(id);
    if (booking.serviceStartOtp && booking.serviceStartOtp !== dto.otp) {
      throw new BadRequestException('Incorrect 4-digit start OTP provided by customer');
    }

    return this.updateBookingStep(id, beauticianId, BookingStatus.IN_PROGRESS);
  }
}
