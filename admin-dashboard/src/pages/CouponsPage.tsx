import React, { useState } from 'react';
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
} from 'lucide-react';
export interface CouponRecord {
  id: string;
  code: string;
  discount: string;
  discountType: 'FLAT' | 'PERCENTAGE';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  description: string;
  expiryDate: string;
  timesUsed: number;
  isActive: boolean;
  applicableCategory: string;
}

const INITIAL_COUPONS: CouponRecord[] = [
  {
    id: 'cp-1',
    code: 'VARANASI50',
    discount: 'Flat ₹50 OFF',
    discountType: 'FLAT',
    discountValue: 50,
    minOrderValue: 499,
    description: 'Special doorstep discount for all Varanasi female residents.',
    expiryDate: '31 Dec 2026',
    timesUsed: 642,
    isActive: true,
    applicableCategory: 'All Services',
  },
  {
    id: 'cp-2',
    code: 'GLOW30',
    discount: '30% OFF',
    discountType: 'PERCENTAGE',
    discountValue: 30,
    minOrderValue: 899,
    maxDiscount: 500,
    description: '30% discount up to ₹500 on all Facials, Cleanups and Skin Rituals.',
    expiryDate: '30 Nov 2026',
    timesUsed: 428,
    isActive: true,
    applicableCategory: 'Facial & Cleanup',
  },
  {
    id: 'cp-3',
    code: 'BRIDAL1000',
    discount: 'Flat ₹1000 OFF',
    discountType: 'FLAT',
    discountValue: 1000,
    minOrderValue: 2999,
    description: 'Grand festive & pre-wedding discount on all Bridal & Pre-Bridal packages.',
    expiryDate: '31 Dec 2026',
    timesUsed: 185,
    isActive: true,
    applicableCategory: 'Bridal & Packages',
  },
  {
    id: 'cp-4',
    code: 'FESTIVE25',
    discount: '25% OFF',
    discountType: 'PERCENTAGE',
    discountValue: 25,
    minOrderValue: 999,
    maxDiscount: 400,
    description: 'Kashi festive season pamper coupon for hair spa, waxing & mani-pedi.',
    expiryDate: '31 Oct 2026',
    timesUsed: 290,
    isActive: true,
    applicableCategory: 'All Services',
  },
  {
    id: 'cp-5',
    code: 'WELCOME200',
    discount: 'Flat ₹200 OFF',
    discountType: 'FLAT',
    discountValue: 200,
    minOrderValue: 799,
    description: 'New customer first booking welcome coupon in Varanasi.',
    expiryDate: '31 Dec 2026',
    timesUsed: 512,
    isActive: true,
    applicableCategory: 'All Services',
  },
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponRecord[]>(() => {
    try {
      const saved = localStorage.getItem('beautynest_coupons');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COUPONS;
  });

  // Persist coupons to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('beautynest_coupons', JSON.stringify(coupons));
    } catch (e) {
      console.error(e);
    }
  }, [coupons]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Add Coupon Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'FLAT' | 'PERCENTAGE'>('FLAT');
  const [newDiscountValue, setNewDiscountValue] = useState('100');
  const [newMinOrder, setNewMinOrder] = useState('599');
  const [newMaxDiscount, setNewMaxDiscount] = useState('300');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('All Services');
  const [newExpiryDate, setNewExpiryDate] = useState('31 Dec 2026');

  // Edit Coupon Modal State
  const [editingCoupon, setEditingCoupon] = useState<CouponRecord | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editDiscountType, setEditDiscountType] = useState<'FLAT' | 'PERCENTAGE'>('FLAT');
  const [editDiscountValue, setEditDiscountValue] = useState('');
  const [editMinOrder, setEditMinOrder] = useState('');
  const [editMaxDiscount, setEditMaxDiscount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');

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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon code?')) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(newDiscountValue) || 50;
    const item: CouponRecord = {
      id: `cp-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      discountType: newDiscountType,
      discountValue: val,
      discount: newDiscountType === 'FLAT' ? `Flat ₹${val} OFF` : `${val}% OFF`,
      minOrderValue: Number(newMinOrder) || 0,
      maxDiscount: newDiscountType === 'PERCENTAGE' ? Number(newMaxDiscount) || undefined : undefined,
      description: newDescription || `${newDiscountType === 'FLAT' ? `₹${val}` : `${val}%`} discount on doorstep salon services.`,
      expiryDate: newExpiryDate || '31 Dec 2026',
      timesUsed: 0,
      isActive: true,
      applicableCategory: newCategory,
    };
    setCoupons([item, ...coupons]);
    setShowAddModal(false);
    setNewCode('');
    setNewDescription('');
  };

  const handleStartEdit = (c: CouponRecord) => {
    setEditingCoupon(c);
    setEditCode(c.code);
    setEditDiscountType(c.discountType);
    setEditDiscountValue(String(c.discountValue));
    setEditMinOrder(String(c.minOrderValue));
    setEditMaxDiscount(c.maxDiscount ? String(c.maxDiscount) : '');
    setEditDescription(c.description);
    setEditCategory(c.applicableCategory);
    setEditExpiryDate(c.expiryDate);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    const val = Number(editDiscountValue) || 50;
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === editingCoupon.id
          ? {
              ...c,
              code: editCode.trim().toUpperCase(),
              discountType: editDiscountType,
              discountValue: val,
              discount: editDiscountType === 'FLAT' ? `Flat ₹${val} OFF` : `${val}% OFF`,
              minOrderValue: Number(editMinOrder) || 0,
              maxDiscount: editDiscountType === 'PERCENTAGE' ? Number(editMaxDiscount) || undefined : undefined,
              description: editDescription,
              applicableCategory: editCategory,
              expiryDate: editExpiryDate,
            }
          : c
      )
    );
    setEditingCoupon(null);
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.applicableCategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
        ? c.isActive
        : !c.isActive;
    return matchesSearch && matchesStatus;
  });

  const totalRedemptions = coupons.reduce((sum, c) => sum + c.timesUsed, 0);
  const activeCount = coupons.filter((c) => c.isActive).length;

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)] bg-[#F8F9FA]">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            MARKETING &amp; PROMOTIONS
          </span>
          <h2 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
            Coupons &amp; Promo Code Management
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Create, monitor and customize instant promo codes, flat discounts and percentage offers for Varanasi clients
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-primary to-pink-600 hover:from-brand-primaryDark hover:to-brand-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-pink-soft hover:shadow-pink-hover transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon Code</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block">Active Coupons</span>
            <span className="text-2xl font-bold text-gray-900">{activeCount}</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Live in Varanasi App</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-brand-primary flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block">Total Redemptions</span>
            <span className="text-2xl font-bold text-gray-900">{totalRedemptions}</span>
            <span className="text-[10px] text-blue-600 font-semibold block mt-1">+128 this week</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block">Client Savings Given</span>
            <span className="text-2xl font-bold text-gray-900">₹71,450</span>
            <span className="text-[10px] text-purple-600 font-semibold block mt-1">Direct booking incentive</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block">Top Performer</span>
            <span className="text-lg font-mono font-bold text-brand-primary">VARANASI50</span>
            <span className="text-[10px] text-gray-400 block mt-1">642 redemptions</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, category or offer description..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-bold text-gray-600">Status:</span>
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                statusFilter === st
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-6 font-bold">Coupon Code</th>
                <th className="py-3.5 px-6 font-bold">Discount Value</th>
                <th className="py-3.5 px-6 font-bold">Min Order Value</th>
                <th className="py-3.5 px-6 font-bold">Category</th>
                <th className="py-3.5 px-6 font-bold">Times Used</th>
                <th className="py-3.5 px-6 font-bold">Expiry Date</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCoupons.map((c) => (
                <tr key={c.id} className="hover:bg-pink-50/20 transition-colors">
                  {/* Code Badge */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm bg-pink-50 text-brand-primary px-2.5 py-1 rounded-lg border border-pink-200">
                        {c.code}
                      </span>
                      <button
                        onClick={() => handleCopy(c.code)}
                        className="text-gray-400 hover:text-brand-primary p-1 rounded-md hover:bg-pink-50"
                        title="Copy Code"
                      >
                        {copiedCode === c.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 max-w-xs truncate">
                      {c.description}
                    </p>
                  </td>

                  {/* Discount Value */}
                  <td className="py-4 px-6 font-bold text-gray-900">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold text-xs">
                        {c.discount}
                      </span>
                      {c.maxDiscount && (
                        <span className="text-[10px] text-gray-400">
                          (Max ₹{c.maxDiscount})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Min Order Value */}
                  <td className="py-4 px-6 font-medium text-gray-700">
                    ₹{c.minOrderValue}
                  </td>

                  {/* Applicable Category */}
                  <td className="py-4 px-6">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      {c.applicableCategory}
                    </span>
                  </td>

                  {/* Times Used */}
                  <td className="py-4 px-6 font-mono font-semibold text-gray-800">
                    {c.timesUsed} uses
                  </td>

                  {/* Expiry Date */}
                  <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{c.expiryDate}</span>
                    </div>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleActive(c.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                        c.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {c.isActive ? '● Active' : '○ Paused'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right whitespace-nowrap space-x-1.5">
                    <button
                      onClick={() => handleStartEdit(c)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-lg border border-pink-200 transition-colors"
                      title="Edit Coupon"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Coupon"
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

      {/* CREATE NEW COUPON MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-pink-100 max-h-[90vh]">
            <div className="p-5 border-b border-pink-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2 text-brand-primary">
                <Tag className="w-4 h-4" />
                <h3 className="text-lg font-bold font-serif text-gray-900">
                  Create New Coupon / Promo Code
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Promo Code (Auto-Uppercase) *
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. KASHI20, GLOW50"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-brand-primary outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={newDiscountType}
                    onChange={(e) => setNewDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none focus:border-brand-primary focus:bg-white"
                  >
                    <option value="FLAT">Flat Amount (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {newDiscountType === 'FLAT' ? 'Discount Amount (₹) *' : 'Discount Percentage (%) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newDiscountValue}
                    onChange={(e) => setNewDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Min Order Value (MOV ₹)
                  </label>
                  <input
                    type="number"
                    value={newMinOrder}
                    onChange={(e) => setNewMinOrder(e.target.value)}
                    placeholder="e.g. 499"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>

                {newDiscountType === 'PERCENTAGE' && (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      value={newMaxDiscount}
                      onChange={(e) => setNewMaxDiscount(e.target.value)}
                      placeholder="e.g. 400"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Applicable Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none focus:border-brand-primary focus:bg-white"
                  >
                    <option value="All Services">All Services</option>
                    <option value="Facial & Cleanup">Facial &amp; Cleanup</option>
                    <option value="Waxing">Waxing</option>
                    <option value="Hair Spa & Care">Hair Spa &amp; Care</option>
                    <option value="Bridal & Packages">Bridal &amp; Packages</option>
                    <option value="Bleach & D-Tan">Bleach &amp; D-Tan</option>
                    <option value="Manicure & Pedicure">Manicure &amp; Pedicure</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    placeholder="e.g. 31 Dec 2026"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Offer Description / Tag
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. Special 30% discount on all doorstep facials in Varanasi"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-primaryDark text-white font-bold px-5 py-2.5 rounded-xl shadow-pink-soft"
                >
                  Publish Coupon Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COUPON MODAL */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-pink-100 max-h-[90vh]">
            <div className="p-5 border-b border-pink-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2 text-brand-primary">
                <Edit className="w-4 h-4" />
                <h3 className="text-lg font-bold font-serif text-gray-900">
                  Edit Coupon • {editingCoupon.code}
                </h3>
              </div>
              <button
                onClick={() => setEditingCoupon(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-brand-primary outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={editDiscountType}
                    onChange={(e) => setEditDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none focus:border-brand-primary focus:bg-white"
                  >
                    <option value="FLAT">Flat Amount (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {editDiscountType === 'FLAT' ? 'Discount Amount (₹)' : 'Discount Percentage (%)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={editDiscountValue}
                    onChange={(e) => setEditDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Min Order Value (MOV ₹)
                  </label>
                  <input
                    type="number"
                    value={editMinOrder}
                    onChange={(e) => setEditMinOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={editExpiryDate}
                    onChange={(e) => setEditExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Offer Description / Tag
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-primaryDark text-white font-bold px-5 py-2.5 rounded-xl shadow-pink-soft"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
