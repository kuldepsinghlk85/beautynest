import { Controller, Get, Put, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { UpdateCustomerProfileDto, CreateAddressDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current customer profile with addresses and wallet' })
  async getProfile(@Request() req: any) {
    return this.customersService.getProfile(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update customer personal profile' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateCustomerProfileDto) {
    return this.customersService.updateProfile(req.user.id, dto);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Get saved delivery addresses' })
  async getAddresses(@Request() req: any) {
    const customerId = req.user.customerProfile?.id;
    return this.customersService.getAddresses(customerId);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Save new delivery address' })
  async addAddress(@Request() req: any, @Body() dto: CreateAddressDto) {
    const customerId = req.user.customerProfile?.id;
    return this.customersService.addAddress(customerId, dto);
  }
}
