import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackagesController } from './packages.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [PackagesController],
  providers: [PackageService],
  exports: [PackageService],
})
export class PackagesModule {}
