'use client';
import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Check,
  ChevronRight,
  ArrowLeft,
  PackageCheck,
  Car,
  FileCheck,
  AlertCircle,
  Navigation,
  Crosshair,
  Map,
  Compass,
  LocateFixed,
  Radio,
  Building,
  Home,
  Users,
  Split,
} from 'lucide-react';
import { Service, BEAUTICIANS } from '@/lib/data';
import { DEFAULT_DISTANCE_RULES } from '@/lib/masterConfig';
import { getCurrentUser, saveNewBooking, type BookingRecord } from '@/lib/userStore';
import {
  getCart,
  clearCart,
  validateCartFeasibility,
  type CartItem,
} from '@/lib/cartStore';
import { getMasterCategoryForService } from '@/lib/masterCategories';

interface VaranasiLocationHub {
  area: string;
  landmark: string;
  distanceKm: number;
  lat: number;
  lng: number;
  zoneDesc: string;
}

export const VARANASI_LOCATION_HUBS: VaranasiLocationHub[] = [
  { area: 'Sigra', landmark: 'Near Sigra Stadium & IP Mall', distanceKm: 1.2, lat: 25.3176, lng: 82.9739, zoneDesc: 'Central Salon Hub • 1.2 KM (Free)' },
  { area: 'Mahmoorganj', landmark: 'Near Shivaji Park & Akashvani', distanceKm: 1.9, lat: 25.3142, lng: 82.9654, zoneDesc: 'West Hub • 1.9 KM (Free)' },
  { area: 'Assi Ghat', landmark: 'Near Subah-e-Banaras Ghat Stage', distanceKm: 2.5, lat: 25.2937, lng: 83.0039, zoneDesc: 'South Riverside Hub • 2.5 KM (Free)' },
  { area: 'Bhelupur', landmark: 'Near Kamachha & Water Works', distanceKm: 2.1, lat: 25.3056, lng: 82.9892, zoneDesc: 'Central-South Hub • 2.1 KM (Free)' },
  { area: 'Lanka (BHU)', landmark: 'Near BHU Main Gate & Malviya Bhavan', distanceKm: 3.8, lat: 25.2818, lng: 82.9996, zoneDesc: 'University Campus • 3.8 KM (+₹40 Travel)' },
  { area: 'Godowlia', landmark: 'Near Dashashwamedh Ghat Chauraha', distanceKm: 3.2, lat: 25.3109, lng: 83.0107, zoneDesc: 'Heritage Kashi • 3.2 KM (+₹10 Travel)' },
  { area: 'Durgakund', landmark: 'Near Durga Temple & Anand Park', distanceKm: 2.7, lat: 25.2901, lng: 82.9961, zoneDesc: 'Temple Zone • 2.7 KM (Free)' },
  { area: 'Cantonment (Cantt)', landmark: 'Near Varanasi Junction & Mall Road', distanceKm: 3.5, lat: 25.3284, lng: 82.9866, zoneDesc: 'Station & Cantt • 3.5 KM (+₹25 Travel)' },
  { area: 'Pandeypur', landmark: 'Near Pandeypur Chauraha', distanceKm: 4.8, lat: 25.3431, lng: 82.9991, zoneDesc: 'North-East Hub • 4.8 KM (+₹90 Travel)' },
  { area: 'Shivpur', landmark: 'Near Central Jail Road & GT Road', distanceKm: 6.5, lat: 25.3582, lng: 82.9551, zoneDesc: 'Outer North Zone • 6.5 KM (+₹175 Travel)' },
  { area: 'Sarnath', landmark: 'Near Dhamek Stupa & Museum', distanceKm: 7.2, lat: 25.3811, lng: 83.0214, zoneDesc: 'Heritage Sarnath • 7.2 KM (+₹210 Travel)' },
  { area: 'Chetganj / Maldahiya', landmark: 'Near Lahurabir & Englishia Line', distanceKm: 1.8, lat: 25.3195, lng: 82.9912, zoneDesc: 'Commercial Hub • 1.8 KM (Free)' },
];

interface BookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  checkoutMode?: 'single' | 'dual' | 'split';
}

