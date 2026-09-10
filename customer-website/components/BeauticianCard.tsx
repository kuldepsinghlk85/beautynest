'use client';

import React from 'react';
import { Star, ShieldCheck, Award, MapPin, CheckCircle2, Briefcase } from 'lucide-react';
import { Beautician } from '@/lib/data';

interface BeauticianCardProps {
  beautician: Beautician;
  onSelect?: (beautician: Beautician) => void;
  isSelected?: boolean;
}

export default function BeauticianCard({ beautician, onSelect, isSelected }: BeauticianCardProps) {
  return (
    <div
      className={`bg-white rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between ${
        isSelected
          ? 'border-brand-primary ring-2 ring-brand-primary/20 shadow-pink-soft'
          : 'border-pink-100 hover:border-pink-300 hover:shadow-md'
      }`}
    >
      <div>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-pink-200 flex-shrink-0 bg-pink-50">
            <img
              src={beautician.imageUrl}
              alt={beautician.name}
              className="w-full h-full object-cover"
            />
            {beautician.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-gray-900 truncate">
                {beautician.name}
              </h4>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-xs font-bold text-amber-700">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{beautician.rating}</span>
                <span className="text-[10px] text-gray-400">({beautician.reviewCount})</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-brand-primary mt-0.5">
              <MapPin className="w-3 h-3 text-brand-primary shrink-0" />
              <span>{beautician.area}, Varanasi</span>
            </div>

            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {beautician.specialization}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px] text-gray-600">
          <span className="inline-flex items-center gap-1 bg-pink-50 text-brand-primary font-medium px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            <span>Aadhaar Verified</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-full">
            <Award className="w-3 h-3 text-amber-600" />
            <span>{beautician.experienceYears}+ Yrs</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-full">
            <Briefcase className="w-3 h-3 text-gray-500" />
            <span>{beautician.totalJobs} Jobs</span>
          </span>
        </div>
      </div>

      {onSelect && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Available for Doorstep
          </span>
          <button
            onClick={() => onSelect(beautician)}
            className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all ${
              isSelected
                ? 'bg-brand-primary text-white'
                : 'bg-pink-50 hover:bg-brand-primary hover:text-white text-brand-primary'
            }`}
          >
            {isSelected ? 'Selected' : 'Book with Her'}
          </button>
        </div>
      )}
    </div>
  );
}
