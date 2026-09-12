import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  Star,
  Sparkles,
  Search,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Tag,
  Percent,
  Save,
  Check,
  Gift,
  Calculator,
  Car,
  Package,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { BEAUTYNEST_SERVICES, SERVICE_CATEGORIES, type BeautyService, type ServiceCategory } from '../lib/allServices';

interface ServiceItem {
  id: string;
  serviceId?: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice: number;
  duration: number;
  durationString?: string;
  rating: number;
  isBestseller: boolean;
  imageUrl?: string;
  description?: string;
  varanasiPriceRange?: string;
  lucknowPriceRange?: string;
  prayagrajPriceRange?: string;
  gender?: string;

  // Dynamic Pricing Formula Breakdown (Basic + Beautician Cut + Cosmetics + Travel + Safety)
  baseLaborPrice: number;
  beauticianShare: number;
  cosmeticProductCost: number;
  distanceCharge: number;
  additionalCharges: number;

  beauticianCommissionPercent?: number;
  beauticianCommissionAmount?: number;
  platformCommissionPercent?: number;
  platformCommissionAmount?: number;
  gstPercent?: number;
  gstAmount?: number;
  estimatedBusinessNet?: number;
  estimatedProfit?: number;
  suggestedAddOns?: string;
  offerCode?: string;
  offerTag?: string;
  discountPercent?: number;
}

