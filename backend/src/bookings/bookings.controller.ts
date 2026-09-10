import { Controller, Post, Get, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, CancelBookingDto, RescheduleBookingDto, VerifyStartOtpDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingStatus } from '@prisma/client';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new doorstep booking with auto-assigned beautician' })
  async createBooking(@Request() req: any, @Body() dto: CreateBookingDto) {
    const customerId = req.user.customerProfile?.id || req.user.id;
    return this.bookingsService.createBooking(customerId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List customer bookings (Upcoming, Completed, Cancelled)' })
  async getBookings(@Request() req: any, @Query('status') status?: string) {
    const customerId = req.user.customerProfile?.id || req.user.id;
    return this.bookingsService.getCustomerBookings(customerId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details by ID or Booking Number' })
  async getBooking(@Param('id') id: string) {
    return this.bookingsService.getBookingById(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking with reason' })
  async cancelBooking(@Request() req: any, @Param('id') id: string, @Body() dto: CancelBookingDto) {
    return this.bookingsService.cancelBooking(id, dto, req.user.fullName || 'User');
  }

  @Put(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule booking date/time slot' })
  async rescheduleBooking(@Param('id') id: string, @Body() dto: RescheduleBookingDto) {
    return this.bookingsService.rescheduleBooking(id, dto);
  }

  // Beautician execution endpoints
  @Put(':id/accept')
  @ApiOperation({ summary: 'Beautician accepts incoming job' })
  async acceptJob(@Request() req: any, @Param('id') id: string) {
    const beauticianId = req.user.beauticianProfile?.id;
    return this.bookingsService.updateBookingStep(id, beauticianId, BookingStatus.ASSIGNED);
  }

  @Put(':id/navigating')
  @ApiOperation({ summary: 'Beautician marks On The Way / Navigating' })
  async startNavigating(@Request() req: any, @Param('id') id: string) {
    const beauticianId = req.user.beauticianProfile?.id;
    return this.bookingsService.updateBookingStep(id, beauticianId, BookingStatus.NAVIGATING);
  }

  @Put(':id/arrived')
  @ApiOperation({ summary: 'Beautician marks Arrived at Doorstep' })
  async markArrived(@Request() req: any, @Param('id') id: string) {
    const beauticianId = req.user.beauticianProfile?.id;
    return this.bookingsService.updateBookingStep(id, beauticianId, BookingStatus.ARRIVED);
  }

  @Put(':id/start')
  @ApiOperation({ summary: 'Start service by verifying customer 4-digit OTP' })
  async startService(@Request() req: any, @Param('id') id: string, @Body() dto: VerifyStartOtpDto) {
    const beauticianId = req.user.beauticianProfile?.id;
    return this.bookingsService.startServiceWithOtp(id, beauticianId, dto);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark service as Completed' })
  async completeService(@Request() req: any, @Param('id') id: string) {
    const beauticianId = req.user.beauticianProfile?.id;
    return this.bookingsService.updateBookingStep(id, beauticianId, BookingStatus.COMPLETED);
  }
}
