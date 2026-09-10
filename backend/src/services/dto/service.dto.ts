import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Facial' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'facial' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Glowing luxury facials' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class CreateServiceDto {
  @ApiProperty({ example: 'cat-uuid-123' })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 'Korean Facial Ritual' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'korean-facial-ritual' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Glass skin ritual with ampoules' })
  @IsOptional()
  @IsString()
  shortDesc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  benefits?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  processSteps?: string[];

  @ApiProperty({ example: 899.00 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 1699.00 })
  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @ApiPropertyOptional({ example: 47 })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiPropertyOptional({ example: 65 })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isBestseller?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  imageUrls?: string[];
}

export class FilterServiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBestseller?: boolean;
}
