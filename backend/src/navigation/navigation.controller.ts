import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { NavigationService } from './navigation.service';

@Controller('navigation')
export class NavigationController {
  constructor(private navigationService: NavigationService) {}

  @Post('start/:orderId')
  startNavigation(
    @Param('orderId') orderId: string,
    @Body('beauticianId') beauticianId = 'worker-1',
  ) {
    return this.navigationService.startNavigation(orderId, beauticianId);
  }

  @Get('session/:orderId')
  getNavigationSession(@Param('orderId') orderId: string) {
    return this.navigationService.getNavigationSession(orderId);
  }

  @Put('location/:orderId')
  updateLiveLocation(
    @Param('orderId') orderId: string,
    @Body('lat') lat: number,
    @Body('lng') lng: number,
  ) {
    return this.navigationService.updateLiveLocation(orderId, lat, lng);
  }

  @Post('arrived/:orderId')
  markArrived(@Param('orderId') orderId: string) {
    return this.navigationService.markArrived(orderId);
  }
}
