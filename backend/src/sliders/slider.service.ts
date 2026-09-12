import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface SliderBanner {
  id: string;
  bannerImage: string;
  title: string;
  description: string;
  buttonText: string;
  redirectPage: string;
  priority: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

@Injectable()
export class SliderService {
  private slidersStore: SliderBanner[] = [
    {
      id: 'sld-1',
      bannerImage: '/slider/slide1.png',
      title: 'Glow Like Never Before',
      description: 'Varanasi Top Doorstep Facial & Cleanup Treatments with certified beauticians.',
      buttonText: 'Book Facial Now',
      redirectPage: '/services',
      priority: 1,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sld-2',
      bannerImage: '/slider/slide2.png',
      title: 'Bridal & Festive Elegance',
      description: 'Pre-wedding & Party Glow Rituals at Your Doorstep with sterile hygienic kits.',
      buttonText: 'Explore Bridal Packages',
      redirectPage: '/offers',
      priority: 2,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sld-3',
      bannerImage: '/slider/slide3.png',
      title: 'Korean Glass Skin Ritual',
      description: 'Deep Pore Hydration & Ultrasonic Skin Pampering with organic ampoules.',
      buttonText: 'Book Korean Ritual',
      redirectPage: '/services',
      priority: 3,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
  ];

  constructor(private prisma: PrismaService) {}

  async getAllSliders() {
    return this.slidersStore.sort((a, b) => a.priority - b.priority);
  }

  async getActiveSliders() {
    return this.slidersStore
      .filter((s) => s.status === 'ACTIVE')
      .sort((a, b) => a.priority - b.priority);
  }

  async createBanner(data: {
    bannerImage: string;
    title: string;
    description: string;
    buttonText?: string;
    redirectPage?: string;
    priority?: number;
    status?: 'ACTIVE' | 'INACTIVE';
  }) {
    const newBanner: SliderBanner = {
      id: `sld-${Date.now()}`,
      bannerImage: data.bannerImage,
      title: data.title,
      description: data.description,
      buttonText: data.buttonText || 'Book Now',
      redirectPage: data.redirectPage || '/services',
      priority: data.priority !== undefined ? Number(data.priority) : this.slidersStore.length + 1,
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    this.slidersStore.push(newBanner);
    return newBanner;
  }

  async updateBanner(id: string, data: Partial<SliderBanner>) {
    const index = this.slidersStore.findIndex((s) => s.id === id);
    if (index === -1) throw new NotFoundException(`Slider banner with ID ${id} not found`);

    this.slidersStore[index] = {
      ...this.slidersStore[index],
      ...data,
    };
    return this.slidersStore[index];
  }

  async deleteBanner(id: string) {
    const index = this.slidersStore.findIndex((s) => s.id === id);
    if (index === -1) throw new NotFoundException(`Slider banner with ID ${id} not found`);
    const deleted = this.slidersStore.splice(index, 1);
    return { success: true, message: `Banner ${id} deleted`, deleted: deleted[0] };
  }

  async updatePriority(id: string, direction: 'UP' | 'DOWN') {
    const index = this.slidersStore.findIndex((s) => s.id === id);
    if (index === -1) throw new NotFoundException(`Slider banner with ID ${id} not found`);

    if (direction === 'UP' && index > 0) {
      const prev = this.slidersStore[index - 1];
      const current = this.slidersStore[index];
      const tempPriority = prev.priority;
      prev.priority = current.priority;
      current.priority = tempPriority;
      this.slidersStore.sort((a, b) => a.priority - b.priority);
    } else if (direction === 'DOWN' && index < this.slidersStore.length - 1) {
      const next = this.slidersStore[index + 1];
      const current = this.slidersStore[index];
      const tempPriority = next.priority;
      next.priority = current.priority;
      current.priority = tempPriority;
      this.slidersStore.sort((a, b) => a.priority - b.priority);
    }

    return this.slidersStore;
  }
}
