// Central multi-service cart management & feasibility validation for BeautyNest
import { Service, Beautician, BEAUTICIANS } from './data';
import { MasterCategoryType, getMasterCategoryForService } from './masterCategories';

export interface CartItem {
  service: Service;
  quantity: number;
  masterCategory: MasterCategoryType;
}

export interface FeasibilityValidationResult {
  isFeasibleSingleBeautician: boolean;
  hasSkillMismatch: boolean;
  distinctCategories: MasterCategoryType[];
  conflictReason?: string;
  recommendedSpecialists: {
    category: MasterCategoryType;
    categoryLabel: string;
    beautician: Beautician;
    serviceNames: string[];
  }[];
  splitGroups: {
    category: MasterCategoryType;
    categoryLabel: string;
    items: CartItem[];
    subtotal: number;
    duration: number;
    recommendedBeautician: Beautician;
  }[];
}

const CART_KEY = 'beautynest_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      const parsed: CartItem[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          ...item,
          masterCategory: item.masterCategory || getMasterCategoryForService(item.service),
        }));
      }
    }
  } catch (e) {
    console.error('Error reading cart:', e);
  }
  return [];
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('beautynest_cart_updated'));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
}

export function addToCart(service: Service): void {
  const current = getCart();
  const id = service.id || service.serviceId || service.slug;
  const existingIdx = current.findIndex(
    (c) => c.service.id === id || c.service.serviceId === id || c.service.slug === id
  );

  const masterCategory = service.masterCategory || getMasterCategoryForService(service);

  if (existingIdx >= 0) {
    current[existingIdx].quantity += 1;
  } else {
    current.push({
      service,
      quantity: 1,
      masterCategory,
    });
  }

  saveCart(current);
}

export function removeFromCart(serviceId: string): void {
  const current = getCart();
  const filtered = current.filter(
    (c) => c.service.id !== serviceId && c.service.serviceId !== serviceId && c.service.slug !== serviceId
  );
  saveCart(filtered);
}

export function updateQuantity(serviceId: string, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(serviceId);
    return;
  }
  const current = getCart();
  const target = current.find(
    (c) => c.service.id === serviceId || c.service.serviceId === serviceId || c.service.slug === serviceId
  );
  if (target) {
    target.quantity = quantity;
    saveCart(current);
  }
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event('beautynest_cart_updated'));
  } catch (e) {
    console.error('Error clearing cart:', e);
  }
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.service.price * (item.quantity || 1), 0);
}

export function getCartOriginalTotal(): number {
  return getCart().reduce((sum, item) => sum + (item.service.originalPrice || item.service.price) * (item.quantity || 1), 0);
}

export function getCartDuration(): number {
  return getCart().reduce((sum, item) => sum + (item.service.durationMinutes || 45) * (item.quantity || 1), 0);
}

export function getCartMasterCategories(): MasterCategoryType[] {
  const cart = getCart();
  const cats = new Set<MasterCategoryType>();
  cart.forEach((i) => cats.add(i.masterCategory));
  return Array.from(cats);
}

// Category labels in Hindi & English
export const MASTER_CATEGORY_LABELS: Record<MasterCategoryType, string> = {
  spa: 'स्पा व बॉडी केयर (Spa & Wellness)',
  beauty: 'ब्यूटी व सैलून (Beauty & Salon)',
  makeup: 'मेकअप व ब्राइडल (Makeup & Bridal)',
};

/**
 * Validate whether a single beautician can perform all services in the cart.
 * If services cross domains (e.g. Makeup + Beauty / Spa), checks whether any
 * verified beautician can do both, or if dual specialists / split orders are required.
 */
