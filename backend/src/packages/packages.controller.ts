import { Controller, Get, Post, Put, Patch, Delete, Param, Body } from '@nestjs/common';
import { PackageService } from './package.service';

@Controller('packages')
export class PackagesController {
  constructor(private packageService: PackageService) {}

  @Get()
  getAllPackages() {
    return this.packageService.getAllPackages();
  }

  @Get(':id')
  getPackageById(@Param('id') id: string) {
    return this.packageService.getPackageById(id);
  }

  @Post()
  createPackage(@Body() body: any) {
    return this.packageService.createPackage(body);
  }

  @Put(':id')
  updatePackage(@Param('id') id: string, @Body() body: any) {
    return this.packageService.updatePackage(id, body);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.packageService.toggleActive(id);
  }

  @Delete(':id')
  deletePackage(@Param('id') id: string) {
    return this.packageService.deletePackage(id);
  }
}
