'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function KoreanBanner() {
  return (
    <section className="py-8 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FDE8EE] via-[#FCE4EC] to-[#FFF0F4] border border-pink-200 shadow-pink-soft p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-primary border border-pink-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EXCLUSIVE K-BEAUTY EXPERIENCE</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-charcoal">
                Korean Beauty Rituals
              </h2>

              <p className="text-lg sm:text-xl text-gray-700 font-light">
                Glow Like Never Before. Authentic 7-step glass skin facial using imported peptide serums, chilled jade rollers, and soothing hydro-jelly masks.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/services/korean-facial-ritual"
                  className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primaryDark text-white text-sm font-semibold px-7 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="text-sm text-gray-600 font-medium">
                  Starting at only <span className="font-bold text-brand-primary">₹899</span> <span className="line-through text-gray-400">₹1,699</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border-4 border-white aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80"
                  alt="Korean Beauty Rituals"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
