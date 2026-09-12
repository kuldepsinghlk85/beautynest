import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Percent,
  Coins,
  CheckCircle2,
  X,
  Filter,
  Layers,
  Gift,
  Tag,
  Clock,
  Check,
} from 'lucide-react';
import { BEAUTYNEST_SERVICES } from '../lib/allServices';

export interface OfferRecord {
  id: string;
  offerName: string;
  offerType: 'SERVICE' | 'PACKAGE' | 'FESTIVAL' | 'SEASONAL';
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  applicableServices: string[];
  applicablePackages: string[];
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  description?: string;
  totalRedemptions?: number;
}

const DEFAULT_OFFERS: OfferRecord[] = [
  {
    id: 'off-1',
    offerName: 'Varanasi Dev Deepawali Festival Glow Offer',
    offerType: 'FESTIVAL',
    discountType: 'PERCENTAGE',
    discountValue: 25,
    applicableServices: ['O3+ Bridal Glow & Radiance Oxygenating Facial', 'Sara Herbal Instaglow De-Tan Clean Up'],
    applicablePackages: ['Bridal Royal Glow Makeover Ritual'],
    startDate: '2026-10-01',
    endDate: '2026-11-15',
    status: 'ACTIVE',
    description: 'Festive season pamper ritual discount for Kashi residents.',
    totalRedemptions: 142,
  },
  {
    id: 'off-2',
    offerName: 'Winter Hydra Skin Shield Ritual Offer',
    offerType: 'SEASONAL',
    discountType: 'FIXED',
    discountValue: 300,
    applicableServices: ['Korean Hyaluronic Acid Glass Skin Facial'],
    applicablePackages: ['Hydra Glass Skin & Hair Rejuvenation Ritual'],
    startDate: '2026-11-01',
    endDate: '2027-02-28',
    status: 'ACTIVE',
    description: 'Seasonal winter moisture and anti-dryness therapy treat.',
    totalRedemptions: 89,
  },
  {
    id: 'off-3',
    offerName: 'Royal Pre-Bridal Makeover Privilege',
    offerType: 'PACKAGE',
    discountType: 'FIXED',
    discountValue: 1000,
    applicableServices: ['Full Body Waxing with Italian Rica Cartridge', 'Hydra Collagen Crystal Manicure & Pedicure Spa'],
    applicablePackages: ['Bridal Royal Glow Makeover Ritual', 'Varanasi Festive Glow & De-Tan Combo'],
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    description: 'Exclusive bundle savings on complete bridal transformations.',
    totalRedemptions: 215,
  },
  {
    id: 'off-4',
    offerName: 'Flash Wednesday Express Cleanup Service Offer',
    offerType: 'SERVICE',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    applicableServices: ['Sara Herbal Instaglow De-Tan Clean Up', 'Express Rose Foot Reflexology & Pedicure'],
    applicablePackages: [],
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    status: 'ACTIVE',
    description: 'Mid-week door-to-door express rejuvenation discount.',
    totalRedemptions: 178,
  },
];

