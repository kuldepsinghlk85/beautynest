import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class RegisterBeauticianDto {
  @ApiProperty({ example: 'Ananya Sharma' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+919811223344' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'ananya@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Expert in Korean Facials, Waxing, and Skin Care' })
  @IsNotEmpty()
  @IsString()
  bio: string;

  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @IsNumber()
  experienceYears: number;

  @ApiProperty({ type: [String], example: ['cat-uuid-1', 'cat-uuid-2'] })
  @IsArray()
  categoryIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankIfscCode?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'Sigra' })
  @IsOptional()
  @IsString()
  area?: string;
}

export class UpdateKycDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aadhaarCardUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certificateUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  portfolioUrls?: string[];
}

export class UpdateAvailabilityDto {
  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  isOnline: boolean;

  @ApiPropertyOptional({ example: 26.8920 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 80.9412 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
