'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, PackageCheck, Clock } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF0F4] via-[#FFF5F7] to-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading & Trust Badges */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100/80 border border-pink-200">
              <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
                SELF CARE, DELIVERED
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-charcoal tracking-tight leading-[1.15]">
              Beauty Services <br />
              <span className="text-brand-primary italic">at Your Doorstep</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 font-light max-w-xl">
              Professional Beauticians. Premium Care. At Your Home. Experience salon-grade hygiene and pampered relaxation in Varanasi.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/services"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-primary to-pink-600 hover:from-brand-primaryDark hover:to-brand-primary text-white text-base font-semibold px-8 py-4 rounded-full shadow-pink-soft hover:shadow-pink-hover transition-all transform hover:-translate-y-0.5"
              >
                <span>Book Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                href="/offers"
                className="inline-flex items-center gap-2 bg-white hover:bg-pink-50 text-brand-charcoal border border-pink-200 text-base font-medium px-6 py-4 rounded-full transition-all"
              >
                <span>View Offers (Up to 50% Off)</span>
              </Link>
            </div>

            {/* Tagline in handwriting font */}
            <div className="pt-2">
              <p className="font-script text-3xl sm:text-4xl text-brand-primaryDark">
                More Than Beauty, It&apos;s Care ❤️
              </p>
            </div>

            {/* 4 Trust Badges in a Row */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-pink-100">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-brand-primary flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Verified Beauticians</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-brand-primary flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Safe &amp; Hygienic</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-brand-primary flex-shrink-0">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <span>Premium Products</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-brand-primary flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span>On-Time Service</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Composite */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Model Photo with rounded luxury styling */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-pink-50">
                <img
                  src="https://images.unsplash.com/photo-1512290900672-1f41444e2fc1?w=800&q=80"
                  alt="Beauty facial relaxation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-6">
                  <span className="font-script text-2xl text-white drop-shadow-md">
                    Glow Like Never Before ✨
                  </span>
                </div>
              </div>

              {/* Floating Pill Badges */}
              <div className="hidden sm:block absolute -top-4 -right-2 bg-white/95 backdrop-blur-sm border border-pink-200 px-4 py-2 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-gray-800">Salon at Home 🌸</span>
                </div>
              </div>

              <div className="hidden sm:block absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-sm border border-pink-200 px-4 py-2.5 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">★ 4.9</span>
                  <span className="text-xs font-semibold text-gray-700">11,500+ Verified Reviews</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
