import { Controller, Get, Post, Put, Patch, Delete, Param, Body } from '@nestjs/common';
import { OfferService } from './offer.service';

@Controller('offers')
export class OffersController {
  constructor(private offerService: OfferService) {}

  @Get()
  getAllOffers() {
    return this.offerService.getAllOffers();
  }

  @Get(':id')
  getOfferById(@Param('id') id: string) {
    return this.offerService.getOfferById(id);
  }

  @Post()
  createOffer(@Body() body: any) {
    return this.offerService.createOffer(body);
  }

  @Put(':id')
  updateOffer(@Param('id') id: string, @Body() body: any) {
    return this.offerService.updateOffer(id, body);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.offerService.toggleStatus(id);
  }

  @Delete(':id')
  deleteOffer(@Param('id') id: string) {
    return this.offerService.deleteOffer(id);
  }
}
