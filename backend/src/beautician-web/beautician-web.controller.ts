import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { BeauticianWebService } from './beautician-web.service';

@Controller('beautician-web')
export class BeauticianWebController {
  constructor(private beauticianWebService: BeauticianWebService) {}

  @Post('auth/send-otp')
  sendOtp(@Body('phone') phone: string) {
    return this.beauticianWebService.sendOtp(phone);
  }

  @Post('auth/verify-otp')
  verifyOtp(@Body('phone') phone: string, @Body('otp') otp: string) {
    return this.beauticianWebService.verifyOtp(phone, otp);
  }

  @Get('dashboard')
  getDashboard(@Query('beauticianId') beauticianId = 'worker-1') {
    return this.beauticianWebService.getDashboard(beauticianId);
  }

  @Get('orders/:id')
  getOrderDetails(@Param('id') id: string) {
    return this.beauticianWebService.getOrderDetails(id);
  }

  @Post('orders/:id/accept')
  acceptOrder(@Param('id') id: string) {
    return this.beauticianWebService.acceptOrder(id);
  }

  @Post('orders/:id/reject')
  rejectOrder(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.beauticianWebService.rejectOrder(id, reason);
  }

  @Put('orders/:id/status')
  updateServiceStatus(
    @Param('id') id: string,
    @Body('status') status: any,
    @Body('otp') otp?: string,
  ) {
    return this.beauticianWebService.updateServiceStatus(id, status, otp);
  }
}