export default function BookingModal({ service, isOpen, onClose, checkoutMode = 'single' }: BookingModalProps) {
  // Step 1: Date & Time, Step 2: Address & Products, Step 3: Beautician Match, Step 4: Consent Form, Step 5: Bill & Pay, Step 6: Confirmed
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [selectedDate, setSelectedDate] = useState('Mon, 03 Aug');
  const [selectedTime, setSelectedTime] = useState('11:30 AM - 12:30 PM');
  
  // Structured Location Demo State
  const [selectedVaranasiArea, setSelectedVaranasiArea] = useState('Sigra');
  const [flatNumber, setFlatNumber] = useState('House 42, 2nd Floor');
  const [streetName, setStreetName] = useState('Anand Nagar Colony, Lane 3');
  const [nearbyLandmark, setNearbyLandmark] = useState('Opposite Sigra Sports Stadium');
  const [addressType, setAddressType] = useState<'HOME' | 'OFFICE' | 'OTHER'>('HOME');
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const [gpsLocked, setGpsLocked] = useState(true);
  const [gpsCoords, setGpsCoords] = useState({ lat: 25.3176, lng: 82.9739 });

  const [address, setAddress] = useState('House 42, 2nd Floor, Anand Nagar Colony, Opposite Sigra Sports Stadium, Sigra, Varanasi');
  
  // Customization: Own Products & Distance Charge
  const [hasOwnProducts, setHasOwnProducts] = useState(false);
  const [travelDistanceKm, setTravelDistanceKm] = useState<number>(1.2); // Default 1.2 KM (Sigra Hub free tier)
  
  // Pre-service Consent Form State
  const [allergyChoice, setAllergyChoice] = useState<'NONE' | 'AMMONIA' | 'WAX' | 'OTHER'>('NONE');
  const [skinSensitivity, setSkinSensitivity] = useState<'NORMAL' | 'SENSITIVE' | 'VERY_SENSITIVE'>('NORMAL');
  const [isPregnant, setIsPregnant] = useState(false);
  const [hasSkinCuts, setHasSkinCuts] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [consentError, setConsentError] = useState<string | null>(null);

  // Offers & Promo
  const [couponCode, setCouponCode] = useState('VARANASI50');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('VARANASI50');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COD'>('UPI');
  const [bookingId, setBookingId] = useState('BK-6887');
  const [cartItemsState, setCartItemsState] = useState<CartItem[]>([]);

  // Auto pre-fill from logged-in customer profile & cart
  useEffect(() => {
    if (isOpen) {
      setCartItemsState(getCart());
      const user = getCurrentUser();
      if (user) {
        if (user.area) {
          const matchHub = VARANASI_LOCATION_HUBS.find(
            (h) => h.area.toLowerCase() === user.area.toLowerCase()
          );
          if (matchHub) {
            setSelectedVaranasiArea(matchHub.area);
            setNearbyLandmark(matchHub.landmark);
            setGpsCoords({ lat: matchHub.lat, lng: matchHub.lng });
            setTravelDistanceKm(matchHub.distanceKm);
          }
        }
        if (user.address) {
          setAddress(user.address);
          setFlatNumber(user.address.split(',')[0] || 'House 42');
        }
      }
    }
  }, [isOpen]);

  const effectiveItems: CartItem[] =
    cartItemsState.length > 0
      ? cartItemsState
      : service
      ? [{ service, quantity: 1, masterCategory: service.masterCategory || getMasterCategoryForService(service) }]
      : [];

  if (!isOpen || effectiveItems.length === 0) return null;
  const effectiveService = effectiveItems[0].service;

  const dates = [
    { day: 'Sat', date: '01' },
    { day: 'Sun', date: '02' },
    { day: 'Mon', date: '03' },
    { day: 'Tue', date: '04' },
    { day: 'Wed', date: '05' },
    { day: 'Thu', date: '06' },
    { day: 'Fri', date: '07' },
  ];

  const morningSlots = ['09:00 AM', '10:30 AM', '11:30 AM'];
  const afternoonSlots = ['02:00 PM', '03:30 PM'];
  const eveningSlots = ['05:00 PM', '06:30 PM', '08:00 PM'];

  // Multi-service totals
  const totalServicePrice = effectiveItems.reduce((acc, item) => acc + item.service.price * item.quantity, 0);
  const totalDurationMins = effectiveItems.reduce((acc, item) => acc + (item.service.durationMinutes || 45) * item.quantity, 0);

  // Distance charge calculation (First 3 KM free, ₹50/KM thereafter)
  const freeKm = DEFAULT_DISTANCE_RULES.freeDistanceKm; // 3 KM
  const perKm = DEFAULT_DISTANCE_RULES.perKmCharge; // ₹50/KM
  const distanceCharge = travelDistanceKm > freeKm ? Math.round((travelDistanceKm - freeKm) * perKm) : 0;

  // Cosmetic Product Cost: If customer provides own product -> ₹0!
  const normalCosmeticProductCost = Math.round(totalServicePrice * 0.22); // standard product portion (~22%)
  const cosmeticProductCost = hasOwnProducts ? 0 : normalCosmeticProductCost;
  const baseServiceCost = totalServicePrice - normalCosmeticProductCost; // pure salon labor
  const safetyKitFee = effectiveItems.length > 1 ? 69 : 49;

  // Dynamic Coupon Engine (reads from Admin coupons or defaults)
  const getAvailableCoupons = () => {
    const defaultCoupons = [
      { code: 'VARANASI50', discountType: 'FLAT', discountValue: 50, minOrderValue: 299, maxDiscount: 50, isActive: true },
      { code: 'GLOW30', discountType: 'PERCENTAGE', discountValue: 30, minOrderValue: 799, maxDiscount: 500, isActive: true },
      { code: 'BRIDAL1000', discountType: 'FLAT', discountValue: 1000, minOrderValue: 1999, maxDiscount: 1000, isActive: true },
      { code: 'FESTIVE25', discountType: 'PERCENTAGE', discountValue: 25, minOrderValue: 699, maxDiscount: 400, isActive: true },
      { code: 'WELCOME200', discountType: 'FLAT', discountValue: 200, minOrderValue: 799, maxDiscount: 200, isActive: true },
      { code: 'WELCOME50', discountType: 'FLAT', discountValue: 50, minOrderValue: 299, maxDiscount: 50, isActive: true },
    ];

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('beautynest_coupons');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((c: any) => c.isActive !== false);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return defaultCoupons;
  };

  // Calculate discount based on applied code
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const code = appliedCoupon.toUpperCase().trim();
    const allCoupons = getAvailableCoupons();
    const found = allCoupons.find((c: any) => c.code.toUpperCase() === code);

    if (!found) {
      // Fallback
      return 50;
    }

    if (found.discountType === 'PERCENTAGE') {
      const calculated = Math.round(totalServicePrice * (Number(found.discountValue) / 100));
      return found.maxDiscount ? Math.min(calculated, Number(found.maxDiscount)) : calculated;
    } else {
      // FLAT discount
      return Math.min(Number(found.discountValue) || 50, totalServicePrice);
    }
  };

  const discount = calculateDiscount();
  const subtotalBeforeTax = baseServiceCost + cosmeticProductCost + distanceCharge + safetyKitFee;
  const taxableAmount = Math.max(0, subtotalBeforeTax - discount);
  const tax = Math.round(taxableAmount * 0.05); // 5% GST
  const total = Math.max(0, taxableAmount + tax);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).toUpperCase().trim();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const allCoupons = getAvailableCoupons();
    const found = allCoupons.find((c: any) => c.code.toUpperCase() === code);

    if (!found) {
      setCouponError(`Coupon '${code}' is invalid or expired. Try VARANASI50 or GLOW30`);
      return;
    }

    const minOrder = Number(found.minOrderValue) || 0;
    if (totalServicePrice < minOrder) {
      setCouponError(`Min. booking value for '${code}' is ₹${minOrder}. Current total is ₹${totalServicePrice}.`);
      return;
    }

    setAppliedCoupon(code);
    setCouponCode(code);
    setCouponError(null);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  // Feasibility & Beautician Matching
  const validation = validateCartFeasibility(effectiveItems, BEAUTICIANS, selectedVaranasiArea);
  const isDualSpecialistMode = checkoutMode === 'dual' || (effectiveItems.length > 1 && validation.hasSkillMismatch);
  const isSplitMode = checkoutMode === 'split';

  const specialist1 = validation.recommendedSpecialists[0]?.beautician || BEAUTICIANS[0];
  const specialist2 = validation.recommendedSpecialists[1]?.beautician || (isDualSpecialistMode ? BEAUTICIANS[1] : null);
  const matchedBeautician = specialist1;

  const handleProceedFromConsent = () => {
    if (!consentAccepted) {
      setConsentError('Please acknowledge the digital health & allergy consent to proceed.');
      return;
    }
    setConsentError(null);
    setStep(5);
  };

  const handleDetectLocation = () => {
    setIsGpsLocating(true);
    setTimeout(() => {
      setIsGpsLocating(false);
      setGpsLocked(true);
      const sigraHub = VARANASI_LOCATION_HUBS[0];
      setSelectedVaranasiArea(sigraHub.area);
      setTravelDistanceKm(sigraHub.distanceKm);
      setNearbyLandmark(sigraHub.landmark);
      setGpsCoords({ lat: sigraHub.lat, lng: sigraHub.lng });
      setAddress(`${flatNumber}, ${streetName}, ${sigraHub.landmark}, ${sigraHub.area}, Varanasi, UP - 221010`);
    }, 850);
  };

  const handleSelectArea = (hub: VaranasiLocationHub) => {
    setSelectedVaranasiArea(hub.area);
    setTravelDistanceKm(hub.distanceKm);
    setNearbyLandmark(hub.landmark);
    setGpsCoords({ lat: hub.lat, lng: hub.lng });
    setGpsLocked(true);
    setAddress(`${flatNumber}, ${streetName}, ${hub.landmark}, ${hub.area}, Varanasi, UP - 221010`);
  };

  const handleUpdateAddress = (flat: string, street: string, landmark: string, area: string) => {
    setFlatNumber(flat);
    setStreetName(street);
    setNearbyLandmark(landmark);
    setAddress(`${flat}, ${street}, ${landmark}, ${area}, Varanasi, UP - 221010`);
  };

  const handleConfirm = () => {
    const randomId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingId(randomId);

    const user = getCurrentUser();

    if (isSplitMode && validation.splitGroups.length > 1) {
      // Create 2 separate orders for each domain!
      validation.splitGroups.forEach((group, gIdx) => {
        const splitSuffix = group.category === 'makeup' ? 'M' : group.category === 'spa' ? 'S' : 'B';
        const splitId = `${randomId}-${splitSuffix}`;
        const groupTotal = Math.round((total / Math.max(1, totalServicePrice)) * group.subtotal);
        const splitBooking: BookingRecord = {
          id: splitId,
          bookingNumber: splitId,
          customerName: user?.fullName || 'Priya Sharma',
          customerPhone: user?.phone || '9876543210',
          customerAddress: address,
          area: selectedVaranasiArea,
          serviceName: group.items.map((i) => `${i.service.name}${i.quantity > 1 ? ` (x${i.quantity})` : ''}`).join(' + '),
          serviceCategory: group.categoryLabel,
          servicePrice: group.subtotal,
          beauticianName: group.recommendedBeautician.name,
          beauticianPhone: group.recommendedBeautician.phone || '+91 98390 12001',
          beauticianTier: (group.recommendedBeautician as any).tier || 'Gold Tier',
          scheduledDate: `${selectedDate} 2026`,
          scheduledTime: gIdx === 1 ? '02:00 PM - 03:30 PM' : selectedTime,
          hasOwnProducts,
          distanceKm: travelDistanceKm,
          distanceFee: Math.round(distanceCharge / validation.splitGroups.length),
          totalAmount: groupTotal,
          status: 'CONFIRMED',
          paymentMethod,
          bookingDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          createdAt: new Date().toISOString(),
          consentSigned: true,
          isSplitBooking: true,
        };
        saveNewBooking(splitBooking);
      });
    } else {
      // Single or Dual Specialist Booking
      const allServiceNames = effectiveItems
        .map((i) => `${i.service.name}${i.quantity > 1 ? ` (x${i.quantity})` : ''}`)
        .join(' + ');

      const newBooking: BookingRecord = {
        id: randomId,
        bookingNumber: randomId,
        customerName: user?.fullName || 'Priya Sharma',
        customerPhone: user?.phone || '9876543210',
        customerAddress: address,
        area: selectedVaranasiArea,
        serviceName: allServiceNames,
        serviceCategory: isDualSpecialistMode ? 'Dual Specialist (मेकअप + ब्यूटी)' : (effectiveService.categoryName || effectiveService.category || 'Beauty'),
        servicePrice: totalServicePrice,
        beauticianName: isDualSpecialistMode && specialist2 ? `${specialist1.name} (मेकअप) & ${specialist2.name} (सैलून)` : specialist1.name,
        beauticianPhone: specialist1.phone || '+91 98390 12001',
        beauticianTier: (specialist1 as any).tier || 'Gold Tier',
        secondaryBeauticianName: isDualSpecialistMode && specialist2 ? specialist2.name : undefined,
        secondaryBeauticianPhone: isDualSpecialistMode && specialist2 ? (specialist2.phone || '+91 98390 12002') : undefined,
        scheduledDate: `${selectedDate} 2026`,
        scheduledTime: selectedTime,
        hasOwnProducts,
        distanceKm: travelDistanceKm,
        distanceFee: distanceCharge,
        totalAmount: total,
        status: 'CONFIRMED',
        paymentMethod,
        bookingDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: new Date().toISOString(),
        consentSigned: true,
      };

      saveNewBooking(newBooking);
    }

    clearCart();
    setStep(6); // Confirmed
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-6 sm:pt-10 pb-10">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-pink-100 max-h-[88vh] flex flex-col my-0 animate-in fade-in zoom-in duration-200 shrink-0">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-pink-500 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {step > 1 && step < 6 && (
              <button
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="p-1 rounded-full hover:bg-white/20 mr-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/80 p-0.5 bg-white shrink-0 shadow-xs">
              <img src="/logo.png" alt="BeautyNest Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-pink-100 font-semibold">
                BeautyNest • {step === 6 ? 'Confirmed' : `Step ${step} of 5`}
              </span>
              <h3 className="text-lg font-serif font-bold leading-tight">
                {step === 1 && 'Select Date & Time'}
                {step === 2 && 'Varanasi Location & Doorstep Address'}
                {step === 3 && 'Assigned Beautician'}
                {step === 4 && 'Pre-Service Health & Consent Form'}
                {step === 5 && 'Itemized Bill & Payment'}
                {step === 6 && 'Booking Confirmed! 🎉'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: Date & Time Picker */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Selected Services / Multi-package Quick Info */}
              {effectiveItems.length > 1 ? (
                <div className="bg-pink-50/70 rounded-2xl p-3.5 border border-pink-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 pb-1.5 border-b border-pink-100">
                    <span>चयनित पैकेज ({effectiveItems.length} सेवाएं)</span>
                    <span className="text-brand-primary font-bold">
                      कुल: ₹{totalServicePrice} • {totalDurationMins} मिनट
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                    {effectiveItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-pink-50"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-100 text-brand-primary shrink-0">
                            {item.masterCategory === 'makeup'
                              ? '💄 मेकअप'
                              : item.masterCategory === 'spa'
                              ? '🧖‍♀️ स्पा'
                              : '✨ ब्यूटी'}
                          </span>
                          <span className="font-semibold text-gray-800 truncate">
                            {item.service.name}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-gray-400 font-bold">×{item.quantity}</span>
                          )}
                        </div>
                        <span className="font-bold text-gray-900 shrink-0 ml-2">
                          ₹{item.service.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {isDualSpecialistMode && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>2 अलग-अलग विशेषज्ञ ब्यूटीशियन (1 मेकअप आर्टिस्ट + 1 सैलून एक्सपर्ट) असाइन किए जाएंगे।</span>
                    </div>
                  )}

                  {isSplitMode && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
                      <Split className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>यह बुकिंग 2 अलग-अलग ऑर्डरों में विभाजित की जा रही है।</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-2xl border border-pink-100">
                  <img
                    src={effectiveService.imageUrl}
                    alt={effectiveService.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {effectiveService.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {effectiveService.durationMinutes} mins • ₹{effectiveService.price}
                    </p>
                  </div>
                </div>
              )}

              {/* 7-Day Horizontal Date Picker */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Select Date (Aug 2026)
                </label>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {dates.map((d) => {
                    const isSelected = selectedDate.includes(d.date);
                    return (
                      <button
                        key={d.date}
                        onClick={() => setSelectedDate(`${d.day}, ${d.date} Aug`)}
                        className={`p-2.5 rounded-2xl flex flex-col items-center transition-all ${
                          isSelected
                            ? 'bg-brand-primary text-white shadow-pink-soft'
                            : 'bg-brand-bg hover:bg-pink-100 text-gray-700'
                        }`}
                      >
                        <span className="text-[11px] font-medium opacity-80">{d.day}</span>
                        <span className="text-sm font-bold mt-1">{d.date}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500 block mb-2">Morning Slots</span>
                  <div className="grid grid-cols-3 gap-2">
                    {morningSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(`${slot} - 12:30 PM`)}
                        className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                          selectedTime.startsWith(slot)
                            ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                            : 'border-pink-200 bg-white text-gray-700 hover:bg-pink-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500 block mb-2">Afternoon Slots</span>
                  <div className="grid grid-cols-2 gap-2">
                    {afternoonSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(`${slot} - 03:00 PM`)}
                        className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                          selectedTime.startsWith(slot)
                            ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                            : 'border-pink-200 bg-white text-gray-700 hover:bg-pink-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500 block mb-2">Evening Slots</span>
                  <div className="grid grid-cols-3 gap-2">
                    {eveningSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(`${slot} - 06:00 PM`)}
                        className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                          selectedTime.startsWith(slot)
                            ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                            : 'border-pink-200 bg-white text-gray-700 hover:bg-pink-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white py-3.5 rounded-full font-bold shadow-pink-soft hover:shadow-pink-hover transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Address &amp; Products</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Interactive Varanasi Location Demo, GPS & Map Simulator */}
          {step === 2 && (
            <div className="space-y-4">
              {/* GPS Auto-Detect & Satellite Simulator */}
              <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 p-4 rounded-2xl border border-pink-200 shadow-2xs space-y-2.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                    <Crosshair className="w-4 h-4 text-brand-primary animate-spin-slow" />
                    <span>Varanasi GPS Location Demo Engine</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isGpsLocating}
                    className="inline-flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primaryDark text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all disabled:opacity-60"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span>{isGpsLocating ? 'Detecting via Varanasi Satellites...' : '📍 Auto-Detect Location (GPS)'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-gray-600 bg-white/80 p-2 rounded-xl border border-pink-100 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-emerald-700 font-bold">GPS SIGNAL LOCKED</span>
                    <span className="text-gray-400">|</span>
                    <span>Lat: {gpsCoords.lat.toFixed(4)}° N, Lng: {gpsCoords.lng.toFixed(4)}° E</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    ±4m Precision • {selectedVaranasiArea} Hub
                  </span>
                </div>
              </div>

              {/* Interactive Visual Varanasi Map Preview Canvas */}
              <div className="relative bg-slate-900 rounded-2xl p-4 overflow-hidden text-white border border-slate-700 shadow-md">
                {/* Simulated Street Grid Background */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Simulated Ganga River Curve SVG Background */}
                <svg className="absolute right-0 top-0 bottom-0 w-32 h-full opacity-20 pointer-events-none" viewBox="0 0 100 200">
                  <path d="M70,0 Q30,100 80,200" fill="none" stroke="#38bdf8" strokeWidth="24" strokeLinecap="round" />
                  <text x="50" y="100" fill="#38bdf8" fontSize="8" transform="rotate(75 50,100)" opacity="0.8">
                    GANGA RIVER
                  </text>
                </svg>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-pink-300">
                      <Map className="w-3.5 h-3.5" />
                      <span>Live Doorstep Navigation Route • Varanasi (Kashi)</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full font-mono">
                      Hub Distance: {travelDistanceKm} KM
                    </span>
                  </div>

                  {/* Route Visualizer */}
                  <div className="bg-slate-800/90 backdrop-blur-sm p-3 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
                    {/* Salon Hub Point */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-xs shadow-pink-soft">
                        🏰
                      </div>
                      <div>
                        <span className="font-bold text-[11px] block text-white">Sigra Central Hub</span>
                        <span className="text-[10px] text-slate-400">Main Varanasi Depot</span>
                      </div>
                    </div>

                    {/* Dotted Connecting Route */}
                    <div className="flex-1 mx-3 flex flex-col items-center">
                      <div className="w-full flex items-center justify-center gap-1">
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-pink-500 via-purple-400 to-emerald-400 border-dashed" />
                        <span className="text-[9px] font-mono font-bold text-amber-300 px-1 bg-slate-900 rounded">
                          {travelDistanceKm} KM
                        </span>
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-purple-400 to-emerald-400" />
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        ~{Math.round(travelDistanceKm * 4 + 6)} mins doorstep transit
                      </span>
                    </div>

                    {/* Customer Destination Pin */}
                    <div className="flex items-center gap-2 text-right">
                      <div>
                        <span className="font-bold text-[11px] block text-emerald-400">{selectedVaranasiArea}</span>
                        <span className="text-[10px] text-slate-400">Customer Doorstep</span>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-emerald-500/20 animate-pulse">
                        📍
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-300 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-pink-400" />
                    <span>Verified Doorstep Coverage: Verified female beautician dispatched from nearest Varanasi hub.</span>
                  </p>
                </div>
              </div>

              {/* Varanasi Area Quick Chips (Major Localities) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Select Varanasi Area / Locality *</span>
                  </span>
                  <span className="text-[10px] text-brand-primary font-bold">12 Serviceable Hubs</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {VARANASI_LOCATION_HUBS.map((hub) => {
                    const isSelected = selectedVaranasiArea === hub.area;
                    return (
                      <button
                        key={hub.area}
                        type="button"
                        onClick={() => handleSelectArea(hub)}
                        className={`p-2 rounded-xl text-left border transition-all text-xs ${
                          isSelected
                            ? 'bg-pink-50/90 border-brand-primary text-brand-primary shadow-xs ring-1 ring-brand-primary'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-pink-50/40'
                        }`}
                      >
                        <div className="font-bold text-[11px] truncate flex items-center justify-between">
                          <span>{hub.area}</span>
                          {hub.distanceKm <= freeKm && (
                            <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1 py-0.2 rounded font-semibold">
                              FREE
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] text-gray-500 truncate mt-0.5">
                          {hub.distanceKm} KM • {hub.distanceKm <= freeKm ? 'Free delivery' : `+₹${Math.round((hub.distanceKm - freeKm) * perKm)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Doorstep Address Inputs */}
              <div className="p-4 rounded-2xl border border-pink-200 bg-pink-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Doorstep Delivery Address
                  </span>
                  {/* Address Type Selector */}
                  <div className="flex gap-1">
                    {(['HOME', 'OFFICE', 'OTHER'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddressType(type)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                          addressType === type
                            ? 'bg-brand-primary text-white'
                            : 'bg-white text-gray-600 border border-pink-100'
                        }`}
                      >
                        {type === 'HOME' ? '🏠 Home' : type === 'OFFICE' ? '🏢 Office' : '📍 Other'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                      House / Flat / Floor No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={flatNumber}
                      onChange={(e) => handleUpdateAddress(e.target.value, streetName, nearbyLandmark, selectedVaranasiArea)}
                      placeholder="e.g. Flat 302, 3rd Floor"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                      Colony / Street / Lane *
                    </label>
                    <input
                      type="text"
                      required
                      value={streetName}
                      onChange={(e) => handleUpdateAddress(flatNumber, e.target.value, nearbyLandmark, selectedVaranasiArea)}
                      placeholder="e.g. Anand Nagar Colony, Lane 3"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                    Nearby Famous Landmark (Varanasi) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nearbyLandmark}
                    onChange={(e) => handleUpdateAddress(flatNumber, streetName, e.target.value, selectedVaranasiArea)}
                    placeholder="e.g. Opposite Sigra Sports Stadium Gate 2"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Composed Address Output Preview */}
                <div className="bg-white p-2.5 rounded-xl border border-pink-100 text-xs text-gray-700 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-gray-900">Delivery Address for Beautician:</span>
                    <span className="text-[11px] text-gray-600">{address}</span>
                  </div>
                </div>
              </div>

              {/* Distance Charge Module with Threshold indicator */}
              <div className="p-3.5 rounded-2xl border border-blue-100 bg-blue-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <Car className="w-4 h-4 text-[#0071E3]" />
                    <span>Travel Distance from Sigra Salon Hub</span>
                  </div>
                  <span className="text-xs font-bold text-[#0071E3] bg-blue-100 px-2.5 py-0.5 rounded-full font-mono">
                    {travelDistanceKm} KM
                  </span>
                </div>

                <p className="text-[11px] text-gray-600">
                  {travelDistanceKm <= freeKm ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span>✓</span> Zero distance charge! Travel up to {freeKm} KM is 100% FREE.
                    </span>
                  ) : (
                    <span className="text-blue-800">
                      Travel fee: First {freeKm} KM free, then ₹{perKm}/KM. Distance charge added: ₹{distanceCharge}.
                    </span>
                  )}
                </p>
              </div>

              {/* Customer Cosmetic Product Option Checkbox */}
              <div className="p-3.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasOwnProducts}
                    onChange={(e) => setHasOwnProducts(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-emerald-600 rounded accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-900">
                        I have my own cosmetic products
                      </span>
                      <span className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        Save ₹{normalCosmeticProductCost}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800/80 mt-0.5">
                      If checked, cosmetic product cost is waived to ₹0. The beautician will use your personal salon kit safely.
                    </p>
                  </div>
                </label>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white py-3.5 rounded-full font-bold shadow-pink-soft transition-all flex items-center justify-center gap-2"
              >
                <span>Find Nearby Verified Beautician</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Beautician Assignment */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center gap-2 bg-pink-100 text-brand-primary text-xs font-bold px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isDualSpecialistMode
                    ? '2 समर्पित विशेषज्ञ असाइन किए गए (Dual Specialists Assigned)'
                    : 'AI Matching Algorithm (96% Compatibility)'}
                </span>
              </div>

              <h4 className="text-xl font-serif font-bold text-brand-charcoal">
                {isDualSpecialistMode
                  ? 'Matched Doorstep Specialists (2 एक्सपर्ट्स)'
                  : 'Matched Doorstep Beautician'}
              </h4>

              {/* Beautician Cards: Dual or Single */}
              {isDualSpecialistMode && specialist2 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                  {/* Specialist 1 */}
                  <div className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mb-2">
                        एक्सपर्ट 1: मेकअप आर्टिस्ट
                      </span>
                      <div className="flex items-center gap-3">
                        <img
                          src={specialist1.imageUrl}
                          alt={specialist1.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="text-sm font-bold text-gray-900 truncate">
                            {specialist1.name}
                          </h5>
                          <p className="text-[11px] text-gray-500 line-clamp-1">
                            {specialist1.specialization}
                          </p>
                          <span className="text-xs font-bold text-amber-600">
                            ★ {specialist1.rating} ({specialist1.reviewCount}+ reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-600 flex items-center justify-between">
                      <span className="font-semibold text-amber-900">ब्राइडल / पार्टी मेकअप</span>
                      <span className="text-emerald-700 font-bold">✓ वेरिफाइड प्रो</span>
                    </div>
                  </div>

                  {/* Specialist 2 */}
                  <div className="bg-white rounded-2xl p-4 border-2 border-pink-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand-primary bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mb-2">
                        एक्सपर्ट 2: सैलून ब्यूटीशियन
                      </span>
                      <div className="flex items-center gap-3">
                        <img
                          src={specialist2.imageUrl}
                          alt={specialist2.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-primary shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="text-sm font-bold text-gray-900 truncate">
                            {specialist2.name}
                          </h5>
                          <p className="text-[11px] text-gray-500 line-clamp-1">
                            {specialist2.specialization}
                          </p>
                          <span className="text-xs font-bold text-amber-600">
                            ★ {specialist2.rating} ({specialist2.reviewCount}+ reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-600 flex items-center justify-between">
                      <span className="font-semibold text-brand-primary">सैलून स्किन व बॉडी केयर</span>
                      <span className="text-emerald-700 font-bold">✓ वेरिफाइड प्रो</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-5 border-2 border-pink-200 shadow-md text-left">
                  <div className="flex items-center gap-4">
                    <img
                      src={matchedBeautician.imageUrl}
                      alt={matchedBeautician.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-primary"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-base font-bold text-gray-900">{matchedBeautician.name}</h5>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Gold Tier Partner
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{matchedBeautician.specialization}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-amber-600">★ {matchedBeautician.rating}</span>
                        <span className="text-[11px] text-gray-400">({matchedBeautician.reviewCount}+ reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-center text-[11px] text-gray-700">
                    <div className="bg-pink-50 p-2 rounded-xl">
                      <ShieldCheck className="w-4 h-4 text-brand-primary mx-auto mb-1" />
                      <span>Verified Pro</span>
                    </div>
                    <div className="bg-pink-50 p-2 rounded-xl">
                      <span className="font-bold text-brand-primary block">5+ Yrs</span>
                      <span>Experience</span>
                    </div>
                    <div className="bg-pink-50 p-2 rounded-xl">
                      <span className="font-bold text-brand-primary block">{travelDistanceKm} KM</span>
                      <span>Travel Radius</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setStep(4)}
                  className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white py-3.5 rounded-full font-bold shadow-pink-soft transition-all"
                >
                  Continue to Health &amp; Consent Form
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Pre-Service Health & Sensitivity Digital Consent Form (Specification 9) */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Safety Compliance Declaration</span>
                  <span>BeautyNest protocols require customer allergy and sensitivity screening prior to door service commencement.</span>
                </div>
              </div>

              {/* Allergy questionnaire */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  1. Do you have any known allergies to salon cosmetics/chemicals?
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'NONE', label: 'No Known Allergies' },
                    { id: 'AMMONIA', label: 'Ammonia / Bleach' },
                    { id: 'WAX', label: 'Wax / Resin Allergy' },
                    { id: 'OTHER', label: 'Other Chemical Allergy' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAllergyChoice(item.id as any)}
                      className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                        allergyChoice === item.id
                          ? 'border-brand-primary bg-pink-50 text-brand-primary font-bold'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Sensitivity */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  2. Skin Type &amp; Sensitivity Profile
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'NORMAL', label: 'Normal / Oily' },
                    { id: 'SENSITIVE', label: 'Sensitive' },
                    { id: 'VERY_SENSITIVE', label: 'Ultra Sensitive' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSkinSensitivity(s.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                        skinSensitivity === s.id
                          ? 'border-brand-primary bg-pink-50 text-brand-primary font-bold'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregnancy & Skin Condition */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
                  <span>Currently Pregnant or Nursing?</span>
                  <input
                    type="checkbox"
                    checked={isPregnant}
                    onChange={(e) => setIsPregnant(e.target.checked)}
                    className="w-4 h-4 accent-brand-primary"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
                  <span>Any active skin rash, sunburn, or open cuts?</span>
                  <input
                    type="checkbox"
                    checked={hasSkinCuts}
                    onChange={(e) => setHasSkinCuts(e.target.checked)}
                    className="w-4 h-4 accent-brand-primary"
                  />
                </label>
              </div>

              {/* Digital Consent Acceptance Checkbox */}
              <div className="bg-pink-50/70 p-3.5 rounded-2xl border border-pink-200 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-brand-primary"
                  />
                  <span className="text-[11px] text-gray-700 leading-relaxed">
                    I confirm that the health and allergy information provided is correct. I authorize the certified beautician to perform the procedure and request a patch test if recommended.
                  </span>
                </label>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Digital Consent will be archived and verified by beautician prior to service start</span>
                </div>
              </div>

              {consentError && (
                <p className="text-xs text-rose-600 font-semibold">{consentError}</p>
              )}

              <button
                onClick={handleProceedFromConsent}
                className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white py-3.5 rounded-full font-bold shadow-pink-soft transition-all"
              >
                Sign Declaration &amp; Review Bill
              </button>
            </div>
          )}

          {/* STEP 5: Payment Summary & Itemized Dynamic Pricing Breakdown (Specification 6) */}
          {step === 5 && (
            <div className="space-y-5">
              {/* Coupon Code Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                    placeholder="Enter Promo Code (e.g. VARANASI50)"
                    className="flex-1 px-3 py-2 text-xs uppercase border border-pink-200 rounded-xl outline-none focus:border-brand-primary font-semibold"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    className="bg-brand-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-primaryDark shadow-xs"
                  >
                    Apply
                  </button>
                </div>

                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                )}

                {/* Quick Promo Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                  <span className="text-gray-400 shrink-0 font-medium">Available:</span>
                  {getAvailableCoupons().slice(0, 5).map((c: any) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleApplyCoupon(c.code)}
                      className={`px-2 py-0.5 rounded-md font-mono font-bold transition-all shrink-0 ${
                        appliedCoupon === c.code
                          ? 'bg-brand-primary text-white shadow-xs'
                          : 'bg-pink-50 text-brand-primary hover:bg-pink-100 border border-pink-200'
                      }`}
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      ✓ Promo Code &apos;{appliedCoupon}&apos; Applied
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] text-rose-600 hover:underline font-bold"
                    >
                      Remove
                    </button>
                  </div>
                  <span className="font-bold text-sm text-emerald-700">-₹{discount}</span>
                </div>
              )}

              {/* Dynamic Itemized Price Breakdown (Basic + Products + Distance + Safety) */}
              <div className="bg-brand-bg p-4 rounded-2xl border border-pink-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-700">
                  <span>1. Professional Service Labor</span>
                  <span className="font-semibold">₹{baseServiceCost}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center gap-1">
                    <span>2. Cosmetic Products</span>
                    {hasOwnProducts && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        Customer Provided
                      </span>
                    )}
                  </span>
                  <span className={hasOwnProducts ? 'text-emerald-600 font-bold' : 'font-semibold'}>
                    {hasOwnProducts ? '₹0' : `₹${cosmeticProductCost}`}
                  </span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center gap-1">
                    <span>3. Doorstep Travel Fee ({travelDistanceKm} KM)</span>
                    {distanceCharge === 0 && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                        ≤3 KM Free
                      </span>
                    )}
                  </span>
                  <span className={distanceCharge === 0 ? 'text-blue-600 font-bold' : 'font-semibold'}>
                    {distanceCharge === 0 ? '₹0' : `₹${distanceCharge}`}
                  </span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>4. Safety, PPE &amp; Disposables Kit</span>
                  <span className="font-semibold">₹{safetyKitFee}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold pt-1 border-t border-pink-100">
                    <span>Promo Code Discount ({appliedCoupon})</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>GST Taxes (5%)</span>
                  <span>₹{tax}</span>
                </div>

                <div className="border-t border-pink-200 pt-2 flex justify-between text-sm font-bold text-gray-900">
                  <span>Total Amount Payable</span>
                  <span className="text-brand-primary text-base">₹{total}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 block">Payment Options</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      paymentMethod === 'UPI'
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                        : 'bg-white border-pink-200 text-gray-700 hover:bg-pink-50'
                    }`}
                  >
                    UPI / GPay
                  </button>
                  <button
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      paymentMethod === 'CARD'
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                        : 'bg-white border-pink-200 text-gray-700 hover:bg-pink-50'
                    }`}
                  >
                    Cards / Net
                  </button>
                  <button
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      paymentMethod === 'COD'
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                        : 'bg-white border-pink-200 text-gray-700 hover:bg-pink-50'
                    }`}
                  >
                    Pay After Service
                  </button>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full bg-gradient-to-r from-brand-primary to-pink-600 hover:from-brand-primaryDark hover:to-brand-primary text-white py-3.5 rounded-full font-bold shadow-pink-soft transition-all"
              >
                Confirm &amp; Place Booking (₹{total})
              </button>
            </div>
          )}

          {/* STEP 6: Booking Confirmed with Digital Consent Badge (Matches Screen 6) */}
          {step === 6 && (
            <div className="text-center space-y-4 py-2">
              {/* Logo with Checkmark badge */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-brand-primary p-0.5 bg-white shadow-pink-soft">
                  <img src="/logo.png" alt="BeautyNest Logo" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>

              <div>
                <h4 className="text-2xl font-serif font-bold text-gray-900">
                  Booking Confirmed! 🎉
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Your certified beautician will arrive at your doorstep on time.
                </p>
              </div>

              {/* Receipt Summary Table */}
              <div className="bg-brand-bg rounded-2xl p-4 border border-pink-100 text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking ID</span>
                  <span className="font-bold text-brand-charcoal font-mono">
                    {isSplitMode ? `${bookingId}-M & ${bookingId}-B` : bookingId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Scheduled</span>
                  <span className="font-semibold text-gray-800">
                    {selectedDate} 2026 • {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 shrink-0">Services ({effectiveItems.length})</span>
                  <span className="font-semibold text-gray-800 text-right ml-3 truncate max-w-xs">
                    {effectiveItems.length > 1
                      ? effectiveItems.map((i) => `${i.service.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join(', ')
                      : effectiveService.name}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 shrink-0">Assigned Specialists</span>
                  <div className="text-right ml-3">
                    {isDualSpecialistMode && specialist2 ? (
                      <div className="space-y-0.5">
                        <span className="font-bold text-amber-700 block">
                          💄 {specialist1.name} (मेकअप)
                        </span>
                        <span className="font-bold text-brand-primary block">
                          💅 {specialist2.name} (सैलून ब्यूटी)
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold text-brand-primary">
                        {matchedBeautician.name} (Gold Tier)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer Products</span>
                  <span className="font-semibold text-gray-800">
                    {hasOwnProducts ? 'Own Products (₹0 Fee)' : 'Standard Salon Kit Provided'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Travel Distance</span>
                  <span className="font-semibold text-gray-800">
                    {travelDistanceKm} KM ({distanceCharge === 0 ? 'Free' : `₹${distanceCharge}`})
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-pink-100 text-[11px]">
                  <span className="text-gray-600 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Customer Details</span>
                  </span>
                  <span className="font-bold text-gray-800">
                    {getCurrentUser()?.fullName || 'Priya Sharma'} (+91 {getCurrentUser()?.phone || '9876543210'})
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-pink-100 text-[11px]">
                  <span className="text-gray-600 flex items-center gap-1 font-semibold">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Health &amp; Allergy Form</span>
                  </span>
                  <span className="font-bold text-emerald-700">✓ Digitally Signed &amp; Recorded</span>
                </div>
                <div className="flex justify-between border-t border-pink-200 pt-2 font-bold text-sm">
                  <span>Total Paid / Payable</span>
                  <span className="text-brand-primary">₹{total}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new Event('beautynest_booking_created'));
                    window.dispatchEvent(new Event('beautynest_user_change'));
                  }}
                  className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white py-3.5 rounded-full font-bold shadow-pink-soft transition-all text-xs uppercase tracking-wider"
                >
                  Done • View in My Bookings
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

