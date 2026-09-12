'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PackageCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Star,
  Tag,
} from 'lucide-react';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  scriptText: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'hs-1',
    title: 'Glow Like Never Before',
    subtitle: 'Varanasi Top Doorstep Facial & Cleanup Treatments',
    badge: '★ 4.9 (11,500+ Reviews)',
    scriptText: 'Glow Like Never Before ✨',
    imageUrl: '/slider/slide1.png',
    ctaText: 'Book Facial Now',
    ctaLink: '/services',
    isActive: true,
  },
  {
    id: 'hs-2',
    title: 'Bridal & Festive Elegance',
    subtitle: 'Pre-wedding & Party Glow Rituals at Your Doorstep',
    badge: 'Flat ₹1000 OFF with BRIDAL1000',
    scriptText: 'Royal Bridal Rituals 🌸',
    imageUrl: '/slider/slide2.png',
    ctaText: 'Explore Bridal Packages',
    ctaLink: '/offers',
    isActive: true,
  },
  {
    id: 'hs-3',
    title: 'Korean Glass Skin Ritual',
    subtitle: 'Deep Pore Hydration & Ultrasonic Skin Pampering',
    badge: 'Trending in Varanasi',
    scriptText: 'Pure Glass Skin 💧',
    imageUrl: '/slider/slide3.png',
    ctaText: 'Book Korean Ritual',
    ctaLink: '/services',
    isActive: true,
  },
];

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Load from localStorage if admin has customized slides
  useEffect(() => {
    try {
      const saved = localStorage.getItem('beautynest_hero_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const activeOnes = parsed.filter((s: HeroSlide) => s.isActive !== false);
          if (activeOnes.length > 0) {
            setSlides(activeOnes);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[currentSlideIndex] || DEFAULT_SLIDES[0];

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

          {/* Right Column: Hero Slider Carousel */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none group">
              
              {/* Main Photo Slider Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-pink-50">
                <img
                  key={currentSlide.id}
                  src={currentSlide.imageUrl}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out scale-100 group-hover:scale-105"
                />
                
                {/* Overlay Vignette & Script Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <div className="space-y-1">
                    <span className="inline-block bg-pink-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      {currentSlide.badge}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight drop-shadow-md">
                      {currentSlide.title}
                    </h3>
                    <p className="font-script text-2xl text-pink-200 drop-shadow-md">
                      {currentSlide.scriptText}
                    </p>
                  </div>

                  {/* Slide Action Button */}
                  <div className="pt-3">
                    <Link
                      href={currentSlide.ctaLink || '/services'}
                      className="inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-brand-primary text-xs font-bold px-4 py-2 rounded-full shadow-lg transition-all hover:scale-105"
                    >
                      <span>{currentSlide.ctaText || 'Explore Services'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Left & Right Slide Controls */}
                {slides.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Next Slide"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Slider Dot Indicators */}
                {slides.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          currentSlideIndex === idx
                            ? 'w-6 bg-brand-primary'
                            : 'w-1.5 bg-white/60 hover:bg-white'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Floating Badges */}
              <div className="hidden sm:block absolute -top-4 -right-2 bg-white/95 backdrop-blur-sm border border-pink-200 px-4 py-2 rounded-2xl shadow-lg z-20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-gray-800">Salon at Home 🌸</span>
                </div>
              </div>

              <div className="hidden sm:block absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-sm border border-pink-200 px-4 py-2.5 rounded-2xl shadow-lg z-20">
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
