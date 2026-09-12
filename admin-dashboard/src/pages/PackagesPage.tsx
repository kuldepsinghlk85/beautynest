import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Tag,
  Clock,
  Coins,
  Percent,
  Upload,
  Image as ImageIcon,
  Check,
  ChevronRight,
  Filter,
  Eye,
  Gift,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { BEAUTYNEST_SERVICES, type BeautyService } from '../lib/allServices';

export interface PackageItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  servicesIncluded: string[]; // service names or IDs
  originalPrice: number;
  packagePrice: number;
  durationMin: number;
  description: string;
  highlights: string[];
  isActive: boolean;
  category: string;
  totalBookings: number;
}

const DEFAULT_PACKAGES: PackageItem[] = [
  {
    id: 'pkg-1',
    title: 'Bridal Royal Glow Makeover Ritual',
    subtitle: 'Complete pre-wedding luxury pampering package for radiant bridal skin',
    badge: 'BRIDAL SPECIAL',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    servicesIncluded: [
      'O3+ Bridal Glow & Radiance Oxygenating Facial',
      'Full Body Waxing with Italian Rica Cartridge',
      'Hydra Collagen Crystal Manicure & Pedicure Spa',
      'L\'Oréal Mythic Oil Deep Hair Spa & Blow Dry',
    ],
    originalPrice: 4899,
    packagePrice: 3199,
    durationMin: 180,
    description: 'Our most comprehensive doorstep bridal ritual curated by master beauticians. Delivers deep oxygenation, flawless satin skin, and hair vitality.',
    highlights: ['Includes single-use hygienic kit', 'Free patch-test and consultation', 'Complimentary eyebrow shaping'],
    isActive: true,
    category: 'Bridal & Occasion',
    totalBookings: 348,
  },
  {
    id: 'pkg-2',
    title: 'Varanasi Festive Glow & De-Tan Combo',
    subtitle: 'Instant brightening and sun-damage reversal for festive celebrations',
    badge: 'FESTIVE COMBO',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    servicesIncluded: [
      'Sara Herbal Instaglow De-Tan Clean Up',
      'Rica Honey Full Arms & Full Legs Waxing',
      'Express Rose Foot Reflexology & Pedicure',
    ],
    originalPrice: 2249,
    packagePrice: 1499,
    durationMin: 90,
    description: 'Fast, effective brightening combo designed to remove stubborn tanning, pollution dullness, and dead skin cells in one sitting.',
    highlights: ['Painless Rica peel-off wax', 'Infused with organic rose extracts', 'Zero post-wax redness guaranteed'],
    isActive: true,
    category: 'Clean Up & Waxing',
    totalBookings: 612,
  },
  {
    id: 'pkg-3',
    title: 'Hydra Glass Skin & Hair Rejuvenation Ritual',
    subtitle: 'Deep cellular hydration combined with professional scalp revival therapy',
    badge: 'BEST VALUE',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    servicesIncluded: [
      'Korean Hyaluronic Acid Glass Skin Facial',
      'Moroccan Argan Anti-Frizz Scalp Spa & Steam',
      'Under-Eye Caffeine Gel Infusion Therapy',
    ],
    originalPrice: 3199,
    packagePrice: 2099,
    durationMin: 120,
    description: 'High-performance moisture booster that infuses hyaluronic acid and micro-current lifting for luminous glass-like skin.',
    highlights: ['Authentic imported ampoules', 'Cooling jade roller drainage massage', 'Therapeutic ozone hair steamer'],
    isActive: true,
    category: 'Facials & Hair',
    totalBookings: 460,
  },
];

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>(() => {
    try {
      const saved = localStorage.getItem('beautynest_custom_packages');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PACKAGES;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'SPECIAL OFFER',
    imageUrl: '',
    servicesIncluded: [] as string[],
    originalPrice: 2000,
    packagePrice: 1399,
    durationMin: 90,
    description: '',
    highlights: ['Hygienic single-use kit included', 'Certified senior beautician'],
    newHighlight: '',
    category: 'Facial & Skin',
    isActive: true,
  });

  const [serviceSearch, setServiceSearch] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('beautynest_custom_packages', JSON.stringify(packages));
    } catch (e) {
      console.error(e);
    }
  }, [packages]);

  // Filtered packages
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.servicesIncluded.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBadge =
      selectedBadgeFilter === 'ALL' || pkg.badge === selectedBadgeFilter;

    return matchesSearch && matchesBadge;
  });

  // Calculate dynamic savings percentage
  const savingsAmount = Math.max(0, formData.originalPrice - formData.packagePrice);
  const savingsPct =
    formData.originalPrice > 0
      ? Math.round((savingsAmount / formData.originalPrice) * 100)
      : 0;

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingPackageId(null);
    setFormData({
      title: '',
      subtitle: '',
      badge: 'FESTIVE COMBO',
      imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      servicesIncluded: [],
      originalPrice: 1999,
      packagePrice: 1399,
      durationMin: 90,
      description: '',
      highlights: ['Hygienic single-use kit included', 'Certified senior beautician'],
      newHighlight: '',
      category: 'Combos & Packages',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (pkg: PackageItem) => {
    setEditingPackageId(pkg.id);
    setFormData({
      title: pkg.title,
      subtitle: pkg.subtitle,
      badge: pkg.badge,
      imageUrl: pkg.imageUrl,
      servicesIncluded: [...pkg.servicesIncluded],
      originalPrice: pkg.originalPrice,
      packagePrice: pkg.packagePrice,
      durationMin: pkg.durationMin,
      description: pkg.description,
      highlights: [...pkg.highlights],
      newHighlight: '',
      category: pkg.category,
      isActive: pkg.isActive,
    });
    setIsModalOpen(true);
  };

  // Toggle Service inclusion in package
  const handleToggleService = (srv: BeautyService) => {
    const exists = formData.servicesIncluded.includes(srv.name);
    let updatedServices: string[];
    let newOriginalPrice = formData.originalPrice;
    let newDuration = formData.durationMin;

    if (exists) {
      updatedServices = formData.servicesIncluded.filter((s) => s !== srv.name);
      newOriginalPrice = Math.max(0, newOriginalPrice - srv.price);
      newDuration = Math.max(30, newDuration - srv.durationMinutes);
    } else {
      updatedServices = [...formData.servicesIncluded, srv.name];
      if (formData.servicesIncluded.length === 0) {
        newOriginalPrice = srv.price;
        newDuration = srv.durationMinutes;
      } else {
        newOriginalPrice = newOriginalPrice + srv.price;
        newDuration = newDuration + srv.durationMinutes;
      }
    }

    // Default package price to 30% off combined original price if auto-adjusting
    const suggestedPackagePrice = Math.round(newOriginalPrice * 0.7);

    setFormData({
      ...formData,
      servicesIncluded: updatedServices,
      originalPrice: newOriginalPrice,
      packagePrice: suggestedPackagePrice > 0 ? suggestedPackagePrice : formData.packagePrice,
      durationMin: newDuration,
    });
  };

  // Image Upload handler (File from device -> Base64)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({
            ...prev,
            imageUrl: reader.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add highlight bullet
  const handleAddHighlight = () => {
    if (formData.newHighlight.trim()) {
      setFormData({
        ...formData,
        highlights: [...formData.highlights, formData.newHighlight.trim()],
        newHighlight: '',
      });
    }
  };

  // Remove highlight bullet
  const handleRemoveHighlight = (index: number) => {
    setFormData({
      ...formData,
      highlights: formData.highlights.filter((_, i) => i !== index),
    });
  };

  // Save / Update Package
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingPackageId) {
      // Edit existing
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === editingPackageId
            ? {
                ...pkg,
                title: formData.title,
                subtitle: formData.subtitle,
                badge: formData.badge,
                imageUrl: formData.imageUrl,
                servicesIncluded: formData.servicesIncluded,
                originalPrice: formData.originalPrice,
                packagePrice: formData.packagePrice,
                durationMin: formData.durationMin,
                description: formData.description,
                highlights: formData.highlights,
                category: formData.category,
                isActive: formData.isActive,
              }
            : pkg
        )
      );
    } else {
      // Add new
      const newPkg: PackageItem = {
        id: `pkg-${Date.now()}`,
        title: formData.title,
        subtitle: formData.subtitle,
        badge: formData.badge,
        imageUrl:
          formData.imageUrl ||
          'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        servicesIncluded: formData.servicesIncluded,
        originalPrice: formData.originalPrice,
        packagePrice: formData.packagePrice,
        durationMin: formData.durationMin,
        description: formData.description,
        highlights: formData.highlights,
        isActive: formData.isActive,
        category: formData.category,
        totalBookings: 0,
      };
      setPackages((prev) => [newPkg, ...prev]);
    }
    setIsModalOpen(false);
  };

  // Delete Package
  const handleDeletePackage = (id: string) => {
    if (confirm('Are you sure you want to delete this combo package offer?')) {
      setPackages((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Toggle Active Status
  const handleToggleActive = (id: string) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  // Filtered master services for multi-selection
  const selectableServices = BEAUTYNEST_SERVICES.filter((s) =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(serviceSearch.toLowerCase())
  ).slice(0, 15);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-100 text-[#D84374]">
              <Gift className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900">
              Offers &amp; Custom Combo Packages (ऑफ़र और पैकेज प्रबंधन)
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Create bundles of beauty services with custom discounted combo prices, hero badges, and duration.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-gradient-to-r from-[#D84374] to-pink-600 hover:from-[#c23664] hover:to-pink-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Package / Offer</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Active Packages</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
              {packages.filter((p) => p.isActive).length}
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium">Ready for Booking</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#D84374] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Avg Combo Savings</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
              {Math.round(
                packages.reduce(
                  (acc, p) => acc + ((p.originalPrice - p.packagePrice) / (p.originalPrice || 1)) * 100,
                  0
                ) / (packages.length || 1)
              )}
              %
            </h3>
            <span className="text-[11px] text-pink-600 font-medium">Customer Incentive</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Packages Booked</span>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
              {packages.reduce((acc, p) => acc + p.totalBookings, 0).toLocaleString()}
            </h3>
            <span className="text-[11px] text-blue-600 font-medium">Across Varanasi Hub</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Top Performer</span>
            <h3 className="text-base font-bold text-gray-900 mt-1 truncate max-w-[150px]">
              {packages[0]?.title || 'Bridal Royal Glow'}
            </h3>
            <span className="text-[11px] text-amber-600 font-medium">⭐ Highest Grossing</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Badges Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search packages, included services..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#D84374] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400 mr-1 shrink-0" />
          {['ALL', 'BRIDAL SPECIAL', 'FESTIVE COMBO', 'BEST VALUE', 'SPECIAL OFFER'].map((badge) => (
            <button
              key={badge}
              onClick={() => setSelectedBadgeFilter(badge)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-xs ${
                selectedBadgeFilter === badge
                  ? 'bg-[#D84374] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {badge}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => {
          const savings = pkg.originalPrice - pkg.packagePrice;
          const discountPct = Math.round((savings / pkg.originalPrice) * 100);

          return (
            <div
              key={pkg.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                pkg.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50/50'
              }`}
            >
              <div>
                {/* Image Banner & Badge */}
                <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <span className="absolute top-3 left-3 bg-[#D84374] text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider shadow-sm uppercase">
                    {pkg.badge}
                  </span>

                  <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-300" />
                    <span>{pkg.durationMin} Mins</span>
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] text-pink-200 font-semibold uppercase tracking-wider block">
                      {pkg.category}
                    </span>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {pkg.title}
                    </h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3 text-xs">
                  <p className="text-gray-500 text-[11px] line-clamp-2 leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Included Services List */}
                  <div className="space-y-1 pt-1">
                    <span className="font-semibold text-gray-700 text-[11px] block">
                      Included Services ({pkg.servicesIncluded.length}):
                    </span>
                    <div className="space-y-1">
                      {pkg.servicesIncluded.slice(0, 3).map((svc, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{svc}</span>
                        </div>
                      ))}
                      {pkg.servicesIncluded.length > 3 && (
                        <span className="text-[10px] text-pink-600 font-semibold pl-5 block">
                          +{pkg.servicesIncluded.length - 3} more service in this combo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Savings Pill */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-extrabold text-[#D84374]">
                          ₹{pkg.packagePrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{pkg.originalPrice.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Save ₹{savings.toLocaleString()} ({discountPct}% OFF)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Total Bookings</span>
                      <span className="text-xs font-bold text-gray-700 font-mono">
                        {pkg.totalBookings}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(pkg.id)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                    pkg.isActive
                      ? 'text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200'
                      : 'text-gray-500 bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {pkg.isActive ? '● Active' : '○ Paused'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(pkg)}
                    className="p-1.5 text-gray-500 hover:text-[#D84374] hover:bg-pink-50 rounded-lg transition-colors"
                    title="Edit Package"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Package"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT PACKAGE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-6 pb-12">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-pink-100 max-h-[90vh] flex flex-col my-0 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#D84374] to-pink-600 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Gift className="w-6 h-6 text-pink-200" />
                <div>
                  <h3 className="text-lg font-bold">
                    {editingPackageId ? 'Edit Combo Package & Offer' : 'Create New Offer & Package (नया पैकेज बनाएं)'}
                  </h3>
                  <p className="text-xs text-pink-100">
                    Bundle services, attach promotional tags, upload banner photos, and set discounted combo rates.
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
            <form onSubmit={handleSavePackage} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Package Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Bridal Royal Glow Makeover"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374] focus:bg-white font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Promotional Badge / Tag *</label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374] focus:bg-white font-medium"
                  >
                    <option value="BRIDAL SPECIAL">BRIDAL SPECIAL</option>
                    <option value="FESTIVE COMBO">FESTIVE COMBO</option>
                    <option value="BEST VALUE">BEST VALUE</option>
                    <option value="SPECIAL OFFER">SPECIAL OFFER</option>
                    <option value="LIMITED EDITION">LIMITED EDITION</option>
                    <option value="GLOW RITUAL">GLOW RITUAL</option>
                  </select>
                </div>
              </div>

              {/* Subtitle / Tagline */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Short Subtitle / Tagline</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Complete pre-wedding luxury pampering package for radiant bridal skin"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374] focus:bg-white"
                />
              </div>

              {/* Image Uploader & Preview */}
              <div className="space-y-2 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                <label className="font-bold text-gray-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#D84374]" />
                    <span>Package Banner Photo / Uploader (फ़ोटो अपलोड करें)</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-normal">Supports PNG, JPG, WebP</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Image Thumbnail Preview */}
                  <div className="w-28 h-20 bg-gray-200 rounded-xl overflow-hidden shrink-0 border border-gray-300 relative shadow-xs">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="w-6 h-6" />
                        <span className="text-[9px]">No Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex gap-2 items-center">
                      <label className="cursor-pointer bg-white border border-[#D84374] text-[#D84374] hover:bg-pink-50 font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 text-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-gray-400 text-xs">or paste URL:</span>
                    </div>

                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#D84374] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Service Bundle Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#D84374]" />
                    <span>Select Services to Bundle ({formData.servicesIncluded.length} Selected)</span>
                  </label>
                  <span className="text-[11px] text-gray-500">
                    Click service to add/remove
                  </span>
                </div>

                {/* Service Search in Modal */}
                <input
                  type="text"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Type service name to filter catalog (e.g. Facial, Waxing, Spa)..."
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374] text-xs"
                />

                {/* Selectable Services List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-gray-200 rounded-xl bg-gray-50/50">
                  {selectableServices.map((srv) => {
                    const isSelected = formData.servicesIncluded.includes(srv.name);
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => handleToggleService(srv)}
                        className={`p-2 rounded-xl text-left border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-pink-50 border-[#D84374] text-[#D84374] font-semibold'
                            : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs truncate">{srv.name}</p>
                          <span className="text-[10px] text-gray-400">
                            ₹{srv.price} • {srv.durationMinutes}m
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#D84374] text-white' : 'border border-gray-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pricing & Savings Box */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-2xl border border-pink-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Combined MRP Sum (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, originalPrice: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono font-bold text-gray-700 outline-none focus:border-[#D84374]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#D84374] block mb-1">
                      Package Offer Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.packagePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, packagePrice: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-white border-2 border-[#D84374] rounded-xl font-mono font-extrabold text-[#D84374] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Total Duration (Mins) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.durationMin}
                      onChange={(e) =>
                        setFormData({ ...formData, durationMin: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono font-bold text-gray-700 outline-none focus:border-[#D84374]"
                    />
                  </div>
                </div>

                {/* Savings Live Alert */}
                <div className="bg-white p-2.5 rounded-xl border border-pink-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Customer Saves: ₹{savingsAmount.toLocaleString()} ({savingsPct}% Discount)
                    </span>
                  </div>
                  <span className="text-gray-500 font-medium">
                    MRP ₹{formData.originalPrice} → Deal ₹{formData.packagePrice}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Package Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the benefits and results of this ritual..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374] focus:bg-white resize-none"
                />
              </div>

              {/* Highlights & Inclusions */}
              <div className="space-y-2">
                <label className="font-bold text-gray-700">Key Highlights &amp; Guarantees</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.newHighlight}
                    onChange={(e) => setFormData({ ...formData, newHighlight: e.target.value })}
                    placeholder="e.g. Free patch-test and consultation"
                    className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374]"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 font-bold rounded-xl"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {formData.highlights.map((h, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-pink-50 text-[#D84374] px-2 py-1 rounded-lg border border-pink-200 text-[11px]"
                    >
                      <span>✓ {h}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(index)}
                        className="hover:text-rose-600 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#D84374] rounded accent-[#D84374]"
                  />
                  <span className="font-semibold text-gray-800">
                    Publish Package on Website Immediately
                  </span>
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#D84374] to-pink-600 hover:from-[#c23664] hover:to-pink-700 text-white font-bold rounded-xl shadow-md"
                >
                  {editingPackageId ? 'Save Package Changes' : 'Create Package Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
