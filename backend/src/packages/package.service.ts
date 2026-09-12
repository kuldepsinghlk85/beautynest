import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface PackageData {
  id: string;
  name: string;
  image?: string;
  description: string;
  selectedServices: Array<{ id: string; name: string; price: number }>;
  originalPrice: number; // Automatic calculation: Sum of selected service prices
  customSellingPrice: number; // Admin can customize final selling price manually
  discount: number; // Percentage discount calculated: ((original - custom) / original) * 100
  validity: string;
  isActive: boolean;
  createdAt: string;
}

@Injectable()
export class PackageService {
  // In-memory persistent fallback store
  private packagesStore: PackageData[] = [
    {
      id: 'pkg-1',
      name: 'Bridal Royal Glow Makeover Ritual',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      description: 'Complete pre-wedding luxury pampering package for radiant bridal skin with O3+ facial, Rica waxing & hair spa.',
      selectedServices: [
        { id: 'srv-1', name: 'O3+ Bridal Glow & Radiance Oxygenating Facial', price: 1899 },
        { id: 'srv-2', name: 'Full Body Waxing with Italian Rica Cartridge', price: 1499 },
        { id: 'srv-3', name: 'Hydra Collagen Crystal Manicure & Pedicure Spa', price: 999 },
        { id: 'srv-4', name: "L'Oréal Mythic Oil Deep Hair Spa & Blow Dry", price: 899 },
      ],
      originalPrice: 5296,
      customSellingPrice: 3499,
      discount: 34,
      validity: '365 Days',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pkg-2',
      name: 'Varanasi Festive Glow & De-Tan Combo',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      description: 'Instant brightening and sun-damage reversal for festive celebrations.',
      selectedServices: [
        { id: 'srv-5', name: 'Sara Herbal Instaglow De-Tan Clean Up', price: 799 },
        { id: 'srv-6', name: 'Rica Honey Full Arms & Full Legs Waxing', price: 899 },
        { id: 'srv-7', name: 'Express Rose Foot Reflexology & Pedicure', price: 549 },
      ],
      originalPrice: 2247,
      customSellingPrice: 1499,
      discount: 33,
      validity: '180 Days',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pkg-3',
      name: 'Hydra Glass Skin & Hair Rejuvenation Ritual',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      description: 'Deep cellular hydration combined with professional scalp revival therapy.',
      selectedServices: [
        { id: 'srv-8', name: 'Korean Hyaluronic Acid Glass Skin Facial', price: 1699 },
        { id: 'srv-9', name: 'Moroccan Argan Anti-Frizz Scalp Spa', price: 1199 },
        { id: 'srv-10', name: 'Under-Eye Caffeine Gel Infusion Therapy', price: 499 },
      ],
      originalPrice: 3397,
      customSellingPrice: 2199,
      discount: 35,
      validity: '365 Days',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  constructor(private prisma: PrismaService) {}

  async getAllPackages() {
    return this.packagesStore;
  }

  async getPackageById(id: string) {
    const pkg = this.packagesStore.find((p) => p.id === id);
    if (!pkg) throw new NotFoundException(`Package with ID ${id} not found`);
    return pkg;
  }

  async createPackage(data: {
    name: string;
    image?: string;
    description: string;
    selectedServices: Array<{ id: string; name: string; price: number }>;
    customSellingPrice?: number;
    validity?: string;
  }) {
    // Automatic calculation: Package Base Price = Sum of selected service prices
    const originalPrice = data.selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const customSellingPrice = data.customSellingPrice !== undefined && data.customSellingPrice > 0
      ? data.customSellingPrice
      : Math.round(originalPrice * 0.7);

    const discount = originalPrice > 0
      ? Math.round(((originalPrice - customSellingPrice) / originalPrice) * 100)
      : 0;

    const newPackage: PackageData = {
      id: `pkg-${Date.now()}`,
      name: data.name,
      image: data.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      description: data.description,
      selectedServices: data.selectedServices,
      originalPrice,
      customSellingPrice,
      discount,
      validity: data.validity || '365 Days',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.packagesStore.unshift(newPackage);
    return newPackage;
  }

  async updatePackage(id: string, data: Partial<PackageData>) {
    const index = this.packagesStore.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException(`Package with ID ${id} not found`);

    const existing = this.packagesStore[index];
    const services = data.selectedServices || existing.selectedServices;
    const originalPrice = services.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const customSellingPrice = data.customSellingPrice !== undefined
      ? data.customSellingPrice
      : existing.customSellingPrice;

    const discount = originalPrice > 0
      ? Math.round(((originalPrice - customSellingPrice) / originalPrice) * 100)
      : 0;

    const updated: PackageData = {
      ...existing,
      ...data,
      selectedServices: services,
      originalPrice,
      customSellingPrice,
      discount,
    };

    this.packagesStore[index] = updated;
    return updated;
  }

  async toggleActive(id: string) {
    const pkg = await this.getPackageById(id);
    pkg.isActive = !pkg.isActive;
    return pkg;
  }

  async deletePackage(id: string) {
    const index = this.packagesStore.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException(`Package with ID ${id} not found`);
    const deleted = this.packagesStore.splice(index, 1);
    return { success: true, message: `Package ${id} deleted successfully`, deleted: deleted[0] };
  }
}
