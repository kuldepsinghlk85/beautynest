export type MasterCategoryType = 'spa' | 'beauty' | 'makeup';

export interface MasterCategoryInfo {
  id: MasterCategoryType;
  nameHi: string;
  nameEn: string;
  tagline: string;
  icon: string;
  badgeColor: string;
  image: string;
  subCategoryIds: string[];
}

export const MASTER_CATEGORIES: MasterCategoryInfo[] = [
  {
    id: 'spa',
    nameHi: 'स्पा',
    nameEn: 'Spa & Wellness',
    tagline: 'बॉडी मसाज, थेरेपी, पॉलिशिंग और रिलैक्सेशन',
    icon: 'Flower2',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
    subCategoryIds: ['massage-spa', 'body-care'],
  },
  {
    id: 'beauty',
    nameHi: 'ब्यूटी',
    nameEn: 'Beauty & Salon',
    tagline: 'फेशियल, वैक्सिंग, हेयर केयर, मैनीक्योर व पेडीक्योर',
    icon: 'Sparkles',
    badgeColor: 'bg-pink-50 text-brand-primary border-pink-200',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    subCategoryIds: [
      'facial',
      'bleach-dtan',
      'threading',
      'waxing',
      'manicure',
      'pedicure',
      'hair-care',
      'male-grooming',
      'kids',
    ],
  },
  {
    id: 'makeup',
    nameHi: 'मेकअप',
    nameEn: 'Makeup & Bridal',
    tagline: 'ब्राइडल एचडी मेकअप, पार्टी मेकअप, मेहंदी व प्री-ब्राइडल',
    icon: 'Crown',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    subCategoryIds: ['bridal-makeup', 'bridal-pre-bridal', 'mehendi'],
  },
];

export function getMasterCategoryForCategory(categoryIdOrName?: string): MasterCategoryType {
  if (!categoryIdOrName) return 'beauty';
  const norm = categoryIdOrName.toLowerCase();

  // Spa checks
  if (
    norm.includes('massage') ||
    norm.includes('spa') ||
    norm.includes('body-care') ||
    norm.includes('body care') ||
    norm.includes('polishing')
  ) {
    return 'spa';
  }

  // Makeup checks
  if (
    norm.includes('makeup') ||
    norm.includes('bridal') ||
    norm.includes('pre-bridal') ||
    norm.includes('mehendi') ||
    norm.includes('henna')
  ) {
    return 'makeup';
  }

  // Default to Beauty (facials, waxing, threading, hair, manicure, pedicure, grooming)
  return 'beauty';
}

export function getMasterCategoryForService(service: {
  category?: string;
  categoryName?: string;
  name?: string;
}): MasterCategoryType {
  if (!service) return 'beauty';
  if (service.category) {
    const fromCat = getMasterCategoryForCategory(service.category);
    if (fromCat !== 'beauty') return fromCat;
  }
  if (service.categoryName) {
    const fromName = getMasterCategoryForCategory(service.categoryName);
    if (fromName !== 'beauty') return fromName;
  }
  if (service.name) {
    const n = service.name.toLowerCase();
    if (n.includes('bridal') || n.includes('makeup') || n.includes('mehendi')) return 'makeup';
    if (n.includes('massage') || (n.includes('spa') && !n.includes('hair spa'))) return 'spa';
  }
  return 'beauty';
}

export function getMasterCategoryMeta(id: MasterCategoryType): MasterCategoryInfo {
  return MASTER_CATEGORIES.find((m) => m.id === id) || MASTER_CATEGORIES[1];
}
