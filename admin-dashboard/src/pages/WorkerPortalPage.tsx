import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Calendar,
  Wallet,
  CalendarDays,
  Plus,
  ArrowUpRight,
  TrendingUp,
  CheckCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
  PackagePlus,
  X,
  FileCheck,
  AlertTriangle,
  Sparkles,
  MapPin,
  Phone,
  Search,
  Check,
  Bike,
  Navigation,
  ExternalLink,
  KeyRound,
  Compass,
  MessageSquare,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { INITIAL_CONSENT_FORMS, CustomerConsentForm, ExtraServiceProduct } from '../lib/masterConfig';

const BOOKINGS_TREND_DATA = [
  { month: 'Apr', bookings: 1 },
  { month: 'May', bookings: 1 },
  { month: 'Jun', bookings: 2 },
  { month: 'Jul', bookings: 2 },
  { month: 'Aug', bookings: 3 },
  { month: 'Sep', bookings: 6 },
];

const REVENUE_TRAJECTORY_DATA = [
  { month: 'Apr', revenue: 0 },
  { month: 'May', revenue: 200 },
  { month: 'Jun', revenue: 250 },
  { month: 'Jul', revenue: 2200 },
  { month: 'Aug', revenue: 2200 },
  { month: 'Sep', revenue: 4993 },
];

const STATUS_BREAKDOWN_DATA = [
  { name: 'Completed', value: 7, color: '#16A34A' },
  { name: 'Active / Confirmed', value: 5, color: '#2563EB' },
  { name: 'Pending', value: 0, color: '#F59E0B' },
  { name: 'Cancelled', value: 3, color: '#DC2626' },
];

interface WorkerBookingItem {
  id: string;
  bookingNumber: string;
  isNew?: boolean;
  bookedOn: string;
  customerName: string;
  customerPhone: string;
  customerArea: string;
  customerAddress: string;
  serviceName: string;
  assignedWorker: string;
  scheduledSlot: string;
  totalAmount: number;
  bookingStatus: 'Accepted' | 'Confirmed' | 'Pending';
  serviceStatus: 'Completed' | 'In Progress' | 'Ready to Start' | 'Cancelled';
  consentVerified: boolean;
  hasOwnProducts: boolean;
  distanceKm: number;
  extraProducts: ExtraServiceProduct[];
}

