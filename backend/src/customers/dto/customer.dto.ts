import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({ example: 'Priya Verma' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'priya.verma@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'Lucknow' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1494790108377' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class CreateAddressDto {
  @ApiProperty({ example: 'Home' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'B-34, Sector L, Kapoorthala Chauraha' })
  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Aliganj' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'Opposite Dominoes' })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiProperty({ example: 'Lucknow' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Uttar Pradesh' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ example: '226024' })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({ example: 26.8850 })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 80.9380 })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
