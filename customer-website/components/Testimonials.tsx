'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/data';

export default function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-pink-100 px-3 py-1 rounded-full">
            REAL EXPERIENCES
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-charcoal mt-3">
            Loved by 10,000+ Ladies in Lucknow
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Read authentic feedback from happy clients who experienced doorstep care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-brand-bg rounded-3xl p-8 border border-pink-100 shadow-sm hover:shadow-pink-soft transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-pink-200" />
                </div>

                <p className="text-sm text-gray-700 italic leading-relaxed mb-6">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-pink-200/60">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-pink-300"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.location}</p>
                  <span className="text-[10px] text-brand-primary font-medium block mt-0.5">
                    Booked: {t.service}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
