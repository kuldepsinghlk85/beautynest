import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({ example: 'booking-uuid-123' })
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty({ example: 'RAZORPAY_UPI', enum: ['RAZORPAY_UPI', 'RAZORPAY_CARD', 'WALLET', 'CASH_ON_DELIVERY'] })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ example: 'booking-uuid-123' })
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty({ example: 'order_NxXXXXXXXX' })
  @IsNotEmpty()
  @IsString()
  razorpayOrderId: string;

  @ApiProperty({ example: 'pay_NxXXXXXXXX' })
  @IsNotEmpty()
  @IsString()
  razorpayPaymentId: string;

  @ApiProperty({ example: 'sig_XXXXXXXXXX' })
  @IsNotEmpty()
  @IsString()
  razorpaySignature: string;
}
