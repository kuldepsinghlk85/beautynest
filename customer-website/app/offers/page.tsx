'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Tag, ArrowRight, Check } from 'lucide-react';

export default function OffersPage() {
  const coupons = [
    {
      code: 'WELCOME50',
      title: 'Flat 50% Off on First Booking',
      desc: 'Special welcome treat for every new customer in Lucknow. Valid on any service above ₹499.',
      discount: '50% OFF',
      tag: 'NEW USER',
    },
    {
      code: 'KOREAN30',
      title: 'Flat ₹300 Off on Korean Facial Rituals',
      desc: 'Indulge in authentic glass skin rituals with ampoules and jade rollers at an unbeatable price.',
      discount: 'FLAT ₹300 OFF',
      tag: 'TRENDING',
    },
    {
      code: 'GLOW20',
      title: '20% Off on Hair Spa & Waxing Combos',
      desc: 'Save more when you bundle hair pampering with painless Rica cartridge waxing.',
      discount: '20% OFF',
      tag: 'COMBO PACK',
    },
  ];

  return (
    <div className="py-12 bg-brand-bg min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-100 px-3 py-1 rounded-full text-xs font-bold text-brand-primary">
            <Tag className="w-3.5 h-3.5" />
            <span>SAVINGS &amp; PAMPERING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-charcoal mt-3">
            Exclusive Offers &amp; Promo Codes
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Use these verified coupon codes during checkout to enjoy luxury doorstep salon discounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="bg-white rounded-3xl p-6 border-2 border-dashed border-pink-200 shadow-sm hover:shadow-pink-soft transition-all relative flex flex-col justify-between"
            >
              <div>
                <span className="inline-block bg-brand-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mb-3">
                  {c.tag}
                </span>
                <h3 className="text-xl font-serif font-bold text-gray-900">
                  {c.discount}
                </h3>
                <h4 className="text-sm font-bold text-gray-800 mt-1">
                  {c.title}
                </h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  {c.desc}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="bg-pink-50 px-3 py-1.5 rounded-xl border border-pink-200 font-mono text-xs font-bold text-brand-primary">
                  {c.code}
                </div>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-primaryDark"
                >
                  <span>Use Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Membership Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#2D2D2D] to-[#453A40] text-white rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              BEAUTYNEST GOLD CLUB
            </span>
            <h3 className="text-2xl font-serif font-bold">
              Get Unlimited 15% Extra Off on Every Booking
            </h3>
            <p className="text-xs text-gray-300 max-w-md">
              Join for just ₹499/year. Free delivery hygiene kits, zero cancellation fees, and priority weekend bookings.
            </p>
          </div>
          <Link
            href="/services"
            className="bg-brand-primary hover:bg-brand-primaryDark text-white text-xs font-bold px-6 py-3.5 rounded-full whitespace-nowrap shadow-lg transition-all"
          >
            Join Gold Club
          </Link>
        </div>

      </div>
    </div>
  );
}
