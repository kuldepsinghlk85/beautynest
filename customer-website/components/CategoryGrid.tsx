'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/data';
import { ArrowRight } from 'lucide-react';

export default function CategoryGrid() {
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

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
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
