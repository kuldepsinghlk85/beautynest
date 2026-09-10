import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { AssignmentService } from './assignment.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, AssignmentService, PrismaService],
  exports: [BookingsService, AssignmentService],
})
export class BookingsModule {}
