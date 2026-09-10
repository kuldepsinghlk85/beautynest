import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class BookingItemDto {
  @ApiProperty({ example: 'service-id-123' })
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateBookingDto {
  @ApiProperty({ example: 'address-id-123' })
  @IsNotEmpty()
  @IsString()
  addressId: string;

  @ApiProperty({ example: '2026-08-03' })
  @IsNotEmpty()
  @IsString()
  scheduledDate: string;

  @ApiProperty({ example: '11:30 AM - 12:30 PM' })
  @IsNotEmpty()
  @IsString()
  scheduledTimeSlot: string;

  @ApiProperty({ type: [BookingItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingItemDto)
  items: BookingItemDto[];

  @ApiPropertyOptional({ example: 'WELCOME50' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ example: 'Please bring kit for sensitive skin' })
  @IsOptional()
  @IsString()
  specialNotes?: string;

  @ApiPropertyOptional({ example: 'beautician-id-123' })
  @IsOptional()
  @IsString()
  preferredBeauticianId?: string;
}

export class CancelBookingDto {
  @ApiProperty({ example: 'Change of plans / Emergency' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class RescheduleBookingDto {
  @ApiProperty({ example: '2026-08-04' })
  @IsNotEmpty()
  @IsString()
  newDate: string;

  @ApiProperty({ example: '02:00 PM - 03:00 PM' })
  @IsNotEmpty()
  @IsString()
  newTimeSlot: string;
}

export class VerifyStartOtpDto {
  @ApiProperty({ example: '4821' })
  @IsNotEmpty()
  @IsString()
  otp: string;
}
