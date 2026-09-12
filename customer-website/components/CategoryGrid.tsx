'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/data';
import { ArrowRight } from 'lucide-react';

export default function CategoryGrid() {
  const [categoryList, setCategoryList] = useState(CATEGORIES);

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

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-charcoal">
              Popular Beauty Services
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a category to explore certified doorstep treatments
            </p>
          </div>
          <Link
            href="/services"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primaryDark"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-4 sm:gap-6">
          {categoryList.map((cat) => (
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
