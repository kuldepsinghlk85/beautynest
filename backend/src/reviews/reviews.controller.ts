import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reviews & Ratings')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit rating (1-5) and review for completed booking' })
  async createReview(@Request() req: any, @Body() dto: CreateReviewDto) {
    const customerId = req.user.customerProfile?.id || req.user.id;
    return this.reviewsService.createReview(customerId, dto);
  }

  @Get('beautician/:id')
  @ApiOperation({ summary: 'Get public reviews for a beautician' })
  async getBeauticianReviews(@Param('id') beauticianId: string) {
    return this.reviewsService.getReviewsForBeautician(beauticianId);
  }
}
