'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SERVICES, Service } from '@/lib/data';
import {
  Star,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Heart,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import BookingModal from '@/components/BookingModal';
import Link from 'next/link';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.id as string;

  const [activeTab, setActiveTab] = useState<'about' | 'benefits' | 'process' | 'reviews'>('about');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Find service or fallback to Korean Facial Ritual
  const service = SERVICES.find((s) => s.slug === slug || s.id === slug) || SERVICES[0];

  return (
    <div className="bg-brand-bg min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-brand-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Services</span>
          </Link>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full bg-white border border-pink-100 text-gray-500 hover:text-rose-500 shadow-sm">
              <Heart className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full bg-white border border-pink-100 text-gray-500 hover:text-brand-primary shadow-sm">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Service Hero Card */}
        <div className="bg-white rounded-3xl overflow-hidden border border-pink-100 shadow-pink-soft">
          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* Image Col */}
            <div className="md:col-span-6 relative aspect-[4/3] md:aspect-auto">
              <img
                src={service.imageUrl}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              {service.isBestseller && (
                <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Bestseller
                </span>
              )}
            </div>

            {/* Info Col */}
            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-700">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{service.rating}</span>
                    <span className="text-gray-400 font-normal">({service.reviewCount.toLocaleString()} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 bg-pink-50 px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-primary">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.durationMinutes} mins</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-charcoal">
                  {service.name}
                </h1>

                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {service.shortDesc}
                </p>

                {/* Price Display */}
                <div className="mt-4 pt-4 border-t border-pink-50 flex items-baseline gap-3">
                  <span className="text-3xl font-serif font-bold text-brand-charcoal">
                    ₹{service.price}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{service.originalPrice}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {service.discountPercent}% OFF
                  </span>
                </div>
              </div>

              {/* Safety guarantee */}
              <div className="p-3 bg-brand-bg rounded-2xl border border-pink-100 flex items-center gap-2.5 text-xs text-gray-700">
                <ShieldCheck className="w-5 h-5 text-brand-primary flex-shrink-0" />
                <span>100% Single-Use Disposables • Sealed Product Kits</span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-gradient-to-r from-brand-primary to-pink-600 hover:from-brand-primaryDark hover:to-brand-primary text-white py-4 rounded-full font-bold shadow-pink-soft hover:shadow-pink-hover transition-all transform hover:-translate-y-0.5"
              >
                Book Now (Doorstep Service)
              </button>
            </div>

          </div>

          {/* Tabs Section: About | Benefits | Process | Reviews */}
          <div className="border-t border-pink-100">
            <div className="flex border-b border-pink-100 px-6 overflow-x-auto">
              {(['about', 'benefits', 'process', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-5 text-sm font-bold capitalize whitespace-nowrap border-b-2 transition-all ${
                    activeTab === tab
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === 'about' && (
                <div className="space-y-4 max-w-3xl">
                  <h3 className="text-lg font-bold text-gray-900">About this Treatment</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {service.about}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-pink-50/70 rounded-xl text-xs text-gray-800">
                      ✨ <strong>Skin Type:</strong> Suitable for all skin types including oily, dry &amp; sensitive.
                    </div>
                    <div className="p-3 bg-pink-50/70 rounded-xl text-xs text-gray-800">
                      🌿 <strong>Product Quality:</strong> Sealed single-dose ampoules with zero contamination.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'benefits' && (
                <div className="space-y-3 max-w-3xl">
                  <h3 className="text-lg font-bold text-gray-900">Key Benefits</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-pink-50/50">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-800 font-medium">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'process' && (
                <div className="space-y-4 max-w-3xl">
                  <h3 className="text-lg font-bold text-gray-900">Step-by-Step Treatment Process</h3>
                  <div className="space-y-3">
                    {service.processSteps.map((step, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white border border-pink-100 rounded-xl">
                        <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-xs font-medium text-gray-800">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Customer Reviews</h3>
                    <div className="flex items-center gap-1 text-sm font-bold text-amber-600">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span>{service.rating} Out of 5</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-brand-bg rounded-2xl border border-pink-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900">Shalini M., Gomti Nagar</span>
                        <span className="text-[10px] text-gray-400">2 days ago</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-700">
                        The beautician arrived right on time and set up a spotless spa bed in my living room. The facial was so relaxing and gave an instant radiant glow. Highly recommended!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        <BookingModal
          service={service}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
