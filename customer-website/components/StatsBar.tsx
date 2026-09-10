'use client';

import React from 'react';
import { Users, UserCheck, Star, ShieldCheck, Heart } from 'lucide-react';

export default function StatsBar() {
  return (
    <section className="bg-white border-y border-pink-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
          
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-brand-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-brand-charcoal">10K+</div>
              <div className="text-xs text-gray-500 font-medium">Happy Customers</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-brand-primary">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-brand-charcoal">500+</div>
              <div className="text-xs text-gray-500 font-medium">Verified Beauticians</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-brand-primary">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-brand-charcoal">4.9★</div>
              <div className="text-xs text-gray-500 font-medium">Average Rating</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-brand-primary">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-brand-charcoal">100%</div>
              <div className="text-xs text-gray-500 font-medium">Safe &amp; Hygienic</div>
            </div>
          </div>

        </div>

        {/* Tagline footer banner */}
        <div className="mt-6 pt-6 border-t border-pink-50 text-center flex items-center justify-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-gray-800 tracking-wide uppercase">
            Beauty at Your Doorstep
          </span>
          <span className="text-gray-400">•</span>
          <span className="font-script text-xl sm:text-2xl text-brand-primaryDark">
            Because You Deserve the Best
          </span>
          <Heart className="w-4 h-4 text-brand-primary fill-brand-primary inline" />
        </div>
      </div>
    </section>
  );
}
