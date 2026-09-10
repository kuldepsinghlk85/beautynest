import { Controller, Get, Put, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleType, KycStatus } from '@prisma/client';

@ApiTags('Admin Dashboard & Operations')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get executive dashboard KPIs, charts, and recent bookings' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List all customer bookings with status and date filtering' })
  async getBookings(@Query('status') status?: string, @Query('search') search?: string) {
    return this.adminService.getBookings({ status, search });
  }

  @Put('bookings/:id/assign')
  @ApiOperation({ summary: 'Manually assign or reassign beautician to booking' })
  async assignBeautician(@Param('id') id: string, @Body('beauticianId') beauticianId: string) {
    return this.adminService.assignBeauticianManually(id, beauticianId);
  }

  @Get('customers')
  @ApiOperation({ summary: 'List all registered customers with metrics' })
  async getCustomers() {
    return this.adminService.getCustomers();
  }

  @Get('beauticians')
  @ApiOperation({ summary: 'List all beauticians with KYC details and ratings' })
  async getBeauticians() {
    return this.adminService.getBeauticians();
  }

  @Put('beauticians/:id/approve')
  @ApiOperation({ summary: 'Approve or reject beautician KYC verification' })
  async updateKycApproval(@Param('id') id: string, @Body('status') status: KycStatus) {
    return this.adminService.updateKycApproval(id, status);
  }

  @Get('reports/revenue')
  @ApiOperation({ summary: 'Generate detailed revenue breakdown report' })
  async getRevenueReport() {
    return this.adminService.getRevenueReport();
  }

  @Post('coupons')
  @ApiOperation({ summary: 'Create promotional coupon code' })
  async createCoupon(@Body() body: any) {
    return this.adminService.createCoupon(body);
  }
}
