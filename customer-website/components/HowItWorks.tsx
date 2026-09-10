'use client';

import React from 'react';
import { Calendar, Sparkles, Smile, CheckCircle2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Choose Service & Slot',
      desc: 'Pick your preferred facial, waxing, or spa ritual. Select a date and convenient time slot.',
      icon: Calendar,
    },
    {
      num: '02',
      title: 'Verified Beautician Arrives',
      desc: 'Certified salon expert reaches your doorstep with 100% sterilized, disposable kits and branded cosmetics.',
      icon: Sparkles,
    },
    {
      num: '03',
      title: 'Relax & Pay After Service',
      desc: 'Enjoy salon-grade luxury in your living room. Verify service start OTP and pay via Razorpay UPI or COD.',
      icon: Smile,
    },
  ];

  return (
    <section className="py-16 bg-[#FFF5F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-pink-100 px-3 py-1 rounded-full">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-charcoal mt-3">
            Salon Luxury at Your Doorstep in 3 Easy Steps
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            No traveling in city heat, no waiting in salon queues. Just pure care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-3xl p-8 border border-pink-100 shadow-pink-soft hover:shadow-pink-hover transition-all duration-300 relative group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-primary to-pink-400 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-3xl font-serif font-bold text-pink-200 group-hover:text-brand-primary transition-colors">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.desc}
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-brand-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Safe &amp; Verified</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
