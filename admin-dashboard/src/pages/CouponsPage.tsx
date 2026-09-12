import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
  Calendar,
  Percent,
  Coins,
  Copy,
  Check,
  TrendingUp,
  Award,
  Filter,
  Layers,
  History,
  ShieldCheck,
  DollarSign,
  Users,
} from 'lucide-react';
import { BEAUTYNEST_SERVICES } from '../lib/allServices';

export interface CouponRecord {
  id: string;
  code: string;
  discount: string;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  minBookingValue: number;
  maxDiscount?: number;
  maxUsageLimit: number;
  perUserUsageLimit: number;
  description: string;
  expiryDate: string;
  timesUsed: number;
  isActive: boolean;
  applicableCategory: string;
  applicableServices: string[];
  applicablePackages: string[];
}

export interface CouponUsageHistoryItem {
  id: string;
  couponCode: string;
  customerName: string;
  customerPhone: string;
  bookingId: string;
  discountGiven: number;
  orderValue: number;
  usedAt: string;
}

const INITIAL_COUPONS: CouponRecord[] = [
  {
    id: 'cp-1',
    code: 'VARANASI50',
    discount: 'Flat ₹50 OFF',
    discountType: 'FIXED',
    discountValue: 50,
    minBookingValue: 499,
    maxUsageLimit: 1000,
    perUserUsageLimit: 2,
    description: 'Special doorstep discount for all Varanasi female residents.',
    expiryDate: '2026-12-31',
    timesUsed: 642,
    isActive: true,
    applicableCategory: 'All Services',
    applicableServices: [],
    applicablePackages: [],
  },
  {
    id: 'cp-2',
    code: 'GLOW30',
    discount: '30% OFF',
    discountType: 'PERCENTAGE',
    discountValue: 30,
    minBookingValue: 899,
    maxDiscount: 500,
    maxUsageLimit: 800,
    perUserUsageLimit: 1,
    description: '30% discount up to ₹500 on all Facials, Cleanups and Skin Rituals.',
    expiryDate: '2026-11-30',
    timesUsed: 428,
    isActive: true,
    applicableCategory: 'Facial & Cleanup',
    applicableServices: ['O3+ Bridal Glow & Radiance Oxygenating Facial'],
    applicablePackages: [],
  },
  {
    id: 'cp-3',
    code: 'BRIDAL1000',
    discount: 'Flat ₹1000 OFF',
    discountType: 'FIXED',
    discountValue: 1000,
    minBookingValue: 2499,
    maxUsageLimit: 500,
    perUserUsageLimit: 1,
    description: 'Grand festive & pre-wedding discount on all Bridal & Pre-Bridal packages.',
    expiryDate: '2026-12-31',
    timesUsed: 185,
    isActive: true,
    applicableCategory: 'Bridal & Packages',
    applicableServices: [],
    applicablePackages: ['Bridal Royal Glow Makeover Ritual'],
  },
  {
    id: 'cp-4',
    code: 'FESTIVE25',
    discount: '25% OFF',
    discountType: 'PERCENTAGE',
    discountValue: 25,
    minBookingValue: 799,
    maxDiscount: 400,
    maxUsageLimit: 600,
    perUserUsageLimit: 2,
    description: 'Kashi festive season pamper coupon for hair spa, waxing & mani-pedi.',
    expiryDate: '2026-10-31',
    timesUsed: 290,
    isActive: true,
    applicableCategory: 'All Services',
    applicableServices: [],
    applicablePackages: [],
  },
  {
    id: 'cp-5',
    code: 'WELCOME200',
    discount: 'Flat ₹200 OFF',
    discountType: 'FIXED',
    discountValue: 200,
    minBookingValue: 799,
    maxUsageLimit: 1500,
    perUserUsageLimit: 1,
    description: 'New customer first booking welcome coupon in Varanasi.',
    expiryDate: '2026-12-31',
    timesUsed: 512,
    isActive: true,
    applicableCategory: 'All Services',
    applicableServices: [],
    applicablePackages: [],
  },
];

