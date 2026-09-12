import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface OfferData {
  id: string;
  offerName: string;
  offerType: 'SERVICE' | 'PACKAGE' | 'FESTIVAL' | 'SEASONAL';
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  applicableServices: string[]; // service names or IDs
  applicablePackages: string[]; // package names or IDs
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  createdAt: string;
}

@Injectable()
export class OfferService {
  private offersStore: OfferData[] = [
    {
      id: 'off-1',
      offerName: 'Varanasi Dev Deepawali Festival Glow Offer',
      offerType: 'FESTIVAL',
      discountType: 'PERCENTAGE',
      discountValue: 25,
      applicableServices: ['Facial & Cleanup', 'Hair Spa', 'Manicure & Pedicure'],
      applicablePackages: ['pkg-1', 'pkg-2'],
      startDate: '2026-10-01',
      endDate: '2026-11-15',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'off-2',
      offerName: 'Winter Hydra Skin Shield Ritual Offer',
      offerType: 'SEASONAL',
      discountType: 'FIXED',
      discountValue: 300,
      applicableServices: ['Korean Hyaluronic Acid Glass Skin Facial', 'Honey Nourishing Body Polish'],
      applicablePackages: ['pkg-3'],
      startDate: '2026-11-01',
      endDate: '2027-02-28',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'off-3',
      offerName: 'Royal Pre-Bridal Makeover Privilege',
      offerType: 'PACKAGE',
      discountType: 'FIXED',
      discountValue: 1000,
      applicableServices: ['Bridal Makeover', 'Full Body Waxing'],
      applicablePackages: ['pkg-1'],
      startDate: '2026-09-01',
      endDate: '2026-12-31',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
  ];

  constructor(private prisma: PrismaService) {}

  async getAllOffers() {
    return this.offersStore;
  }

  async getOfferById(id: string) {
    const offer = this.offersStore.find((o) => o.id === id);
    if (!offer) throw new NotFoundException(`Offer with ID ${id} not found`);
    return offer;
  }

  async createOffer(data: {
    offerName: string;
    offerType: 'SERVICE' | 'PACKAGE' | 'FESTIVAL' | 'SEASONAL';
    discountType: 'FIXED' | 'PERCENTAGE';
    discountValue: number;
    applicableServices?: string[];
    applicablePackages?: string[];
    startDate: string;
    endDate: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  }) {
    const newOffer: OfferData = {
      id: `off-${Date.now()}`,
      offerName: data.offerName,
      offerType: data.offerType,
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      applicableServices: data.applicableServices || [],
      applicablePackages: data.applicablePackages || [],
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    this.offersStore.unshift(newOffer);
    return newOffer;
  }

  async updateOffer(id: string, data: Partial<OfferData>) {
    const index = this.offersStore.findIndex((o) => o.id === id);
    if (index === -1) throw new NotFoundException(`Offer with ID ${id} not found`);

    this.offersStore[index] = {
      ...this.offersStore[index],
      ...data,
      discountValue: data.discountValue !== undefined ? Number(data.discountValue) : this.offersStore[index].discountValue,
    };
    return this.offersStore[index];
  }

  async toggleStatus(id: string) {
    const offer = await this.getOfferById(id);
    offer.status = offer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return offer;
  }

  async deleteOffer(id: string) {
    const index = this.offersStore.findIndex((o) => o.id === id);
    if (index === -1) throw new NotFoundException(`Offer with ID ${id} not found`);
    const deleted = this.offersStore.splice(index, 1);
    return { success: true, message: `Offer ${id} deleted`, deleted: deleted[0] };
  }
}
