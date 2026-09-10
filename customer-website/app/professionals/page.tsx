'use client';

import React, { useState } from 'react';
import { BEAUTICIANS, SERVICES, Beautician, VARANASI_AREAS } from '@/lib/data';
import BeauticianCard from '@/components/BeauticianCard';
import BookingModal from '@/components/BookingModal';
import { Sparkles, Award, ShieldCheck, Heart, MapPin, Search } from 'lucide-react';

export default function ProfessionalsPage() {
  const [selectedBeautician, setSelectedBeautician] = useState<Beautician | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (b: Beautician) => {
    setSelectedBeautician(b);
    setIsModalOpen(true);
  };

  const filteredBeauticians = BEAUTICIANS.filter((b) => {
    const matchesArea = selectedArea === 'ALL' || b.area.toLowerCase() === selectedArea.toLowerCase();
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.area.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesArea && matchesSearch;
  });

  return (
    <div className="py-12 bg-brand-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-100 px-3 py-1 rounded-full text-xs font-bold text-brand-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>20 VERIFIED FEMALE BEAUTICIANS IN VARANASI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-charcoal mt-3">
            Meet Our Top Beauticians in Varanasi (Kashi)
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Serving all major Varanasi areas including Sigra, Lanka (BHU), Assi Ghat, Godowlia, Bhelupur, Cantt, Mahmoorganj, and Sarnath with 100% disposable hygienic kits.
          </p>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
          <div className="bg-white p-4 rounded-2xl border border-pink-100 text-center shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <span className="text-xs font-bold text-gray-900 block">Aadhaar &amp; Background Verified</span>
            <span className="text-[11px] text-gray-500">Rigorous safety clearance for your peace of mind</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-pink-100 text-center shadow-sm">
            <Award className="w-6 h-6 text-brand-primary mx-auto mb-1" />
            <span className="text-xs font-bold text-gray-900 block">Experienced Specialists</span>
            <span className="text-[11px] text-gray-500">Trained in O3+, Rica, Korean Facials &amp; Keratin</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-pink-100 text-center shadow-sm">
            <Heart className="w-6 h-6 text-rose-500 mx-auto mb-1" />
            <span className="text-xs font-bold text-gray-900 block">4.8+ Customer Rating</span>
            <span className="text-[11px] text-gray-500">Loved by 10,000+ Varanasi women</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-pink-100 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by beautician name or skill..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>

          {/* Varanasi Area Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
            <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Filter Area:</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-brand-primary font-medium cursor-pointer"
            >
              <option value="ALL">All Varanasi Areas (20)</option>
              {VARANASI_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Beauticians Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBeauticians.map((b) => (
            <BeauticianCard
              key={b.id}
              beautician={b}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {filteredBeauticians.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-pink-100 mt-4">
            <p className="text-gray-500 text-sm">No beauticians found for this area/filter. Showing all Varanasi areas:</p>
            <button
              onClick={() => {
                setSelectedArea('ALL');
                setSearchQuery('');
              }}
              className="mt-3 text-xs bg-brand-primary text-white font-bold px-4 py-2 rounded-full"
            >
              Reset Filters
            </button>
          </div>
        )}

        <BookingModal
          service={SERVICES[0]}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