export default function WorkerPortalPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'consent' | 'earnings'>('dashboard');
  const [consentForms, setConsentForms] = useState<CustomerConsentForm[]>(INITIAL_CONSENT_FORMS);
  const [selectedConsent, setSelectedConsent] = useState<CustomerConsentForm | null>(null);
  const [selectedBookingForExtra, setSelectedBookingForExtra] = useState<WorkerBookingItem | null>(null);

  // Live Doorstep Trip & Navigation Mode State
  const [doorstepTripOpen, setDoorstepTripOpen] = useState(true);
  const [tripStep, setTripStep] = useState<'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED'>('ON_THE_WAY');
  const [tripEnteredOtp, setTripEnteredOtp] = useState('');
  const [tripOtpError, setTripOtpError] = useState<string | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);

  // Live Timer during Service In Progress
  useEffect(() => {
    let interval: any;
    if (tripStep === 'IN_PROGRESS') {
      interval = setInterval(() => {
        setSessionTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tripStep]);

  // Next Scheduled Booking Information
  const nextScheduledBooking = {
    bookingId: 'BK-69012',
    date: '20 Sep 2026 (Tomorrow / कल)',
    timeSlot: '11:30 AM - 01:00 PM',
    customerName: 'Pooja Verma',
    customerPhone: '+91 98390 55123',
    customerArea: 'Assi Ghat, Varanasi',
    serviceName: 'O3+ Bridal Glow Facial & Hair Spa',
    price: 1899,
    partnerCut: 380,
    bufferNotice: 'Next job in 18 hrs 45 mins',
  };

  // Extra product form state
  const [extraProdName, setExtraProdName] = useState('');
  const [extraProdQty, setExtraProdQty] = useState('1');
  const [extraProdPrice, setExtraProdPrice] = useState('150');

  const [bookings, setBookings] = useState<WorkerBookingItem[]>([
    {
      id: 'wb-1',
      bookingNumber: 'BK-69006',
      isNew: true,
      bookedOn: 'Just now, 19 Sep 2026, 03:30 PM',
      customerName: 'Shivnash',
      customerPhone: '+91 98390 12001',
      customerArea: 'Sigra, Varanasi',
      customerAddress: 'House 42, Near Stadium, Sigra',
      serviceName: 'Korean Glass Skin Hydra Ritual',
      assignedWorker: 'Priya Beautician (Gold)',
      scheduledSlot: '19 Sep 2026 03:30 PM',
      totalAmount: 899,
      bookingStatus: 'Accepted',
      serviceStatus: 'Ready to Start',
      consentVerified: false,
      hasOwnProducts: false,
      distanceKm: 2.8,
      extraProducts: [],
    },
    {
      id: 'wb-2',
      bookingNumber: 'BK-6887',
      bookedOn: 'Yesterday, 18 Sep 2026, 11:30 AM',
      customerName: 'Ritu Singh',
      customerPhone: '+91 98390 44551',
      customerArea: 'Lanka (BHU), Varanasi',
      customerAddress: 'B-12, Anand Vihar Colony, Lanka',
      serviceName: 'O3+ Whitening & Brightening Facial',
      assignedWorker: 'Priya Beautician (Gold)',
      scheduledSlot: '18 Sep 2026 11:30 AM',
      totalAmount: 1499,
      bookingStatus: 'Accepted',
      serviceStatus: 'Completed',
      consentVerified: true,
      hasOwnProducts: false,
      distanceKm: 4.2,
      extraProducts: [
        {
          id: 'xp-1',
          name: 'O3+ Derma Cooling Mask Post-Facial',
          quantity: 1,
          pricePerUnit: 250,
          addedByBeautician: 'Priya Beautician',
          addedAt: '18 Sep 12:15 PM',
        },
      ],
    },
    {
      id: 'wb-3',
      bookingNumber: 'BK-6882',
      bookedOn: '17 Sep 2026, 02:00 PM',
      customerName: 'Ananya Roy',
      customerPhone: '+91 98390 44558',
      customerArea: 'Assi Ghat, Varanasi',
      customerAddress: 'Ghat Heritage Lane 3, Assi',
      serviceName: 'Rica White Chocolate Full Body Waxing',
      assignedWorker: 'Priya Beautician (Gold)',
      scheduledSlot: '17 Sep 2026 02:00 PM',
      totalAmount: 1299,
      bookingStatus: 'Accepted',
      serviceStatus: 'Completed',
      consentVerified: true,
      hasOwnProducts: true,
      distanceKm: 3.0,
      extraProducts: [],
    },
  ]);

  // Handle Verify Customer Consent
  const handleVerifyConsent = (bookingNumber: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.bookingNumber === bookingNumber
          ? { ...b, consentVerified: true, serviceStatus: 'In Progress' }
          : b
      )
    );
    setSelectedConsent(null);
  };

  // Add Extra Salon Product During Service
  const handleAddExtraProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForExtra) return;

    const extra: ExtraServiceProduct = {
      id: `xp-${Date.now()}`,
      name: extraProdName,
      quantity: Number(extraProdQty) || 1,
      pricePerUnit: Number(extraProdPrice) || 100,
      addedByBeautician: 'Priya Beautician',
      addedAt: 'Just now',
    };

    const addedAmount = extra.quantity * extra.pricePerUnit;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBookingForExtra.id
          ? {
              ...b,
              extraProducts: [...b.extraProducts, extra],
              totalAmount: b.totalAmount + addedAmount,
            }
          : b
      )
    );

    setSelectedBookingForExtra(null);
    setExtraProdName('');
    setExtraProdQty('1');
    setExtraProdPrice('150');
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)] bg-[#F8F9FA]">
      {/* Top Breadcrumb & Action Bar (Matching Screenshot 1) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            OVERVIEW
          </span>
          <h2 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
            Executive Dashboard
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time worker operations, doorstep assignments, pre-service consent verification &amp; dynamic earnings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setDoorstepTripOpen(!doorstepTripOpen)}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all ${
              doorstepTripOpen
                ? 'bg-gradient-to-r from-pink-600 to-brand-primary text-white shadow-pink-soft ring-2 ring-pink-300'
                : 'bg-white border border-pink-200 text-brand-primary hover:bg-pink-50'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>🛵 Live Doorstep Trip &amp; Address Mode</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>

          <button
            onClick={() => alert('Viewing worker schedule & booked time slots')}
            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <span>View Schedule</span>
          </button>

          <button
            onClick={() => alert('New Doorstep Dispatch Assignment created')}
            className="inline-flex items-center gap-1.5 bg-[#0071E3] hover:bg-[#005bb5] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Dispatch</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards (Matching Screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Total Customers</span>
              <span className="text-2xl font-bold text-gray-900">6</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+6 registered this month</span>
          </div>
        </div>

        {/* Active Workers */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Active Workers</span>
              <span className="text-2xl font-bold text-gray-900">1</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>1 active ready for dispatch</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Total Bookings</span>
              <span className="text-2xl font-bold text-gray-900">15</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>6 scheduled this month</span>
          </div>
        </div>

        {/* Gross Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Gross Revenue</span>
              <span className="text-2xl font-bold text-gray-900">₹4,993</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>₹199 collected this month</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* LIVE DOORSTEP TRIP & PERSISTENT CUSTOMER ADDRESS CARD */}
      {/* (ब्यूटीशियन कस्टमर के घर जाएगी - बुकिंग आईडी, कब पहुंचना है, कस्टमर एड्रेस, अगली बुकिंग आईडी व तारीख) */}
      {/* ============================================================ */}
      {doorstepTripOpen && (
        <div className="bg-slate-900 rounded-3xl p-6 border-2 border-brand-primary shadow-2xl text-white space-y-5 animate-in fade-in">
          
          {/* Header Bar: Current Booking ID & Scheduled Arrival Countdown */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-primary to-pink-600 p-4 rounded-2xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-pink-200">
                  CURRENT ACTIVE DOORSTEP TRIP (वर्तमान बुकिंग)
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              </div>
              <div className="flex items-center gap-3 mt-1">
                <h3 className="text-2xl font-black font-mono tracking-tight text-white">
                  Booking #{bookings[0]?.bookingNumber || 'BK-69006'}
                </h3>
                <span className="text-xs bg-white text-brand-primary font-bold px-3 py-1 rounded-full shadow-sm">
                  {tripStep === 'ON_THE_WAY' && '🛵 On the Way (रास्ते में हैं)'}
                  {tripStep === 'ARRIVED' && '📍 Arrived at Doorstep'}
                  {tripStep === 'IN_PROGRESS' && '⏳ Service in Progress'}
                  {tripStep === 'COMPLETED' && '✓ Completed'}
                </span>
              </div>
              <p className="text-xs text-pink-100 mt-0.5">
                Service: <strong>{bookings[0]?.serviceName}</strong> (60 mins) • Payout: <strong className="text-amber-200">₹{Math.round((bookings[0]?.totalAmount || 899) * 0.20)}</strong> (20% Gold Tier)
              </p>
            </div>

            {/* Scheduled Arrival Time & Countdown Display */}
            <div className="bg-black/35 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/20 text-left md:text-right">
              <span className="text-[10px] text-pink-200 block font-medium">
                Scheduled Arrival Time (पहुंचने का समय):
              </span>
              <div className="flex items-center gap-1.5 md:justify-end">
                <Clock className="w-4 h-4 text-amber-300" />
                <span className="text-base font-extrabold text-white">
                  Today 03:30 PM
                </span>
              </div>
              <div className="text-xs font-bold text-amber-300 mt-0.5">
                {tripStep === 'ON_THE_WAY'
                  ? '⏱️ 22 Mins Remaining • Distance: 2.8 KM'
                  : tripStep === 'ARRIVED'
                  ? '✓ Beautician at Doorstep'
                  : tripStep === 'IN_PROGRESS'
                  ? `⏱️ Session Timer: ${Math.floor(sessionTimer / 60)}m ${sessionTimer % 60}s`
                  : 'Booking Finished'}
              </div>
            </div>
          </div>

          {/* Persistent Customer Address & Map Navigation (Always Visible) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Customer Details & Persistent Address (2 cols) */}
            <div className="lg:col-span-2 bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-brand-primary animate-bounce" />
                  <span>Persistent Customer Address (कस्टमर का पता - हमेशा दिखाई देगा)</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  Sigra Hub • 2.8 KM
                </span>
              </div>

              {/* Customer Contact & Call Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                    {bookings[0]?.customerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{bookings[0]?.customerName}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-semibold">
                        Verified Client
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {bookings[0]?.customerPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${bookings[0]?.customerPhone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/919839012001?text=Hello%20${bookings[0]?.customerName},%20I%20am%20Priya,%20your%20BeautyNest%20beautician%20on%20the%20way%20to%20your%20home.`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Exact Address Box */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Exact Doorstep Destination:
                </span>
                <p className="text-xs font-semibold text-white leading-relaxed">
                  House 42, 2nd Floor, Anand Nagar Colony, Opposite Sigra Sports Stadium Gate 2, Sigra, Varanasi, UP - 221010
                </p>
                <div className="flex items-center gap-1.5 text-xs text-amber-300 pt-1">
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span><strong>Landmark:</strong> Opposite Stadium Gate No. 2, Green Gate, Bell on right</span>
                </div>
              </div>

              {/* Turn-by-Turn GPS Navigation Button */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href="https://maps.google.com/?q=25.3176,82.9739"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0071E3] hover:bg-[#005bb5] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open in Google Maps (Turn-by-Turn GPS Navigation)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {tripStep === 'ON_THE_WAY' && (
                  <button
                    type="button"
                    onClick={() => setTripStep('ARRIVED')}
                    className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>I Have Arrived (पहुँच गए)</span>
                  </button>
                )}
              </div>

              {/* OTP Verification Prompt when Arrived */}
              {tripStep === 'ARRIVED' && (
                <div className="bg-amber-500/10 border border-amber-500/50 p-3 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <KeyRound className="w-4 h-4" />
                    <span>Enter Customer Start OTP (e.g. 1234)</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={tripEnteredOtp}
                      onChange={(e) => setTripEnteredOtp(e.target.value)}
                      placeholder="Enter 4-digit OTP"
                      className="px-3 py-1.5 text-xs bg-slate-900 border border-amber-500/40 rounded-lg text-white font-mono font-bold tracking-widest outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tripEnteredOtp === '1234' || tripEnteredOtp.trim() !== '') {
                          setTripStep('IN_PROGRESS');
                          setTripOtpError(null);
                        } else {
                          setTripOtpError('Invalid OTP! Please enter 1234');
                        }
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs"
                    >
                      Verify &amp; Start Service
                    </button>
                  </div>
                  {tripOtpError && <p className="text-[11px] text-rose-400">{tripOtpError}</p>}
                </div>
              )}

              {/* In Progress Service Timer & Completion */}
              {tripStep === 'IN_PROGRESS' && (
                <div className="bg-emerald-500/10 border border-emerald-500/50 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                    <Clock className="w-4 h-4 animate-spin-slow" />
                    <span>Service Running: {Math.floor(sessionTimer / 60)}m {sessionTimer % 60}s</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTripStep('COMPLETED')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs"
                  >
                    Complete Service (₹899)
                  </button>
                </div>
              )}
            </div>

            {/* Next Scheduled Booking Card (अगली बुकिंग आईडी कितनी तारीख को है और कब है) */}
            <div className="bg-slate-800/90 rounded-2xl p-4 border border-purple-500/40 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs uppercase">
                    <Calendar className="w-4 h-4" />
                    <span>Next Booking (अगली बुकिंग)</span>
                  </div>
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                    Upcoming
                  </span>
                </div>

                <div className="space-y-2 mt-3 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Next Booking ID:
                    </span>
                    <span className="text-base font-mono font-bold text-white">
                      #{nextScheduledBooking.bookingId}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Scheduled Date &amp; Time (तारीख व समय):
                    </span>
                    <div className="text-xs font-bold text-amber-300">
                      📅 {nextScheduledBooking.date}
                    </div>
                    <div className="text-xs text-slate-200">
                      ⏰ {nextScheduledBooking.timeSlot}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Client &amp; Destination:
                    </span>
                    <div className="font-bold text-white">{nextScheduledBooking.customerName}</div>
                    <div className="text-[11px] text-slate-400">{nextScheduledBooking.customerArea}</div>
                  </div>

                  <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800 flex justify-between text-[11px]">
                    <span className="text-slate-400">{nextScheduledBooking.serviceName}</span>
                    <span className="font-bold text-purple-300">₹{nextScheduledBooking.price}</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                ⏱️ <strong>Buffer Gap:</strong> {nextScheduledBooking.bufferNotice}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3 Visual Charts Row (Matching Screenshot 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bookings Trend */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0071E3]" />
              <h3 className="text-sm font-bold text-gray-900">Bookings Trend</h3>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">Last 6 months</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={BOOKINGS_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0071E3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0071E3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                <Area type="monotone" dataKey="bookings" stroke="#0071E3" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trajectory */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900">Revenue Trajectory</h3>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">Last 6 months</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TRAJECTORY_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown (Donut) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-900">Status Breakdown</h3>
          </div>

          <div className="flex items-center justify-between h-44">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={STATUS_BREAKDOWN_DATA} innerRadius={36} outerRadius={54} paddingAngle={4} dataKey="value">
                    {STATUS_BREAKDOWN_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-1/2 space-y-1.5 pl-2 text-xs">
              {STATUS_BREAKDOWN_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 text-[11px] truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 text-xs">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Ledger (Matching Screenshot 1) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 font-serif">Recent Bookings Ledger</h3>
            <p className="text-xs text-gray-500">
              Latest home service requests, route navigation, pre-service consent verification &amp; extra products
            </p>
          </div>

          <button
            onClick={() => alert('Navigating to full bookings register')}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0071E3] hover:text-[#005bb5] px-3 py-1.5 rounded-xl border border-blue-100 hover:bg-blue-50/50 transition-all"
          >
            <span>View all bookings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-6 font-bold">Booking Number</th>
                <th className="py-3.5 px-6 font-bold">Booked On</th>
                <th className="py-3.5 px-6 font-bold">Customer</th>
                <th className="py-3.5 px-6 font-bold">Service</th>
                <th className="py-3.5 px-6 font-bold">Assigned Worker</th>
                <th className="py-3.5 px-6 font-bold">Scheduled Slot</th>
                <th className="py-3.5 px-6 font-bold">Total</th>
                <th className="py-3.5 px-6 font-bold">Booking Status</th>
                <th className="py-3.5 px-6 font-bold">Service Status</th>
                <th className="py-3.5 px-6 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-gray-900">
                    <div className="flex items-center gap-1.5">
                      <span>{b.bookingNumber}</span>
                      {b.isNew && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          NEW
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{b.bookedOn}</td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0071E3] font-bold text-[11px] flex items-center justify-center shrink-0">
                        {b.customerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{b.customerName}</span>
                        <span className="text-[10px] text-gray-400">{b.customerPhone}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="bg-gray-100 text-gray-800 text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block max-w-fit">
                        {b.serviceName}
                      </span>
                      {b.hasOwnProducts && (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          ✓ Customer Own Products
                        </span>
                      )}
                      {b.extraProducts.length > 0 && (
                        <span className="text-[10px] text-purple-600 font-bold">
                          +{b.extraProducts.length} Extra Products Added
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6 font-medium text-gray-700">{b.assignedWorker}</td>

                  <td className="py-4 px-6 text-gray-600 whitespace-nowrap">
                    📅 {b.scheduledSlot}
                  </td>

                  <td className="py-4 px-6 font-bold text-gray-900 text-sm">₹{b.totalAmount}</td>

                  <td className="py-4 px-6">
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[11px] border border-emerald-200">
                      • {b.bookingStatus}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`font-bold px-2.5 py-1 rounded-full text-[11px] border ${
                        b.serviceStatus === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : b.serviceStatus === 'In Progress'
                          ? 'bg-blue-50 text-[#0071E3] border-blue-200 animate-pulse'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {b.serviceStatus}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right whitespace-nowrap space-x-1.5">
                    {/* Consent Verification Button */}
                    {!b.consentVerified && (
                      <button
                        onClick={() => {
                          const found = consentForms.find((c) => c.bookingId === b.bookingNumber);
                          setSelectedConsent(
                            found || {
                              id: `cnf-${b.id}`,
                              bookingId: b.bookingNumber,
                              customerName: b.customerName,
                              customerPhone: b.customerPhone,
                              serviceName: b.serviceName,
                              hasSkinAllergies: false,
                              isPregnant: false,
                              skinSensitivityLevel: 'Normal',
                              productPermissionGranted: true,
                              digitalAccepted: true,
                              signedAt: 'Today, Just before start',
                              beauticianVerified: false,
                            }
                          );
                        }}
                        className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-colors"
                        title="Verify Customer Consent before starting"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Verify Consent</span>
                      </button>
                    )}

                    {/* Add Extra Products Button */}
                    {b.serviceStatus !== 'Completed' && (
                      <button
                        onClick={() => setSelectedBookingForExtra(b)}
                        className="inline-flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-purple-200 transition-colors"
                        title="Add extra product consumed during service"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        <span>+ Product</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pre-Service Consent Verification Modal */}
      {selectedConsent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-amber-50/60">
              <div className="flex items-center gap-2 text-amber-900">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold font-serif">
                  Pre-Service Customer Consent Verification
                </h3>
              </div>
              <button
                onClick={() => setSelectedConsent(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking:</span>
                  <span className="font-bold text-gray-900">{selectedConsent.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-bold text-gray-900">{selectedConsent.customerName} ({selectedConsent.customerPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service:</span>
                  <span className="font-semibold text-gray-800">{selectedConsent.serviceName}</span>
                </div>
              </div>

              {/* Allergy & Sensitivity Declaration */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-800">Customer Health &amp; Allergy Declarations:</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="text-gray-700">Known Skin Allergies / Chemical Sensitivity:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${selectedConsent.hasSkinAllergies ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {selectedConsent.hasSkinAllergies ? 'YES (See Notes)' : 'None Reported'}
                    </span>
                  </div>

                  {selectedConsent.allergyDetails && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                      <strong>Customer Note:</strong> {selectedConsent.allergyDetails}
                    </div>
                  )}

                  <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="text-gray-700">Skin Sensitivity Level:</span>
                    <span className="font-bold text-gray-900">{selectedConsent.skinSensitivityLevel}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="text-gray-700">Cosmetic Product Application Permission:</span>
                    <span className="font-bold text-emerald-600">✓ Granted by Customer</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="text-gray-700">Digital Acceptance &amp; Timestamp:</span>
                    <span className="font-mono text-gray-600 text-[10px]">{selectedConsent.signedAt}</span>
                  </div>
                </div>
              </div>

              {/* Beautician Confirmation Checklist */}
              <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 text-blue-900 text-[11px] space-y-1.5">
                <p className="font-bold">Beautician Safe Protocol Checklist:</p>
                <p>✓ Sterile single-use disposable bedsheet &amp; gown deployed</p>
                <p>✓ Patch test checked for facial / waxing / hair chemicals</p>
                <p>✓ 100% sanitized tools verified in presence of client</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedConsent(null)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerifyConsent(selectedConsent.bookingId)}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify &amp; Start Service</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Extra Salon Products Modal */}
      {selectedBookingForExtra && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-purple-50/60">
              <div className="flex items-center gap-2 text-purple-900">
                <PackagePlus className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold font-serif">Add Extra Product to Service</h3>
              </div>
              <button
                onClick={() => setSelectedBookingForExtra(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExtraProduct} className="p-5 space-y-4 text-xs">
              <p className="text-gray-500">
                Beautician can add additional creams, serums, or waxing strips requested by customer during service.
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={extraProdName}
                  onChange={(e) => setExtraProdName(e.target.value)}
                  placeholder="e.g. O3+ Hydrating Serum Ampoule (10ml)"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={extraProdQty}
                    onChange={(e) => setExtraProdQty(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price Per Unit (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={extraProdPrice}
                    onChange={(e) => setExtraProdPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:bg-white font-bold text-purple-700"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50/50 rounded-xl text-[11px] text-purple-900">
                <strong>Bill Update:</strong> ₹{(Number(extraProdQty) || 1) * (Number(extraProdPrice) || 0)} will be added to booking total.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForExtra(null)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
                >
                  Add to Customer Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
