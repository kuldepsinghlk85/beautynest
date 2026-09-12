export interface BeautyService {
  id: string;
  serviceId: string;
  name: string;
  slug: string;
  category: string;
  subCategory: string;
  duration: string;
  durationMinutes: number;
  keyFeatures: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  lucknowPriceRange: string;
  varanasiPriceRange: string;
  prayagrajPriceRange: string;
  homeService: boolean;
  onlineBooking: boolean;
  suggestedAddOns: string;
  priceType: string;
  gender: 'Female' | 'Male' | 'Unisex' | string;
  beauticianCommissionPercent: number;
  beauticianCommissionAmount: number;
  platformCommissionPercent: number;
  platformCommissionAmount: number;
  gstPercent: number;
  gstAmount: number;
  estimatedBusinessNet: number;
  estimatedProfit: number;
  suggestedAddonPrice: number;
  suggestedPackagePrice: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  isBestseller: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
  subcategories: string[];
  icon: string;
  image: string;
}

export declare const BEAUTYNEST_SERVICES: BeautyService[];
export declare const SERVICE_CATEGORIES: ServiceCategory[];
export declare function getServiceById(serviceId: string): BeautyService | undefined;
export declare function getServicesByCategory(category: string): BeautyService[];
export declare function getServicesByGender(gender: string): BeautyService[];
export declare function searchServices(query: string): BeautyService[];
export default BEAUTYNEST_SERVICES;
