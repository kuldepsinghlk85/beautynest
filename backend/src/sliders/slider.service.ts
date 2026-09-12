import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

export interface SliderBanner {
  id: string;
  bannerImage: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  badge: string;
  scriptText: string;
  description: string;
  buttonText: string;
  ctaText: string;
  redirectPage: string;
  ctaLink: string;
  priority: number;
  order: number;
  status: 'ACTIVE' | 'INACTIVE';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

const DEFAULT_SLIDERS: SliderBanner[] = [
  {
    id: 'hs-1',
    bannerImage: '/slider/slide1.png',
    imageUrl: '/slider/slide1.png',
    title: 'Glow Like Never Before',
    subtitle: 'Varanasi Top Doorstep Facial & Cleanup Treatments with certified beauticians.',
    badge: '★ 4.9 (11,500+ Reviews)',
    scriptText: 'Glow Like Never Before ✨',
    description: 'Varanasi Top Doorstep Facial & Cleanup Treatments with certified beauticians.',
    buttonText: 'Book Facial Now',
    ctaText: 'Book Facial Now',
    redirectPage: '/services',
    ctaLink: '/services',
    priority: 1,
    order: 1,
    status: 'ACTIVE',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hs-2',
    bannerImage: '/slider/slide2.png',
    imageUrl: '/slider/slide2.png',
    title: 'Silky Hair Spa & Styling',
    subtitle: 'Nourishing hair rituals & festive blowout right at your home.',
    badge: 'Trending Care 💇‍♀️',
    scriptText: 'Silky Smooth Hair 🌸',
    description: 'Nourishing hair rituals & festive blowout right at your home.',
    buttonText: 'Explore Hair Care',
    ctaText: 'Explore Hair Care',
    redirectPage: '/services',
    ctaLink: '/services',
    priority: 2,
    order: 2,
    status: 'ACTIVE',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hs-3',
    bannerImage: '/slider/slide3.png',
    imageUrl: '/slider/slide3.png',
    title: 'Bridal & Party Glamour',
    subtitle: 'Sterile kits, premium cosmetics & personalized salon touch.',
    badge: 'Special Occasions ✨',
    scriptText: 'Flawless Glamour 💄',
    description: 'Sterile kits, premium cosmetics & personalized salon touch.',
    buttonText: 'View Glam Packages',
    ctaText: 'View Glam Packages',
    redirectPage: '/offers',
    ctaLink: '/offers',
    priority: 3,
    order: 3,
    status: 'ACTIVE',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hs-4',
    bannerImage: '/slider/slide4.png',
    imageUrl: '/slider/slide4.png',
    title: 'Aroma Spa & Relaxation',
    subtitle: 'Full body unwinding and herbal skin therapies in Varanasi.',
    badge: '100% Organic Products',
    scriptText: 'Pure Serenity 🌿',
    description: 'Full body unwinding and herbal skin therapies in Varanasi.',
    buttonText: 'Book Spa Ritual',
    ctaText: 'Book Spa Ritual',
    redirectPage: '/services',
    ctaLink: '/services',
    priority: 4,
    order: 4,
    status: 'ACTIVE',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

@Injectable()
export class SliderService {
  private readonly logger = new Logger(SliderService.name);
  private slidersStore: SliderBanner[] = [];
  private dataFilePath = path.resolve(process.cwd(), 'data', 'sliders.json');

  constructor(private prisma: PrismaService) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const dataDir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.slidersStore = parsed.map((s, idx) => this.normalizeSlider(s, idx + 1));
          this.logger.log(`Loaded ${this.slidersStore.length} hero sliders from ${this.dataFilePath}`);
          return;
        }
      }
    } catch (err: any) {
      this.logger.error(`Failed to load sliders file: ${err.message}`);
    }

