import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { SliderService } from './slider.service';

@Controller(['sliders', 'api/sliders'])
export class SlidersController {
  constructor(private sliderService: SliderService) {}

  @Get()
  getAllSliders() {
    return this.sliderService.getAllSliders();
  }

  @Get('active')
  getActiveSliders() {
    return this.sliderService.getActiveSliders();
  }

  @Post()
  createBanner(@Body() body: any) {
    return this.sliderService.createBanner(body);
  }

  @Post('batch')
  batchSync(@Body() body: any) {
    const items = Array.isArray(body) ? body : body?.sliders || [];
    return this.sliderService.batchSync(items);
  }

  @Post('reset')
  resetDefaults() {
    return this.sliderService.resetDefaults();
  }

  @Put(':id')
  updateBanner(@Param('id') id: string, @Body() body: any) {
    return this.sliderService.updateBanner(id, body);
  }

  @Patch(':id/priority')
  updatePriority(@Param('id') id: string, @Query('direction') direction: 'UP' | 'DOWN') {
    return this.sliderService.updatePriority(id, direction);
  }

  @Delete(':id')
  deleteBanner(@Param('id') id: string) {
    return this.sliderService.deleteBanner(id);
  }
}

