'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Service, BEAUTICIANS } from '@/lib/data';
import { DEFAULT_DISTANCE_RULES } from '@/lib/masterConfig';

interface BookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ service, isOpen, onClose }: BookingModalProps) {
  // Step 1: Date & Time, Step 2: Address & Products, Step 3: Beautician Match, Step 4: Consent Form, Step 5: Bill & Pay, Step 6: Confirmed
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [selectedDate, setSelectedDate] = useState('Mon, 03 Aug');
  const [selectedTime, setSelectedTime] = useState('11:30 AM - 12:30 PM');
  const [address, setAddress] = useState('House 42, Anand Nagar Colony, Near Sigra Stadium, Varanasi');
  
  // Customization: Own Products & Distance Charge
  const [hasOwnProducts, setHasOwnProducts] = useState(false);
  const [travelDistanceKm, setTravelDistanceKm] = useState<number>(2.5); // Default 2.5 KM (within 3km free tier)
  
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

  if (!isOpen || !service) return null;

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

  // Distance charge calculation (First 3 KM free, ₹50/KM thereafter)
  const freeKm = DEFAULT_DISTANCE_RULES.freeDistanceKm; // 3 KM
  const perKm = DEFAULT_DISTANCE_RULES.perKmCharge; // ₹50/KM
  const distanceCharge = travelDistanceKm > freeKm ? Math.round((travelDistanceKm - freeKm) * perKm) : 0;

  // Cosmetic Product Cost: If customer provides own product -> ₹0!
  const normalCosmeticProductCost = Math.round(service.price * 0.22); // standard product portion (~22%)
  const cosmeticProductCost = hasOwnProducts ? 0 : normalCosmeticProductCost;
  const baseServiceCost = service.price - normalCosmeticProductCost; // pure salon labor
  const safetyKitFee = 49;

