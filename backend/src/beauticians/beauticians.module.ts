import { Module } from '@nestjs/common';
import { BeauticiansService } from './beauticians.service';
import { BeauticiansController } from './beauticians.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [BeauticiansController],
  providers: [BeauticiansService, PrismaService],
  exports: [BeauticiansService],
})
export class BeauticiansModule {}
