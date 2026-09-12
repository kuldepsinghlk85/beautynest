'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#262125] text-gray-300 pt-16 pb-12 border-t-4 border-brand-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-300 shadow-md bg-white flex items-center justify-center p-0.5 shrink-0">
                <img src="/logo.png" alt="BeautyNest Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="text-2xl font-serif font-bold text-white tracking-tight">
                Beauty<span className="text-brand-primary">Nest</span>
              </span>
            </div>

            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              India&apos;s luxury doorstep salon platform crafted exclusively for ladies. Certified beauticians, 100% disposable hygienic kits, and transparent salon pricing.
            </p>

            <p className="font-script text-2xl text-pink-300">
              More Than Beauty, It&apos;s Care ❤️
            </p>

            <div className="pt-2 text-xs text-gray-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span>Head Office: Sigra, Varanasi, UP – 221010</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span>Customer Care: +91 98390 12341 (9 AM - 9 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <span>Support: care@beautynest.in</span>
              </div>
            </div>
          </div>

          {/* Doorstep Areas */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Varanasi Hubs
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>Sigra &amp; Rathyatra</li>
              <li>Lanka (BHU) &amp; Assi Ghat</li>
              <li>Godowlia &amp; Dashashwamedh</li>
              <li>Bhelupur &amp; Durgakund</li>
              <li>Varanasi Cantt &amp; Shivpur</li>
              <li>Mahmoorganj &amp; Orderly Bazar</li>
              <li>Pandeypur &amp; Sarnath</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/services" className="hover:text-pink-300">All Services</Link></li>
              <li><Link href="/services?category=facial" className="hover:text-pink-300">Korean Facial Rituals</Link></li>
              <li><Link href="/services?category=waxing" className="hover:text-pink-300">Cartridge Waxing</Link></li>
              <li><Link href="/professionals" className="hover:text-pink-300">Verified Beauticians</Link></li>
              <li><Link href="/offers" className="hover:text-pink-300">Offers &amp; Coupons</Link></li>
              <li><Link href="/about" className="hover:text-pink-300">Hygiene &amp; Safety Pledge</Link></li>
            </ul>
          </div>

          {/* App Download */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Get Mobile App
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Book doorstep beauticians in seconds with real-time GPS tracking.
            </p>
            <div className="space-y-2">
              <div className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl flex items-center gap-3 border border-gray-700 cursor-pointer">
                <span className="text-2xl">📱</span>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase">Available on</div>
                  <div className="text-xs font-bold text-white">Google Play Store</div>
                </div>
              </div>
              <div className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl flex items-center gap-3 border border-gray-700 cursor-pointer">
                <span className="text-2xl">🍎</span>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase">Download on</div>
                  <div className="text-xs font-bold text-white">Apple App Store</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 BeautyNest Technologies Pvt. Ltd. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-brand-primary fill-brand-primary" /> for Indian Women
          </p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:underline">Privacy Policy</Link>
            <Link href="/about" className="hover:underline">Terms of Service</Link>
            <Link href="/contact" className="hover:underline">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
