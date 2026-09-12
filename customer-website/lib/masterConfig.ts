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

export interface DistanceRuleConfig {
  isEnabled: boolean;
  freeDistanceKm: number; // e.g. 3 KM
  perKmCharge: number; // e.g. ₹50 per KM
  fixedChargeAfterThreshold: number;
  maxServiceRadiusKm: number;
}

export const DEFAULT_DISTANCE_RULES: DistanceRuleConfig = {
  isEnabled: true,
  freeDistanceKm: 3,
  perKmCharge: 50,
  fixedChargeAfterThreshold: 0,
  maxServiceRadiusKm: 10,
};

export const INITIAL_CITIES: CityConfig[] = [
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
    id: 'city-pun',
    name: 'Pune',
    state: 'Maharashtra',
    slug: 'pune',
    priceOverridesCount: 0,
    isActive: true,
    minBookingValue: 449,
    deliveryChargePerKm: 50,
  },
];

export function calculateCustomerPricing(params: {
  baseServiceCost: number;
  cosmeticProductCost: number;
  customerUsesOwnProducts: boolean;
  distanceKm: number;
  distanceRules?: DistanceRuleConfig;
  discountAmount?: number;
}) {
  const {
    baseServiceCost,
    cosmeticProductCost,
    customerUsesOwnProducts,
    distanceKm,
    distanceRules = DEFAULT_DISTANCE_RULES,
    discountAmount = 0,
  } = params;

  const productCost = customerUsesOwnProducts ? 0 : cosmeticProductCost;

  let distanceCharge = 0;
  if (distanceRules.isEnabled && distanceKm > distanceRules.freeDistanceKm) {
    const chargeableKm = distanceKm - distanceRules.freeDistanceKm;
    distanceCharge = Math.round(chargeableKm * distanceRules.perKmCharge);
  }

  const subtotal = baseServiceCost + productCost + distanceCharge;
  const taxable = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxable * 0.05);
  const total = Math.max(0, taxable + tax);

  return {
    baseServiceCost,
    productCost,
    savedByOwnProduct: customerUsesOwnProducts ? cosmeticProductCost : 0,
    distanceKm,
    distanceCharge,
    subtotal,
    tax,
    total,
  };
}
