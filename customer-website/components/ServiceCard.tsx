'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Clock, Heart, Plus, Minus, Check, ShoppingBag } from 'lucide-react';
import { Service } from '@/lib/data';
import { addToCart, removeFromCart, updateQuantity, getCart } from '@/lib/cartStore';
import { getMasterCategoryForService } from '@/lib/masterCategories';

interface ServiceCardProps {
  service: Service;
  onBookNow?: (service: Service) => void;
}

export default function ServiceCard({ service, onBookNow }: ServiceCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [cartQty, setCartQty] = useState(0);

  const masterCat = service.masterCategory || getMasterCategoryForService(service);

  const syncCartQty = () => {
    const items = getCart();
    const id = service.id || service.serviceId || service.slug;
    const item = items.find(
      (c) => c.service.id === id || c.service.serviceId === id || c.service.slug === id
    );
    setCartQty(item ? item.quantity : 0);
  };

  useEffect(() => {
    syncCartQty();
    const handleCartUpdate = () => syncCartQty();
    window.addEventListener('beautynest_cart_updated', handleCartUpdate);
    return () => window.removeEventListener('beautynest_cart_updated', handleCartUpdate);
  }, [service.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(service);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    const id = service.id || service.serviceId || service.slug;
    updateQuantity(id, cartQty + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    const id = service.id || service.serviceId || service.slug;
    updateQuantity(id, cartQty - 1);
  };

  const handleDirectBook = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartQty === 0) {
      addToCart(service);
    }
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

        {/* Master Category Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm ${
              masterCat === 'makeup'
                ? 'bg-amber-600 text-white'
                : masterCat === 'spa'
                ? 'bg-teal-600 text-white'
                : 'bg-brand-primary text-white'
            }`}
          >
            {masterCat === 'makeup' ? '💄 मेकअप' : masterCat === 'spa' ? '🧖‍♀️ स्पा' : '✨ ब्यूटी'}
          </span>
          {service.isBestseller && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Bestseller
            </span>
          )}
        </div>

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

        {/* Price and Cart Actions */}
        <div className="pt-4 mt-3 border-t border-pink-50 flex items-center justify-between gap-2">
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

          {/* Action Buttons: Add/Qty & Book */}
          <div className="flex items-center gap-1.5">
            {cartQty > 0 ? (
              <div className="inline-flex items-center bg-pink-50 border border-brand-primary/40 rounded-full p-0.5 shadow-sm">
                <button
                  onClick={handleDecrement}
                  className="w-6 h-6 rounded-full bg-white text-brand-primary hover:bg-brand-primary hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                  title="Remove one"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2 text-xs font-bold text-brand-charcoal min-w-[20px] text-center">
                  {cartQty}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-6 h-6 rounded-full bg-brand-primary text-white hover:bg-brand-primaryDark flex items-center justify-center transition-colors text-xs font-bold"
                  title="Add one more"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-full border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ जोड़ें (Add)</span>
              </button>
            )}

            <button
              onClick={handleDirectBook}
              className="inline-flex items-center gap-1 text-xs font-bold px-3.5 py-2 rounded-full bg-brand-primary hover:bg-brand-primaryDark text-white transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <span>बुक करें</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
