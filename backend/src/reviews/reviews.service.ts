import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateReviewDto } from './dto/review.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(customerId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { review: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customerId !== customerId) {
      throw new BadRequestException('You can only review your own bookings');
    }
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('You can only review completed appointments');
    }
    if (booking.review) {
      throw new BadRequestException('A review has already been submitted for this booking');
    }
    if (!booking.beauticianId) {
      throw new BadRequestException('No beautician was assigned to this booking');
    }

    const review = await this.prisma.review.create({
      data: {
        bookingId: booking.id,
        customerId,
        beauticianId: booking.beauticianId,
        rating: dto.rating,
        comment: dto.comment,
        images: dto.imageUrls?.length
          ? {
              create: dto.imageUrls.map((url) => ({ imageUrl: url })),
            }
          : undefined,
      },
      include: { images: true },
    });

    // Update beautician average rating
    const aggregate = await this.prisma.review.aggregate({
      where: { beauticianId: booking.beauticianId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.beautician.update({
      where: { id: booking.beauticianId },
      data: {
        rating: parseFloat((aggregate._avg.rating || 5.0).toFixed(1)),
        totalRatings: aggregate._count.rating,
      },
    });

    return review;
  }

  async getReviewsForBeautician(beauticianId: string) {
    return this.prisma.review.findMany({
      where: { beauticianId, isPublic: true },
      include: {
        customer: { include: { user: true } },
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