export function validateCartFeasibility(
  cartItems: CartItem[] = getCart(),
  allBeauticians: Beautician[] = BEAUTICIANS,
  customerArea: string = 'Sigra'
): FeasibilityValidationResult {
  const distinctCategories = Array.from(
    new Set(cartItems.map((item) => item.masterCategory || getMasterCategoryForService(item.service)))
  );

  // If 0 or 1 category in cart, a single specialist of that domain can do it!
  if (distinctCategories.length <= 1) {
    const singleCat = distinctCategories[0] || 'beauty';
    const matched =
      allBeauticians.find(
        (b) =>
          b.skills?.includes(singleCat) &&
          b.area.toLowerCase().includes(customerArea.toLowerCase())
      ) ||
      allBeauticians.find((b) => b.skills?.includes(singleCat)) ||
      allBeauticians[0];

    const group = {
      category: singleCat,
      categoryLabel: MASTER_CATEGORY_LABELS[singleCat],
      items: cartItems,
      subtotal: cartItems.reduce((s, i) => s + i.service.price * i.quantity, 0),
      duration: cartItems.reduce((s, i) => s + (i.service.durationMinutes || 45) * i.quantity, 0),
      recommendedBeautician: matched,
    };

    return {
      isFeasibleSingleBeautician: true,
      hasSkillMismatch: false,
      distinctCategories,
      recommendedSpecialists: [
        {
          category: singleCat,
          categoryLabel: MASTER_CATEGORY_LABELS[singleCat],
          beautician: matched,
          serviceNames: cartItems.map((i) => i.service.name),
        },
      ],
      splitGroups: [group],
    };
  }

  // Multiple categories: Check if ANY single beautician possesses ALL required skills
  const allRounder = allBeauticians.find((b) =>
    distinctCategories.every((cat) => b.skills?.includes(cat))
  );

  // Split groups for each category
  const splitGroups = distinctCategories.map((cat) => {
    const catItems = cartItems.filter((i) => i.masterCategory === cat);
    const catBeautician =
      allBeauticians.find(
        (b) =>
          b.skills?.includes(cat) &&
          b.area.toLowerCase().includes(customerArea.toLowerCase())
      ) ||
      allBeauticians.find((b) => b.skills?.includes(cat)) ||
      allBeauticians[0];

    return {
      category: cat,
      categoryLabel: MASTER_CATEGORY_LABELS[cat],
      items: catItems,
      subtotal: catItems.reduce((s, i) => s + i.service.price * i.quantity, 0),
      duration: catItems.reduce((s, i) => s + (i.service.durationMinutes || 45) * i.quantity, 0),
      recommendedBeautician: catBeautician,
    };
  });

  const recommendedSpecialists = splitGroups.map((g) => ({
    category: g.category,
    categoryLabel: g.categoryLabel,
    beautician: g.recommendedBeautician,
    serviceNames: g.items.map((i) => i.service.name),
  }));

  // Makeup artists do NOT do salon manicure/pedicure/waxing or deep body spa
  const hasMakeupConflict =
    distinctCategories.includes('makeup') &&
    (distinctCategories.includes('beauty') || distinctCategories.includes('spa'));

  const hasSpaBeautyConflict =
    distinctCategories.includes('spa') && distinctCategories.includes('beauty');

  // Conflict is triggered if hasMakeupConflict or no allRounder exists
  const hasSkillMismatch = hasMakeupConflict || !allRounder;

  let conflictReason = '';
  if (hasMakeupConflict) {
    conflictReason =
      'मेकअप आर्टिस्ट (Makeup Artist) मैनीक्योर/पेडीक्योर, वैक्सिंग या बॉडी स्पा नहीं करती हैं, और सैलून ब्यूटीशियन ब्राइडल/एचडी मेकअप नहीं करती हैं। इसके लिए अलग-अलग विशेषज्ञ ब्यूटीशियन की आवश्यकता होती है।';
  } else if (hasSpaBeautyConflict) {
    conflictReason =
      'बॉडी स्पा और सैलून सेवाओं के लिए अलग-अलग उपकरण व विशेषज्ञता की आवश्यकता होती है।';
  }

  return {
    isFeasibleSingleBeautician: !hasSkillMismatch,
    hasSkillMismatch,
    distinctCategories,
    conflictReason,
    recommendedSpecialists,
    splitGroups,
  };
}
