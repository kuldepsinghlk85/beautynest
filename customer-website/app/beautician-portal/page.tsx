'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bike,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Navigation,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  KeyRound,
  ExternalLink,
  Car,
  Compass,
  Check,
} from 'lucide-react';

interface ActiveTripState {
  currentStep: 'ASSIGNED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';
  bookingId: string;
  customerName: string;
  customerPhone: string;
  scheduledTime: string;
  targetArrival: string;
  minutesRemaining: number;
  customerFullAddress: string;
  landmark: string;
  area: string;
  distanceKm: number;
  serviceName: string;
  serviceDuration: string;
  servicePrice: number;
  partnerCut: number;
  startOtp: string;
  // Next Booking Details
  nextBookingId: string;
  nextBookingDate: string;
  nextBookingTime: string;
  nextCustomerName: string;
  nextCustomerArea: string;
  nextServiceName: string;
  nextServicePrice: number;
  bufferHours: string;
}

export default function BeauticianPortalPage() {
  const [trip, setTrip] = useState<ActiveTripState>({
    currentStep: 'ON_THE_WAY',
    bookingId: 'BK-69006',
    customerName: 'Shivnash',
    customerPhone: '+91 98390 12001',
    scheduledTime: 'Today, 19 Sep 2026, 03:30 PM',
    targetArrival: '03:30 PM',
    minutesRemaining: 22,
    customerFullAddress: 'House 42, 2nd Floor, Anand Nagar Colony, Opposite Sigra Sports Stadium Gate 2, Sigra, Varanasi, UP - 221010',
    landmark: 'Opposite Stadium Gate No. 2, Green Gate, Bell on the right side',
    area: 'Sigra, Varanasi',
    distanceKm: 2.8,
    serviceName: 'Korean Glass Skin Hydra Facial Ritual',
    serviceDuration: '60 mins',
    servicePrice: 899,
    partnerCut: 180, // 20% Partner Tier
    startOtp: '1234',
    // Next booking
    nextBookingId: 'BK-69012',
    nextBookingDate: '20 Sep 2026 (Tomorrow / कल)',
    nextBookingTime: '11:30 AM - 01:00 PM',
    nextCustomerName: 'Pooja Verma',
    nextCustomerArea: 'Assi Ghat, Varanasi',
    nextServiceName: 'O3+ Bridal Glow Facial & Hair Spa',
    nextServicePrice: 1899,
    bufferHours: '18 hrs 45 mins buffer',
  });

  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Live Timer when Service is In Progress
  useEffect(() => {
    let interval: any;
    if (trip.currentStep === 'IN_PROGRESS') {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [trip.currentStep]);

  const handleStartTrip = () => {
    setTrip((prev) => ({ ...prev, currentStep: 'ON_THE_WAY' }));
  };

  const handleMarkArrived = () => {
    setTrip((prev) => ({ ...prev, currentStep: 'ARRIVED', minutesRemaining: 0 }));
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === trip.startOtp || enteredOtp === '1234') {
      setTrip((prev) => ({ ...prev, currentStep: 'IN_PROGRESS' }));
      setOtpError(null);
    } else {
      setOtpError(`Invalid OTP! Please ask customer ${trip.customerName} for the 4-digit code (Demo Hint: ${trip.startOtp})`);
    }
  };

  const handleCompleteService = () => {
    setTrip((prev) => ({ ...prev, currentStep: 'COMPLETED' }));
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Top Header */}
      <div className="bg-slate-800/90 border-b border-slate-700 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Priya Sharma</span>
                  <span className="text-[10px] bg-pink-500/20 text-pink-400 border border-pink-500/30 px-2 py-0.2 rounded-full">
                    Gold Partner (20%)
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400">
                Doorstep Partner Portal • Varanasi Duty Mode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
              🟢 ON DUTY
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        
        {/* ============================================================ */}
        {/* CURRENT BOOKING & ARRIVAL COUNTDOWN BANNER */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-r from-brand-primary to-pink-600 rounded-3xl p-5 shadow-xl text-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-pink-200 block">
                CURRENT ACTIVE DOORSTEP JOB (वर्तमान बुकिंग)
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-2xl font-black font-mono tracking-tight">
                  Booking #{trip.bookingId}
                </h2>
                <span className="text-xs bg-white text-brand-primary font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  {trip.currentStep === 'ON_THE_WAY' && '🛵 On the Way / रास्ते में हैं'}
                  {trip.currentStep === 'ARRIVED' && '📍 Arrived at Doorstep'}
                  {trip.currentStep === 'IN_PROGRESS' && '⏳ Service in Progress'}
                  {trip.currentStep === 'COMPLETED' && '✓ Completed'}
                </span>
              </div>
            </div>

            {/* Scheduled Arrival Time & Live Countdown */}
            <div className="bg-black/30 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/20 text-right">
              <span className="text-[10px] text-pink-200 block font-medium">
                Scheduled Doorstep Arrival (पहुंचने का समय):
              </span>
              <div className="flex items-center gap-1.5 justify-end">
                <Clock className="w-4 h-4 text-amber-300" />
                <span className="text-base font-extrabold text-white">
                  {trip.targetArrival}
                </span>
              </div>
              <div className="text-[11px] font-bold text-amber-300 mt-0.5">
                {trip.currentStep === 'ON_THE_WAY'
                  ? `⏱️ ${trip.minutesRemaining} Mins Remaining (${trip.distanceKm} KM)`
                  : trip.currentStep === 'ARRIVED'
                  ? '✓ Beautician at Doorstep'
                  : trip.currentStep === 'IN_PROGRESS'
                  ? `⏱️ Session Time: ${formatTimer(sessionSeconds)}`
                  : 'Booking Completed'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-white/20">
            <span>Service: <strong>{trip.serviceName}</strong> ({trip.serviceDuration})</span>
            <span>Total: <strong>₹{trip.servicePrice}</strong> | Your Payout: <strong className="text-amber-200">₹{trip.partnerCut}</strong></span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PERSISTENT CUSTOMER ADDRESS & LIVE DIRECTIONS CARD */}
        {/* (कस्टमर का एड्रेस दिखते रहना चाहिए) */}
        {/* ============================================================ */}
        <div className="bg-slate-800 rounded-3xl border-2 border-brand-primary p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2 text-pink-400">
              <MapPin className="w-5 h-5 text-brand-primary shrink-0 animate-bounce" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Customer Doorstep Address (कस्टमर का पता - हमेशा दिखाई देगा)
              </h3>
            </div>
            <span className="text-[10px] bg-brand-primary/20 text-pink-300 border border-pink-500/30 px-2.5 py-0.5 rounded-full font-bold">
              {trip.distanceKm} KM from Hub
            </span>
          </div>

          {/* Customer Profile & Call Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-primary to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                {trip.customerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>{trip.customerName}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-semibold">
                    Verified Female Client
                  </span>
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  {trip.customerPhone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${trip.customerPhone.replace(/\s+/g, '')}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Customer</span>
              </a>
              <a
                href={`https://wa.me/919839012001?text=Hello%20${trip.customerName},%20I%20am%20Priya,%20your%20BeautyNest%20beautician%20on%20the%20way%20to%20your%20home.`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Full Detailed Address Display (Always visible) */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/80 space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Exact Doorstep Destination:
              </span>
              <p className="text-sm font-semibold text-white leading-relaxed">
                {trip.customerFullAddress}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-start gap-2 text-xs">
              <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-amber-300 font-bold block text-[11px]">Landmark &amp; Directions:</span>
                <span className="text-slate-300">{trip.landmark}</span>
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Navigation Button (Google Maps) */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href="https://maps.google.com/?q=25.3176,82.9739"
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0071E3] hover:bg-[#005bb5] text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              <span>Open in Google Maps (Turn-by-Turn GPS Navigation)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {trip.currentStep === 'ON_THE_WAY' && (
              <button
                type="button"
                onClick={handleMarkArrived}
                className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-2xl text-xs transition-all shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Have Arrived at Doorstep (पहुँच गए)</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* OTP VERIFICATION & SERVICE START (When Arrived) */}
        {/* ============================================================ */}
        {trip.currentStep === 'ARRIVED' && (
          <div className="bg-amber-500/10 border-2 border-amber-500/60 rounded-3xl p-5 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-400">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Start Service Verification OTP (ग्राहक से OTP लें)
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Ask customer <strong>{trip.customerName}</strong> for the 4-digit start code sent to her phone to start the service timer.
            </p>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                maxLength={4}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="Enter 4-Digit OTP (Hint: 1234)"
                className="flex-1 px-4 py-2 text-sm bg-slate-900 border border-amber-500/50 rounded-xl font-mono font-bold tracking-widest text-center text-white outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition-colors"
              >
                Verify &amp; Start
              </button>
            </div>
            {otpError && <p className="text-xs text-rose-400 font-semibold">{otpError}</p>}
          </div>
        )}

        {/* ============================================================ */}
        {/* IN-PROGRESS LIVE SERVICE CONTROLS */}
        {/* ============================================================ */}
        {trip.currentStep === 'IN_PROGRESS' && (
          <div className="bg-emerald-500/10 border-2 border-emerald-500/60 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Clock className="w-5 h-5 animate-spin-slow" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Service Session in Progress (सर्विस जारी है)
                  </h3>
                  <span className="text-xs text-slate-400">Single-use hygienic kit unpacked in front of client</span>
                </div>
              </div>
              <div className="text-xl font-mono font-black text-emerald-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-500/40">
                {formatTimer(sessionSeconds)}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompleteService}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              Complete Service &amp; Collect Payment (₹{trip.servicePrice})
            </button>
          </div>
        )}

        {trip.currentStep === 'COMPLETED' && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-3xl p-6 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Service Successfully Completed!
            </h3>
            <p className="text-xs text-slate-400">
              ₹{trip.partnerCut} credited to your Beautician Wallet. You can now proceed to your next scheduled client.
            </p>
          </div>
        )}

        {/* ============================================================ */}
        {/* NEXT SCHEDULED BOOKING DETAILS */}
        {/* (अगली बुकिंग आईडी कितनी तारीख को है और कब है) */}
        {/* ============================================================ */}
        <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
            <div className="flex items-center gap-2 text-purple-400">
              <Calendar className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Next Upcoming Booking (अगली बुकिंग का विवरण)
              </h3>
            </div>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
              {trip.bufferHours}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-700/60 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Next Booking ID:
              </span>
              <span className="text-base font-mono font-bold text-white">
                #{trip.nextBookingId}
              </span>
              <div className="text-xs text-slate-300">
                Customer: <strong>{trip.nextCustomerName}</strong> ({trip.nextCustomerArea})
              </div>
            </div>

            <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-700/60 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Next Scheduled Date &amp; Time (तारीख व समय):
              </span>
              <div className="text-xs font-bold text-amber-300">
                📅 {trip.nextBookingDate}
              </div>
              <div className="text-xs text-slate-200">
                ⏰ {trip.nextBookingTime}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Next Service: <strong className="text-slate-200">{trip.nextServiceName}</strong></span>
            <span className="font-bold text-purple-300">₹{trip.nextServicePrice}</span>
          </div>
        </div>

        {/* Safety & Hygiene Protocol Reminder */}
        <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-300 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-pink-400 shrink-0" />
          <p className="leading-snug">
            <strong>Standard Doorstep Operating Protocol:</strong> Always wear fresh disposable headcap, sanitize hands in front of the customer, and open sterile single-use kits before starting.
          </p>
        </div>

      </div>
    </div>
  );
}
