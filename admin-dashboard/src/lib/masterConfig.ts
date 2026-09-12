export interface CityConfig {
  id: string;
  name: string;
  state: string;
  slug: string;
  priceOverridesCount: number;
  isActive: boolean;
  minBookingValue: number;
  deliveryChargePerKm: number;
}

export interface BeauticianCategoryTier {
  id: string;
  name: string;
  badgeColor: string;
  commissionPercent: number; // e.g. 10 for Bronze, 15 for Silver, 20 for Gold
  minJobsRequired: number;
  minRating: number;
  perks: string[];
}

export interface DistanceRuleConfig {
  isEnabled: boolean;
  freeDistanceKm: number; // e.g. 3 KM
  perKmCharge: number; // e.g. ₹50 per KM
  fixedChargeAfterThreshold: number; // 0 or fixed fee
  maxServiceRadiusKm: number; // 3, 5, 7, 10, or All City (e.g. 25)
}

export interface CustomerConsentForm {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  hasSkinAllergies: boolean;
  allergyDetails?: string;
  isPregnant: boolean;
  skinSensitivityLevel: 'Normal' | 'Sensitive' | 'Very Sensitive';
  productPermissionGranted: boolean;
  digitalAccepted: boolean;
  signedAt: string;
  beauticianVerified: boolean;
  verifiedAt?: string;
  verifiedByWorker?: string;
}

export interface OperatorPermission {
  id: string;
  operatorName: string;
  email: string;
  role: 'OPERATOR' | 'DISPATCHER';
  allowedCities: string[];
  canAssignBeautician: boolean;
  canUpdateStatus: boolean;
  hideFinancials: boolean; // Cannot view profit margin, internal cost, company commission
}

export interface ExtraServiceProduct {
  id: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  addedByBeautician: string;
  addedAt: string;
}

// Initial Serviceable Cities (Matches Screenshot 2)
export const INITIAL_CITIES: CityConfig[] = [
  {
    id: 'city-blr',
    name: 'Bangalore',
    state: 'Karnataka',
    slug: 'bangalore',
    priceOverridesCount: 0,
    isActive: true,
    minBookingValue: 499,
    deliveryChargePerKm: 50,
  },
  {
    id: 'city-del',
    name: 'Delhi',
    state: 'Delhi',
    slug: 'delhi',
    priceOverridesCount: 1,
    isActive: true,
    minBookingValue: 499,
    deliveryChargePerKm: 50,
  },
  {
    id: 'city-lko',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    slug: 'lucknow',
    priceOverridesCount: 99,
    isActive: true,
    minBookingValue: 399,
    deliveryChargePerKm: 40,
  },
  {
    id: 'city-bom',
    name: 'Mumbai',
    state: 'Maharashtra',
    slug: 'mumbai',
    priceOverridesCount: 1,
    isActive: true,
    minBookingValue: 599,
    deliveryChargePerKm: 60,
  },
  {
    id: 'city-pry',
    name: 'Prayagraj',
    state: 'Uttar Pradesh',
    slug: 'prayagraj',
    priceOverridesCount: 99,
    isActive: true,
    minBookingValue: 349,
    deliveryChargePerKm: 40,
  },
  {
    id: 'city-pun',
    name: 'Pune',
    state: 'Maharashtra',
    slug: 'pune',
    priceOverridesCount: 0,
    isActive: true,
    minBookingValue: 449,
    deliveryChargePerKm: 50,
  },
  {
    id: 'city-vns',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    slug: 'banaras',
    priceOverridesCount: 99,
    isActive: true,
    minBookingValue: 299,
    deliveryChargePerKm: 50,
  },
];

// Beautician Categories & Commissions
export const INITIAL_BEAUTICIAN_TIERS: BeauticianCategoryTier[] = [
  {
    id: 'tier-bronze',
    name: 'Bronze Beautician',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    commissionPercent: 10,
    minJobsRequired: 0,
    minRating: 4.0,
    perks: ['Standard Welcome Kit', 'Direct Doorstep Booking', 'Basic Salon Support'],
  },
  {
    id: 'tier-silver',
    name: 'Silver Specialist',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    commissionPercent: 15,
    minJobsRequired: 50,
    minRating: 4.5,
    perks: ['Higher Payout Rate', 'Priority Dispatch Queue', 'Advanced O3+ Certified'],
  },
  {
    id: 'tier-gold',
    name: 'Gold Master Artisan',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    commissionPercent: 20,
    minJobsRequired: 150,
    minRating: 4.8,
    perks: ['20% Payout Bonus', 'Bridal & Premium Client Access', 'Top Worker Leaderboard'],
  },
  {
    id: 'tier-platinum',
    name: 'Platinum Royal Pro',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    commissionPercent: 25,
    minJobsRequired: 300,
    minRating: 4.9,
    perks: ['Maximum Commission', 'VIP Luxury Kit Supplied', 'Dedicated Dispatch Manager'],
  },
];

