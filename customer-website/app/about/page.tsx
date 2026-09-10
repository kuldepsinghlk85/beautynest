'use client';

import React from 'react';
import { Sparkles, Heart, ShieldCheck, Award, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="py-12 bg-brand-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-pink-100 px-3 py-1 rounded-full">
            OUR STORY &amp; MISSION
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-brand-charcoal">
            More Than Beauty, <br />
            <span className="font-script text-4xl sm:text-6xl text-brand-primary">It&apos;s Care ❤️</span>
          </h1>
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            Born in Lucknow, built for every woman who values her time, personal safety, and uncompromised salon hygiene.
          </p>
        </div>

        {/* Narrative */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-pink-100 shadow-sm space-y-6 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-2xl font-serif font-bold text-brand-charcoal">
            Why BeautyNest was Created
          </h2>
          <p>
            Traditional salons often mean long travel in traffic, waiting in crowded lobbies, and questioning the hygiene of reused towels or unsealed creams. We believe that professional self-care should happen in your sanctuary: your home.
          </p>
          <p>
            BeautyNest brings certified salon professionals to your doorstep with single-use hygienic disposables, sealed branded cosmetics, and transparent pricing where you never pay inflated salon overhead costs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-pink-50 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-brand-primary mb-2" />
              <h4 className="font-bold text-gray-900">Safety First</h4>
              <p className="text-xs text-gray-600 mt-1">
                Every professional is female, Aadhaar-verified, and police background cleared. Service starts only when you share your secret OTP.
              </p>
            </div>
            <div className="p-4 bg-pink-50 rounded-2xl">
              <Sparkles className="w-6 h-6 text-brand-primary mb-2" />
              <h4 className="font-bold text-gray-900">Monodose Packaging</h4>
              <p className="text-xs text-gray-600 mt-1">
                Wax, facials, and creams are opened in single-use sachets right in front of your eyes. No contamination, zero compromises.
              </p>
            </div>
          </div>
        </div>

        {/* Lucknow Roots */}
        <div className="bg-white rounded-3xl p-8 border border-pink-100 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary uppercase">
            <MapPin className="w-4 h-4" />
            <span>Launch City: Lucknow</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900">
            Proudly Serving Lucknow with Love
          </h3>
          <p className="text-xs text-gray-600 max-w-lg mx-auto">
            From Kapoorthala and Aliganj to Gomti Nagar and Hazratganj, thousands of Nawabi ladies have embraced BeautyNest as their go-to pampering partner.
          </p>
          <div className="pt-2">
            <Link
              href="/services"
              className="inline-block bg-brand-primary hover:bg-brand-primaryDark text-white text-xs font-bold px-7 py-3.5 rounded-full shadow-pink-soft"
            >
              Book Your Appointment
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