const INITIAL_USAGE_HISTORY: CouponUsageHistoryItem[] = [
  {
    id: 'usg-1',
    couponCode: 'VARANASI50',
    customerName: 'Pooja Sharma',
    customerPhone: '+91 98765 43210',
    bookingId: 'BK-69006',
    discountGiven: 50,
    orderValue: 1899,
    usedAt: '12 Sep 2026, 02:45 PM',
  },
  {
    id: 'usg-2',
    couponCode: 'GLOW30',
    customerName: 'Anjali Srivastava',
    customerPhone: '+91 98765 22334',
    bookingId: 'BK-69008',
    discountGiven: 360,
    orderValue: 1200,
    usedAt: '12 Sep 2026, 01:15 PM',
  },
  {
    id: 'usg-3',
    couponCode: 'BRIDAL1000',
    customerName: 'Neha Mishra',
    customerPhone: '+91 98765 44556',
    bookingId: 'BK-69010',
    discountGiven: 1000,
    orderValue: 4800,
    usedAt: '11 Sep 2026, 06:30 PM',
  },
  {
    id: 'usg-4',
    couponCode: 'FESTIVE25',
    customerName: 'Swati Tripathi',
    customerPhone: '+91 98765 77889',
    bookingId: 'BK-69011',
    discountGiven: 225,
    orderValue: 900,
    usedAt: '11 Sep 2026, 04:20 PM',
  },
  {
    id: 'usg-5',
    couponCode: 'WELCOME200',
    customerName: 'Priyanka Dubey',
    customerPhone: '+91 98765 99001',
    bookingId: 'BK-69014',
    discountGiven: 200,
    orderValue: 1099,
    usedAt: '10 Sep 2026, 11:10 AM',
  },
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponRecord[]>(() => {
    try {
      const saved = localStorage.getItem('beautynest_coupons');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COUPONS;
  });

  const [usageHistory] = useState<CouponUsageHistoryItem[]>(INITIAL_USAGE_HISTORY);
  const [activeTab, setActiveTab] = useState<'COUPONS' | 'HISTORY'>('COUPONS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    code: string;
    discountType: 'FIXED' | 'PERCENTAGE';
    discountValue: number;
    minBookingValue: number;
    maxDiscount?: number;
    maxUsageLimit: number;
    perUserUsageLimit: number;
    description: string;
    expiryDate: string;
    applicableCategory: string;
    applicableServices: string[];
    applicablePackages: string[];
    isActive: boolean;
  }>({
    code: '',
    discountType: 'FIXED',
    discountValue: 100,
    minBookingValue: 599,
    maxDiscount: 300,
    maxUsageLimit: 500,
    perUserUsageLimit: 1,
    description: '',
    expiryDate: '2026-12-31',
    applicableCategory: 'All Services',
    applicableServices: [],
    applicablePackages: [],
    isActive: true,
  });

  // Persist coupons to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('beautynest_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.error(e);
    }
  }, [coupons]);

  // COUPON ANALYTICS CALCULATIONS (Requested in Spec 4)
  const totalCouponsCreated = coupons.length;
  const totalUsed = coupons.reduce((sum, c) => sum + (c.timesUsed || 0), 0);
  const totalMaxLimit = coupons.reduce((sum, c) => sum + (c.maxUsageLimit || 1000), 0);
  const remainingUsage = Math.max(0, totalMaxLimit - totalUsed);
  // Revenue generated = order value from usage history + average revenue from redemptions
  const revenueGenerated = usageHistory.reduce((sum, u) => sum + u.orderValue, 0) + totalUsed * 1350;

  const filteredCoupons = coupons.filter((c) => {
    const matchesQuery =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.applicableCategory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && c.isActive) ||
      (statusFilter === 'INACTIVE' && !c.isActive);

    return matchesQuery && matchesStatus;
  });

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1600);
  };

  const handleToggleActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      code: '',
      discountType: 'FIXED',
      discountValue: 100,
      minBookingValue: 499,
      maxDiscount: 300,
      maxUsageLimit: 500,
      perUserUsageLimit: 1,
      description: '',
      expiryDate: '2026-12-31',
      applicableCategory: 'All Services',
      applicableServices: [],
      applicablePackages: [],
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (coupon: CouponRecord) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minBookingValue: coupon.minBookingValue,
      maxDiscount: coupon.maxDiscount,
      maxUsageLimit: coupon.maxUsageLimit || 500,
      perUserUsageLimit: coupon.perUserUsageLimit || 1,
      description: coupon.description,
      expiryDate: coupon.expiryDate,
      applicableCategory: coupon.applicableCategory,
      applicableServices: coupon.applicableServices || [],
      applicablePackages: coupon.applicablePackages || [],
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon code?')) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    const discountText =
      formData.discountType === 'PERCENTAGE'
        ? `${formData.discountValue}% OFF`
        : `Flat ₹${formData.discountValue} OFF`;

    if (editingId) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                code: formData.code.toUpperCase().trim(),
                discount: discountText,
                discountType: formData.discountType,
                discountValue: formData.discountValue,
                minBookingValue: formData.minBookingValue,
                maxDiscount: formData.maxDiscount,
                maxUsageLimit: formData.maxUsageLimit,
                perUserUsageLimit: formData.perUserUsageLimit,
                description: formData.description,
                expiryDate: formData.expiryDate,
                applicableCategory: formData.applicableCategory,
                applicableServices: formData.applicableServices,
                applicablePackages: formData.applicablePackages,
                isActive: formData.isActive,
              }
            : c
        )
      );
    } else {
      const newCoupon: CouponRecord = {
        id: `cp-${Date.now()}`,
        code: formData.code.toUpperCase().trim(),
        discount: discountText,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minBookingValue: formData.minBookingValue,
        maxDiscount: formData.maxDiscount,
        maxUsageLimit: formData.maxUsageLimit,
        perUserUsageLimit: formData.perUserUsageLimit,
        description: formData.description,
        expiryDate: formData.expiryDate,
        timesUsed: 0,
        isActive: formData.isActive,
        applicableCategory: formData.applicableCategory,
        applicableServices: formData.applicableServices,
        applicablePackages: formData.applicablePackages,
      };
      setCoupons((prev) => [newCoupon, ...prev]);
    }

    setShowModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-100 text-[#D84374]">
              <Tag className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900">
              Coupon Code Management Module (कूपन कोड प्रबंधन)
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Create fixed &amp; percentage discounts with minimum booking values, maximum usage limits, and real-time coupon analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Tab Switcher */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setActiveTab('COUPONS')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'COUPONS' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
              }`}
            >
              All Coupons
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                activeTab === 'HISTORY' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Usage History ({usageHistory.length})</span>
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-gradient-to-r from-[#D84374] to-pink-600 hover:from-[#c23664] hover:to-pink-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Coupon Code</span>
          </button>
        </div>
      </div>

      {/* 4 COUPON ANALYTICS KPI CARDS (Specified in Requirement 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Total Coupons Created</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalCouponsCreated}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Configured in Master</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#D84374] flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Total Used</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalUsed.toLocaleString()}</h3>
            <span className="text-[11px] text-blue-600 font-medium">Redemptions by Customers</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Remaining Usage</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{remainingUsage.toLocaleString()}</h3>
            <span className="text-[11px] text-purple-600 font-medium">Quota Available</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Revenue Generated</span>
            <h3 className="text-2xl font-bold text-emerald-700 mt-0.5">
              ₹{revenueGenerated.toLocaleString()}
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium">Via Coupon Bookings</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {activeTab === 'COUPONS' ? (
        <>
          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search promo codes, category..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#D84374]"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
                    statusFilter === s
                      ? 'bg-[#D84374] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Coupon Code</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Min. Booking Value</th>
                    <th className="p-4">Usage Limits (Max / User)</th>
                    <th className="p-4">Applicable Restriction</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCoupons.map((c) => (
                    <tr key={c.id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#D84374] bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                            {c.code}
                          </span>
                          <button
                            onClick={() => handleCopy(c.code)}
                            className="text-gray-400 hover:text-gray-700 p-1"
                            title="Copy code"
                          >
                            {copiedCode === c.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{c.description}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-[#D84374]">{c.discount}</span>
                        {c.maxDiscount && (
                          <span className="text-[10px] text-gray-400 block">Cap: ₹{c.maxDiscount}</span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-gray-700 font-semibold">
                        ₹{c.minBookingValue}
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="text-gray-800 font-medium">
                            {c.timesUsed} / {c.maxUsageLimit} used
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            Max {c.perUserUsageLimit} per user
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {c.applicableCategory}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 font-mono text-[11px]">{c.expiryDate}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(c.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                            c.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {c.isActive ? '● Active' : '○ Paused'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="p-1.5 text-gray-500 hover:text-[#D84374] hover:bg-pink-50 rounded-lg"
                            title="Edit Coupon"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* COUPON USAGE HISTORY TABLE (Specified in Requirement 4) */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Coupon Usage History (कूपन उपयोग का विस्तृत इतिहास)
              </h3>
              <p className="text-[11px] text-gray-500">
                Live audit trail of each customer redemption, booking amount, and discount given.
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
              {usageHistory.length} Redemptions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Used At</th>
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Customer Name &amp; Phone</th>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Order Value</th>
                  <th className="p-4">Discount Given</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usageHistory.map((u) => (
                  <tr key={u.id} className="hover:bg-pink-50/30">
                    <td className="p-4 text-gray-600 font-mono text-[11px]">{u.usedAt}</td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-xs text-[#D84374] bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                        {u.couponCode}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gray-900 block">{u.customerName}</span>
                      <span className="text-[11px] text-gray-500">{u.customerPhone}</span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-blue-700">{u.bookingId}</td>
                    <td className="p-4 font-mono font-bold text-gray-800">₹{u.orderValue}</td>
                    <td className="p-4 font-mono font-extrabold text-emerald-700">-₹{u.discountGiven}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT COUPON MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-6 pb-12">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-pink-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#D84374] to-pink-600 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Tag className="w-6 h-6 text-pink-200" />
                <div>
                  <h3 className="text-lg font-bold">
                    {editingId ? 'Edit Coupon Code' : 'Create New Coupon Code (नया कूपन बनाएं)'}
                  </h3>
                  <p className="text-xs text-pink-100">
                    Configure discounts, limits, and service restrictions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DIWALI50"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl uppercase font-mono font-bold outline-none focus:border-[#D84374]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374] font-medium"
                  >
                    <option value="FIXED">Fixed Discount (₹ Flat)</option>
                    <option value="PERCENTAGE">Percentage Discount (% Off)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-pink-50/50 p-3 rounded-2xl border border-pink-100">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-bold outline-none focus:border-[#D84374]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Min. Order Value (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.minBookingValue}
                    onChange={(e) => setFormData({ ...formData, minBookingValue: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#D84374]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount || ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    placeholder="Optional"
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#D84374]"
                  />
                </div>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Maximum Total Usage Limit *</label>
                  <input
                    type="number"
                    required
                    value={formData.maxUsageLimit}
                    onChange={(e) => setFormData({ ...formData, maxUsageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Per User Usage Limit *</label>
                  <input
                    type="number"
                    required
                    value={formData.perUserUsageLimit}
                    onChange={(e) => setFormData({ ...formData, perUserUsageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374]"
                  />
                </div>
              </div>

              {/* Expiry & Restriction */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Service / Category Restriction</label>
                  <select
                    value={formData.applicableCategory}
                    onChange={(e) => setFormData({ ...formData, applicableCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374]"
                  >
                    <option value="All Services">All Services (No Restriction)</option>
                    <option value="Facial & Cleanup">Facial &amp; Cleanup Only</option>
                    <option value="Bridal & Packages">Bridal &amp; Packages Only</option>
                    <option value="Waxing & Hair Removal">Waxing Only</option>
                    <option value="Hair Spa & Care">Hair Spa Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Short Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Offer details shown to customer during checkout..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374] resize-none"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#D84374] rounded accent-[#D84374]"
                  />
                  <span className="font-semibold text-gray-800">Activate coupon immediately</span>
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#D84374] to-pink-600 hover:from-[#c23664] text-white font-bold rounded-xl shadow-md"
                >
                  {editingId ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