// Distance Charge Engine Configuration
export const DEFAULT_DISTANCE_RULES: DistanceRuleConfig = {
  isEnabled: true,
  freeDistanceKm: 3, // First 3 KM Free
  perKmCharge: 50, // ₹50/KM thereafter
  fixedChargeAfterThreshold: 0,
  maxServiceRadiusKm: 10,
};

// Consent Forms Mock Store
export const INITIAL_CONSENT_FORMS: CustomerConsentForm[] = [
  {
    id: 'cnf-101',
    bookingId: 'BK-6887',
    customerName: 'Ritu Singh',
    customerPhone: '+91 98390 44551',
    serviceName: 'Korean Glass Skin Hydra Ritual',
    hasSkinAllergies: false,
    isPregnant: false,
    skinSensitivityLevel: 'Normal',
    productPermissionGranted: true,
    digitalAccepted: true,
    signedAt: 'Today, 10:45 AM',
    beauticianVerified: true,
    verifiedAt: 'Today, 11:25 AM',
    verifiedByWorker: 'Priya Beautician (Gold)',
  },
  {
    id: 'cnf-102',
    bookingId: 'BK-6888',
    customerName: 'Neha Verma',
    customerPhone: '+91 98390 44552',
    serviceName: 'O3+ Whitening & Brightening Facial',
    hasSkinAllergies: true,
    allergyDetails: 'Mild redness with strong bleach, allergic to synthetic fragrance',
    isPregnant: false,
    skinSensitivityLevel: 'Sensitive',
    productPermissionGranted: true,
    digitalAccepted: true,
    signedAt: 'Today, 11:15 AM',
    beauticianVerified: false,
  },
  {
    id: 'cnf-103',
    bookingId: 'BK-6889',
    customerName: 'Pooja Agarwal',
    customerPhone: '+91 98390 44553',
    serviceName: 'Rica Brazilian Chocolate Waxing',
    hasSkinAllergies: false,
    isPregnant: false,
    skinSensitivityLevel: 'Normal',
    productPermissionGranted: true,
    digitalAccepted: true,
    signedAt: 'Yesterday, 04:30 PM',
    beauticianVerified: true,
    verifiedAt: 'Yesterday, 05:00 PM',
    verifiedByWorker: 'Sunita Sharma (Silver)',
  },
];

// Pricing Engine Calculation
export function calculateDynamicServicePrice(params: {
  baseServiceCost: number;
  cosmeticProductCost: number;
  customerUsesOwnProducts: boolean;
  beauticianCommissionPercent: number;
  distanceKm: number;
  distanceRules?: DistanceRuleConfig;
  taxPercent?: number;
  discountAmount?: number;
}) {
  const {
    baseServiceCost,
    cosmeticProductCost,
    customerUsesOwnProducts,
    beauticianCommissionPercent,
    distanceKm,
    distanceRules = DEFAULT_DISTANCE_RULES,
    taxPercent = 5,
    discountAmount = 0,
  } = params;

  // 1. Cosmetic Product Cost: 0 if customer has own products
  const finalProductCost = customerUsesOwnProducts ? 0 : cosmeticProductCost;

  // 2. Distance Charge: free up to threshold, then per KM
  let distanceCharge = 0;
  if (distanceRules.isEnabled && distanceKm > distanceRules.freeDistanceKm) {
    const chargeableKm = distanceKm - distanceRules.freeDistanceKm;
    distanceCharge = Math.round(chargeableKm * distanceRules.perKmCharge) + distanceRules.fixedChargeAfterThreshold;
  }

  // 3. Beautician Commission Amount
  const beauticianShare = Math.round((baseServiceCost * beauticianCommissionPercent) / 100);

  // 4. Subtotal
  const subtotal = baseServiceCost + finalProductCost + distanceCharge;

  // 5. Taxes & Total
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableAmount * taxPercent) / 100);
  const finalPayable = Math.max(0, taxableAmount + taxAmount);

  // 6. Company Gross Margin & Net Profit
  const companyMargin = Math.max(0, baseServiceCost - beauticianShare);

  return {
    baseServiceCost,
    cosmeticProductCost: finalProductCost,
    savedByOwnProducts: customerUsesOwnProducts ? cosmeticProductCost : 0,
    distanceKm,
    distanceCharge,
    beauticianShare,
    beauticianCommissionPercent,
    companyMargin,
    subtotal,
    discountAmount,
    taxAmount,
    finalPayable,
  };
}
