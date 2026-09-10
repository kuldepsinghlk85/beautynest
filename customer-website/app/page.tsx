'use client';

import React, { useState } from 'react';
import Hero from '@/components/Hero';
import CategoryGrid from '@/components/CategoryGrid';
import KoreanBanner from '@/components/KoreanBanner';
import StatsBar from '@/components/StatsBar';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import ServiceCard from '@/components/ServiceCard';
import BeauticianCard from '@/components/BeauticianCard';
import BookingModal from '@/components/BookingModal';
import { SERVICES, BEAUTICIANS, Service } from '@/lib/data';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Popular Categories */}
      <CategoryGrid />

      {/* 3. Featured & Bestseller Services */}
      <section className="py-14 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-pink-100 px-3 py-1 rounded-full">
                BESTSELLERS
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-charcoal mt-2">
                Trending Doorstep Salon Rituals
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Most loved packages by ladies across Varanasi with verified satisfaction
              </p>
            </div>
            <Link
              href="/services"
              className="mt-4 sm:mt-0 group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primaryDark"
            >
              <span>Explore All 30+ Services</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {SERVICES.slice(0, 6).map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBookNow={handleBookService}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Korean Beauty Rituals Banner */}
      <KoreanBanner />

      {/* 5. Top Rated Beauticians Near You */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-pink-100 px-3 py-1 rounded-full">
                VERIFIED PROFESSIONALS
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-charcoal mt-2">
                Top Rated Beauticians in Varanasi (Kashi)
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Background-verified, certified salon experts delivering care across 20 Varanasi major areas
              </p>
            </div>
            <Link
              href="/professionals"
              className="mt-4 sm:mt-0 group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primaryDark"
            >
              <span>View All 20 Beauticians</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BEAUTICIANS.slice(0, 6).map((b) => (
              <BeauticianCard key={b.id} beautician={b} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. How It Works */}
      <HowItWorks />

      {/* 7. Stats Bar */}
      <StatsBar />

      {/* 8. Testimonials */}
      <Testimonials />

      {/* Booking Flow Modal */}
      <BookingModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