  // Calculate discount based on applied code
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const code = appliedCoupon.toUpperCase().trim();
    if (code === 'VARANASI50' || code === 'WELCOME50') {
      return Math.min(50, service.price);
    }
    if (code === 'GLOW30') {
      return Math.min(Math.round(service.price * 0.3), 500);
    }
    if (code === 'BRIDAL1000') {
      return service.price >= 1500 ? 1000 : 300;
    }
    if (code === 'FESTIVE25') {
      return Math.min(Math.round(service.price * 0.25), 400);
    }
    return Math.min(Math.round(service.price * 0.1), 100);
  };

  const discount = calculateDiscount();
  const subtotalBeforeTax = baseServiceCost + cosmeticProductCost + distanceCharge + safetyKitFee;
  const taxableAmount = Math.max(0, subtotalBeforeTax - discount);
  const tax = Math.round(taxableAmount * 0.05); // 5% GST
  const total = Math.max(0, taxableAmount + tax);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).toUpperCase().trim();
    const validCodes = ['VARANASI50', 'GLOW30', 'WELCOME50', 'BRIDAL1000', 'FESTIVE25'];
    if (validCodes.includes(code)) {
      setAppliedCoupon(code);
      setCouponCode(code);
      setCouponError(null);
    } else {
      setCouponError('Invalid coupon code. Try VARANASI50, GLOW30, or BRIDAL1000');
    }
  };

  const matchedBeautician = BEAUTICIANS[0]; // Ananya Sharma (Gold Tier 20%)

  const handleProceedFromConsent = () => {
    if (!consentAccepted) {
      setConsentError('Please acknowledge the digital health & allergy consent to proceed.');
      return;
    }
    setConsentError(null);
    setStep(5);
  };

  const handleConfirm = () => {
    const randomId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingId(randomId);
    setStep(6); // Confirmed
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-pink-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-pink-500 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && step < 6 && (
              <button
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="p-1 rounded-full hover:bg-white/20 mr-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <span className="text-xs uppercase tracking-wider text-pink-100 font-semibold">
                Doorstep Booking • {step === 6 ? 'Success' : `Step ${step} of 5`}
              </span>
              <h3 className="text-lg font-serif font-bold leading-tight">
                {step === 1 && 'Select Date & Time'}
                {step === 2 && 'Address & Product Option'}
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
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: Date & Time Picker */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Selected Service Quick Info */}
              <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-2xl border border-pink-100">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{service.name}</h4>
                  <p className="text-xs text-gray-500">{service.durationMinutes} mins • ₹{service.price}</p>
                </div>
              </div>

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

          {/* STEP 2: Address Selection, Distance & Customer Product Option */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl border-2 border-brand-primary bg-pink-50/60">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase">
                  <MapPin className="w-4 h-4" />
                  <span>Doorstep Delivery Address</span>
                </div>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full mt-2 p-3 text-xs bg-white rounded-xl border border-pink-200 focus:outline-brand-primary text-gray-800"
                />
              </div>

              {/* Distance Charge Module with Threshold indicator */}
              <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <Car className="w-4 h-4 text-[#0071E3]" />
                    <span>Travel Distance from Salon Hub</span>
                  </div>
                  <span className="text-xs font-bold text-[#0071E3] bg-blue-100 px-2 py-0.5 rounded-full">
                    {travelDistanceKm} KM
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[2.0, 3.0, 5.5, 8.0].map((km) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => setTravelDistanceKm(km)}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-all ${
                        travelDistanceKm === km
                          ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {km} KM
                      <span className="block text-[9px] font-normal opacity-90">
                        {km <= freeKm ? 'Free (≤3km)' : `+₹${(km - freeKm) * perKm}`}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-gray-600">
                  {travelDistanceKm <= freeKm ? (
                    <span className="text-emerald-700 font-semibold">
                      ✓ Zero distance charges! First {freeKm} KM travel is completely FREE.
                    </span>
                  ) : (
                    <span className="text-blue-800">
                      Standard fee: First {freeKm} KM free, then ₹{perKm}/KM. Distance charge: ₹{distanceCharge}.
                    </span>
                  )}
                </p>
              </div>

              {/* Customer Cosmetic Product Option Checkbox (Specification 7) */}
              <div className="p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 space-y-2">
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
                <span>Find Nearby Beautician</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Beautician Assignment */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center gap-2 bg-pink-100 text-brand-primary text-xs font-bold px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Matching Algorithm (96% Compatibility)</span>
              </div>

              <h4 className="text-xl font-serif font-bold text-brand-charcoal">
                Matched Doorstep Beautician
              </h4>

              {/* Beautician Card */}
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
                  <span className="text-gray-400 shrink-0 font-medium">Offers:</span>
                  {['VARANASI50', 'GLOW30', 'BRIDAL1000', 'FESTIVE25'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleApplyCoupon(c)}
                      className={`px-2 py-0.5 rounded-md font-mono font-bold transition-all shrink-0 ${
                        appliedCoupon === c
                          ? 'bg-brand-primary text-white shadow-xs'
                          : 'bg-pink-50 text-brand-primary hover:bg-pink-100 border border-pink-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                  <span className="font-semibold">
                    ✓ Promo Code &apos;{appliedCoupon}&apos; Applied
                  </span>
                  <span className="font-bold text-sm">-₹{discount}</span>
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
            <div className="text-center space-y-6 py-2">
              {/* Pink Checkmark Animated */}
              <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center mx-auto shadow-pink-soft">
                <Check className="w-9 h-9 stroke-[3]" />
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
                  <span className="font-bold text-brand-charcoal font-mono">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Scheduled</span>
                  <span className="font-semibold text-gray-800">{selectedDate} 2026 • {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service</span>
                  <span className="font-semibold text-gray-800">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Professional</span>
                  <span className="font-semibold text-brand-primary">{matchedBeautician.name} (Gold Tier)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer Products</span>
                  <span className="font-semibold text-gray-800">
                    {hasOwnProducts ? 'Own Products (₹0 Fee)' : 'Standard Salon Kit Provided'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Travel Distance</span>
                  <span className="font-semibold text-gray-800">{travelDistanceKm} KM ({distanceCharge === 0 ? 'Free' : `₹${distanceCharge}`})</span>
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
                  onClick={onClose}
                  className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white py-3.5 rounded-full font-bold shadow-pink-soft transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

