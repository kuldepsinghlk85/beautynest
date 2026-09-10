'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';
import { SERVICES, CATEGORIES, Service } from '@/lib/data';
import ServiceCard from '@/components/ServiceCard';
import BookingModal from '@/components/BookingModal';

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredServices = useMemo(() => {
    return SERVICES.filter((s) => {
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleBook = (srv: Service) => {
    setActiveService(srv);
    setIsModalOpen(true);
  };

  return (
    <div className="py-10 bg-brand-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-pink-100 px-3 py-1 rounded-full text-xs font-bold text-brand-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DISCOVER 30+ DOORSTEP SALON SERVICES</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-charcoal mt-3">
            Services &amp; Packages
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Hygienic salon treatments delivered at home by verified beauticians across Varanasi
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-pink-100 mb-8 max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for 'Korean Facial', 'Rica Waxing', 'Hair Spa'..."
              className="w-full pl-12 pr-4 py-3 text-sm bg-brand-bg/50 border border-pink-100 rounded-2xl outline-none focus:border-brand-primary text-gray-800"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-brand-primary text-white shadow-pink-soft'
                  : 'bg-brand-bg text-gray-600 hover:bg-pink-100'
              }`}
            >
              All Services
            </button>
            {CATEGORIES.map((cat) => (
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
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-bold text-brand-primary hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        <BookingModal
          service={activeService}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
