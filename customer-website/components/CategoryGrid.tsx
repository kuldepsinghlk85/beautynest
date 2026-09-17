'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/data';
import { MASTER_CATEGORIES, MasterCategoryType, getMasterCategoryForCategory } from '@/lib/masterCategories';
import { ArrowRight, Sparkles, Flower2, Crown, Check } from 'lucide-react';

export default function CategoryGrid() {
  const [categoryList, setCategoryList] = useState(CATEGORIES);
  const [selectedMaster, setSelectedMaster] = useState<'all' | MasterCategoryType>('all');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:4200/api/services/categories');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategoryList((prev) =>
              prev.map((local) => {
                const remote = data.find(
                  (r: any) =>
                    r.id === local.id ||
                    r.slug === local.id ||
                    r.name?.toLowerCase() === local.name?.toLowerCase() ||
                    (local.id === 'facial' && (r.slug === 'facial-cleanup' || r.id === 'cat-facial-cleanup')) ||
                    (local.id === 'bleach-dtan' && (r.slug === 'bleach-detan' || r.id === 'cat-bleach-detan')) ||
                    (local.id === 'threading' && (r.slug === 'threading' || r.id === 'cat-threading')) ||
                    (local.id === 'waxing' && (r.slug === 'waxing' || r.id === 'cat-waxing')) ||
                    (local.id === 'manicure' && (r.slug === 'manicure' || r.id === 'cat-manicure')) ||
                    (local.id === 'pedicure' && (r.slug === 'pedicure' || r.id === 'cat-pedicure')) ||
                    (local.id === 'body-care' && (r.slug === 'body-care' || r.id === 'cat-body-care')) ||
                    (local.id === 'hair-care' && (r.slug === 'hair' || r.id === 'cat-hair')) ||
                    (local.id === 'massage-spa' && (r.slug === 'massage-spa' || r.id === 'cat-massage-spa')) ||
                    (local.id === 'bridal-makeup' && (r.slug === 'makeup' || r.id === 'cat-makeup')) ||
                    (local.id === 'mehendi' && (r.slug === 'mehendi' || r.id === 'cat-mehendi')) ||
                    (local.id === 'male-grooming' && (r.slug === 'male-grooming' || r.id === 'cat-male-grooming')) ||
                    (local.id === 'kids' && (r.slug === 'kids' || r.id === 'cat-kids')) ||
                    (local.id === 'bridal-pre-bridal' && (r.slug === 'bridal-pre-bridal' || r.id === 'cat-bridal-pre-bridal'))
                );
                if (remote && remote.image) {
                  return {
                    ...local,
                    name: remote.name || local.name,
                    image: remote.image,
                  };
                }
                return local;
              })
            );
          }
        }
      } catch {
        // use static categories fallback
      }
    };

    fetchCategories();
    window.addEventListener('focus', fetchCategories);
    return () => window.removeEventListener('focus', fetchCategories);
  }, []);

  const filteredCategories = categoryList.filter((cat) => {
    if (selectedMaster === 'all') return true;
    const catMaster = getMasterCategoryForCategory(cat.id);
    return catMaster === selectedMaster;
  });

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full text-xs font-bold text-brand-primary mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3 मास्टर कैटेगरी • 3 Master Domains</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-charcoal">
              स्पा, ब्यूटी एवं मेकअप सेवाएं
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              अपनी पसंद के अनुसार मुख्य कैटेगरी चुनें और होम सैलून सेवाओं का आनंद लें
            </p>
          </div>
          <Link
            href="/services"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primaryDark"
          >
            <span>सभी सेवाएं देखें (View All)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3 Master Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
          
          {/* 1. स्पा (Spa) */}
          <button
            onClick={() => setSelectedMaster(selectedMaster === 'spa' ? 'all' : 'spa')}
            className={`relative text-left rounded-3xl p-5 sm:p-6 transition-all duration-300 overflow-hidden border-2 flex items-start justify-between ${
              selectedMaster === 'spa'
                ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white border-teal-600 shadow-xl scale-[1.02]'
                : 'bg-gradient-to-br from-teal-50 to-emerald-50/50 hover:bg-teal-50 border-teal-100 text-teal-950 hover:shadow-md'
            }`}
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${selectedMaster === 'spa' ? 'bg-white/20' : 'bg-teal-600 text-white'}`}>
                  <Flower2 className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${selectedMaster === 'spa' ? 'text-teal-100' : 'text-teal-700'}`}>
                  मास्टर कैटेगरी 1
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold">
                स्पा (Spa &amp; Wellness)
              </h3>
              <p className={`text-xs mt-1.5 max-w-xs leading-relaxed ${selectedMaster === 'spa' ? 'text-teal-100' : 'text-gray-600'}`}>
                फुल बॉडी मसाज, अरोमाथेरेपी, बॉडी पॉलिशिंग व तनावमुक्ति
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${selectedMaster === 'spa' ? 'bg-white text-teal-700' : 'bg-teal-200/60 text-teal-900'}`}>
                  15+ स्पा सेवाएं
                </span>
                {selectedMaster === 'spa' && (
                  <span className="text-xs font-bold text-teal-100 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> एक्टिव
                  </span>
                )}
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80"
              alt="Spa"
              className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full object-cover opacity-30 pointer-events-none"
            />
          </button>

          {/* 2. ब्यूटी (Beauty) */}
          <button
            onClick={() => setSelectedMaster(selectedMaster === 'beauty' ? 'all' : 'beauty')}
            className={`relative text-left rounded-3xl p-5 sm:p-6 transition-all duration-300 overflow-hidden border-2 flex items-start justify-between ${
              selectedMaster === 'beauty'
                ? 'bg-gradient-to-br from-brand-primary to-pink-600 text-white border-pink-600 shadow-xl scale-[1.02]'
                : 'bg-gradient-to-br from-pink-50 to-rose-50/50 hover:bg-pink-50 border-pink-100 text-brand-charcoal hover:shadow-md'
            }`}
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${selectedMaster === 'beauty' ? 'bg-white/20' : 'bg-brand-primary text-white'}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${selectedMaster === 'beauty' ? 'text-pink-100' : 'text-brand-primary'}`}>
                  मास्टर कैटेगरी 2
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold">
                ब्यूटी (Beauty &amp; Salon)
              </h3>
              <p className={`text-xs mt-1.5 max-w-xs leading-relaxed ${selectedMaster === 'beauty' ? 'text-pink-100' : 'text-gray-600'}`}>
                फेशियल, क्लीनअप, रिका वैक्सिंग, हेयर स्पा, मैनीक्योर व पेडीक्योर
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${selectedMaster === 'beauty' ? 'bg-white text-brand-primary' : 'bg-pink-200/60 text-brand-primaryDark'}`}>
                  80+ ब्यूटी सेवाएं
                </span>
                {selectedMaster === 'beauty' && (
                  <span className="text-xs font-bold text-pink-100 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> एक्टिव
                  </span>
                )}
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80"
              alt="Beauty"
              className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full object-cover opacity-30 pointer-events-none"
            />
          </button>

          {/* 3. मेकअप (Makeup) */}
          <button
            onClick={() => setSelectedMaster(selectedMaster === 'makeup' ? 'all' : 'makeup')}
            className={`relative text-left rounded-3xl p-5 sm:p-6 transition-all duration-300 overflow-hidden border-2 flex items-start justify-between ${
              selectedMaster === 'makeup'
                ? 'bg-gradient-to-br from-amber-500 to-rose-600 text-white border-amber-600 shadow-xl scale-[1.02]'
                : 'bg-gradient-to-br from-amber-50 to-orange-50/50 hover:bg-amber-50 border-amber-100 text-amber-950 hover:shadow-md'
            }`}
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${selectedMaster === 'makeup' ? 'bg-white/20' : 'bg-amber-600 text-white'}`}>
                  <Crown className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${selectedMaster === 'makeup' ? 'text-amber-100' : 'text-amber-800'}`}>
                  मास्टर कैटेगरी 3
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold">
                मेकअप (Makeup &amp; Bridal)
              </h3>
              <p className={`text-xs mt-1.5 max-w-xs leading-relaxed ${selectedMaster === 'makeup' ? 'text-amber-100' : 'text-gray-600'}`}>
                ब्राइडल एचडी मेकअप, पार्टी लुक, साड़ी ड्रेपिंग व मेहंदी आर्ट
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${selectedMaster === 'makeup' ? 'bg-white text-amber-700' : 'bg-amber-200/60 text-amber-900'}`}>
                  25+ मेकअप पैकेज
                </span>
                {selectedMaster === 'makeup' && (
                  <span className="text-xs font-bold text-amber-100 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> एक्टिव
                  </span>
                )}
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80"
              alt="Makeup"
              className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full object-cover opacity-30 pointer-events-none"
            />
          </button>

        </div>

        {/* Subcategories Filter Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {selectedMaster === 'all'
                ? 'सभी उप-श्रेणियां (All Subcategories)'
                : selectedMaster === 'spa'
                ? 'स्पा उप-श्रेणियां (Spa Subcategories)'
                : selectedMaster === 'makeup'
                ? 'मेकअप उप-श्रेणियां (Makeup Subcategories)'
                : 'ब्यूटी उप-श्रेणियां (Beauty Subcategories)'}
            </h4>
            {selectedMaster !== 'all' && (
              <button
                onClick={() => setSelectedMaster('all')}
                className="text-xs text-brand-primary font-bold hover:underline"
              >
                (सभी दिखाएं)
              </button>
            )}
          </div>
        </div>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-4 sm:gap-6">
          {filteredCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/services?category=${cat.id}`}
              className="group flex flex-col items-center text-center space-y-2.5 p-2 rounded-2xl hover:bg-brand-bg transition-all"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-pink-100 group-hover:border-brand-primary shadow-sm group-hover:shadow-pink-soft transition-all transform group-hover:scale-105 bg-pink-50">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-800 group-hover:text-brand-primary transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
