import { Controller, Post, Get, Put, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BeauticiansService } from './beauticians.service';
import { RegisterBeauticianDto, UpdateKycDto, UpdateAvailabilityDto } from './dto/beautician.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Beauticians')
@Controller('beauticians')
export class BeauticiansController {
  constructor(private readonly beauticiansService: BeauticiansService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new beautician partner' })
  async register(@Body() dto: RegisterBeauticianDto) {
    return this.beauticiansService.registerBeautician(dto);
  }

  @Put('kyc')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit KYC documentation (Aadhaar, Certificates, Portfolio)' })
  async updateKyc(@Request() req: any, @Body() dto: UpdateKycDto) {
    const beauticianId = req.user.beauticianProfile?.id;
    return this.beauticiansService.updateKyc(beauticianId, dto);
  }

  @Put('availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle online/offline status and transmit GPS coordinates' })
  async updateAvailability(@Request() req: any, @Body() dto: UpdateAvailabilityDto) {
    const beauticianId = req.user.beauticianProfile?.id;
    return this.beauticiansService.updateAvailability(beauticianId, dto);
  }

  @Get('jobs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get assigned jobs for beautician (NEW, UPCOMING, COMPLETED)' })
  async getJobs(@Request() req: any, @Query('tab') tab?: 'NEW' | 'UPCOMING' | 'COMPLETED') {
    const beauticianId = req.user.beauticianProfile?.id;
    return this.beauticiansService.getJobs(beauticianId, tab);
  }

  @Get('earnings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get earnings summary and history (TODAY, WEEK, MONTH)' })
  async getEarnings(@Request() req: any, @Query('timeframe') timeframe?: 'TODAY' | 'WEEK' | 'MONTH') {
    const beauticianId = req.user.beauticianProfile?.id;
    return this.beauticiansService.getEarnings(beauticianId, timeframe);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find top rated beauticians near customer location' })
  async getNearby(
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius?: number,
  ) {
    return this.beauticiansService.getNearbyBeauticians(
      Number(lat) || 26.8467,
      Number(lng) || 80.9462,
      Number(radius) || 10,
    );
  }
}