export const ACTIVE_PROMO_CODES = [
  {
    code: 'VARANASI50',
    title: 'Varanasi Launch Special',
    discount: 'Flat ₹50 OFF',
    desc: 'Valid on all doorstep salon services across Varanasi',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    code: 'GLOW30',
    title: 'Facial & Glow Fest',
    discount: '30% OFF',
    desc: 'Valid on all premium O3+, Korean & Hydra facials',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    code: 'BRIDAL1000',
    title: 'Royal Bridal Care',
    discount: 'Flat ₹1000 OFF',
    desc: 'Valid on luxury pre-bridal and bridal packages',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    code: 'FESTIVE25',
    title: 'Ganga Utsav Glam',
    discount: '25% OFF',
    desc: 'Festive hair spa, waxing & mani-pedi packages',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

// Full suite of 132 services from user sheet (BS-001 to BS-132) with offer mappings & dynamic pricing formula
const CATALOG_SERVICES: ServiceItem[] = BEAUTYNEST_SERVICES.map((s, index) => {
  let offerCode: string | undefined = undefined;
  let offerTag: string | undefined = undefined;
  let discountPercent: number | undefined = undefined;

  if (s.category.toLowerCase().includes('facial') || s.category.toLowerCase().includes('clean')) {
    offerCode = 'GLOW30';
    offerTag = '30% OFF Glow';
    discountPercent = 30;
  } else if (s.category.toLowerCase().includes('bridal')) {
    offerCode = 'BRIDAL1000';
    offerTag = '₹1000 OFF';
  } else if (index % 5 === 0) {
    offerCode = 'VARANASI50';
    offerTag = 'Flat ₹50 OFF';
  } else if (index % 7 === 0) {
    offerCode = 'FESTIVE25';
    offerTag = '25% Festive';
    discountPercent = 25;
  }

  // Exact formula breakdown matching master specification
  const price = s.price;
  const baseLaborPrice = Math.round(price * 0.45);
  const beauticianShare = Math.round(price * 0.20); // 20% Gold partner cut
  const cosmeticProductCost = Math.round(price * 0.25); // cosmetics portion (waived to 0 if own products)
  const distanceCharge = 0; // free within 3 KM threshold
  const additionalCharges = Math.max(0, price - (baseLaborPrice + beauticianShare + cosmeticProductCost + distanceCharge));

  return {
    id: s.slug || s.id,
    serviceId: s.serviceId,
    name: s.name,
    category: s.category,
    subcategory: s.subCategory,
    price: s.price,
    originalPrice: s.originalPrice,
    duration: s.durationMinutes,
    durationString: s.duration,
    rating: s.rating,
    isBestseller: s.isBestseller,
    imageUrl: s.imageUrl,
    description: s.keyFeatures,
    varanasiPriceRange: s.varanasiPriceRange,
    lucknowPriceRange: s.lucknowPriceRange,
    prayagrajPriceRange: s.prayagrajPriceRange,
    gender: s.gender,

    // Formula breakdown:
    baseLaborPrice,
    beauticianShare,
    cosmeticProductCost,
    distanceCharge,
    additionalCharges,

    beauticianCommissionPercent: s.beauticianCommissionPercent,
    beauticianCommissionAmount: s.beauticianCommissionAmount,
    platformCommissionPercent: s.platformCommissionPercent,
    platformCommissionAmount: s.platformCommissionAmount,
    gstPercent: s.gstPercent,
    gstAmount: s.gstAmount,
    estimatedBusinessNet: s.estimatedBusinessNet,
    estimatedProfit: s.estimatedProfit,
    suggestedAddOns: s.suggestedAddOns,
    offerCode,
    offerTag,
    discountPercent,
  };
});

const CATEGORIES = [
  'All Categories',
  ...SERVICE_CATEGORIES.map((c) => c.name),
];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(CATALOG_SERVICES);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Top Formula Simulator State
  const [simBase, setSimBase] = useState(300);
  const [simTierPercent, setSimTierPercent] = useState(20);
  const [simCosmetic, setSimCosmetic] = useState(150);
  const [simDistanceKm, setSimDistanceKm] = useState(2.5);
  const [simSafetyKit, setSimSafetyKit] = useState(49);
  const [simOwnProducts, setSimOwnProducts] = useState(false);

  // Computed simulator values
  const simBeauticianCut = Math.round(simBase * (simTierPercent / 100));
  const simEffectiveCosmetics = simOwnProducts ? 0 : simCosmetic;
  const simDistanceFee = simDistanceKm > 3 ? Math.round((simDistanceKm - 3) * 50) : 0;
  const simFinalPrice = simBase + simBeauticianCut + simEffectiveCosmetics + simDistanceFee + simSafetyKit;

  // Add Form State
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState(SERVICE_CATEGORIES[0]?.name || 'Facial & Cleanup');
  const [newSubcat, setNewSubcat] = useState(SERVICE_CATEGORIES[0]?.subcategories[0] || 'Cleanup');
  const [newBaseLabor, setNewBaseLabor] = useState(350);
  const [newBeauticianCut, setNewBeauticianCut] = useState(150);
  const [newCosmeticCost, setNewCosmeticCost] = useState(200);
  const [newDistanceCharge, setNewDistanceCharge] = useState(0);
  const [newAdditionalCharges, setNewAdditionalCharges] = useState(49);
  const [newPrice, setNewPrice] = useState('749');
  const [newOriginalPrice, setNewOriginalPrice] = useState('1199');
  const [newVaranasiRange, setNewVaranasiRange] = useState('699 - 999');
  const [newDuration, setNewDuration] = useState('60');
  const [newDesc, setNewDesc] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80');
  const [newIsBestseller, setNewIsBestseller] = useState(false);
  const [newOfferCode, setNewOfferCode] = useState('VARANASI50');
  const [newOfferTag, setNewOfferTag] = useState('Flat ₹50 OFF');
  const [newDiscountPercent, setNewDiscountPercent] = useState('10');

  // Edit Form State
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCat, setEditCat] = useState('');
  const [editSubcat, setEditSubcat] = useState('');
  const [editBaseLabor, setEditBaseLabor] = useState(0);
  const [editBeauticianCut, setEditBeauticianCut] = useState(0);
  const [editCosmeticCost, setEditCosmeticCost] = useState(0);
  const [editDistanceCharge, setEditDistanceCharge] = useState(0);
  const [editAdditionalCharges, setEditAdditionalCharges] = useState(30);
  const [editPrice, setEditPrice] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editVaranasiRange, setEditVaranasiRange] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editIsBestseller, setEditIsBestseller] = useState(false);
  const [editOfferCode, setEditOfferCode] = useState('');
  const [editOfferTag, setEditOfferTag] = useState('');
  const [editDiscountPercent, setEditDiscountPercent] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Recalculate Edit Price whenever formula components change
  const handleEditFormulaChange = (base: number, provider: number, cosmetic: number, travel: number, addl: number) => {
    setEditBaseLabor(base);
    setEditBeauticianCut(provider);
    setEditCosmeticCost(cosmetic);
    setEditDistanceCharge(travel);
    setEditAdditionalCharges(addl);
    const sum = base + provider + cosmetic + travel + addl;
    setEditPrice(String(sum));
  };

  // Recalculate Add Price whenever formula components change
  const handleAddFormulaChange = (base: number, provider: number, cosmetic: number, travel: number, addl: number) => {
    setNewBaseLabor(base);
    setNewBeauticianCut(provider);
    setNewCosmeticCost(cosmetic);
    setNewDistanceCharge(travel);
    setNewAdditionalCharges(addl);
    const sum = base + provider + cosmetic + travel + addl;
    setNewPrice(String(sum));
  };

  // Image Upload handler for Add Service
  const handleAddImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Image Upload handler for Edit Service
  const handleEditImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Edit Service Modal with formula pre-population
  const handleStartEditService = (s: ServiceItem) => {
    setEditingService(s);
    setEditName(s.name);
    setEditCat(s.category);
    setEditSubcat(s.subcategory || '');

    const base = s.baseLaborPrice || Math.round(s.price * 0.45);
    const provider = s.beauticianShare || Math.round(s.price * 0.20);
    const cosmetic = s.cosmeticProductCost || Math.round(s.price * 0.25);
    const travel = s.distanceCharge || 0;
    const addl = s.additionalCharges !== undefined ? s.additionalCharges : Math.max(0, s.price - (base + provider + cosmetic + travel));

    setEditBaseLabor(base);
    setEditBeauticianCut(provider);
    setEditCosmeticCost(cosmetic);
    setEditDistanceCharge(travel);
    setEditAdditionalCharges(addl);
    setEditPrice(String(s.price));
    setEditOriginalPrice(String(s.originalPrice));
    setEditVaranasiRange(s.varanasiPriceRange || `${Math.round(s.price * 0.9)} - ${Math.round(s.price * 1.3)}`);
    setEditDuration(String(s.duration));
    setEditDesc(s.description || '');
    setEditImageUrl(s.imageUrl || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80');
    setEditIsBestseller(s.isBestseller);
    setEditOfferCode(s.offerCode || '');
    setEditOfferTag(s.offerTag || '');
    setEditDiscountPercent(s.discountPercent ? String(s.discountPercent) : '');
    setEditSuccess(false);
  };

  // Save Edit Service
  const handleSaveServiceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const finalCalculatedPrice = Number(editPrice) || (editBaseLabor + editBeauticianCut + editCosmeticCost + editDistanceCharge + editAdditionalCharges);

    setServices((prev) =>
      prev.map((item) =>
        item.id === editingService.id
          ? {
              ...item,
              name: editName,
              category: editCat,
              subcategory: editSubcat,
              price: finalCalculatedPrice,
              originalPrice: Number(editOriginalPrice) || item.originalPrice,
              varanasiPriceRange: editVaranasiRange,
              duration: Number(editDuration) || item.duration,
              durationString: `${editDuration} mins`,
              description: editDesc,
              imageUrl: editImageUrl,
              isBestseller: editIsBestseller,
              offerCode: editOfferCode || undefined,
              offerTag: editOfferTag || undefined,
              discountPercent: Number(editDiscountPercent) || undefined,
              baseLaborPrice: editBaseLabor,
              beauticianShare: editBeauticianCut,
              cosmeticProductCost: editCosmeticCost,
              distanceCharge: editDistanceCharge,
              additionalCharges: editAdditionalCharges,
            }
          : item
      )
    );
    setEditSuccess(true);
    setTimeout(() => {
      setEditSuccess(false);
      setEditingService(null);
    }, 1200);
  };

  // Add Service Submit
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCalculatedPrice = Number(newPrice) || (newBaseLabor + newBeauticianCut + newCosmeticCost + newDistanceCharge + newAdditionalCharges);

    const item: ServiceItem = {
      id: `srv-${Date.now()}`,
      serviceId: `BS-${String(services.length + 1).padStart(3, '0')}`,
      name: newName,
      category: newCat,
      subcategory: newSubcat,
      price: finalCalculatedPrice,
      originalPrice: Number(newOriginalPrice) || Math.round(finalCalculatedPrice * 1.5),
      varanasiPriceRange: newVaranasiRange,
      duration: Number(newDuration) || 60,
      durationString: `${newDuration} mins`,
      rating: 5.0,
      isBestseller: newIsBestseller,
      imageUrl: newImageUrl,
      description: newDesc,
      offerCode: newOfferCode || undefined,
      offerTag: newOfferTag || undefined,
      discountPercent: Number(newDiscountPercent) || undefined,
      baseLaborPrice: newBaseLabor,
      beauticianShare: newBeauticianCut,
      cosmeticProductCost: newCosmeticCost,
      distanceCharge: newDistanceCharge,
      additionalCharges: newAdditionalCharges,
    };
    setServices([item, ...services]);
    setShowAddModal(false);
    setNewName('');
    setNewDesc('');
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const filtered = services.filter((s) => {
    const matchesCategory = selectedCategory === 'All Categories' || s.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.serviceId && s.serviceId.toLowerCase().includes(q)) ||
      (s.subcategory && s.subcategory.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.offerCode && s.offerCode.toLowerCase().includes(q)) ||
      (s.offerTag && s.offerTag.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-gray-900">
              Services &amp; Packages Catalog (Varanasi)
            </h2>
            <span className="bg-pink-100 text-brand-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
              {services.length} Services Live
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Full 132-service production catalog (BS-001 to BS-132) with live price editing, photo uploader, and promo code offers
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand-primary to-pink-500 hover:from-brand-primaryDark hover:to-brand-primary text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-pink-soft transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* DYNAMIC PRICING FORMULA & TARIFF SIMULATOR BANNER */}
      <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 text-xs font-bold text-gray-900">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Master Dynamic Pricing Formula &amp; Tariff Engine</h3>
              <p className="text-[11px] text-gray-500 font-normal">
                Final Customer Payable = Basic Cost + Beautician Tier Commission + Cosmetic Products + Distance Charge + Additional Charges
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              ✓ Customer Own Products = ₹0 Cosmetic Cost
            </span>
          </div>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* 1. Basic Labor */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">1. Basic Labor</span>
            <input
              type="number"
              value={simBase}
              onChange={(e) => setSimBase(Number(e.target.value) || 0)}
              className="w-full mt-1 px-2 py-1 bg-white border border-gray-200 rounded-lg font-bold text-gray-900 text-xs"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">Technician Base</span>
          </div>

          {/* 2. Beautician Tier */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">2. Partner Cut ({simTierPercent}%)</span>
            <select
              value={simTierPercent}
              onChange={(e) => setSimTierPercent(Number(e.target.value))}
              className="w-full mt-1 px-2 py-1 bg-white border border-gray-200 rounded-lg font-bold text-gray-900 text-xs cursor-pointer"
            >
              <option value={10}>Bronze (10%)</option>
              <option value={15}>Silver (15%)</option>
              <option value={20}>Gold (20%)</option>
              <option value={25}>Platinum (25%)</option>
            </select>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">+₹{simBeauticianCut} Cut</span>
          </div>

          {/* 3. Cosmetics */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">3. Cosmetics</span>
            <input
              type="number"
              value={simCosmetic}
              onChange={(e) => setSimCosmetic(Number(e.target.value) || 0)}
              disabled={simOwnProducts}
              className="w-full mt-1 px-2 py-1 bg-white border border-gray-200 rounded-lg font-bold text-gray-900 text-xs disabled:opacity-50"
            />
            <label className="flex items-center gap-1 mt-1 text-[10px] text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={simOwnProducts}
                onChange={(e) => setSimOwnProducts(e.target.checked)}
                className="w-3 h-3 accent-[#0071E3]"
              />
              <span>Own Products</span>
            </label>
          </div>

          {/* 4. Distance */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">4. Travel Distance</span>
            <select
              value={simDistanceKm}
              onChange={(e) => setSimDistanceKm(Number(e.target.value))}
              className="w-full mt-1 px-2 py-1 bg-white border border-gray-200 rounded-lg font-bold text-gray-900 text-xs cursor-pointer"
            >
              <option value={2.5}>2.5 KM (Free)</option>
              <option value={3.0}>3.0 KM (Free)</option>
              <option value={5.5}>5.5 KM (+₹125)</option>
              <option value={8.0}>8.0 KM (+₹250)</option>
            </select>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">
              {simDistanceFee === 0 ? 'Free (≤3 KM)' : `+₹${simDistanceFee}`}
            </span>
          </div>

          {/* 5. Additional / Safety Kit */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/80">
            <span className="text-[10px] font-bold text-gray-500 uppercase block">5. Safety Kit &amp; PPE</span>
            <input
              type="number"
              value={simSafetyKit}
              onChange={(e) => setSimSafetyKit(Number(e.target.value) || 0)}
              className="w-full mt-1 px-2 py-1 bg-white border border-gray-200 rounded-lg font-bold text-gray-900 text-xs"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">Disposables Pack</span>
          </div>

          {/* Result: Calculated Final Price */}
          <div className="bg-blue-50/70 p-3 rounded-xl border-2 border-[#0071E3]/40 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#0071E3] uppercase block">Final Calculated</span>
            <span className="text-xl font-extrabold text-[#0071E3] mt-0.5">₹{simFinalPrice}</span>
            <span className="text-[10px] text-gray-500">
              {simOwnProducts ? '₹0 product cost applied' : 'Standard salon kit'}
            </span>
          </div>
        </div>
      </div>

      {/* Offers & Promo Codes Quick Manager Bar */}
      <div className="bg-gradient-to-r from-pink-50/90 via-purple-50/50 to-amber-50/80 rounded-2xl p-4 border border-pink-200/80 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
            <Gift className="w-4 h-4 text-brand-primary" />
            <span>Active Varanasi Offer Codes &amp; Seasonal Discounts</span>
          </div>
          <span className="text-[11px] text-brand-primary font-semibold">
            Apply to any service or paste at checkout
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ACTIVE_PROMO_CODES.map((promo) => (
            <div
              key={promo.code}
              className="bg-white/95 rounded-xl p-3 border border-pink-100 shadow-xs flex flex-col justify-between gap-1.5"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-extrabold text-brand-primary tracking-wider bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                    {promo.code}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {promo.discount}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-800 mt-1.5">{promo.title}</h4>
                <p className="text-[10px] text-gray-500 line-clamp-1">{promo.desc}</p>
              </div>

              <button
                onClick={() => copyPromoCode(promo.code)}
                className="w-full text-center text-[10px] font-bold text-brand-primary hover:text-brand-primaryDark py-1 bg-pink-50/60 hover:bg-pink-100 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                {copiedCode === promo.code ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Tag className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code (BS-001), name, offer (GLOW30)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-primary text-white font-bold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-6">Code &amp; Service</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Dynamic Pricing Formula Breakdown</th>
                <th className="py-3.5 px-6">Varanasi Range</th>
                <th className="py-3.5 px-6">Duration</th>
                <th className="py-3.5 px-6">Offers &amp; Codes</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-pink-50/30 transition-colors">
                  {/* Service Details & Photo */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      {s.imageUrl && (
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-pink-100 shrink-0 bg-gray-100">
                          <img
                            src={s.imageUrl}
                            alt={s.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          {s.serviceId && (
                            <span className="bg-pink-100 text-brand-primary text-[10px] font-bold px-1.5 py-0.2 rounded">
                              {s.serviceId}
                            </span>
                          )}
                          <span className="font-bold text-gray-900">{s.name}</span>
                        </div>
                        {s.subcategory && (
                          <span className="text-[10px] text-gray-400 block mt-0.5">{s.subcategory}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-6 font-medium text-gray-600">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      {s.category}
                    </span>
                  </td>

                  {/* Dynamic Pricing Formula Breakdown Column */}
                  <td className="py-3.5 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">₹{s.price}</span>
                        <span className="text-gray-400 line-through text-[10px]">₹{s.originalPrice}</span>
                        <span className="text-[9px] bg-blue-100 text-[#0071E3] font-extrabold px-1.5 py-0.2 rounded">
                          Formula Total
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 text-[10px]">
                        <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-medium" title="Technician Service Labor">
                          🛠️ Base: ₹{s.baseLaborPrice}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium" title="Provider Tier Commission">
                          👩‍💼 Partner: ₹{s.beauticianShare}
                        </span>
                        <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium" title="Cosmetic Product Cost (₹0 if own products)">
                          🧴 Cosmetic: ₹{s.cosmeticProductCost}
                        </span>
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium" title="Safety Kit & PPE">
                          🛡️ Kit: ₹{s.additionalCharges}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Varanasi Price Range */}
                  <td className="py-3.5 px-6 font-medium text-purple-700">
                    {s.varanasiPriceRange ? `₹${s.varanasiPriceRange}` : `₹${s.price}`}
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-6 text-gray-500">
                    {s.durationString || `${s.duration} mins`}
                  </td>

                  {/* Offers & Promo Codes Badge */}
                  <td className="py-3.5 px-6">
                    <div className="flex flex-col gap-1 items-start">
                      {s.offerTag && (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          <Tag className="w-2.5 h-2.5" />
                          <span>{s.offerTag}</span>
                          {s.offerCode && <span className="font-mono text-brand-primary">[{s.offerCode}]</span>}
                        </span>
                      )}
                      {s.isBestseller ? (
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          ★ Bestseller
                        </span>
                      ) : !s.offerTag ? (
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                          Standard
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Row Actions: Edit & Delete */}
                  <td className="py-3.5 px-6 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleStartEditService(s)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-lg border border-pink-200 transition-colors"
                      title="Edit Service, Photo, Price & Offer Code"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setServices(services.filter((item) => item.id !== s.id))}
                      className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Service Modal with Photo Uploader & Price/Offer Editing */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-3 sm:p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-pink-100 max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-pink-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <div className="flex items-center gap-2 text-brand-primary mb-0.5">
                  <Edit className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Service Catalog Editor • Varanasi
                  </span>
                </div>
                <h3 className="text-xl font-bold font-serif text-gray-900">
                  Edit Service &amp; Offers
                </h3>
              </div>
              <button
                onClick={() => setEditingService(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              {editSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900">
                    Service Updated Successfully!
                  </h3>
                  <p className="text-xs text-gray-600">
                    Updated price, photo, and offer settings for <strong>{editName}</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveServiceEdit} className="space-y-4">
                  {/* Photo Uploader Section */}
                  <div className="bg-pink-50/60 p-3.5 rounded-2xl border border-pink-100">
                    <label className="block text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-brand-primary" />
                      Service Photo Image Uploader *
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border-2 border-brand-primary shrink-0 shadow-sm">
                        <img
                          src={editImageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            ref={editFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageFileChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 bg-white hover:bg-pink-50 text-brand-primary border border-pink-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image from Device</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          placeholder="Or paste image URL"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Service Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={editCat}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditCat(val);
                          const matched = SERVICE_CATEGORIES.find((c) => c.name === val);
                          if (matched && matched.subcategories && matched.subcategories.length > 0) {
                            setEditSubcat(matched.subcategories[0]);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white font-medium"
                      >
                        {SERVICE_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Subcategory
                      </label>
                      {(() => {
                        const currentCatObj = SERVICE_CATEGORIES.find((c) => c.name === editCat);
                        const subcats = currentCatObj?.subcategories || [];
                        return subcats.length > 0 ? (
                          <select
                            value={editSubcat}
                            onChange={(e) => setEditSubcat(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white font-medium"
                          >
                            {subcats.map((sc) => (
                              <option key={sc} value={sc}>
                                {sc}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={editSubcat}
                            onChange={(e) => setEditSubcat(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                          />
                        );
                      })()}
                    </div>
                  </div>

                  {/* Dynamic Pricing Formula Breakdown Panel */}
                  <div className="bg-gradient-to-br from-pink-50/70 via-purple-50/50 to-amber-50/40 p-3.5 rounded-2xl border border-pink-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-brand-primary" />
                        <span className="text-xs font-bold text-gray-900">Dynamic Pricing Formula Breakdown</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full border border-pink-200">
                        Dynamic Formula Engine
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 bg-white/80 p-2 rounded-xl border border-pink-100 leading-relaxed">
                      <strong>Pricing Formula:</strong> Final Price = Base Labor + Beautician Cut + Cosmetic Cost + Travel Allowance + Safety/Hygiene Kit
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {/* 1. Basic Labor Cost */}
                      <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                        <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                          1. Base Labor (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editBaseLabor}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            handleEditFormulaChange(val, editBeauticianCut, editCosmeticCost, editDistanceCharge, editAdditionalCharges);
                          }}
                          className="w-full px-2 py-1 text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-primary"
                        />
                        <span className="text-[9px] text-gray-400 block mt-0.5">Core service work</span>
                      </div>

                      {/* 2. Beautician Tier Cut */}
                      <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                        <label className="block text-[10px] font-bold text-purple-700 uppercase mb-1">
                          2. Beautician Cut (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editBeauticianCut}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            handleEditFormulaChange(editBaseLabor, val, editCosmeticCost, editDistanceCharge, editAdditionalCharges);
                          }}
                          className="w-full px-2 py-1 text-xs font-bold text-purple-700 bg-purple-50/40 border border-purple-200 rounded-lg outline-none focus:border-brand-primary"
                        />
                        <div className="flex gap-1 mt-1">
                          {[15, 20, 25, 30].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => {
                                const cut = Math.round((Number(editPrice) || 500) * (pct / 100));
                                handleEditFormulaChange(editBaseLabor, cut, editCosmeticCost, editDistanceCharge, editAdditionalCharges);
                              }}
                              className="text-[9px] px-1 py-0.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 font-semibold"
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Cosmetic Product Cost */}
                      <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-bold text-pink-700 uppercase">
                            3. Cosmetics (₹)
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newCost = editCosmeticCost === 0 ? 150 : 0;
                              handleEditFormulaChange(editBaseLabor, editBeauticianCut, newCost, editDistanceCharge, editAdditionalCharges);
                            }}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              editCosmeticCost === 0
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title="Toggle customer own cosmetics waiver"
                          >
                            {editCosmeticCost === 0 ? 'Own (₹0)' : 'Waive'}
                          </button>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={editCosmeticCost}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            handleEditFormulaChange(editBaseLabor, editBeauticianCut, val, editDistanceCharge, editAdditionalCharges);
                          }}
                          className="w-full px-2 py-1 text-xs font-bold text-pink-700 bg-pink-50/40 border border-pink-200 rounded-lg outline-none focus:border-brand-primary"
                        />
                        <span className="text-[9px] text-gray-400 block mt-0.5">₹0 if own products</span>
                      </div>

                      {/* 4. Distance / Travel Allowance */}
                      <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                        <label className="block text-[10px] font-bold text-blue-700 uppercase mb-1">
                          4. Travel / Dist (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editDistanceCharge}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            handleEditFormulaChange(editBaseLabor, editBeauticianCut, editCosmeticCost, val, editAdditionalCharges);
                          }}
                          className="w-full px-2 py-1 text-xs font-bold text-blue-700 bg-blue-50/40 border border-blue-200 rounded-lg outline-none focus:border-brand-primary"
                        />
                        <div className="flex gap-1 mt-1">
                          {[0, 49, 99].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => handleEditFormulaChange(editBaseLabor, editBeauticianCut, editCosmeticCost, amt, editAdditionalCharges)}
                              className="text-[9px] px-1 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-semibold"
                            >
                              ₹{amt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 5. Safety Kit & Additional Charges */}
                      <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                        <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1">
                          5. Safety Kit (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editAdditionalCharges}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            handleEditFormulaChange(editBaseLabor, editBeauticianCut, editCosmeticCost, editDistanceCharge, val);
                          }}
                          className="w-full px-2 py-1 text-xs font-bold text-amber-700 bg-amber-50/40 border border-amber-200 rounded-lg outline-none focus:border-brand-primary"
                        />
                        <span className="text-[9px] text-gray-400 block mt-0.5">Hygiene & sanitized kit</span>
                      </div>

                      {/* Computed Equation Total */}
                      <div className="bg-brand-primary/10 p-2.5 rounded-xl border border-brand-primary/30 flex flex-col justify-center">
                        <span className="text-[9px] font-bold uppercase text-brand-primary">Calculated Total</span>
                        <div className="text-base font-black text-brand-primary">
                          ₹{editBaseLabor + editBeauticianCut + editCosmeticCost + editDistanceCharge + editAdditionalCharges}
                        </div>
                        <span className="text-[9px] text-gray-500">Live formula sum</span>
                      </div>
                    </div>

                    {/* Live Calculation Strip */}
                    <div className="bg-white p-2 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-700">₹{editBaseLabor}</span>
                        <span className="text-gray-400">+</span>
                        <span className="font-semibold text-purple-700">₹{editBeauticianCut}</span>
                        <span className="text-gray-400">+</span>
                        <span className="font-semibold text-pink-700">₹{editCosmeticCost}</span>
                        <span className="text-gray-400">+</span>
                        <span className="font-semibold text-blue-700">₹{editDistanceCharge}</span>
                        <span className="text-gray-400">+</span>
                        <span className="font-semibold text-amber-700">₹{editAdditionalCharges}</span>
                      </div>
                      <div className="font-bold text-brand-primary flex items-center gap-1">
                        <span>=</span>
                        <span className="text-xs bg-brand-primary text-white px-2 py-0.5 rounded-md">
                          ₹{editBaseLabor + editBeauticianCut + editCosmeticCost + editDistanceCharge + editAdditionalCharges}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prices: Selling Price, MRP, Varanasi Range */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Final Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary font-bold text-brand-primary focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Original MRP (₹)
                      </label>
                      <input
                        type="number"
                        value={editOriginalPrice}
                        onChange={(e) => setEditOriginalPrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-gray-600 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Varanasi Range (₹)
                      </label>
                      <input
                        type="text"
                        value={editVaranasiRange}
                        onChange={(e) => setEditVaranasiRange(e.target.value)}
                        placeholder="e.g. 799 - 1199"
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-purple-700 font-semibold focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Offers & Promo Code Attachment */}
                  <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                      <Tag className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Attach Offer &amp; Promo Code</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                          Promo Code
                        </label>
                        <select
                          value={editOfferCode}
                          onChange={(e) => setEditOfferCode(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary font-mono font-bold"
                        >
                          <option value="">None</option>
                          {ACTIVE_PROMO_CODES.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.code} ({p.discount})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                          Offer Tag Badge
                        </label>
                        <input
                          type="text"
                          value={editOfferTag}
                          onChange={(e) => setEditOfferTag(e.target.value)}
                          placeholder="e.g. 30% OFF Glow"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                          Discount %
                        </label>
                        <input
                          type="number"
                          value={editDiscountPercent}
                          onChange={(e) => setEditDiscountPercent(e.target.value)}
                          placeholder="e.g. 30"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Duration & Bestseller */}
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Duration (Mins)
                      </label>
                      <input
                        type="number"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                      />
                    </div>

                    <div className="pt-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="editBestseller"
                        checked={editIsBestseller}
                        onChange={(e) => setEditIsBestseller(e.target.checked)}
                        className="rounded text-brand-primary focus:ring-0"
                      />
                      <label htmlFor="editBestseller" className="text-xs font-semibold text-gray-700 cursor-pointer">
                        Mark as Bestseller
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Service Description &amp; Products
                    </label>
                    <textarea
                      rows={2}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary resize-none focus:bg-white"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand-primary to-pink-500 hover:from-brand-primaryDark hover:to-brand-primary text-white font-bold px-5 py-2.5 rounded-xl shadow-pink-soft text-xs uppercase tracking-wider"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Service Changes</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-3 sm:p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-pink-100 max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-pink-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <div className="flex items-center gap-2 text-brand-primary mb-0.5">
                  <Plus className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Catalog Management
                  </span>
                </div>
                <h3 className="text-xl font-bold font-serif text-gray-900">
                  Add New Doorstep Salon Service
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAdd} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. O3+ D-Tan & Brightening Facial"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCat}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewCat(val);
                      const matched = SERVICE_CATEGORIES.find((c) => c.name === val);
                      if (matched && matched.subcategories && matched.subcategories.length > 0) {
                        setNewSubcat(matched.subcategories[0]);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary font-medium focus:bg-white"
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Subcategory
                  </label>
                  {(() => {
                    const currentCatObj = SERVICE_CATEGORIES.find((c) => c.name === newCat);
                    const subcats = currentCatObj?.subcategories || [];
                    return subcats.length > 0 ? (
                      <select
                        value={newSubcat}
                        onChange={(e) => setNewSubcat(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary font-medium focus:bg-white"
                      >
                        {subcats.map((sc) => (
                          <option key={sc} value={sc}>
                            {sc}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={newSubcat}
                        onChange={(e) => setNewSubcat(e.target.value)}
                        placeholder="e.g. Premium Glow"
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Dynamic Pricing Formula Breakdown Panel */}
              <div className="bg-gradient-to-br from-pink-50/70 via-purple-50/50 to-amber-50/40 p-3.5 rounded-2xl border border-pink-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-brand-primary" />
                    <span className="text-xs font-bold text-gray-900">Dynamic Pricing Formula Breakdown</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full border border-pink-200">
                    Dynamic Formula Engine
                  </span>
                </div>

                <p className="text-[11px] text-gray-600 bg-white/80 p-2 rounded-xl border border-pink-100 leading-relaxed">
                  <strong>Pricing Formula:</strong> Final Price = Base Labor + Beautician Cut + Cosmetic Cost + Travel Allowance + Safety/Hygiene Kit
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* 1. Basic Labor Cost */}
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                      1. Base Labor (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newBaseLabor}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        handleAddFormulaChange(val, newBeauticianCut, newCosmeticCost, newDistanceCharge, newAdditionalCharges);
                      }}
                      className="w-full px-2 py-1 text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-primary"
                    />
                    <span className="text-[9px] text-gray-400 block mt-0.5">Core service work</span>
                  </div>

                  {/* 2. Beautician Tier Cut */}
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                    <label className="block text-[10px] font-bold text-purple-700 uppercase mb-1">
                      2. Beautician Cut (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newBeauticianCut}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        handleAddFormulaChange(newBaseLabor, val, newCosmeticCost, newDistanceCharge, newAdditionalCharges);
                      }}
                      className="w-full px-2 py-1 text-xs font-bold text-purple-700 bg-purple-50/40 border border-purple-200 rounded-lg outline-none focus:border-brand-primary"
                    />
                    <div className="flex gap-1 mt-1">
                      {[15, 20, 25, 30].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            const cut = Math.round((Number(newPrice) || 500) * (pct / 100));
                            handleAddFormulaChange(newBaseLabor, cut, newCosmeticCost, newDistanceCharge, newAdditionalCharges);
                          }}
                          className="text-[9px] px-1 py-0.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 font-semibold"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Cosmetic Product Cost */}
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-pink-700 uppercase">
                        3. Cosmetics (₹)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newCost = newCosmeticCost === 0 ? 150 : 0;
                          handleAddFormulaChange(newBaseLabor, newBeauticianCut, newCost, newDistanceCharge, newAdditionalCharges);
                        }}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          newCosmeticCost === 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Toggle customer own cosmetics waiver"
                      >
                        {newCosmeticCost === 0 ? 'Own (₹0)' : 'Waive'}
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={newCosmeticCost}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        handleAddFormulaChange(newBaseLabor, newBeauticianCut, val, newDistanceCharge, newAdditionalCharges);
                      }}
                      className="w-full px-2 py-1 text-xs font-bold text-pink-700 bg-pink-50/40 border border-pink-200 rounded-lg outline-none focus:border-brand-primary"
                    />
                    <span className="text-[9px] text-gray-400 block mt-0.5">₹0 if own products</span>
                  </div>

                  {/* 4. Distance / Travel Allowance */}
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                    <label className="block text-[10px] font-bold text-blue-700 uppercase mb-1">
                      4. Travel / Dist (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newDistanceCharge}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        handleAddFormulaChange(newBaseLabor, newBeauticianCut, newCosmeticCost, val, newAdditionalCharges);
                      }}
                      className="w-full px-2 py-1 text-xs font-bold text-blue-700 bg-blue-50/40 border border-blue-200 rounded-lg outline-none focus:border-brand-primary"
                    />
                    <div className="flex gap-1 mt-1">
                      {[0, 49, 99].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleAddFormulaChange(newBaseLabor, newBeauticianCut, newCosmeticCost, amt, newAdditionalCharges)}
                          className="text-[9px] px-1 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-semibold"
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Safety Kit & Additional Charges */}
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                    <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1">
                      5. Safety Kit (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newAdditionalCharges}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        handleAddFormulaChange(newBaseLabor, newBeauticianCut, newCosmeticCost, newDistanceCharge, val);
                      }}
                      className="w-full px-2 py-1 text-xs font-bold text-amber-700 bg-amber-50/40 border border-amber-200 rounded-lg outline-none focus:border-brand-primary"
                    />
                    <span className="text-[9px] text-gray-400 block mt-0.5">Hygiene & sanitized kit</span>
                  </div>

                  {/* Computed Equation Total */}
                  <div className="bg-brand-primary/10 p-2.5 rounded-xl border border-brand-primary/30 flex flex-col justify-center">
                    <span className="text-[9px] font-bold uppercase text-brand-primary">Calculated Total</span>
                    <div className="text-base font-black text-brand-primary">
                      ₹{newBaseLabor + newBeauticianCut + newCosmeticCost + newDistanceCharge + newAdditionalCharges}
                    </div>
                    <span className="text-[9px] text-gray-500">Live formula sum</span>
                  </div>
                </div>

                {/* Live Calculation Strip */}
                <div className="bg-white p-2 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700">₹{newBaseLabor}</span>
                    <span className="text-gray-400">+</span>
                    <span className="font-semibold text-purple-700">₹{newBeauticianCut}</span>
                    <span className="text-gray-400">+</span>
                    <span className="font-semibold text-pink-700">₹{newCosmeticCost}</span>
                    <span className="text-gray-400">+</span>
                    <span className="font-semibold text-blue-700">₹{newDistanceCharge}</span>
                    <span className="text-gray-400">+</span>
                    <span className="font-semibold text-amber-700">₹{newAdditionalCharges}</span>
                  </div>
                  <div className="font-bold text-brand-primary flex items-center gap-1">
                    <span>=</span>
                    <span className="text-xs bg-brand-primary text-white px-2 py-0.5 rounded-md">
                      ₹{newBaseLabor + newBeauticianCut + newCosmeticCost + newDistanceCharge + newAdditionalCharges}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Offer Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary font-bold text-brand-primary focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    MRP Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-gray-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Varanasi Range (₹)
                  </label>
                  <input
                    type="text"
                    value={newVaranasiRange}
                    onChange={(e) => setNewVaranasiRange(e.target.value)}
                    placeholder="799 - 1199"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-purple-700 font-semibold focus:bg-white"
                  />
                </div>
              </div>

              {/* Photo Service */}
              <div className="bg-pink-50/60 p-3 rounded-2xl border border-pink-100">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-brand-primary" />
                  Service Image / Photo Uploader
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-pink-200 shrink-0">
                    <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        ref={addFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAddImageFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => addFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 bg-white hover:bg-pink-50 text-brand-primary border border-pink-200 text-xs font-semibold px-3 py-1 rounded-xl shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Image URL"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Offer attachment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Attach Promo Code
                  </label>
                  <select
                    value={newOfferCode}
                    onChange={(e) => setNewOfferCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary font-mono font-bold"
                  >
                    <option value="">None</option>
                    {ACTIVE_PROMO_CODES.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.code} ({p.discount})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Short Description &amp; Benefits
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Include products used, steps, and key skin benefits..."
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary resize-none focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isBestseller"
                  checked={newIsBestseller}
                  onChange={(e) => setNewIsBestseller(e.target.checked)}
                  className="rounded text-brand-primary focus:ring-0"
                />
                <label htmlFor="isBestseller" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Mark as Trending Bestseller
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-primaryDark text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-pink-soft"
                >
                  Publish Service to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
