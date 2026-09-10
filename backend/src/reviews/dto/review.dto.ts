import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional, IsArray } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'booking-uuid-123' })
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Amazing Korean facial! My skin feels so soft and glowing.' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  imageUrls?: string[];
}
