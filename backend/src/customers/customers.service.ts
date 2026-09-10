import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateCustomerProfileDto, CreateAddressDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: {
          include: {
            addresses: true,
            wallet: true,
            membership: { include: { plan: true } },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Customer not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateCustomerProfileDto) {
    const { fullName, email, avatarUrl, city } = dto;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(avatarUrl && { avatarUrl }),
        customerProfile: city
          ? {
              update: { city },
            }
          : undefined,
      },
    });

    return this.getProfile(userId);
  }

  async getAddresses(customerId: string) {
    return this.prisma.address.findMany({
      where: { customerId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async addAddress(customerId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        customerId,
        ...dto,
      },
    });
  }
}