export default function OffersPage() {
  const [offers, setOffers] = useState<OfferRecord[]>(() => {
    try {
      const saved = localStorage.getItem('beautynest_offers');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_OFFERS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<OfferRecord, 'id' | 'totalRedemptions'>>({
    offerName: '',
    offerType: 'FESTIVAL',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    applicableServices: [],
    applicablePackages: [],
    startDate: '2026-09-15',
    endDate: '2026-12-31',
    status: 'ACTIVE',
    description: '',
  });

  const [serviceSearch, setServiceSearch] = useState('');

  // Persist offers to localStorage and sync with backend
  useEffect(() => {
    try {
      localStorage.setItem('beautynest_offers', JSON.stringify(offers));
    } catch (e) {
      console.error(e);
    }
  }, [offers]);

  const filteredOffers = offers.filter((off) => {
    const matchesSearch =
      off.offerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (off.description && off.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || off.offerType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenAddModal = () => {
    setEditingOfferId(null);
    setFormData({
      offerName: '',
      offerType: 'FESTIVAL',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      applicableServices: [],
      applicablePackages: ['Bridal Royal Glow Makeover Ritual'],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      status: 'ACTIVE',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (offer: OfferRecord) => {
    setEditingOfferId(offer.id);
    setFormData({
      offerName: offer.offerName,
      offerType: offer.offerType,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      applicableServices: [...offer.applicableServices],
      applicablePackages: [...offer.applicablePackages],
      startDate: offer.startDate,
      endDate: offer.endDate,
      status: offer.status,
      description: offer.description || '',
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: o.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : o
      )
    );
  };

  const handleDeleteOffer = (id: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      setOffers((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const handleToggleService = (serviceName: string) => {
    const exists = formData.applicableServices.includes(serviceName);
    if (exists) {
      setFormData({
        ...formData,
        applicableServices: formData.applicableServices.filter((s) => s !== serviceName),
      });
    } else {
      setFormData({
        ...formData,
        applicableServices: [...formData.applicableServices, serviceName],
      });
    }
  };

  const handleTogglePackage = (pkgName: string) => {
    const exists = formData.applicablePackages.includes(pkgName);
    if (exists) {
      setFormData({
        ...formData,
        applicablePackages: formData.applicablePackages.filter((p) => p !== pkgName),
      });
    } else {
      setFormData({
        ...formData,
        applicablePackages: [...formData.applicablePackages, pkgName],
      });
    }
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.offerName.trim()) return;

    if (editingOfferId) {
      setOffers((prev) =>
        prev.map((o) => (o.id === editingOfferId ? { ...o, ...formData } : o))
      );
    } else {
      const newOffer: OfferRecord = {
        id: `off-${Date.now()}`,
        ...formData,
        totalRedemptions: 0,
      };
      setOffers((prev) => [newOffer, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-100 text-[#D84374]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900">
              Offer Management Module (ऑफ़र प्रबंधन)
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Create and manage Service Offers, Package Offers, Festival Offers, and Seasonal Offers.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-gradient-to-r from-[#D84374] to-pink-600 hover:from-[#c23664] hover:to-pink-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Offer</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Active Offers</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
              {offers.filter((o) => o.status === 'ACTIVE').length}
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium">Live on Website</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#D84374] flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Festival &amp; Seasonal</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
              {offers.filter((o) => o.offerType === 'FESTIVAL' || o.offerType === 'SEASONAL').length}
            </h3>
            <span className="text-[11px] text-purple-600 font-medium">Special Occasions</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Total Redemptions</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
              {offers.reduce((acc, o) => acc + (o.totalRedemptions || 0), 0)}
            </h3>
            <span className="text-[11px] text-blue-600 font-medium">Customer Bookings</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Avg Offer Value</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">25% OFF</h3>
            <span className="text-[11px] text-amber-600 font-medium">Customer Savings</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search offers by name or description..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#D84374]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400 mr-1 shrink-0" />
          {['ALL', 'FESTIVAL', 'SEASONAL', 'PACKAGE', 'SERVICE'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-xs ${
                typeFilter === t
                  ? 'bg-[#D84374] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'ALL' ? 'All Offers' : `${t} Offers`}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-4">Offer Name &amp; Description</th>
                <th className="p-4">Offer Type</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Applicable Items</th>
                <th className="p-4">Validity Range</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOffers.map((off) => (
                <tr key={off.id} className="hover:bg-pink-50/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900 text-xs">{off.offerName}</div>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{off.description}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        off.offerType === 'FESTIVAL'
                          ? 'bg-amber-100 text-amber-800'
                          : off.offerType === 'SEASONAL'
                          ? 'bg-blue-100 text-blue-800'
                          : off.offerType === 'PACKAGE'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {off.offerType} OFFER
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-extrabold text-[#D84374] text-xs">
                      {off.discountType === 'PERCENTAGE'
                        ? `${off.discountValue}% OFF`
                        : `Flat ₹${off.discountValue} OFF`}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-0.5">
                      {off.applicableServices.length > 0 && (
                        <span className="text-[10px] text-gray-600 block">
                          💇 {off.applicableServices.length} Services
                        </span>
                      )}
                      {off.applicablePackages.length > 0 && (
                        <span className="text-[10px] text-purple-600 font-semibold block">
                          🎁 {off.applicablePackages.length} Packages
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-[11px] text-gray-600">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {off.startDate} to {off.endDate}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(off.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                        off.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {off.status === 'ACTIVE' ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditModal(off)}
                        className="p-1.5 text-gray-500 hover:text-[#D84374] hover:bg-pink-50 rounded-lg"
                        title="Edit Offer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(off.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Offer"
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

      {/* CREATE / EDIT OFFER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-6 pb-12">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-pink-100 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#D84374] to-pink-600 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-pink-200" />
                <div>
                  <h3 className="text-lg font-bold">
                    {editingOfferId ? 'Edit Offer (ऑफ़र संपादित करें)' : 'Create New Offer (नया ऑफ़र बनाएं)'}
                  </h3>
                  <p className="text-xs text-pink-100">
                    Set up Service, Package, Festival, or Seasonal promotional discounts.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveOffer} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Offer Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Offer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.offerName}
                    onChange={(e) => setFormData({ ...formData, offerName: e.target.value })}
                    placeholder="e.g. Diwali Grand Festival Glow Offer"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Offer Type *</label>
                  <select
                    value={formData.offerType}
                    onChange={(e) =>
                      setFormData({ ...formData, offerType: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374] focus:bg-white font-medium"
                  >
                    <option value="FESTIVAL">Festival Offer (त्योहार ऑफ़र)</option>
                    <option value="SEASONAL">Seasonal Offer (मौसमी ऑफ़र)</option>
                    <option value="PACKAGE">Package Offer (पैकेज ऑफ़र)</option>
                    <option value="SERVICE">Service Offer (सर्विस ऑफ़र)</option>
                  </select>
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-pink-50/50 p-3.5 rounded-2xl border border-pink-100">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#D84374]"
                  >
                    <option value="PERCENTAGE">Percentage Discount (%)</option>
                    <option value="FIXED">Fixed Amount Discount (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                    placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 25' : 'e.g. 500'}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#D84374] font-bold"
                  />
                </div>
              </div>

              {/* Applicable Services Multi-Select */}
              <div className="space-y-2">
                <label className="font-bold text-gray-700 block">
                  Applicable Services ({formData.applicableServices.length} Selected)
                </label>
                <div className="max-h-36 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50/60 space-y-1">
                  {BEAUTYNEST_SERVICES.slice(0, 10).map((srv) => {
                    const isSelected = formData.applicableServices.includes(srv.name);
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => handleToggleService(srv.name)}
                        className={`w-full p-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-pink-100 text-[#D84374] font-bold' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="truncate">{srv.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#D84374] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Applicable Packages */}
              <div className="space-y-2">
                <label className="font-bold text-gray-700 block">
                  Applicable Packages ({formData.applicablePackages.length} Selected)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Bridal Royal Glow Makeover Ritual',
                    'Varanasi Festive Glow & De-Tan Combo',
                    'Hydra Glass Skin & Hair Rejuvenation Ritual',
                  ].map((pkgName) => {
                    const isSelected = formData.applicablePackages.includes(pkgName);
                    return (
                      <button
                        key={pkgName}
                        type="button"
                        onClick={() => handleTogglePackage(pkgName)}
                        className={`p-2 rounded-xl text-left border text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'border-[#D84374] bg-pink-50 text-[#D84374] font-bold'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="truncate">{pkgName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#D84374]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Description / Terms</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details of offer eligibility and inclusions..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374] resize-none"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status === 'ACTIVE'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.checked ? 'ACTIVE' : 'INACTIVE',
                      })
                    }
                    className="w-4 h-4 text-[#D84374] rounded accent-[#D84374]"
                  />
                  <span className="font-semibold text-gray-800">
                    Publish and Activate Offer Immediately
                  </span>
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#D84374] to-pink-600 hover:from-[#c23664] text-white font-bold rounded-xl shadow-md"
                >
                  {editingOfferId ? 'Save Changes' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
