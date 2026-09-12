import React, { useState } from 'react';
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

        <div className="flex items-center gap-3">
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
