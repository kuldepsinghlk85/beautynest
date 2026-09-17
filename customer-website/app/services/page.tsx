'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Sparkles, Flower2, Crown, Check } from 'lucide-react';
import { SERVICES, CATEGORIES, Service } from '@/lib/data';
import { MasterCategoryType, MASTER_CATEGORIES, getMasterCategoryForCategory } from '@/lib/masterCategories';
import ServiceCard from '@/components/ServiceCard';
import BookingModal from '@/components/BookingModal';
import FloatingCartBar from '@/components/FloatingCartBar';

export default function ServicesPage() {
  const [masterCategory, setMasterCategory] = useState<'all' | MasterCategoryType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servicesList, setServicesList] = useState<Service[]>(SERVICES);
  const [checkoutMode, setCheckoutMode] = useState<'single' | 'dual' | 'split'>('single');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('http://localhost:4200/api/services');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setServicesList((prev) =>
              prev.map((s) => {
                const remote = data.find((d: any) => d.serviceId === s.serviceId || d.id === s.id);
                if (remote) {
                  return {
                    ...s,
                    name: remote.name || s.name,
                    price: remote.price || s.price,
                    originalPrice: remote.originalPrice || s.originalPrice,
                    imageUrl: remote.imageUrl || s.imageUrl,
                    durationMinutes: remote.durationMinutes || s.durationMinutes,
                    isBestseller: remote.isBestseller !== undefined ? remote.isBestseller : s.isBestseller,
                  };
                }
                return s;
              })
            );
          }
        }
      } catch {
        // default fallback to static
      }
    };

    fetchServices();
    window.addEventListener('focus', fetchServices);
    return () => window.removeEventListener('focus', fetchServices);
  }, []);

  const filteredCategories = useMemo(() => {
    if (masterCategory === 'all') return CATEGORIES;
    return CATEGORIES.filter((cat) => getMasterCategoryForCategory(cat.id) === masterCategory);
  }, [masterCategory]);

  const filteredServices = useMemo(() => {
    return servicesList.filter((s) => {
      const sMaster = s.masterCategory || getMasterCategoryForCategory(s.category);
      const matchesMaster = masterCategory === 'all' || sMaster === masterCategory;
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMaster && matchesCategory && matchesSearch;
    });
  }, [servicesList, masterCategory, selectedCategory, searchQuery]);

  const handleBook = (srv: Service) => {
    setActiveService(srv);
    setCheckoutMode('single');
    setIsModalOpen(true);
  };

  const handleOpenCartCheckout = (mode: 'single' | 'dual' | 'split' = 'single') => {
    setCheckoutMode(mode);
    setActiveService(filteredServices[0] || servicesList[0]);
    setIsModalOpen(true);
  };

  return (
    <div className="py-10 bg-brand-bg min-h-screen pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-pink-100 px-3 py-1 rounded-full text-xs font-bold text-brand-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>3 मास्टर कैटेगरी • 130+ DOORSTEP SERVICES</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-charcoal mt-3">
            Services &amp; Packages
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            स्पा, ब्यूटी और मेकअप की सम्पूर्ण होम सैलून सेवाएं प्रमाणित ब्यूटीशियन द्वारा
          </p>
        </div>

        {/* 3 Master Categories Pill Navigation Bar */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-white rounded-3xl p-1.5 shadow-sm border border-pink-100 flex items-center justify-between gap-1">
            
            <button
              onClick={() => {
                setMasterCategory('all');
                setSelectedCategory('all');
              }}
              className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                masterCategory === 'all'
                  ? 'bg-brand-charcoal text-white shadow-md'
                  : 'text-gray-600 hover:bg-pink-50'
              }`}
            >
              <span>सभी सेवाएं (All)</span>
            </button>

            <button
              onClick={() => {
                setMasterCategory('spa');
                setSelectedCategory('all');
              }}
              className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                masterCategory === 'spa'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-teal-900 hover:bg-teal-50'
              }`}
            >
              <Flower2 className="w-4 h-4" />
              <span>🧖‍♀️ स्पा (Spa)</span>
            </button>

            <button
              onClick={() => {
                setMasterCategory('beauty');
                setSelectedCategory('all');
              }}
              className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                masterCategory === 'beauty'
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'text-brand-primary hover:bg-pink-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ ब्यूटी (Beauty)</span>
            </button>

            <button
              onClick={() => {
                setMasterCategory('makeup');
                setSelectedCategory('all');
              }}
              className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                masterCategory === 'makeup'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-900 hover:bg-amber-50'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>💄 मेकअप (Makeup)</span>
            </button>

          </div>
        </div>

        {/* Search & Subcategories Bar */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-pink-100 mb-8 max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for 'Korean Facial', 'Rica Waxing', 'Hair Spa', 'Bridal Makeup'..."
              className="w-full pl-12 pr-4 py-3 text-sm bg-brand-bg/50 border border-pink-100 rounded-2xl outline-none focus:border-brand-primary text-gray-800"
            />
          </div>

          {/* Subcategory Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-brand-primary text-white shadow-pink-soft'
                  : 'bg-brand-bg text-gray-600 hover:bg-pink-100'
              }`}
            >
              All Subcategories ({filteredServices.length})
            </button>
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-brand-primary text-white shadow-pink-soft'
                    : 'bg-brand-bg text-gray-600 hover:bg-pink-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services List */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBookNow={handleBook}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-pink-100">
            <p className="text-base font-semibold text-gray-700">
              No services found matching &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => {
                setMasterCategory('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-bold text-brand-primary hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Booking & Cart Checkout Modal */}
        <BookingModal
          service={activeService}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          checkoutMode={checkoutMode}
        />

        {/* Floating Cart Bar */}
        <FloatingCartBar onOpenCheckout={handleOpenCartCheckout} />

      </div>
    </div>
  );
}
