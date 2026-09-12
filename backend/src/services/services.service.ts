import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateServiceDto, CreateCategoryDto, FilterServiceDto } from './dto/service.dto';
import * as fs from 'fs';
import * as path from 'path';

let BEAUTYNEST_SERVICES: any[] = [];
let SERVICE_CATEGORIES: any[] = [];
try {
  const modPath = fs.existsSync(path.resolve(process.cwd(), 'src', 'services', 'allServices.js'))
    ? path.resolve(process.cwd(), 'src', 'services', 'allServices.js')
    : path.resolve(__dirname, 'allServices.js');
  const loaded = require(modPath);
  BEAUTYNEST_SERVICES = loaded.BEAUTYNEST_SERVICES || [];
  SERVICE_CATEGORIES = loaded.SERVICE_CATEGORIES || [];
} catch (e: any) {
  console.error('Failed to require allServices.js:', e.message);
}

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);
  private overridesFilePath = path.resolve(process.cwd(), 'data', 'services_overrides.json');
  private serviceOverrides: Record<string, any> = {};
  private categoriesOverridesFilePath = path.resolve(process.cwd(), 'data', 'categories_overrides.json');
  private categoryOverrides: Record<string, any> = {};

  constructor(private prisma: PrismaService) {
    this.loadOverrides();
    this.loadCategoryOverrides();
  }

  private loadCategoryOverrides() {
    try {
      const dataDir = path.dirname(this.categoriesOverridesFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(this.categoriesOverridesFilePath)) {
        const raw = fs.readFileSync(this.categoriesOverridesFilePath, 'utf8');
        this.categoryOverrides = JSON.parse(raw);
        this.logger.log(`Loaded ${Object.keys(this.categoryOverrides).length} category overrides`);
      }
    } catch (e: any) {
      this.logger.error(`Failed to load category overrides: ${e.message}`);
      this.categoryOverrides = {};
    }
  }

  private saveCategoryOverrides() {
    try {
      fs.writeFileSync(this.categoriesOverridesFilePath, JSON.stringify(this.categoryOverrides, null, 2), 'utf8');
    } catch (e: any) {
      this.logger.error(`Failed to save category overrides: ${e.message}`);
    }
  }

  private loadOverrides() {
    try {
      const dataDir = path.dirname(this.overridesFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(this.overridesFilePath)) {
        const raw = fs.readFileSync(this.overridesFilePath, 'utf8');
        this.serviceOverrides = JSON.parse(raw);
        this.logger.log(`Loaded ${Object.keys(this.serviceOverrides).length} service overrides`);
      }
    } catch (e: any) {
      this.logger.error(`Failed to load service overrides: ${e.message}`);
      this.serviceOverrides = {};
    }
  }

  private saveOverrides() {
    try {
      fs.writeFileSync(this.overridesFilePath, JSON.stringify(this.serviceOverrides, null, 2), 'utf8');
    } catch (e: any) {
      this.logger.error(`Failed to save service overrides: ${e.message}`);
    }
  }

  private applyOverride(srv: any) {
    const key = srv.serviceId || srv.id || srv.slug;
    const ov = this.serviceOverrides[key] || this.serviceOverrides[srv.id] || this.serviceOverrides[srv.slug];
    if (ov) {
      return { ...srv, ...ov };
    }
    return srv;
  }

  private applyCategoryOverride(cat: any) {
    const key = cat.id || cat.slug || cat.name;
    const ov =
      this.categoryOverrides[key] ||
      this.categoryOverrides[cat.id] ||
      this.categoryOverrides[cat.slug] ||
      this.categoryOverrides[cat.name];
    if (ov) {
      return { ...cat, ...ov };
    }
    return cat;
  }

  async getAllCategories() {
    const list = SERVICE_CATEGORIES.map((c: any) => this.applyCategoryOverride(c));
    for (const [k, v] of Object.entries(this.categoryOverrides)) {
      if (v && v.isCustom && !list.some((c: any) => c.id === v.id || c.slug === v.slug)) {
        list.push(v);
      }
    }
    return list;
  }

  async createCategory(dto: CreateCategoryDto) {
    const newCat = {
      id: `cat-${Date.now()}`,
      ...dto,
      isCustom: true,
      updatedAt: new Date().toISOString(),
    };
    this.categoryOverrides[newCat.id] = newCat;
    this.saveCategoryOverrides();
    return newCat;
  }

  async updateCategory(id: string, dto: any) {
    const key = id;
    const existing = this.categoryOverrides[key] || {};
    const updated = {
      ...existing,
      ...dto,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.categoryOverrides[key] = updated;
    if (dto.slug) this.categoryOverrides[dto.slug] = updated;
    if (dto.name) this.categoryOverrides[dto.name] = updated;

    this.saveCategoryOverrides();
    this.logger.log(`Category override saved for ${id}`);
    return this.applyCategoryOverride({ id, ...dto });
  }

  async batchSyncCategories(items: any[]) {
    for (const item of items) {
      const key = item.id || item.slug || item.name;
      if (key) {
        this.categoryOverrides[key] = {
          ...this.categoryOverrides[key],
          ...item,
          updatedAt: new Date().toISOString(),
        };
        if (item.slug) this.categoryOverrides[item.slug] = this.categoryOverrides[key];
        if (item.name) this.categoryOverrides[item.name] = this.categoryOverrides[key];
      }
    }
    this.saveCategoryOverrides();
    this.logger.log(`Batch synced ${items.length} categories`);
    return { success: true, count: items.length };
  }

  async resetCategoryOverrides() {
    this.categoryOverrides = {};
    this.saveCategoryOverrides();
    return { success: true, message: 'All category overrides cleared' };
  }

  async getAllServices(filters?: FilterServiceDto) {
    let list = BEAUTYNEST_SERVICES.map((s: any) => this.applyOverride(s));

    if (filters?.category && filters.category !== 'all') {
      list = list.filter((s: any) =>
        s.category?.toLowerCase() === filters.category?.toLowerCase() ||
        s.slug?.includes(filters.category?.toLowerCase())
      );
    }

    if (filters?.isBestseller !== undefined) {
      list = list.filter((s: any) => s.isBestseller === filters.isBestseller);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((s: any) =>
        s.name?.toLowerCase().includes(q) ||
        s.keyFeatures?.toLowerCase().includes(q) ||
        s.serviceId?.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async getServiceByIdOrSlug(idOrSlug: string) {
    const srv = BEAUTYNEST_SERVICES.find(
      (s: any) => s.id === idOrSlug || s.slug === idOrSlug || s.serviceId === idOrSlug
    );
    if (!srv) {
      throw new NotFoundException(`Service ${idOrSlug} not found`);
    }
    return this.applyOverride(srv);
  }

  async createService(dto: any) {
    const newId = dto.serviceId || `BS-${String(BEAUTYNEST_SERVICES.length + 1).padStart(3, '0')}`;
    this.serviceOverrides[newId] = dto;
    this.saveOverrides();
    return { id: newId, ...dto };
  }

  async updateService(id: string, dto: any) {
    const srv = BEAUTYNEST_SERVICES.find(
      (s: any) => s.id === id || s.slug === id || s.serviceId === id
    );

    const key = srv ? (srv.serviceId || srv.id) : id;
    const existing = this.serviceOverrides[key] || srv || {};

    const updated = {
      ...existing,
      ...dto,
      imageUrl: dto.imageUrl || dto.imageUrls?.[0] || existing.imageUrl,
      updatedAt: new Date().toISOString(),
    };

    this.serviceOverrides[key] = updated;
    this.saveOverrides();
    this.logger.log(`Updated service override for ${key} (Image: ${updated.imageUrl?.substring(0, 45)}...)`);
    return updated;
  }

  async batchSync(items: any[]) {
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const key = item.serviceId || item.id || item.slug;
        if (key) {
          this.serviceOverrides[key] = {
            ...(this.serviceOverrides[key] || {}),
            ...item,
          };
        }
      });
      this.saveOverrides();
    }
    return { success: true, count: Object.keys(this.serviceOverrides).length };
  }

  async resetOverrides() {
    this.serviceOverrides = {};
    this.saveOverrides();
    return { success: true, message: 'All service overrides reset to catalog defaults' };
  }

  async deleteService(id: string) {
    const srv = BEAUTYNEST_SERVICES.find((s: any) => s.id === id || s.serviceId === id);
    const key = srv ? (srv.serviceId || srv.id) : id;
    this.serviceOverrides[key] = { ...(this.serviceOverrides[key] || {}), isActive: false };
    this.saveOverrides();
    return { success: true, message: `Service ${id} deactivated` };
  }
}

