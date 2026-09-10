import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto, CreateCategoryDto, FilterServiceDto } from './dto/service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Services & Categories')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all active service categories' })
  async getCategories() {
    return this.servicesService.getAllCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create service category (Admin)' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.servicesService.createCategory(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List and search services with optional filters' })
  async getServices(@Query() query: FilterServiceDto) {
    return this.servicesService.getAllServices(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service details by ID or Slug' })
  async getServiceById(@Param('id') id: string) {
    return this.servicesService.getServiceByIdOrSlug(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new service (Admin)' })
  async createService(@Body() dto: CreateServiceDto) {
    return this.servicesService.createService(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service details (Admin)' })
  async updateService(@Param('id') id: string, @Body() dto: Partial<CreateServiceDto>) {
    return this.servicesService.updateService(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete service (Admin)' })
  async deleteService(@Param('id') id: string) {
    return this.servicesService.deleteService(id);
  }
}
