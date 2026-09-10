'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Clock, Heart, Plus, Check } from 'lucide-react';
import { Service } from '@/lib/data';

interface ServiceCardProps {
  service: Service;
  onBookNow?: (service: Service) => void;
}

export default function ServiceCard({ service, onBookNow }: ServiceCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [added, setAdded] = useState(false);

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    if (onBookNow) {
      onBookNow(service);
    }
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-pink-100/80 shadow-sm hover:shadow-pink-hover transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-pink-50">
        <img
          src={service.imageUrl}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Bestseller Badge */}
        {service.isBestseller && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Bestseller
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : ''}`} />
        </button>

        {/* Duration Chip */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
          <Clock className="w-3 h-3 text-pink-300" />
          <span>{service.durationMinutes} mins</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-gray-900 font-bold">{service.rating}</span>
            <span className="text-gray-400">({service.reviewCount.toLocaleString()})</span>
          </div>

          <Link href={`/services/${service.slug}`}>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-1">
              {service.name}
            </h3>
          </Link>

          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {service.shortDesc}
          </p>
        </div>

        {/* Price and Booking Action */}
        <div className="pt-4 mt-3 border-t border-pink-50 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">
                ₹{service.price}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ₹{service.originalPrice}
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {service.discountPercent}% OFF
            </span>
          </div>

          <button
            onClick={handleBook}
            className={`inline-flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-full transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-primary hover:bg-brand-primaryDark text-white shadow-pink-soft'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Book Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
