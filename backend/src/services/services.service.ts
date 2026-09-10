import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateServiceDto, CreateCategoryDto, FilterServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async getAllCategories() {
    return this.prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { services: true } },
      },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.serviceCategory.create({ data: dto });
  }

  async getAllServices(filters?: FilterServiceDto) {
    const where: any = { isActive: true };

    if (filters?.category) {
      where.category = { slug: filters.category };
    }

    if (filters?.isBestseller !== undefined) {
      where.isBestseller = filters.isBestseller;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { shortDesc: { contains: filters.search, mode: 'insensitive' } },
        { about: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.service.findMany({
      where,
      include: {
        category: true,
        images: true,
      },
      orderBy: [{ isBestseller: 'desc' }, { rating: 'desc' }],
    });
  }

  async getServiceByIdOrSlug(idOrSlug: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: true,
        images: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service ${idOrSlug} not found`);
    }

    return service;
  }

  async createService(dto: CreateServiceDto) {
    const { imageUrls, ...data } = dto;
    return this.prisma.service.create({
      data: {
        ...data,
        images: imageUrls?.length
          ? {
              create: imageUrls.map((url, idx) => ({
                imageUrl: url,
                isPrimary: idx === 0,
              })),
            }
          : undefined,
      },
      include: { images: true, category: true },
    });
  }

  async updateService(id: string, dto: Partial<CreateServiceDto>) {
    const { imageUrls, ...data } = dto;
    return this.prisma.service.update({
      where: { id },
      data,
      include: { images: true, category: true },
    });
  }

  async deleteService(id: string) {
    return this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