    this.slidersStore = [...DEFAULT_SLIDERS];
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      const dataDir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.slidersStore, null, 2), 'utf8');
    } catch (err: any) {
      this.logger.error(`Failed to persist sliders: ${err.message}`);
    }
  }

  private normalizeSlider(item: any, fallbackOrder: number): SliderBanner {
    const img = item.imageUrl || item.bannerImage || '/slider/slide1.png';
    const cta = item.ctaText || item.buttonText || 'Book Now';
    const link = item.ctaLink || item.redirectPage || '/services';
    const order = item.order !== undefined ? Number(item.order) : item.priority !== undefined ? Number(item.priority) : fallbackOrder;
    const isActive = item.isActive !== undefined ? Boolean(item.isActive) : item.status !== undefined ? item.status === 'ACTIVE' : true;

    return {
      id: item.id || `hs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bannerImage: img,
      imageUrl: img,
      title: item.title || '',
      subtitle: item.subtitle || item.description || '',
      badge: item.badge || '',
      scriptText: item.scriptText || '',
      description: item.description || item.subtitle || '',
      buttonText: cta,
      ctaText: cta,
      redirectPage: link,
      ctaLink: link,
      priority: order,
      order: order,
      status: isActive ? 'ACTIVE' : 'INACTIVE',
      isActive: isActive,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getAllSliders() {
    return this.slidersStore.sort((a, b) => a.order - b.order);
  }

  async getActiveSliders() {
    return this.slidersStore
      .filter((s) => s.isActive && s.status === 'ACTIVE')
      .sort((a, b) => a.order - b.order);
  }

  async createBanner(data: any) {
    const normalized = this.normalizeSlider(data, this.slidersStore.length + 1);
    this.slidersStore.push(normalized);
    this.saveToStorage();
    return normalized;
  }

  async updateBanner(id: string, data: any) {
    const index = this.slidersStore.findIndex((s) => s.id === id);
    if (index === -1) throw new NotFoundException(`Slider banner with ID ${id} not found`);

    const updated = {
      ...this.slidersStore[index],
      ...data,
      bannerImage: data.imageUrl || data.bannerImage || this.slidersStore[index].bannerImage,
      imageUrl: data.imageUrl || data.bannerImage || this.slidersStore[index].imageUrl,
      ctaText: data.ctaText || data.buttonText || this.slidersStore[index].ctaText,
      buttonText: data.ctaText || data.buttonText || this.slidersStore[index].buttonText,
      ctaLink: data.ctaLink || data.redirectPage || this.slidersStore[index].ctaLink,
      redirectPage: data.ctaLink || data.redirectPage || this.slidersStore[index].redirectPage,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : data.status !== undefined ? data.status === 'ACTIVE' : this.slidersStore[index].isActive,
      status: (data.isActive !== undefined ? data.isActive : data.status === 'ACTIVE') ? 'ACTIVE' : 'INACTIVE',
      updatedAt: new Date().toISOString(),
    };

    this.slidersStore[index] = updated;
    this.saveToStorage();
    return updated;
  }

  async deleteBanner(id: string) {
    const index = this.slidersStore.findIndex((s) => s.id === id);
    if (index === -1) throw new NotFoundException(`Slider banner with ID ${id} not found`);
    const deleted = this.slidersStore.splice(index, 1);
    this.saveToStorage();
    return { success: true, message: `Banner ${id} deleted`, deleted: deleted[0] };
  }

  async updatePriority(id: string, direction: 'UP' | 'DOWN') {
    const index = this.slidersStore.findIndex((s) => s.id === id);
    if (index === -1) throw new NotFoundException(`Slider banner with ID ${id} not found`);

    if (direction === 'UP' && index > 0) {
      const prev = this.slidersStore[index - 1];
      const current = this.slidersStore[index];
      const tempOrder = prev.order;
      prev.order = current.order;
      prev.priority = current.order;
      current.order = tempOrder;
      current.priority = tempOrder;
      this.slidersStore.sort((a, b) => a.order - b.order);
    } else if (direction === 'DOWN' && index < this.slidersStore.length - 1) {
      const next = this.slidersStore[index + 1];
      const current = this.slidersStore[index];
      const tempOrder = next.order;
      next.order = current.order;
      next.priority = current.order;
      current.order = tempOrder;
      current.priority = tempOrder;
      this.slidersStore.sort((a, b) => a.order - b.order);
    }

    this.saveToStorage();
    return this.slidersStore;
  }

  async batchSync(items: any[]) {
    if (!Array.isArray(items)) {
      throw new Error('Expected an array of slider items');
    }
    this.slidersStore = items.map((item, idx) => this.normalizeSlider(item, idx + 1));
    this.saveToStorage();
    return this.slidersStore;
  }

  async resetDefaults() {
    this.slidersStore = [...DEFAULT_SLIDERS];
    this.saveToStorage();
    return this.slidersStore;
  }
}
