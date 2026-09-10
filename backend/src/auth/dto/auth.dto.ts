import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsPhoneNumber, IsOptional, Length, IsEmail } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'User mobile number with country code' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code' })
  @IsNotEmpty()
  @Length(4, 6)
  otpCode: string;

  @ApiPropertyOptional({ example: 'Priya Verma' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'priya@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'CUSTOMER', enum: ['CUSTOMER', 'BEAUTICIAN', 'ADMIN'] })
  @IsOptional()
  @IsString()
  role?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class LoginPasswordDto {
  @ApiProperty({ example: 'admin@beautynest.in' })
  @IsNotEmpty()
  @IsString()
  identifier: string; // email or phone

  @ApiProperty({ example: 'Admin@123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
